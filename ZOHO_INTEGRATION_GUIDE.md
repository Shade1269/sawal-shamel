# دليل التكامل مع Zoho Books
# Zoho Books Integration Guide

**آخر تحديث:** 23 نوفمبر 2025
**الحالة:** ✅ جاهز للاستخدام

---

## 📋 نظرة عامة

هذا التكامل يربط منصة أتلانتس مع **Zoho Books** لإصدار الفواتير الإلكترونية تلقائياً وبشكل متوافق مع متطلبات **هيئة الزكاة والضريبة والجمارك (ZATCA)** في المملكة العربية السعودية.

### ✨ المميزات:
- ✅ إنشاء فاتورة إلكترونية تلقائياً عند تأكيد الطلب
- ✅ مزامنة بيانات العملاء
- ✅ حساب الضريبة (15% VAT)
- ✅ تتبع حالة المزامنة
- ✅ معالجة الأخطاء وإعادة المحاولة

---

## 🔧 المتطلبات الأساسية

### 1. حساب Zoho Books

يجب أن يكون لديك:
- ✅ حساب Zoho Books نشط
- ✅ Organization ID من Zoho
- ✅ تفعيل الفوترة الإلكترونية المتوافقة مع ZATCA
- ✅ رقم التسجيل الضريبي في السعودية

### 2. Zoho OAuth Credentials

ستحتاج إلى:
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ORGANIZATION_ID`

---

## 📝 خطوات الإعداد

### الخطوة 1: إنشاء تطبيق Zoho OAuth

1. اذهب إلى [Zoho API Console](https://api-console.zoho.com/)
2. انقر على "Add Client"
3. اختر "Server-based Applications"
4. املأ البيانات:
   - **Client Name:** Atlantis E-commerce Platform
   - **Homepage URL:** `https://your-domain.com`
   - **Authorized Redirect URIs:** `https://your-supabase-url/functions/v1/zoho-callback`

5. احفظ:
   - ✅ `Client ID`
   - ✅ `Client Secret`

### الخطوة 2: الحصول على Refresh Token

#### الطريقة الأولى: عبر المتصفح (الموصى بها)

1. افتح الرابط التالي في المتصفح (بعد تعديل البيانات):

```
https://accounts.zoho.com/oauth/v2/auth?
scope=ZohoBooks.fullaccess.all&
client_id=YOUR_CLIENT_ID&
response_type=code&
redirect_uri=https://your-supabase-url/functions/v1/zoho-callback&
access_type=offline&
prompt=consent
```

2. سجل الدخول بحساب Zoho وامنح الصلاحيات

3. سيتم توجيهك إلى صفحة callback تحتوي على `REFRESH_TOKEN`

4. انسخ الـ Refresh Token

#### الطريقة الثانية: عبر صفحة الـ Callback المدمجة

1. اذهب إلى: `https://your-domain.com/zoho/callback`

2. اتبع التعليمات على الشاشة

3. انسخ الـ Refresh Token المعروض

### الخطوة 3: الحصول على Organization ID

