# 📋 Incident Playbooks - دليل التعامل مع الحوادث

## 🚨 الحوادث الحرجة

### 1. انقطاع نظام الدفع

**الأعراض:**
- فشل معاملات الدفع
- أخطاء من بوابة الدفع
- شكاوى العملاء

**التشخيص:**
```sql
-- فحص معاملات الدفع الفاشلة
SELECT COUNT(*), payment_method, error_message
FROM order_hub
WHERE payment_status = 'FAILED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY payment_method, error_message;
```

**الحل:**
1. التحقق من اتصال بوابة الدفع
2. مراجعة API keys
3. التواصل مع مزود الخدمة
4. تفعيل وضع الصيانة إن لزم

**Rollback:**
```sql
-- تحويل الطلبات المعلقة إلى يدوي
UPDATE order_hub
SET payment_status = 'PENDING_MANUAL_VERIFICATION'
WHERE payment_status = 'FAILED'
  AND created_at > NOW() - INTERVAL '1 hour';
```

---

### 2. تأخير الشحنات

**الأعراض:**
- شحنات متأخرة عن الموعد المتوقع
- عدم تحديث حالة التتبع

**التشخيص:**
```sql
-- الشحنات المتأخرة
SELECT s.id, s.shipment_number, s.carrier_name,
       s.estimated_delivery_date, s.status,
       oh.order_number, oh.customer_phone
FROM shipments s
JOIN order_hub oh ON (
  (s.ecommerce_order_id IS NOT NULL AND oh.source = 'ecommerce' AND oh.source_order_id = s.ecommerce_order_id)
  OR (s.simple_order_id IS NOT NULL AND oh.source = 'simple' AND oh.source_order_id = s.simple_order_id)
)
WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')
  AND s.estimated_delivery_date < CURRENT_DATE;
```

**الحل:**
1. التواصل مع شركة الشحن
2. تحديث العملاء
3. إضافة تعويض إن لزم
4. إنشاء تنبيه تلقائي

**الوقاية:**
```sql
-- تفعيل Cron Job للتنبيهات
-- إضافة في pg_cron
SELECT cron.schedule(
  'check-delayed-shipments',
  '0 9 * * *', -- كل يوم 9 صباحاً
  $$
  SELECT send_delayed_shipment_alerts();
  $$
);
```

---

### 3. قفزة في تنبيهات الاحتيال

**الأعراض:**
- زيادة مفاجئة في تنبيهات fraud_alerts
- معاملات مشبوهة

**التشخيص:**
```sql
-- التنبيهات الأخيرة
SELECT fa.id, fa.risk_score, fa.alert_reason,
       oh.order_number, oh.customer_phone, oh.total_amount_sar
FROM fraud_alerts fa
JOIN order_hub oh ON oh.id = fa.order_id
WHERE fa.created_at > NOW() - INTERVAL '1 hour'
  AND fa.status = 'PENDING'
ORDER BY fa.risk_score DESC;
```

**الحل:**
1. مراجعة يدوية فورية للطلبات عالية المخاطر
2. تجميد الطلبات المشبوهة
3. التواصل مع العملاء للتحقق
4. تحديث قواعد الاحتيال

**إجراء سريع:**
```sql
-- تجميد الطلبات عالية المخاطر
UPDATE order_hub
SET status = 'ON_HOLD'
WHERE id IN (
  SELECT order_id FROM fraud_alerts
  WHERE risk_score > 80 AND status = 'PENDING'
);
```

---

### 4. بيانات يتيمة (Orphaned Records)

**الأعراض:**
- فحوصات جودة البيانات تفشل
- سجلات بدون مراجع

**التشخيص:**
```sql
-- فحص شامل
SELECT * FROM check_data_quality();
```

**الحل:**
```sql
-- تشغيل الإصلاح التلقائي
SELECT * FROM auto_fix_missing_data();

-- أو التنظيف الشامل
SELECT * FROM run_full_cleanup();
```

**التحقق:**
```sql
-- التأكد من النتائج
SELECT check_name, status, details
FROM check_data_quality()
WHERE status = 'warning' OR status = 'error';
```

---

### 5. أداء بطيء

**الأعراض:**
- استعلامات بطيئة
- timeout errors
- شكاوى المستخدمين

**التشخيص:**
```sql
-- أبطأ الاستعلامات
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- الأقفال النشطة
SELECT pid, usename, state, query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%';
```

**الحل:**
1. تحديد الاستعلام البطيء
2. إضافة فهرس إن لزم
3. تحسين الاستعلام
4. VACUUM/ANALYZE

**فهارس مقترحة:**
```sql
-- إن لم تكن موجودة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_hub_created_at 
  ON order_hub(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_hub_status 
  ON order_hub(status) WHERE status != 'DELIVERED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_status 
  ON shipments(status) WHERE status NOT IN ('DELIVERED', 'CANCELLED');
```

---

### 6. محاولة كتابة في جدول قديم

**الأعراض:**
- أخطاء "مُجمّد للكتابة"
- فشل عمليات معينة

**التشخيص:**
```bash
# فحص الـ Logs
grep "مُجمّد للكتابة" /var/log/postgresql/*.log
```

**الحل:**
1. تحديد المصدر (أي كود يحاول الكتابة)
2. تحديث الكود لاستخدام الجداول الجديدة
3. مراجعة ROLLOUT_GUIDE.md

**Rollback المؤقت (طوارئ فقط):**
```sql
-- ⚠️ للطوارئ فقط - إلغاء Trigger مؤقتاً
DROP TRIGGER IF EXISTS prevent_orders_write ON public.orders;

-- بعد الإصلاح، إعادة تفعيله
CREATE TRIGGER prevent_orders_write
  BEFORE INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.prevent_legacy_write();
```

---

## 🔄 إجراءات الصيانة الدورية

### يومياً (Automated)
```sql
-- جدولة عبر pg_cron
SELECT cron.schedule('daily-cleanup', '0 2 * * *', $$
  SELECT run_full_cleanup();
$$);

SELECT cron.schedule('daily-stats', '0 3 * * *', $$
  SELECT backfill_statistics();
$$);
```

### أسبوعياً (Manual)
```bash
# فحص جودة البيانات
psql -c "SELECT * FROM check_data_quality();"

# مراجعة الأداء
psql -c "SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY seq_scan DESC LIMIT 20;"

# نسخ احتياطي
pg_dump -Fc mydb > backup_weekly_$(date +%Y%m%d).dump
```

### شهرياً
- مراجعة السعة والتخزين
- تحديث الفهارس
- أرشفة البيانات القديمة
- مراجعة Security warnings

---

## 📞 جهات الاتصال

### الطوارئ
- **Database Admin:** [رقم]
- **Backend Lead:** [رقم]
- **DevOps:** [رقم]

### الدعم
- **Supabase Support:** support@supabase.io
- **Payment Gateway:** [رقم]
- **Shipping Provider:** [رقم]

---

## 📊 مقاييس النجاح

**مؤشرات الصحة:**
- Uptime > 99.9%
- P95 latency < 500ms
- Error rate < 0.1%
- Orphaned records = 0
- Failed payments < 2%

**Dashboard المراقبة:**
```
/monitoring - لوحة المراقبة المباشرة
/testing - فحوصات الجودة
/rollout - حالة Feature Flags
```

---

**آخر تحديث:** 2025-10-11  
**النسخة:** 1.0
