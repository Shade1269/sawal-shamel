# تقرير التقدم: توحيد قاعدة البيانات

**آخر تحديث**: 2025-10-11  
**الحالة**: 🟢 المراحل 1-3 + 4(ب-ج) مكتملة (60% من الخطة الشاملة)

---

## ✅ المُنجَز (Completed)

### المرحلة 1: إصلاح الثغرات الحرجة (order_hub)
**الحالة**: ✅ 100%

#### المفاتيح الأجنبية (4 FKs):
- ✅ `product_returns.order_hub_id → order_hub(id)` ON DELETE SET NULL
- ✅ `refunds.order_hub_id → order_hub(id)` ON DELETE SET NULL
- ✅ `shipments.order_hub_id → order_hub(id)` ON DELETE SET NULL
- ✅ `invoices.order_hub_id → order_hub(id)` ON DELETE SET NULL

#### Triggers للمزامنة التلقائية:
- ✅ `trg_sync_ecommerce_to_hub` على `ecommerce_orders`
- ✅ `trg_sync_simple_to_hub` على `simple_orders`

#### Functions للتحقق من الجودة:
- ✅ `check_order_hub_orphans()` - كشف البيانات اليتيمة

#### الفهارس (4 indexes):
- ✅ `idx_product_returns_order_hub_id`
- ✅ `idx_refunds_order_hub_id`
- ✅ `idx_shipments_order_hub_id`
- ✅ `idx_invoices_order_hub_id`

**نتيجة الاختبار**: 0 سجلات يتيمة في جميع الجداول ✅

---

### المرحلة 2: البنية المشتركة (Types & Computed)
**الحالة**: ✅ 100%

#### Arrays المُصحّحة (4):
- ✅ `products.image_urls` → `text[]`
- ✅ `products.tags` → `text[]`
- ✅ `chat_messages.mentions` → `uuid[]`
- ✅ `shipping_zones.postal_codes` → `text[]`

#### Generated Columns (4):
- ✅ `cart_items.total_price_sar_computed` = `quantity * unit_price_sar`
- ✅ `ecommerce_order_items.total_price_computed` = `quantity * unit_price_sar`
- ✅ `simple_order_items.total_price_computed` = `quantity * unit_price_sar`
- ✅ `product_variants.available_stock_computed` = `current_stock - reserved_stock`

#### الفهارس على الأعمدة المحسوبة:
- ✅ `idx_cart_items_total_computed`
- ✅ `idx_variants_available_stock` (partial: WHERE > 0)

---

### المرحلة 3: المفاتيح الأجنبية الشاملة
**الحالة**: ✅ 100%

#### CMS System (6 FKs):
- ✅ `cms_custom_pages.store_id → affiliate_stores(id)` CASCADE
- ✅ `cms_content_widgets.page_id → cms_custom_pages(id)` CASCADE
- ✅ `cms_page_revisions.page_id → cms_custom_pages(id)` CASCADE
- ✅ `cms_page_revisions.created_by → profiles(id)` SET NULL
- ✅ `cms_seo_analytics.page_id → cms_custom_pages(id)` CASCADE
- ✅ `content_editor_drafts.page_id → cms_custom_pages(id)` CASCADE

#### Marketing System (9 FKs):
- ✅ `email_campaigns.shop_id → shops(id)` CASCADE
- ✅ `marketing_automation_campaigns.store_id → affiliate_stores(id)` CASCADE
- ✅ `marketing_automation_campaigns.created_by → profiles(id)` SET NULL
- ✅ `social_media_accounts.shop_id → shops(id)` CASCADE
- ✅ `social_media_posts.shop_id → shops(id)` CASCADE
- ✅ `promotion_campaigns.store_id → affiliate_stores(id)` CASCADE
- ✅ `promotion_campaigns.created_by → profiles(id)` SET NULL
- ✅ `promotional_banners.store_id → affiliate_stores(id)` CASCADE
- ✅ `promotional_banners.created_by → profiles(id)` SET NULL

#### Settings & Configuration (3 FKs):
- ✅ `affiliate_store_settings.store_id → affiliate_stores(id)` CASCADE
- ✅ `store_settings.shop_id → shops(id)` CASCADE
- ✅ `coupons.shop_id → shops(id)` CASCADE

#### Inventory & Catalog (5 FKs):
- ✅ `product_variants.warehouse_product_id → warehouse_products(id)` CASCADE
- ✅ `inventory_movements.warehouse_product_id → warehouse_products(id)` CASCADE
- ✅ `inventory_movements.product_variant_id → product_variants(id)` SET NULL
- ✅ `inventory_movements.created_by → profiles(id)` SET NULL
- ✅ `simple_order_items.product_id → products(id)` SET NULL

