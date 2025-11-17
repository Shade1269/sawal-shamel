# 📋 دليل تطبيق Migration إصلاح تضارب الأعمدة

## 🎯 الهدف
إصلاح مشكلة "إصلاح شيء يخرب شيء" من خلال توحيد أسماء الأعمدة في قاعدة البيانات.

## ⚠️ المشكلة الحالية
قاعدة البيانات تحتوي على تضارب في أسماء الأعمدة:
- بعض الجداول تستخدم `user_profile_id`
- بعض الجداول تستخدم `profile_id`
- بعض الجداول تحتوي على العمودين معاً!

هذا يسبب:
- ❌ أخطاء في Foreign Keys
- ❌ فشل RLS Policies
- ❌ تعطل Helper Functions
- ❌ "إصلاح شيء يخرب شيء آخر"

## ✅ الحل
Migration شامل يوحّد جميع العلاقات لتستخدم: `profile_id → profiles(id)`

## 📝 كيفية التطبيق

### الطريقة 1: عبر Supabase Dashboard (مفضّلة)

1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى: **SQL Editor**
4. انسخ محتوى الملف: `supabase/migrations/20251117000000_fix_column_naming_conflicts.sql`
5. الصقه في SQL Editor
6. اضغط **Run**

### الطريقة 2: عبر Supabase CLI

```bash
# إذا كان لديك Supabase CLI مثبت
supabase db push

# أو تشغيل Migration مباشرة
supabase db execute -f supabase/migrations/20251117000000_fix_column_naming_conflicts.sql
```

## 🔍 التحقق من نجاح التطبيق

بعد تطبيق الـ Migration، تحقق من:

### 1. أسماء الأعمدة
```sql
-- يجب أن تعرض profile_id فقط (ليس user_profile_id)
SELECT column_name
FROM information_schema.columns
WHERE table_name IN ('affiliate_stores', 'merchants', 'shops')
  AND column_name LIKE '%profile%';
```

### 2. Foreign Keys
```sql
-- يجب أن تعرض علاقات profile_id → profiles(id)
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('affiliate_stores', 'merchants');
```

### 3. Helper Functions
```sql
-- اختبر أن الـ Functions تعمل
SELECT public.get_current_user_profile_id();
SELECT public.get_current_user_role();
```

### 4. RLS Policies
```sql
-- تحقق من وجود الـ Policies الجديدة
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('affiliate_stores', 'merchants');
```

## 📊 ما يفعله الـ Migration

1. ✅ **إعادة تسمية الأعمدة**
   - `affiliate_stores.user_profile_id` → `profile_id`
   - `merchants.user_profile_id` → `profile_id`
   - `shops.user_profile_id` → `owner_id`

2. ✅ **تحديث Foreign Keys**
   - حذف القيود القديمة
   - إضافة قيود جديدة تشير إلى `profiles(id)`

3. ✅ **تحديث Helper Functions**
   - `get_current_user_profile_id()` الآن يستخدم جدول `profiles`
   - `get_current_user_role()` الآن يستخدم جدول `profiles`

4. ✅ **تحديث RLS Policies**
   - إنشاء policies جديدة تستخدم الأسماء الموحدة

5. ✅ **إضافة Indexes**
   - تحسين الأداء للاستعلامات على `profile_id`

## ⚡ ملاحظات مهمة

### أمان
- ✅ الـ Migration يستخدم `BEGIN/COMMIT` للحماية من الأخطاء
- ✅ يتحقق من وجود جدول `profiles` قبل البدء
- ✅ يتعامل مع حالة وجود العمودين معاً (دمج البيانات)

### Data Safety
- ✅ لا يحذف أي بيانات
- ✅ ينسخ البيانات قبل حذف الأعمدة القديمة
- ✅ يستخدم `IF EXISTS/NOT EXISTS` لتجنب الأخطاء

### Rollback
إذا حدث خطأ، الـ Transaction سيتراجع تلقائياً (`ROLLBACK`).

## 🎯 النتيجة المتوقعة

بعد تطبيق الـ Migration:

### ✅ قبل:
```
affiliate_stores
  ├── user_profile_id → ??? (تضارب)
merchants
  ├── user_profile_id → ??? (تضارب)
```

### ✅ بعد:
```
affiliate_stores
  ├── profile_id → profiles(id) ✓
merchants
  ├── profile_id → profiles(id) ✓
shops
  ├── owner_id → profiles(id) ✓
```

## 🔧 استكشاف الأخطاء

### خطأ: "جدول profiles غير موجود"
**الحل:** أنشئ جدول `profiles` أولاً من migrations السابقة.

### خطأ: "constraint already exists"
**الحل:** الـ Migration يتعامل مع هذا تلقائياً باستخدام `IF NOT EXISTS`.

### خطأ: "column does not exist"
**الحل:** هذا يعني أن الـ Migration طُبّق مسبقاً، أو أن الأعمدة بالفعل بالأسماء الصحيحة.

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من logs في Supabase Dashboard
2. شغّل الاستعلامات في قسم "التحقق من نجاح التطبيق"
3. تحقق من أن جدول `profiles` موجود وبه بيانات

---

**تاريخ الإنشاء:** 2025-11-17
**الحالة:** ✅ جاهز للتطبيق
**الأولوية:** 🔴 عالية جداً (يحل مشكلة أساسية)
