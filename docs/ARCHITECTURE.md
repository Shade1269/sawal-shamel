# Unified Orders System - Architecture

## المعماريّة الشاملة

### 1. نظرة عامة

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Dashboard    │  │ Orders List  │  │ Testing UI   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer (DAL)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     UnifiedOrdersService (TypeScript Service)        │  │
│  │  - fetchOrders()      - getStoreStats()              │  │
│  │  - getOrderById()     - updateOrderStatus()          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     React Hooks (State Management)                   │  │
│  │  - useUnifiedOrders()                                 │  │
│  │  - useUnifiedOrdersStats()                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer (Supabase)                   │
│                                                              │
│  ┌──────────────┐       ┌──────────────┐                   │
│  │order_hub     │◄──────┤Legacy Tables │                   │
│  │(Unified)     │       │ecommerce_    │                   │
│  │              │       │orders        │                   │
│  └──────┬───────┘       └──────────────┘                   │
│         │                                                    │
│         ├─────────┬─────────┬─────────┐                    │
│         ↓         ↓         ↓         ↓                     │
│  ┌──────────┐┌────────┐┌────────┐┌─────────┐              │
│  │ Returns  ││Refunds ││Shipments││Invoices │              │
│  └──────────┘└────────┘└────────┘└─────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 2. طبقات النظام

### طبقة العرض (Presentation Layer)

**المكونات:**
- `UnifiedOrdersList`: عرض قائمة الطلبات
- `UnifiedDashboard`: لوحة التحكم
- `DataQualityDashboard`: فحص جودة البيانات
- `UnifiedSystemTester`: اختبار النظام

**المسؤوليات:**
- عرض البيانات للمستخدم
- التفاعل مع المستخدم
- Validation في الواجهة
- تنسيق البيانات للعرض

### طبقة التطبيق (Application Layer)

**الخدمات:**
- `UnifiedOrdersService`: خدمة موحدة للطلبات
- Feature Flags: التحكم بالميزات

**المسؤوليات:**
- منطق الأعمال (Business Logic)
- التفاعل مع قاعدة البيانات
- تحويل البيانات
- معالجة الأخطاء

**React Hooks:**
- `useUnifiedOrders`: إدارة حالة الطلبات
- `useUnifiedOrdersStats`: إدارة الإحصائيات

**المسؤوليات:**
- إدارة الحالة (State Management)
- التخزين المؤقت (Caching)
- إعادة الجلب التلقائي
- معالجة Loading & Error states

### طبقة البيانات (Data Layer)

**الجداول الرئيسية:**

```sql
order_hub (الجدول المركزي)
├── ecommerce_orders (المصدر)
├── simple_orders (المصدر)
└── manual_orders (المصدر - مستقبلي)

order_hub → product_returns (1:N)
order_hub → refunds (1:N)
order_hub → shipments (1:N)
order_hub → invoices (1:N)
```

**المسؤوليات:**
- تخزين البيانات
- العلاقات بين الجداول
- RLS Policies (الأمان)
- Triggers & Functions

## 3. تدفق البيانات (Data Flow)

### مثال: جلب الطلبات

```
User Click
    ↓
Component (UnifiedOrdersList)
    ↓
Hook (useUnifiedOrders)
    ↓
Service (UnifiedOrdersService.fetchOrders)
    ↓
Supabase Client
    ↓
Database Query (SELECT * FROM order_hub)
    ↓
RLS Check (Row Level Security)
    ↓
Return Data
    ↓
Service Processing
    ↓
Hook State Update
    ↓
Component Re-render
    ↓
UI Update
```

### مثال: تحديث حالة الطلب

```
User Action
    ↓
updateOrderStatus(orderId, newStatus)
    ↓
UnifiedOrdersService.updateOrderStatus()
    ↓
UPDATE order_hub SET status = ?
    ↓
Trigger: sync_order_hub_from_ecommerce
    ↓
UPDATE ecommerce_orders (if source='ecommerce')
    ↓
Return Success
    ↓
Local State Update
    ↓
UI Refresh
```

## 4. نمط التصميم (Design Patterns)

### Service Layer Pattern

```typescript
// خدمة موحدة تخفي تعقيد قاعدة البيانات
class UnifiedOrdersService {
  static async fetchOrders(filters) {
    // منطق معقد للاستعلام
    // معالجة الأخطاء
    // تحويل البيانات
    return processedData;
  }
}
```

### Repository Pattern

```typescript
// الوصول إلى البيانات من خلال واجهة موحدة
interface OrderRepository {
  getAll(filters): Promise<Order[]>;
  getById(id): Promise<Order>;
  update(id, data): Promise<Order>;
}
```

### Feature Toggle Pattern

```typescript
// التحكم بالميزات بدون إعادة نشر
if (isFeatureEnabled('USE_UNIFIED_ORDERS')) {
  return <NewComponent />;
} else {
  return <LegacyComponent />;
}
```

