# Unified Orders System - API Documentation

## نظرة عامة

نظام الطلبات الموحد (Unified Orders System) يوفر طبقة موحدة للتعامل مع الطلبات من مصادر متعددة (التجارة الإلكترونية، الطلبات البسيطة، الطلبات اليدوية).

## جدول order_hub

الجدول المركزي الذي يجمع جميع الطلبات من مصادر مختلفة.

### الهيكل

```typescript
interface OrderHub {
  id: string;                    // UUID الطلب الموحد
  source: 'ecommerce' | 'simple' | 'manual'; // مصدر الطلب
  source_order_id: string;       // معرف الطلب الأصلي
  order_number: string;          // رقم الطلب
  customer_name: string;         // اسم العميل
  customer_phone: string;        // رقم هاتف العميل
  customer_email?: string;       // البريد الإلكتروني
  total_amount_sar: number;      // المبلغ الإجمالي
  status: string;                // حالة الطلب
  payment_status: string;        // حالة الدفع
  shop_id?: string;              // معرف المتجر
  affiliate_store_id?: string;   // معرف متجر المسوق
  created_at: string;            // تاريخ الإنشاء
  updated_at: string;            // تاريخ التحديث
}
```

## UnifiedOrdersService

خدمة موحدة للتعامل مع الطلبات.

### fetchOrders()

جلب الطلبات مع إمكانية التصفية.

```typescript
static async fetchOrders(filters?: UnifiedOrderFilters): Promise<OrderHub[]>

interface UnifiedOrderFilters {
  source?: 'ecommerce' | 'simple' | 'manual';
  status?: string;
  paymentStatus?: string;
  storeId?: string;
  affiliateStoreId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}
```

**مثال:**

```typescript
// جلب جميع الطلبات
const allOrders = await UnifiedOrdersService.fetchOrders();

// جلب طلبات التجارة الإلكترونية فقط
const ecommerceOrders = await UnifiedOrdersService.fetchOrders({
  source: 'ecommerce'
});

// جلب الطلبات المعلقة لمتجر معين
const pendingOrders = await UnifiedOrdersService.fetchOrders({
  storeId: 'store-uuid',
  status: 'pending'
});

// البحث عن طلبات
const searchResults = await UnifiedOrdersService.fetchOrders({
  searchQuery: '0551234567'
});
```

### getOrderById()

جلب طلب واحد بالتفاصيل.

```typescript
static async getOrderById(id: string): Promise<OrderHub>
```

**مثال:**

```typescript
const order = await UnifiedOrdersService.getOrderById('order-uuid');
console.log(order.customer_name, order.total_amount_sar);
```

### getStoreOrders()

جلب طلبات متجر معين.

```typescript
static async getStoreOrders(
  storeId: string, 
  affiliateStoreId?: string
): Promise<OrderHub[]>
```

**مثال:**

```typescript
// طلبات المتجر الأساسي
const storeOrders = await UnifiedOrdersService.getStoreOrders('store-uuid');

// طلبات متجر المسوق
const affiliateOrders = await UnifiedOrdersService.getStoreOrders(
  'store-uuid',
  'affiliate-store-uuid'
);
```

### getStoreStats()

جلب إحصائيات المتجر.

```typescript
static async getStoreStats(
  storeId?: string,
  affiliateStoreId?: string
): Promise<{
  total_orders: number;
  total_revenue: number;
  confirmed_orders: number;
  pending_orders: number;
  average_order_value: number;
} | null>
```

**مثال:**

```typescript
const stats = await UnifiedOrdersService.getStoreStats('store-uuid');
console.log(`إجمالي الطلبات: ${stats?.total_orders}`);
console.log(`إجمالي الإيرادات: ${stats?.total_revenue} ر.س`);
```

### updateOrderStatus()

تحديث حالة الطلب.

```typescript
static async updateOrderStatus(
  orderId: string,
  status: string
): Promise<OrderHub>
```

**مثال:**

```typescript
await UnifiedOrdersService.updateOrderStatus(
  'order-uuid',
  'confirmed'
);
```

### updatePaymentStatus()

تحديث حالة الدفع.

```typescript
static async updatePaymentStatus(
  orderId: string,
  paymentStatus: string
): Promise<OrderHub>
```

**مثال:**

```typescript
await UnifiedOrdersService.updatePaymentStatus(
  'order-uuid',
  'paid'
);
```

### getMonthlySales()

جلب مبيعات شهرية.

```typescript
static async getMonthlySales(
  storeId?: string,
  affiliateStoreId?: string,
  months?: number
): Promise<Array<{ month: string; total: number }>>
```

**مثال:**

```typescript
const sales = await UnifiedOrdersService.getMonthlySales('store-uuid', null, 6);
sales.forEach(month => {
  console.log(`${month.month}: ${month.total} ر.س`);
});
```

### getOrderWithRelations()

جلب الطلب مع جميع العلاقات (المرتجعات، الاستردادات، الشحنات).

```typescript
static async getOrderWithRelations(orderId: string): Promise<{
  order: OrderHub;
  returns: ProductReturn[];
  refunds: Refund[];
  shipments: Shipment[];
}>
```

**مثال:**

```typescript
const { order, returns, refunds, shipments } = 
  await UnifiedOrdersService.getOrderWithRelations('order-uuid');

console.log(`الطلب: ${order.order_number}`);
console.log(`عدد المرتجعات: ${returns.length}`);
console.log(`عدد الاستردادات: ${refunds.length}`);
console.log(`عدد الشحنات: ${shipments.length}`);
```

