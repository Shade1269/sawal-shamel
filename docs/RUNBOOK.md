# دليل العمليات اليومية (Runbook)

## 🎯 الهدف
هذا الدليل يوضح العمليات اليومية والأسبوعية والشهرية لصيانة قاعدة البيانات والنظام.

---

## 📅 العمليات اليومية

### 1. فحص صحة النظام (5 دقائق)

```sql
-- فحص عدد الطلبات الجديدة
SELECT 
  source,
  COUNT(*) as new_orders,
  SUM(total_amount_sar) as revenue
FROM order_hub
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY source;

-- فحص حالة الشحنات
SELECT 
  status,
  COUNT(*) as shipment_count
FROM shipments
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY status;
```

### 2. مراقبة الأخطاء

```sql
-- فحص البيانات اليتيمة
SELECT * FROM check_order_hub_orphans();

-- إذا وُجدت مشاكل، قم بإصلاحها:
SELECT * FROM auto_fix_missing_data();
```

### 3. النسخ الاحتياطي

```bash
# تشغيل backup يومي (تلقائي عبر Supabase)
# فحص backup logs
SELECT * FROM backup_logs 
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

---

## 📆 العمليات الأسبوعية

### 1. التنظيف الشامل (15 دقيقة)

```sql
-- تشغيل التنظيف الكامل
SELECT * FROM run_full_cleanup();

-- مراجعة النتائج
SELECT * FROM check_all_data_quality();
```

### 2. تحديث الإحصائيات

```sql
-- تحديث إحصائيات المتاجر
SELECT * FROM backfill_statistics();

-- التحقق من النتائج
SELECT 
  id,
  store_name,
  total_orders,
  total_sales
FROM affiliate_stores
ORDER BY total_sales DESC
LIMIT 20;
```

### 3. حذف البيانات القديمة

```sql
-- حذف carts، OTP، sessions قديمة
SELECT * FROM cleanup_expired_data();
```

### 4. فحص الأداء

```sql
-- فحص أبطأ queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- فحص استخدام indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 📊 العمليات الشهرية

### 1. مراجعة شاملة للبيانات (30 دقيقة)

```sql
-- إحصائيات شاملة
SELECT * FROM get_unified_order_stats(NULL);

-- فحص جودة البيانات الكاملة
SELECT * FROM check_all_data_quality();

-- مراجعة sync quality
SELECT * FROM check_order_hub_sync_quality();
```

### 2. تحليل الأمان

```sql
-- مراجعة RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- فحص security audit log
SELECT 
  event_type,
  COUNT(*) as event_count,
  risk_assessment
FROM security_audit_log
WHERE created_at >= NOW() - INTERVAL '1 month'
GROUP BY event_type, risk_assessment
ORDER BY event_count DESC;
```

### 3. تحسين الأداء

```sql
-- VACUUM ANALYZE للجداول الرئيسية
VACUUM ANALYZE order_hub;
VACUUM ANALYZE profiles;
VACUUM ANALYZE shipments;
VACUUM ANALYZE products;
VACUUM ANALYZE affiliate_stores;

-- REINDEX للفهارس المهمة
REINDEX TABLE order_hub;
REINDEX TABLE profiles;
```

### 4. مراجعة السعة والموارد

```sql
-- حجم الجداول
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- عدد الصفوف
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

---

## 🚨 إجراءات الطوارئ

### حالة طوارئ 1: فقدان بيانات

```sql
-- 1. تحقق من backup الأخير
SELECT * FROM backup_logs 
ORDER BY created_at DESC 
LIMIT 1;

-- 2. استعادة من backup (عبر Supabase Dashboard)
-- 3. إعادة تشغيل sync triggers
-- 4. التحقق من البيانات
SELECT * FROM check_all_data_quality();
```

### حالة طوارئ 2: أداء بطيء

```sql
-- 1. فحص العمليات الجارية
SELECT 
  pid,
  now() - query_start as duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- 2. إيقاف عملية بطيئة (إذا لزم الأمر)
-- SELECT pg_terminate_backend(pid);

-- 3. تشغيل VACUUM
VACUUM ANALYZE;
```

### حالة طوارئ 3: بيانات يتيمة كثيرة

```sql
-- 1. فحص المشكلة
SELECT * FROM check_order_hub_orphans();
SELECT * FROM check_profile_orphans();

-- 2. إصلاح تلقائي
SELECT * FROM auto_fix_missing_data();

-- 3. إعادة تشغيل triggers
-- (راجع ملف migrations للكود)

-- 4. التحقق النهائي
SELECT * FROM check_all_data_quality();
```

---

## 📈 مؤشرات الأداء الرئيسية (KPIs)

### يومياً
- ✅ عدد الطلبات الجديدة
- ✅ معدل نجاح المعاملات
- ✅ عدد الأخطاء في logs
- ✅ وقت استجابة API

### أسبوعياً
- ✅ عدد البيانات اليتيمة المصلحة
- ✅ حجم البيانات المحذوفة
- ✅ دقة الإحصائيات
- ✅ استخدام indexes

### شهرياً
- ✅ نمو حجم قاعدة البيانات
- ✅ معدل استخدام CPU/Memory
- ✅ عدد الـ security incidents
- ✅ جودة البيانات الإجمالية

---

## 🔧 الأدوات المتاحة

### React Hooks
```typescript
// للمطورين
import { useOrderRepository } from '@/hooks/useOrderRepository';
import { useDataCleanup } from '@/hooks/useDataCleanup';
```

### Database Functions
```sql
-- للمسؤولين
check_all_data_quality()
auto_fix_missing_data()
cleanup_expired_data()
backfill_statistics()
run_full_cleanup()
```

### Repository Services
```typescript
// للمطورين
import { 
  OrderRepository, 
  ProfileRepository, 
  ShipmentRepository 
} from '@/services/repositories';
```

---

## 📞 جهات الاتصال

### للدعم الفني
- راجع `ROLLOUT_GUIDE.md`
- راجع `DATABASE_CONSOLIDATION_PROGRESS.md`
- راجع postgres logs و console logs

### للطوارئ
1. فحص Supabase Dashboard
2. مراجعة security_audit_log
3. استخدام run_full_cleanup()
4. الاتصال بفريق DevOps إذا لزم الأمر

---

## ✅ Checklist

### يومي
- [ ] فحص صحة النظام
- [ ] مراقبة الأخطاء
- [ ] التحقق من backups

### أسبوعي
- [ ] التنظيف الشامل
- [ ] تحديث الإحصائيات
- [ ] حذف البيانات القديمة
- [ ] فحص الأداء

### شهري
- [ ] مراجعة شاملة للبيانات
- [ ] تحليل الأمان
- [ ] تحسين الأداء
- [ ] مراجعة السعة والموارد
