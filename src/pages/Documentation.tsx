import React from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBadge } from '@/components/design-system';
import { Book, Code, Database, Layers, Shield, Zap } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">نظام الطلبات الموحد</h1>
          <p className="text-xl text-muted-foreground">
            دليل شامل للـ API والمعمارية والأمثلة
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <UnifiedBadge variant="success">✅ الإصدار 1.0</UnifiedBadge>
            <UnifiedBadge variant="info">TypeScript</UnifiedBadge>
            <UnifiedBadge variant="info">React</UnifiedBadge>
            <UnifiedBadge variant="info">Supabase</UnifiedBadge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="hooks">Hooks</TabsTrigger>
            <TabsTrigger value="architecture">المعمارية</TabsTrigger>
            <TabsTrigger value="examples">أمثلة</TabsTrigger>
            <TabsTrigger value="best-practices">أفضل الممارسات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <UnifiedCard variant="glass-strong">
              <UnifiedCardHeader>
                <UnifiedCardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  ما هو النظام الموحد؟
                </UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-4">
                <p className="text-muted-foreground">
                  نظام الطلبات الموحد (Unified Orders System) هو طبقة موحدة للتعامل مع الطلبات من مصادر متعددة
                  (التجارة الإلكترونية، الطلبات البسيطة، الطلبات اليدوية).
                </p>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <UnifiedCard variant="flat">
                    <UnifiedCardHeader>
                      <UnifiedCardTitle className="text-lg flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        جدول موحد
                      </UnifiedCardTitle>
                    </UnifiedCardHeader>
                    <UnifiedCardContent>
                      <p className="text-sm text-muted-foreground">
                        جدول <code className="bg-muted px-1 rounded">order_hub</code> يجمع جميع الطلبات من مصادر مختلفة
                      </p>
                    </UnifiedCardContent>
                  </UnifiedCard>

                  <UnifiedCard variant="flat">
                    <UnifiedCardHeader>
                      <UnifiedCardTitle className="text-lg flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        خدمة موحدة
                      </UnifiedCardTitle>
                    </UnifiedCardHeader>
                    <UnifiedCardContent>
                      <p className="text-sm text-muted-foreground">
                        <code className="bg-muted px-1 rounded">UnifiedOrdersService</code> للتعامل مع جميع أنواع الطلبات
                      </p>
                    </UnifiedCardContent>
                  </UnifiedCard>

                  <UnifiedCard variant="flat">
                    <UnifiedCardHeader>
                      <UnifiedCardTitle className="text-lg flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        React Hooks
                      </UnifiedCardTitle>
                    </UnifiedCardHeader>
                    <UnifiedCardContent>
                      <p className="text-sm text-muted-foreground">
                        Hooks جاهزة للاستخدام في مكونات React مع إدارة الحالة
                      </p>
                    </UnifiedCardContent>
                  </UnifiedCard>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>

            <UnifiedCard variant="glass-strong">
              <UnifiedCardHeader>
                <UnifiedCardTitle>الميزات الرئيسية</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">أمان محسّن</p>
                      <p className="text-sm text-muted-foreground">RLS policies وSecurity Definer Functions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium">أداء عالي</p>
                      <p className="text-sm text-muted-foreground">Indexes، Caching، وPagination</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">مصادر متعددة</p>
                      <p className="text-sm text-muted-foreground">دعم ecommerce، simple، manual orders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-info mt-0.5" />
                    <div>
                      <p className="font-medium">قابل للتوسع</p>
                      <p className="text-sm text-muted-foreground">سهل إضافة مصادر جديدة</p>
                    </div>
                  </div>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>

          <TabsContent value="api" className="space-y-4 mt-6">
            <UnifiedCard variant="flat">
              <UnifiedCardHeader>
                <UnifiedCardTitle>UnifiedOrdersService API</UnifiedCardTitle>
                <UnifiedCardDescription>الخدمة الموحدة للتعامل مع الطلبات</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">getAllOrders()</h3>
                  <p className="text-sm text-muted-foreground mb-2">جلب جميع الطلبات من مصادر متعددة</p>
                  <pre className="bg-muted p-3 rounded-lg text-sm">
{`const orders = await UnifiedOrdersService.getAllOrders({
  page: 1,
  limit: 20,
  source: 'all', // 'ecommerce' | 'simple' | 'manual'
  status: 'pending'
});`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">getOrderById()</h3>
                  <p className="text-sm text-muted-foreground mb-2">جلب طلب محدد مع جميع تفاصيله</p>
                  <pre className="bg-muted p-3 rounded-lg text-sm">
{`const order = await UnifiedOrdersService.getOrderById(orderId);
// يرجع UnifiedOrder object`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">updateOrderStatus()</h3>
                  <p className="text-sm text-muted-foreground mb-2">تحديث حالة الطلب</p>
                  <pre className="bg-muted p-3 rounded-lg text-sm">
{`await UnifiedOrdersService.updateOrderStatus(
  orderId,
  'processing',
  'تم البدء بمعالجة الطلب'
);`}
                  </pre>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>

          <TabsContent value="hooks" className="space-y-4 mt-6">
            <UnifiedCard variant="glass-strong">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Hooks API</UnifiedCardTitle>
                <UnifiedCardDescription>React Hooks للعمل بسهولة مع البيانات الموحدة</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">useUnifiedOrders(filters?)</h3>
                  <p className="text-sm text-muted-foreground mb-3">Hook للتعامل مع الطلبات</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`function OrdersList() {
  const { orders, loading, error } = useUnifiedOrders({
    storeId: 'store-uuid',
    status: 'pending'
  });

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <div>{orders.map(order => ...)}</div>;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">useUnifiedOrdersStats(shopId, affiliateStoreId?)</h3>
                  <p className="text-sm text-muted-foreground mb-3">Hook لجلب الإحصائيات</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`function StatsCard() {
  const { stats, loading } = useUnifiedOrdersStats('store-uuid');

  if (loading) return <Skeleton />;

  return (
    <div>
      <p>الطلبات: {stats.totalOrders}</p>
      <p>الإيرادات: {stats.totalRevenue} ر.س</p>
    </div>
  );
}`}
                  </pre>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-4 mt-6">
            <UnifiedCard variant="flat">
              <UnifiedCardHeader>
                <UnifiedCardTitle>معمارية النظام</UnifiedCardTitle>
                <UnifiedCardDescription>هيكل النظام الموحد</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-4">
                <div className="bg-muted p-6 rounded-lg">
                  <pre className="text-xs overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────┐
│      User Interface (React)         │
│   Dashboard | Orders | Testing      │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│   Application Layer (Services)      │
│   - UnifiedOrdersService            │
│   - UnifiedOrdersStatsService       │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│  Adapters (Data Transformation)     │
│ ├─ EcommerceOrderAdapter            │
│ ├─ SimpleOrderAdapter               │
│ └─ ManualOrderAdapter               │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Data Layer (Supabase)          │
│ - orders (ecommerce + simple)       │
│ - order_items                       │
│ - manual_orders                     │
│ - manual_order_items                │
└─────────────────────────────────────┘`}
                  </pre>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4 mt-6">
            <UnifiedCard variant="glass-strong">
              <UnifiedCardHeader>
                <UnifiedCardTitle>أمثلة عملية</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">مثال 1: لوحة تحكم بسيطة</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`function Dashboard() {
  const { stats } = useUnifiedOrdersStats('store-uuid');
  const { orders } = useUnifiedOrders({ 
    storeId: 'store-uuid' 
  });

  return (
    <div>
      <StatsCards stats={stats} />
      <OrdersTable orders={orders} />
    </div>
  );
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">مثال 2: بحث وتصفية</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`function SearchOrders() {
  const [query, setQuery] = useState('');
  const { orders } = useUnifiedOrders({
    searchQuery: query,
    status: 'pending'
  });

  return (
    <div>
      <SearchInput onChange={setQuery} />
      <OrdersList orders={orders} />
    </div>
  );
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">مثال 3: تحديث الحالة</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`async function confirmOrder(orderId: string) {
  try {
    await UnifiedOrdersService.updateOrderStatus(
      orderId,
      'confirmed'
    );
    toast.success('تم تأكيد الطلب');
  } catch (error) {
    toast.error('فشل التأكيد');
  }
}`}
                  </pre>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>

          <TabsContent value="best-practices" className="space-y-4 mt-6">
            <UnifiedCard variant="flat">
              <UnifiedCardHeader>
                <UnifiedCardTitle>أفضل الممارسات</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">✅ استخدم التصفية بدلاً من الجلب الكامل</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// ❌ سيء
const all = await fetchOrders();
const pending = all.filter(o => o.status === 'pending');

// ✅ جيد
const pending = await fetchOrders({ status: 'pending' });`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">✅ استخدم Feature Flags للإطلاق التدريجي</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`if (isFeatureEnabled('USE_UNIFIED_ORDERS')) {
  return <UnifiedOrdersList />;
} else {
  return <LegacyOrdersList />;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">✅ معالجة الأخطاء دائماً</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`try {
  const orders = await fetchOrders();
  // معالجة النجاح
} catch (error) {
  console.error('Error:', error);
  toast.error('حدث خطأ');
}`}
                  </pre>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