1. سجل الدخول إلى [Zoho Books](https://books.zoho.com)

2. اذهب إلى **Settings** → **Organization Profile**

3. ستجد Organization ID في الـ URL أو في الإعدادات

### الخطوة 4: إضافة Secrets في Supabase

1. اذهب إلى Supabase Dashboard

2. **Project Settings** → **Edge Functions** → **Secrets**

3. أضف المتغيرات التالية:

```bash
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_ORGANIZATION_ID=your_organization_id_here
```

4. احفظ التغييرات

### الخطوة 5: Deploy Edge Function

```bash
# في مجلد المشروع
supabase functions deploy sync-order-to-zoho
```

### الخطوة 6: تطبيق Database Migrations

```bash
# تطبيق migrations
supabase db push

# أو يدوياً في Supabase Dashboard:
# SQL Editor → نسخ محتوى الملفات التالية:
# - supabase/migrations/20251123000000_add_zoho_integration_to_orders.sql
# - supabase/migrations/20251123000001_create_zoho_sync_trigger.sql
```

---

## 🚀 الاستخدام

### المزامنة التلقائية

التكامل يعمل **تلقائياً** عند تأكيد الطلب:

```sql
-- عند تحديث الطلب وتعيين confirmed_at
UPDATE ecommerce_orders
SET confirmed_at = NOW()
WHERE id = 'order_id_here';

-- سيتم تلقائياً:
-- 1. استدعاء Edge Function
-- 2. إنشاء/تحديث العميل في Zoho
-- 3. إنشاء الفاتورة في Zoho
-- 4. تحديث الطلب بمعلومات الفاتورة
```

### المزامنة اليدوية

يمكنك إرسال طلب يدوياً:

```typescript
// من الكود
const { data, error } = await supabase.functions.invoke('sync-order-to-zoho', {
  body: { order_id: 'your-order-id' }
});

if (data?.success) {
  console.log('تم إنشاء الفاتورة:', data.invoice_number);
}
```

```bash
# عبر cURL
curl -X POST 'https://your-supabase-url/functions/v1/sync-order-to-zoho' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"order_id": "order-uuid-here"}'
```

### إعادة المحاولة للطلبات الفاشلة

```sql
-- عرض الطلبات الفاشلة
SELECT
  id,
  order_number,
  zoho_error_message,
  zoho_last_sync_attempt
FROM ecommerce_orders
WHERE zoho_sync_status = 'FAILED'
ORDER BY created_at DESC;

-- إعادة المحاولة
UPDATE ecommerce_orders
SET zoho_sync_status = 'PENDING'
WHERE id = 'failed-order-id';
```

---

## 📊 حالات المزامنة

| الحالة | الوصف |
|--------|-------|
| `PENDING` | في انتظار المزامنة |
| `IN_PROGRESS` | جاري المزامنة |
| `SYNCED` | تمت المزامنة بنجاح ✅ |
| `FAILED` | فشلت المزامنة ❌ |

---

## 🔍 التحقق من نجاح التكامل

### 1. فحص جدول الطلبات

```sql
SELECT
  order_number,
  zoho_invoice_id,
  zoho_invoice_number,
  zoho_sync_status,
  zoho_synced_at
FROM ecommerce_orders
WHERE zoho_sync_status = 'SYNCED'
LIMIT 10;
```

### 2. فحص Logs

```bash
# عرض logs من Edge Function
supabase functions logs sync-order-to-zoho --tail
```

### 3. التحقق من Zoho Books

1. سجل الدخول إلى Zoho Books
2. اذهب إلى **Sales** → **Invoices**
3. ابحث عن رقم الطلب من المنصة
4. تحقق من تفاصيل الفاتورة

---

## 🛠️ استكشاف الأخطاء

### خطأ: "Failed to get access token"

**السبب:** Refresh Token منتهي أو خاطئ

**الحل:**
1. احذف الـ Refresh Token القديم
2. احصل على Refresh Token جديد (راجع الخطوة 2)
3. حدّث Secret في Supabase

### خطأ: "Failed to create customer"

**السبب:** بيانات العميل غير صحيحة أو مكررة

**الحل:**
1. تحقق من رقم الهاتف (يجب أن يكون فريد)
2. تحقق من البريد الإلكتروني
3. ابحث عن العميل في Zoho يدوياً

### خطأ: "Failed to create invoice"

**السبب:** بيانات الفاتورة غير صحيحة أو معرف العميل خاطئ

**الحل:**
1. تحقق من أن Customer ID صحيح
2. تحقق من أن المبالغ صحيحة (> 0)
3. تحقق من إعدادات الضريبة في Zoho

### خطأ: "Zoho credentials not configured"

**السبب:** المتغيرات البيئية غير موجودة

**الحل:**
1. افتح Supabase Dashboard
2. تحقق من Edge Functions Secrets
3. أضف المتغيرات المفقودة

---

## 📈 أفضل الممارسات

### 1. المراقبة المستمرة

```sql
-- إنشاء view لمراقبة حالات المزامنة
CREATE VIEW zoho_sync_monitoring AS
SELECT
  zoho_sync_status,
  COUNT(*) as count,
  MAX(zoho_last_sync_attempt) as last_attempt
FROM ecommerce_orders
GROUP BY zoho_sync_status;
```

### 2. معالجة الطلبات الفاشلة

أنشئ Cron Job أو Scheduled Task لإعادة محاولة الطلبات الفاشلة:

```typescript
// مثال: إعادة المحاولة كل ساعة
const retryFailedOrders = async () => {
  const { data: failedOrders } = await supabase
    .from('ecommerce_orders')
    .select('id')
    .eq('zoho_sync_status', 'FAILED')
    .lt('zoho_last_sync_attempt', new Date(Date.now() - 3600000).toISOString())
    .limit(10);

  for (const order of failedOrders || []) {
    await supabase.functions.invoke('sync-order-to-zoho', {
      body: { order_id: order.id }
    });
  }
};
```

### 3. الإشعارات

أضف إشعارات للأخطاء:

```typescript
// عند فشل المزامنة
if (zoho_sync_status === 'FAILED') {
  await sendNotification({
    type: 'error',
    title: 'فشلت مزامنة الفاتورة مع Zoho',
    message: `الطلب ${order_number}: ${zoho_error_message}`
  });
}
```

---

## 🔐 الأمان

### الممارسات الآمنة:

✅ **لا تحفظ** Access Token في قاعدة البيانات (يتم إنشاؤه ديناميكياً)
✅ **استخدم** Refresh Token فقط (صالح لمدة طويلة)
✅ **احفظ** جميع Credentials في Supabase Secrets (مشفرة)
✅ **لا تشارك** Client Secret مع أي شخص
✅ **راجع** Logs بانتظام للتأكد من عدم وجود محاولات غير مصرح بها

---

## 📞 الدعم

### في حالة وجود مشاكل:

1. **راجع Logs:** `supabase functions logs sync-order-to-zoho`
2. **تحقق من الـ Database:** استعلامات SQL أعلاه
3. **راجع Zoho Logs:** في لوحة تحكم Zoho
4. **تواصل مع الدعم:** support@atlantis-platform.com

---

## 📚 موارد إضافية

- [Zoho Books API Documentation](https://www.zoho.com/books/api/v3/)
- [Zoho OAuth Documentation](https://www.zoho.com/accounts/protocol/oauth.html)
- [ZATCA E-Invoicing Requirements](https://zatca.gov.sa/ar/E-Invoicing/Pages/default.aspx)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

## ✅ Checklist الإطلاق

قبل الإطلاق للإنتاج، تأكد من:

- [ ] تم إضافة جميع Zoho Secrets في Supabase
- [ ] تم deploy Edge Function بنجاح
- [ ] تم تطبيق جميع Database Migrations
- [ ] تم اختبار إنشاء فاتورة تجريبية
- [ ] تم التحقق من ظهور الفاتورة في Zoho Books
- [ ] تم تفعيل الفوترة الإلكترونية (ZATCA) في Zoho
- [ ] تم إضافة رقم التسجيل الضريبي في Zoho
- [ ] تم إعداد نظام المراقبة والإشعارات
- [ ] تم توثيق خطة معالجة الأخطاء

---

**تم بواسطة:** فريق تطوير أتلانتس
**الإصدار:** 1.0
**التاريخ:** 23 نوفمبر 2025