## React Hooks

### useUnifiedOrders()

Hook للتعامل مع الطلبات في مكونات React.

```typescript
const {
  orders,
  loading,
  error,
  updateOrderStatus,
  refreshOrders,
  fetchOrders
} = useUnifiedOrders(filters?: UnifiedOrderFilters);
```

**مثال:**

```tsx
function OrdersList() {
  const { orders, loading, error } = useUnifiedOrders({
    storeId: 'store-uuid',
    status: 'pending'
  });

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### useUnifiedOrdersStats()

Hook لجلب الإحصائيات.

```typescript
const { stats, loading } = useUnifiedOrdersStats(
  shopId?: string,
  affiliateStoreId?: string
);
```

**مثال:**

```tsx
function StatsCard() {
  const { stats, loading } = useUnifiedOrdersStats('store-uuid');

  if (loading) return <Skeleton />;

  return (
    <div>
      <p>إجمالي الطلبات: {stats.totalOrders}</p>
      <p>الإيرادات: {stats.totalRevenue} ر.س</p>
    </div>
  );
}
```

## Feature Flags

للتحكم بالإطلاق التدريجي للنظام الموحد.

```typescript
import { isFeatureEnabled } from '@/config/featureFlags';

// فحص تفعيل ميزة
if (isFeatureEnabled('USE_UNIFIED_ORDERS')) {
  // استخدام النظام الموحد
} else {
  // استخدام النظام القديم
}
```

### الأعلام المتاحة

- `USE_UNIFIED_ORDERS`: تفعيل نظام order_hub
- `USE_UNIFIED_RETURNS`: استخدام المرتجعات الموحدة
- `USE_UNIFIED_REFUNDS`: استخدام الاستردادات الموحدة
- `USE_UNIFIED_SHIPMENTS`: استخدام الشحنات الموحدة
- `SHOW_UNIFIED_DASHBOARD`: عرض لوحة التحكم الموحدة
- `SHOW_SOURCE_INDICATOR`: عرض مصدر الطلب
- `ENABLE_DUAL_WRITE`: الكتابة على الجداول القديمة والجديدة
- `SHOW_MIGRATION_TOOLS`: عرض أدوات الترحيل

## Database Functions

### check_data_quality()

فحص جودة البيانات والعلاقات.

```sql
SELECT * FROM check_data_quality();
```

**النتيجة:**

```typescript
interface DataQualityResult {
  check_name: string;
  status: 'success' | 'warning' | 'info';
  details: Record<string, number>;
}
```

## أفضل الممارسات

### 1. استخدام التصفية بدلاً من الجلب الكامل

```typescript
// ❌ سيء
const allOrders = await UnifiedOrdersService.fetchOrders();
const pending = allOrders.filter(o => o.status === 'pending');

// ✅ جيد
const pending = await UnifiedOrdersService.fetchOrders({ status: 'pending' });
```

### 2. استخدام Feature Flags

```typescript
// ✅ جيد - الإطلاق التدريجي
if (isFeatureEnabled('USE_UNIFIED_ORDERS')) {
  return <UnifiedOrdersList />;
} else {
  return <LegacyOrdersList />;
}
```

### 3. معالجة الأخطاء

```typescript
// ✅ جيد
try {
  const orders = await UnifiedOrdersService.fetchOrders();
  // معالجة النتائج
} catch (error) {
  console.error('Error fetching orders:', error);
  // عرض رسالة خطأ للمستخدم
}
```

### 4. تحسين الأداء

```typescript
// ✅ استخدام React Query للتخزين المؤقت
const { orders } = useUnifiedOrders({ storeId });
// يتم تخزين النتائج مؤقتاً تلقائياً
```

## أمثلة متقدمة

### مثال 1: لوحة تحكم شاملة

```tsx
function ComprehensiveDashboard() {
  const { stats } = useUnifiedOrdersStats('store-uuid');
  const { orders } = useUnifiedOrders({
    storeId: 'store-uuid',
    dateFrom: '2025-01-01'
  });

  return (
    <div>
      <StatsGrid stats={stats} />
      <OrdersChart orders={orders} />
      <RecentOrdersList orders={orders.slice(0, 10)} />
    </div>
  );
}
```

### مثال 2: نظام بحث متقدم

```tsx
function AdvancedSearch() {
  const [filters, setFilters] = useState<UnifiedOrderFilters>({});
  const { orders, loading } = useUnifiedOrders(filters);

  return (
    <div>
      <SearchFilters onChange={setFilters} />
      {loading ? <Spinner /> : <OrdersTable orders={orders} />}
    </div>
  );
}
```

### مثال 3: تصدير البيانات

```typescript
async function exportOrders(storeId: string) {
  const orders = await UnifiedOrdersService.fetchOrders({ storeId });
  
  const csv = orders.map(order => 
    `${order.order_number},${order.customer_name},${order.total_amount_sar}`
  ).join('\n');
  
  // تحميل CSV
  downloadCSV(csv, 'orders.csv');
}
```

## الدعم والمساعدة

- للأسئلة: راجع [GitHub Issues](https://github.com/yourproject/issues)
- للتحديثات: راجع [CHANGELOG.md](./CHANGELOG.md)
- للمساهمة: راجع [CONTRIBUTING.md](./CONTRIBUTING.md)