#### CRM System (3 FKs):
- ✅ `lead_activities.lead_id → leads(id)` CASCADE
- ✅ `leads.store_id → affiliate_stores(id)` CASCADE
- ✅ `leads.assigned_to → profiles(id)` SET NULL

#### Themes & Reviews (5 FKs):
- ✅ `visual_theme_customizations.store_id → affiliate_stores(id)` CASCADE
- ✅ `user_custom_themes.user_id → profiles(id)` CASCADE
- ✅ `user_custom_themes.store_id → affiliate_stores(id)` CASCADE
- ✅ `product_reviews.product_id → products(id)` CASCADE
- ✅ `product_reviews.user_id → profiles(id)` CASCADE

#### Misc (1 FK):
- ✅ `saved_page_components.created_by → profiles(id)` SET NULL

**إجمالي FKs المُضافة**: 32 FK

---

### المرحلة 4(ب): توحيد نظام الشحن
**الحالة**: ✅ 100%

#### الحقول الجديدة في shipments (5):
- ✅ `tracking_url` - رابط تتبع خارجي
- ✅ `estimated_delivery_date` - تاريخ التسليم المتوقع
- ✅ `actual_delivery_date` - تاريخ التسليم الفعلي
- ✅ `current_location` - الموقع الحالي
- ✅ `last_update_time` - آخر وقت تحديث

#### جدول shipment_events الجديد:
- ✅ سجل تاريخي كامل لجميع أحداث الشحنات
- ✅ يتم التحديث تلقائياً عبر Triggers
- ✅ تتبع تغييرات الحالة والموقع

#### المفاتيح الأجنبية (2 FKs):
- ✅ `shipment_events.shipment_id → shipments(id)` CASCADE
- ✅ `shipment_events.created_by → profiles(id)` SET NULL

#### الفهارس (5 indexes):
- ✅ `idx_shipment_events_shipment_id`
- ✅ `idx_shipment_events_timestamp`
- ✅ `idx_shipment_events_created_by`
- ✅ `idx_shipments_tracking_number`
- ✅ `idx_shipments_status`

#### Triggers & Functions (4):
- ✅ `log_shipment_creation_event()` - تسجيل إنشاء شحنة
- ✅ `log_shipment_event()` - تسجيل تحديثات الشحنة
- ✅ `get_shipment_history()` - الحصول على تاريخ كامل
- ✅ `get_latest_shipment_location()` - آخر موقع مسجل

**نتيجة**: نظام شحن موحد مع تتبع تاريخي كامل ✅

### المرحلة 4(ج): توحيد نظام الهوية
**الحالة**: ✅ 100%

#### حقول جديدة في profiles (4):
- ✅ `avatar_url` - رابط الصورة الشخصية
- ✅ `bio` - نبذة عن المستخدم
- ✅ `level` - مستوى المستخدم
- ✅ `total_earnings` - إجمالي الأرباح

#### ترحيل البيانات:
- ✅ نسخ البيانات من `user_profiles` إلى `profiles`
- ✅ View للتوافق الخلفي (`user_profiles_compat`)

#### Functions موحدة (2):
- ✅ `get_user_profile()` - الحصول على بيانات مستخدم
- ✅ `get_current_profile()` - الحصول على المستخدم الحالي
- ✅ `check_profile_orphans()` - فحص البيانات اليتيمة

#### الفهارس (5):
- ✅ `idx_profiles_auth_user_id`
- ✅ `idx_profiles_email`
- ✅ `idx_profiles_phone`
- ✅ `idx_profiles_role`
- ✅ `idx_profiles_is_active`

#### RLS Policies (3):
- ✅ `profile_select_own` - قراءة الملف الشخصي
- ✅ `profile_update_own` - تحديث الملف الشخصي
- ✅ `profile_select_admin` - الإدمن يرى الكل

**نتيجة**: `profiles` هو SSOT للهوية ✅

---

## 📊 الإحصائيات

### قاعدة البيانات:
- **37 طلب** في order_hub (22 ecommerce + 13 legacy + 2 simple)
- **6,614 SAR** إجمالي الإيرادات
- **0 سجلات يتيمة** (orphans) ✅
- **34 علاقة FK جديدة** محمية (32 سابقة + 2 شحن)
- **4 أعمدة محسوبة** تلقائياً
- **4 arrays مُحدّدة** بأنواع صريحة
- **1 جدول جديد** للشحنات (`shipment_events`)
- **5 حقول جديدة** في `shipments`
- **4 حقول جديدة** في `profiles` (avatar_url, bio, level, total_earnings)
- **15 فهارس جديدة** للأداء (10 شحن + 5 profiles)
- **3 دوال جديدة** للهوية (get_user_profile، get_current_profile، check_profile_orphans)
- **1 view جديد** للتوافق (`user_profiles_compat`)

