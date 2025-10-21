# دليل ربط ChatGPT - الطريقة النهائية ✅

## الطريقة الصحيحة (بدون OAuth)

### 1️⃣ احصل على الـ API Key

اذهب إلى Supabase Secrets وانسخ قيمة `MCP_API_KEY`:
https://supabase.com/dashboard/project/uewuiiopkctdtaexmtxu/settings/functions

مثال: `abc123xyz789`

---

### 2️⃣ إعداد ChatGPT

**في شاشة "إضافة رابط جديد":**

#### الوصف (اختياري):
```
نظام افلييت - وصول كامل للبيانات
```

#### MCP الخاص بخادم URL عنوان:
```
https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/mcp-full-access?api_key=YOUR_API_KEY_HERE
```

**⚠️ مهم:** استبدل `YOUR_API_KEY_HERE` بالـ API Key الفعلي!

**مثال كامل:**
```
https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/mcp-full-access?api_key=abc123xyz789
```

#### المصادقة:
**اختر: "بدون مصادقة" ✅**

(الـ API Key موجود في الـ URL، لذا لا نحتاج مصادقة إضافية)

---

### 3️⃣ احفظ واختبر

اضغط "إنشاء" ثم جرب في ChatGPT:

```
كم عدد المتاجر النشطة في النظام؟
```

---

## ✅ طرق بديلة لإرسال الـ API Key

الـ endpoint يدعم 4 طرق مختلفة:

### 1. في الـ URL (الأسهل) ✅
```
https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/mcp-full-access?api_key=abc123
```

### 2. في الـ Body
```json
{
  "api_key": "abc123",
  "action": "select",
  "table": "affiliate_stores"
}
```

### 3. في Header (x-api-key)
```
x-api-key: abc123
```

### 4. في Authorization Header
```
Authorization: Bearer abc123
```

---

## 📋 أمثلة الاستخدام

### عرض المتاجر النشطة
```
اعرض لي جميع المتاجر النشطة
```

ChatGPT سيرسل:
```json
{
  "action": "select",
  "table": "affiliate_stores",
  "filters": {
    "is_active": true
  }
}
```

### إضافة متجر
```
أضف متجر جديد اسمه "متجر الكترونيات"
```

### تعديل متجر
```
عدل اسم المتجر رقم xxx إلى "اسم جديد"
```

### حذف متجر
```
احذف المتجر رقم xxx
```

---

## 🔍 استكشاف الأخطاء

### خطأ: Unauthorized
**السبب:** الـ API Key غير صحيح أو غير موجود

**الحل:**
1. تأكد من نسخ الـ API Key صحيح من Supabase
2. تأكد من وضعه في الـ URL بشكل صحيح
3. تأكد من عدم وجود مسافات زائدة

### خطأ: Invalid action
**السبب:** العملية المطلوبة غير مدعومة

**الحل:** استخدم إحدى العمليات المدعومة:
- `select` (قراءة)
- `insert` (إضافة)
- `update` (تعديل)
- `delete` (حذف)
- `list_tables` (عرض الجداول)
- `describe_table` (وصف جدول)

### الـ endpoint لا يستجيب
**الحل:**
1. تأكد من الـ URL صحيح
2. تحقق من Logs: https://supabase.com/dashboard/project/uewuiiopkctdtaexmtxu/functions/mcp-full-access/logs

---

## 🔐 ملاحظات أمنية

⚠️ **هذا يعطي صلاحيات كاملة على قاعدة البيانات!**

✅ **افعل:**
- احتفظ بالـ API Key سراً
- لا تشارك الرابط الكامل (الذي يحتوي على الـ API Key)
- استخدم الفلاتر دائماً عند الحذف أو التعديل

❌ **لا تفعل:**
- لا تنشر الـ URL الكامل في أي مكان عام
- لا تشارك الـ API Key مع أحد
- لا تحذف بدون فلاتر

---

## 📊 الجداول المتاحة

| الجدول | الوصف |
|--------|-------|
| `affiliate_stores` | متاجر المسوقين |
| `affiliate_products` | منتجات المسوقين |
| `products` | جميع المنتجات |
| `profiles` | ملفات المستخدمين |
| `commissions` | العمولات |
| `ecommerce_orders` | الطلبات |
| `order_tracking` | تتبع الطلبات |
| `cart_items` | عناصر السلة |
| `customers` | العملاء |

لعرض جميع الجداول:
```
اعرض لي جميع الجداول المتاحة
```

---

## 🎯 نصائح للاستخدام

1. **ابدأ بالاستعلام البسيط:**
   ```
   اعرض لي جميع الجداول
   ```

2. **اعرف تفاصيل الجدول قبل التعديل:**
   ```
   اعرض لي تفاصيل جدول affiliate_stores
   ```

3. **استخدم الفلاتر دائماً:**
   ```json
   {
     "action": "update",
     "table": "affiliate_stores",
     "filters": {
       "id": "uuid-here"
     },
     "data": {
       "store_name": "الاسم الجديد"
     }
   }
   ```

4. **تحقق من النتائج:**
   - راجع الـ Logs بعد كل عملية
   - تأكد من صحة البيانات المُدخلة

---

## ✨ جاهز للاستخدام!

الآن يمكنك استخدام ChatGPT للتحكم الكامل في قاعدة البيانات. جرب أمثلة بسيطة أولاً ثم انتقل للعمليات المعقدة.

**رابط سريع للوثائق:**
- Supabase Secrets: https://supabase.com/dashboard/project/uewuiiopkctdtaexmtxu/settings/functions
- Edge Function Logs: https://supabase.com/dashboard/project/uewuiiopkctdtaexmtxu/functions/mcp-full-access/logs
