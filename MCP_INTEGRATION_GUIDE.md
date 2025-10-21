# دليل ربط ChatGPT مع مشروعك عبر MCP

## ⚠️ تحذير أمني مهم جداً
**هذا الـ endpoint يعطي صلاحيات كاملة على قاعدة البيانات!** أي شخص لديه الـ API Key يمكنه:
- قراءة كل البيانات
- إضافة بيانات جديدة
- تعديل أي بيانات
- حذف أي بيانات

**لا تشارك الـ API Key مع أحد!**

---

## 1. الحصول على الـ API Key

الـ API Key موجود في Supabase Secrets باسم `MCP_API_KEY`. 

للحصول عليه:
1. اذهب إلى: https://supabase.com/dashboard/project/uewuiiopkctdtaexmtxu/settings/functions
2. افتح قسم "Secrets"
3. ابحث عن `MCP_API_KEY`
4. انسخ القيمة

---

## 2. رابط الـ Endpoint

```
https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/mcp-full-access
```

---

## 3. إعداد ChatGPT

في ChatGPT، أضف رابط جديد:

**الاسم:** Lovable افلييت نظام

**الوصف:** لوفبل انشاء منصه افلييت فيه

**MCP الخاص بخادم URL عنوان:**
```
https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/mcp-full-access
```

**المصادقة:** OAuth

**Custom Headers:**
```
x-mcp-key: [ضع هنا الـ API Key]
```

---

## 4. أمثلة على الاستخدام

### قراءة جميع المتاجر
```json
{
  "action": "select",
  "table": "affiliate_stores",
  "columns": "*"
}
```

### قراءة متاجر نشطة فقط
```json
{
  "action": "select",
  "table": "affiliate_stores",
  "filters": {
    "is_active": true
  }
}
```

### إضافة متجر جديد
```json
{
  "action": "insert",
  "table": "affiliate_stores",
  "data": {
    "store_name": "متجر تجريبي",
    "store_slug": "test-store",
    "profile_id": "uuid-here"
  }
}
```

### تعديل متجر
```json
{
  "action": "update",
  "table": "affiliate_stores",
  "data": {
    "store_name": "اسم جديد"
  },
  "filters": {
    "id": "store-uuid-here"
  }
}
```

### حذف متجر
```json
{
  "action": "delete",
  "table": "affiliate_stores",
  "filters": {
    "id": "store-uuid-here"
  }
}
```

### عرض جميع الجداول
```json
{
  "action": "list_tables"
}
```

### وصف جدول
```json
{
  "action": "describe_table",
  "table": "affiliate_stores"
}
```

---

## 5. العمليات المدعومة

| العملية | الوصف |
|---------|--------|
| `select` | قراءة بيانات من جدول |
| `insert` | إضافة بيانات جديدة |
| `update` | تعديل بيانات موجودة |
| `delete` | حذف بيانات |
| `list_tables` | عرض جميع الجداول |
| `describe_table` | عرض تفاصيل جدول |
| `raw_query` | تنفيذ استعلام SQL (خطير!) |

---

## 6. الجداول الرئيسية في النظام

- `affiliate_stores` - متاجر المسوقين
- `affiliate_products` - منتجات المسوقين
- `products` - جميع المنتجات
- `profiles` - ملفات المستخدمين
- `commissions` - العمولات
- `ecommerce_orders` - الطلبات
- `order_tracking` - تتبع الطلبات

---

## 7. نصائح للاستخدام

1. **استخدم الفلاتر دائماً** لتحديد البيانات بدقة
2. **تجنب `raw_query`** إلا في حالات الضرورة القصوى
3. **استخدم `list_tables` و `describe_table`** لفهم البيانات
4. **تأكد من صحة الـ UUID** قبل التعديل أو الحذف

---

## 8. أمثلة ChatGPT

### مثال 1: سؤال عن المتاجر
**أنت:** كم عدد المتاجر النشطة؟

**ChatGPT سيرسل:**
```json
{
  "action": "select",
  "table": "affiliate_stores",
  "filters": {
    "is_active": true
  },
  "columns": "id"
}
```

### مثال 2: إضافة متجر
**أنت:** أضف متجر جديد باسم "متجر الالكترونيات"

**ChatGPT سيرسل:**
```json
{
  "action": "insert",
  "table": "affiliate_stores",
  "data": {
    "store_name": "متجر الالكترونيات",
    "store_slug": "electronics-store",
    "is_active": true
  }
}
```

---

## 9. استكشاف الأخطاء

### خطأ 401 Unauthorized
- تأكد من صحة الـ API Key في الـ Headers

### خطأ 400 Bad Request
- تأكد من صحة اسم الجدول
- تأكد من صحة الأعمدة
- تأكد من صحة البيانات

### لا توجد بيانات
- استخدم `list_tables` للتأكد من اسم الجدول
- استخدم `describe_table` لمعرفة الأعمدة

---

## 10. الأمان

✅ **افعل:**
- احتفظ بالـ API Key سراً
- استخدم الفلاتر لتحديد البيانات
- راجع العمليات قبل التنفيذ

❌ **لا تفعل:**
- لا تشارك الـ API Key
- لا تحذف بدون فلاتر
- لا تستخدم `raw_query` إلا للضرورة