### الكود:
- ✅ `UnifiedOrdersService` (237 سطر)
- ✅ `useUnifiedOrders` hook
- ✅ `useUnifiedOrdersStats` hook
- ✅ 3 UI Components (Manager, List, Affiliate)
- ✅ `OrdersRouter` مع Feature Flags
- ✅ 7 Database Views موحدة

---

### المرحلة 4(ج): توحيد الهوية
**الحالة**: ✅ 100%

#### الحقول الجديدة في profiles (4):
- ✅ `avatar_url` - رابط صورة المستخدم
- ✅ `bio` - نبذة عن المستخدم  
- ✅ `level` - مستوى المستخدم (user_level)
- ✅ `total_earnings` - إجمالي الأرباح

#### ترحيل البيانات:
- ✅ نسخ البيانات من `user_profiles` → `profiles`
- ✅ إنشاء `user_profiles_compat` view للتوافق الخلفي

#### الدوال الموحدة (3 functions):
- ✅ `get_user_profile()` - الحصول على بيانات مستخدم محدد
- ✅ `get_current_profile()` - الحصول على بيانات المستخدم الحالي
- ✅ `check_profile_orphans()` - فحص البيانات اليتيمة

#### الفهارس (5 indexes):
- ✅ `idx_profiles_auth_user_id` (partial)
- ✅ `idx_profiles_email` (partial)
- ✅ `idx_profiles_phone` (partial)
- ✅ `idx_profiles_role`
- ✅ `idx_profiles_is_active` (partial)

#### RLS Policies (3 policies):
- ✅ Users can select own profile
- ✅ Users can update own profile
- ✅ Admins can select all profiles

**نتيجة**: `profiles` الآن SSOT موحد مع دوال آمنة ✅

---

## 🔜 المتبقي (Remaining - 40%)

### المرحلة 4(د): توحيد CMS
- ❌ تحديد نظام CMS الرئيسي (store_pages vs cms_custom_pages)
- ❌ ترحيل أو أرشفة page_builder_*

### المرحلة 5: طبقة الوصول للبيانات (DAL)
- ❌ Repositories محايدة عن تغييرات الجدول
- ❌ Views للتوافق الخلفي

### المرحلة 6: تنظيف البيانات
- ❌ فحص وإصلاح أي orphans متبقية
- ❌ Backfill للحقول المفقودة

### المرحلة 7-10: QA، Rollout، Documentation
- ❌ اختبارات E2E كاملة
- ❌ Runbooks للعمليات
- ❌ ERD محدّث
- ❌ إزالة الجداول legacy

---

## 🎯 الخطوات التالية المقترحة

### خيار 1: المرحلة 4(د) - توحيد CMS (موصى به)
**التقدير**: 2-3 ساعات  
**التأثير**: متوسط - تحديد نظام CMS رئيسي

### خيار 2: استكمال المرحلة 4(أ) - ربط Orders القديمة
**التقدير**: 1-2 ساعات  
**التأثير**: متوسط - ترحيل بيانات legacy orders إلى order_hub

---

## 📝 ملاحظات مهمة

1. **التحذيرات الأمنية**: 53 تحذير أمني (معظمها موجودة مسبقاً)
2. **الأداء**: جميع FKs مُفهرسة لتجنب بطء الـ queries
3. **سياسة الحذف**: 
   - `CASCADE` للتفاصيل التابعة (items, analytics, widgets, events)
   - `SET NULL` للمراجع الاختيارية (created_by, assigned_to)
4. **Feature Flags**: `USE_UNIFIED_ORDERS=true` مفعّل حالياً
5. **نظام الشحن**: يتم تسجيل جميع الأحداث تلقائياً عبر Triggers
6. **نظام الهوية**: `profiles` هو SSOT الآن، مع view للتوافق الخلفي

---

## 🧪 أوامر الاختبار

```sql
-- فحص البيانات اليتيمة
SELECT * FROM check_order_hub_orphans();
SELECT * FROM check_profile_orphans();

-- فحص جودة البيانات
SELECT * FROM check_data_quality();

-- إحصائيات order_hub
SELECT 
  source, 
  COUNT(*) as orders, 
  SUM(total_amount_sar) as revenue
FROM order_hub 
GROUP BY source;

-- الحصول على تاريخ شحنة معينة
SELECT * FROM get_shipment_history('SHIPMENT_UUID_HERE');

-- آخر موقع لشحنة
SELECT get_latest_shipment_location('SHIPMENT_UUID_HERE');

-- الحصول على ملف مستخدم
SELECT * FROM get_user_profile('USER_AUTH_UUID_HERE');

-- المستخدم الحالي
SELECT * FROM get_current_profile();
```

---

## 📞 التواصل

للأسئلة أو المشاكل، راجع:
- `docs/ROLLOUT_GUIDE.md` - دليل الإطلاق
- `docs/CHANGELOG.md` - سجل التغييرات
- `/testing` - صفحة الاختبار