## 5. استراتيجية الترحيل (Migration Strategy)

### المرحلة 1: البنية التحتية ✅
- إنشاء ENUMs
- إنشاء Generated Columns
- إضافة Arrays للعلاقات

### المرحلة 2: العلاقات ✅
- Foreign Keys
- Cascading Rules

### المرحلة 3: Order Hub ✅
- جدول order_hub
- Triggers للمزامنة
- Views للتوافق

### المرحلة 4: طبقة التطبيق ✅
- UnifiedOrdersService
- Feature Flags
- React Hooks

### المرحلة 5: ملء البيانات ✅
- Backfill من الجداول القديمة
- تحديث العلاقات
- فحص جودة البيانات

### المرحلة 6: الاختبار ✅
- Unit Tests
- Integration Tests
- UI Testing

### المرحلة 7: التوثيق ✅
- API Docs
- Architecture Docs
- Examples

### المرحلة 8: الإطلاق التدريجي (قادم)
- تفعيل Feature Flags تدريجياً
- مراقبة الأداء
- معالجة المشاكل

### المرحلة 9: إلغاء القديم (قادم)
- تعطيل الكود القديم
- حذف الجداول غير المستخدمة
- تنظيف نهائي

## 6. الأمان (Security)

### Row Level Security (RLS)

```sql
-- مثال: المستخدمون يرون طلباتهم فقط
CREATE POLICY "Users see own orders"
ON order_hub FOR SELECT
USING (
  shop_id IN (
    SELECT id FROM shops WHERE owner_id = auth.uid()
  )
  OR affiliate_store_id IN (
    SELECT id FROM affiliate_stores WHERE profile_id = auth.uid()
  )
);
```

### Security Definer Functions

```sql
-- للتعامل مع البيانات بصلاحيات عالية بشكل آمن
CREATE FUNCTION check_data_quality()
RETURNS TABLE(...)
SECURITY DEFINER
SET search_path = public
AS $$
  -- كود آمن هنا
$$;
```

## 7. الأداء (Performance)

### استراتيجيات التحسين

**1. Indexes:**
```sql
CREATE INDEX idx_order_hub_source ON order_hub(source);
CREATE INDEX idx_order_hub_status ON order_hub(status);
CREATE INDEX idx_order_hub_store ON order_hub(shop_id, affiliate_store_id);
```

**2. Caching:**
```typescript
// React Query يخزن النتائج مؤقتاً
const { orders } = useUnifiedOrders(filters);
// لا يعيد الجلب إلا عند الحاجة
```

**3. Pagination:**
```typescript
// جلب تدريجي بدلاً من الكل
fetchOrders({ limit: 50, offset: 0 });
```

## 8. المراقبة (Monitoring)

### Metrics المهمة

- عدد الاستعلامات في الثانية
- وقت الاستجابة
- معدل الأخطاء
- استخدام الذاكرة

### Logging

```typescript
// تسجيل الأحداث المهمة
console.log('[UnifiedOrders] Fetching orders', { filters });
console.error('[UnifiedOrders] Error:', error);
```

## 9. الاختبار (Testing)

### أنواع الاختبارات

**1. Unit Tests:**
```typescript
describe('UnifiedOrdersService', () => {
  it('should fetch orders', async () => {
    const orders = await UnifiedOrdersService.fetchOrders();
    expect(orders).toBeDefined();
  });
});
```

**2. Integration Tests:**
```typescript
it('should sync order_hub with ecommerce_orders', async () => {
  // إنشاء طلب في ecommerce_orders
  // التحقق من وجوده في order_hub
});
```

**3. E2E Tests:**
```typescript
// Cypress, Playwright
cy.visit('/orders');
cy.contains('الطلبات الموحدة');
```

## 10. التوسع المستقبلي

### إضافة مصدر جديد

```typescript
// 1. إضافة نوع جديد
type OrderSource = 'ecommerce' | 'simple' | 'manual' | 'api';

// 2. إنشاء جدول المصدر
CREATE TABLE api_orders (...);

// 3. إنشاء Trigger للمزامنة
CREATE TRIGGER sync_from_api ...

// 4. تحديث Service
static async fetchOrders(filters) {
  // يدعم المصدر الجديد تلقائياً
}
```

### إضافة ميزات جديدة

```typescript
// استخدام Feature Flags
const NEW_FEATURE = isFeatureEnabled('NEW_ORDER_ANALYTICS');

if (NEW_FEATURE) {
  // الميزة الجديدة
} else {
  // الميزة القديمة
}
```

## خلاصة

النظام الموحد مصمم ليكون:
- ✅ **قابل للتوسع**: إضافة مصادر جديدة بسهولة
- ✅ **آمن**: RLS وSecurity Definer
- ✅ **سريع**: Indexes وCaching
- ✅ **قابل للصيانة**: كود نظيف ومنظم
- ✅ **قابل للاختبار**: Unit, Integration, E2E
- ✅ **موثق**: API وArchitecture docs
