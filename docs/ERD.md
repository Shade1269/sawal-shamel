# مخطط علاقات قاعدة البيانات (ERD)

## 🎯 نظرة عامة

هذا المستند يوضح بنية قاعدة البيانات الموحدة لمنصة Anaqti، مع التركيز على العلاقات الرئيسية والجداول المركزية.

---

## 🏗️ الجداول المركزية (Core Tables)

### 1. order_hub (مركز الطلبات الموحد)
**الوصف**: SSOT لجميع أنواع الطلبات  
**النوع**: Hub Table

```sql
order_hub
├── id (PK)
├── source ('ecommerce' | 'simple' | 'manual')
├── source_order_id (FK → ecommerce_orders.id | simple_orders.id)
├── order_number
├── customer_name
├── customer_phone
├── customer_email
├── total_amount_sar
├── status
├── payment_status
├── affiliate_store_id (FK → affiliate_stores.id)
├── created_at
└── updated_at
```

**العلاقات**:
- `1:N` → `shipments.order_hub_id`
- `1:N` → `invoices.order_hub_id`
- `1:N` → `refunds.order_hub_id`
- `1:N` → `product_returns.order_hub_id`
- `N:1` → `affiliate_stores.id`

**الفهارس (7)**:
- `idx_order_hub_source_order_id` (source, source_order_id)
- `idx_order_hub_customer_phone`
- `idx_order_hub_customer_email`
- `idx_order_hub_status`
- `idx_order_hub_payment_status`
- `idx_order_hub_affiliate_store_id`
- `idx_order_hub_created_at`

---

### 2. profiles (الملفات الشخصية الموحدة)
**الوصف**: SSOT لهوية المستخدمين  
**النوع**: Core Identity Table

```sql
profiles
├── id (PK)
├── auth_user_id (FK → auth.users.id) UNIQUE
├── email
├── phone
├── full_name
├── avatar_url
├── bio
├── role ('admin' | 'merchant' | 'affiliate' | 'customer')
├── level ('bronze' | 'silver' | 'gold' | 'legendary')
├── points
├── total_earnings
├── is_active
├── created_at
├── updated_at
└── last_activity_at
```

**العلاقات**:
- `1:N` → `affiliate_stores.profile_id`
- `1:N` → `shops.owner_id`
- `1:N` → `commissions.affiliate_id`
- `1:N` → `points_events.affiliate_id`
- `1:1` → `auth.users.id`

**الفهارس (5)**:
- `idx_profiles_auth_user_id`
- `idx_profiles_email`
- `idx_profiles_phone`
- `idx_profiles_role`
- `idx_profiles_is_active`

---

### 3. shipments (الشحنات مع التتبع)
**الوصف**: إدارة الشحنات مع تاريخ كامل  
**النوع**: Operations Table

```sql
shipments
├── id (PK)
├── shipment_number
├── order_hub_id (FK → order_hub.id) SET NULL
├── ecommerce_order_id (FK → ecommerce_orders.id) SET NULL
├── simple_order_id (FK → simple_orders.id) SET NULL
├── tracking_number
├── tracking_url
├── carrier_name
├── status
├── estimated_delivery_date
├── actual_delivery_date
├── current_location
├── last_update_time
├── created_at
└── updated_at
```

**العلاقات**:
- `N:1` → `order_hub.id`
- `1:N` → `shipment_events.shipment_id`

**الفهارس (2)**:
- `idx_shipments_tracking_number`
- `idx_shipments_status`

---

### 4. shipment_events (تاريخ الشحنات)
**الوصف**: سجل تفصيلي لجميع أحداث الشحنة  
**النوع**: Audit/History Table

```sql
shipment_events
├── id (PK)
├── shipment_id (FK → shipments.id) CASCADE
├── event_type
├── event_description
├── location
├── event_timestamp
├── created_by (FK → profiles.id) SET NULL
└── created_at
```

**العلاقات**:
- `N:1` → `shipments.id`
- `N:1` → `profiles.id`

**الفهارس (3)**:
- `idx_shipment_events_shipment_id`
- `idx_shipment_events_timestamp`
- `idx_shipment_events_created_by`

---

## 🔗 العلاقات الرئيسية

### نظام الطلبات (Order System)

```
┌─────────────────┐
│  affiliate_     │
│  stores         │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│   order_hub     │◄──────────────┐
│   (SSOT)        │               │
└────────┬────────┘               │
         │ 1:N                    │ N:1
         ▼                        │
┌─────────────────┐         ┌────┴────────┐
│   shipments     │────────►│ ecommerce_  │
│                 │ N:1     │ orders      │
└────────┬────────┘         └─────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│ shipment_events │
│  (history)      │
└─────────────────┘
```

### نظام الهوية (Identity System)

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │
│    (SSOT)       │
└────────┬────────┘
         │ 1:N
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│ affiliate_  │  │  shops   │  │ commissions  │
│ stores      │  │          │  │              │
└─────────────┘  └──────────┘  └──────────────┘
```

### نظام CMS (Content System)

```
┌─────────────────┐
│  affiliate_     │
│  stores         │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│ cms_custom_     │
│ pages (SSOT)    │
└────────┬────────┘
         │ 1:N
         ├──────────────┬──────────────────┐
         ▼              ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ cms_content │  │ cms_page_   │  │ cms_seo_    │
