import { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { ProductCategoriesManager } from './ProductCategoriesManager';
import { AdvancedInventoryManager } from './AdvancedInventoryManager';
import { AdvancedCouponSystem } from './AdvancedCouponSystem';
import { ReferralTrackingSystem } from './ReferralTrackingSystem';
import { 
  Package, 
  Archive, 
  Gift, 
  Share2, 
  BarChart3, 
  Users, 
  MessageSquare, 
  CreditCard,
  Settings,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export const ComprehensiveAffiliateManager = () => {
  const { store, isLoading } = useAffiliateStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لم يتم العثور على المتجر</h3>
          <p className="text-muted-foreground">
            يجب إنشاء متجر أولاً للوصول إلى أدوات الإدارة المتقدمة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المتجر الشاملة</h1>
          <p className="text-muted-foreground">أدوات متقدمة لإدارة متجرك بكفاءة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            فئات المنتجات
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            إدارة المخزون
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            نظام الكوبونات
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            نظام الإحالات
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            دعم العملاء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المنتجات النشطة</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">منتج متاح</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.total_orders || 0}</div>
                <p className="text-xs text-muted-foreground">طلب مكتمل</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.total_sales || 0} ريال</div>
                <p className="text-xs text-muted-foreground">مبيعات إجمالية</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">العملاء</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">عميل مسجل</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>حالة النظام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>إعداد المتجر</span>
                  </div>
                  <span className="text-sm text-green-600">مكتمل</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>إضافة المنتجات</span>
                  </div>
                  <span className="text-sm text-yellow-600">في الانتظار</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>تفعيل المدفوعات</span>
                  </div>
                  <span className="text-sm text-yellow-600">في الانتظار</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <ProductCategoriesManager storeId={store.id} />
        </TabsContent>

        <TabsContent value="inventory">
          <AdvancedInventoryManager storeId={store.id} />
        </TabsContent>

        <TabsContent value="coupons">
          <AdvancedCouponSystem storeId={store.id} />
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralTrackingSystem storeId={store.id} baseUrl={`https://${store.store_slug}.mystore.com`} />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نظام دعم العملاء</CardTitle>
              <CardDescription>إدارة استفسارات العملاء والدعم الفني</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">نظام الدعم قريباً</h3>
                <p className="text-muted-foreground">
                  سيتم إضافة نظام دعم العملاء المتكامل قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};