│ _widgets    │  │ revisions   │  │ analytics   │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🎨 أنواع البيانات المخصصة (Custom Types)

```sql
-- نوع الدور
CREATE TYPE user_role AS ENUM (
  'admin', 
  'merchant', 
  'affiliate', 
  'customer', 
  'moderator'
);

-- نوع المستوى
CREATE TYPE user_level AS ENUM (
  'bronze', 
  'silver', 
  'gold', 
  'legendary'
);

-- نوع الثيم
CREATE TYPE theme_type AS ENUM (
  'classic', 
  'modern', 
  'minimal'
);

-- حالة التحالف
CREATE TYPE alliance_status AS ENUM (
  'active', 
  'inactive', 
  'disbanded'
);

-- نوع الخصم
CREATE TYPE discount_type AS ENUM (
  'percent', 
  'fixed'
);
```

---

## 🔒 سياسات الحذف (Delete Policies)

### CASCADE (حذف تسلسلي)
يُستخدم للبيانات التابعة التي يجب حذفها مع الجدول الأصلي:

- `shipment_events` → `shipments`
- `ecommerce_order_items` → `ecommerce_orders`
- `simple_order_items` → `simple_orders`
- `cms_content_widgets` → `cms_custom_pages`
- `cms_page_revisions` → `cms_custom_pages`

### SET NULL (إبقاء السجل)
يُستخدم للمراجع الاختيارية:

- `product_returns.order_hub_id` → `order_hub`
- `refunds.order_hub_id` → `order_hub`
- `shipments.order_hub_id` → `order_hub`
- `invoices.order_hub_id` → `order_hub`
- `shipment_events.created_by` → `profiles`

---

## 📊 الأعمدة المحسوبة (Generated Columns)

### 1. cart_items.total_price_sar_computed
```sql
total_price_sar_computed = quantity * unit_price_sar
```

### 2. ecommerce_order_items.total_price_computed
```sql
total_price_computed = quantity * unit_price_sar
```

### 3. simple_order_items.total_price_computed
```sql
total_price_computed = quantity * unit_price_sar
```

### 4. product_variants.available_stock_computed
```sql
available_stock_computed = current_stock - reserved_stock
```

---

## 🔍 الفهارس الرئيسية (Key Indexes)

### للأداء (Performance)
- جميع FKs مُفهرسة
- الحقول المستخدمة في WHERE و JOIN
- الحقول المستخدمة في ORDER BY

### للبحث (Search)
- `customer_phone`, `customer_email` في order_hub
- `email`, `phone` في profiles
- `tracking_number` في shipments

### للفرز (Sorting)
- `created_at` في معظم الجداول (DESC)
- `updated_at` للبحث عن آخر التحديثات

---

## 📝 ملاحظات مهمة

### 1. SSOT (Single Source of Truth)
- `order_hub` → جميع الطلبات
- `profiles` → جميع المستخدمين
- `cms_custom_pages` → جميع صفحات CMS

### 2. التوافق الخلفي (Backward Compatibility)
- `user_profiles_compat` view
- `store_pages_compat` view
- `page_builder_archive` view

### 3. الأمان (Security)
- جميع الجداول لديها RLS policies
- Security Definer functions للعمليات الحساسة
- Audit logs لتتبع التغييرات

### 4. الأداء (Performance)
- Generated columns للحسابات المتكررة
- Indexes شاملة
- Triggers محسّنة

---

## 🔄 Triggers & Functions

### Triggers
- `trg_sync_ecommerce_to_hub` - مزامنة ecommerce_orders → order_hub
- `trg_sync_simple_to_hub` - مزامنة simple_orders → order_hub
- `log_shipment_creation_event` - تسجيل إنشاء شحنة
- `log_shipment_event` - تسجيل تحديثات الشحنة

### Functions
- `get_unified_store_orders()` - طلبات موحدة لمتجر
- `get_unified_order_stats()` - إحصائيات شاملة
- `get_shipment_history()` - تاريخ شحنة
- `get_latest_shipment_location()` - آخر موقع
- `get_current_profile()` - المستخدم الحالي
- `check_all_data_quality()` - فحص الجودة
- `auto_fix_missing_data()` - إصلاح تلقائي
- `cleanup_expired_data()` - حذف قديم
- `backfill_statistics()` - تحديث إحصائيات
- `run_full_cleanup()` - تنظيف شامل

---

## 📈 خارطة الطريق المستقبلية

### قريباً
- [ ] Materialized Views للإحصائيات
- [ ] Partitioning للجداول الكبيرة
- [ ] Full-text search محسّن
- [ ] Real-time subscriptions

### المستقبل البعيد
- [ ] Multi-tenancy محسّن
- [ ] Data archiving تلقائي
- [ ] Advanced analytics
- [ ] ML integration
