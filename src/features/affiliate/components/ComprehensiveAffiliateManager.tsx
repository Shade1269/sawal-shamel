import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { ProductCategoriesManager } from './ProductCategoriesManager';
import { AdvancedInventoryManager } from './AdvancedInventoryManager';
import { AdvancedCouponSystem } from './AdvancedCouponSystem';
import { ReferralTrackingSystem } from './ReferralTrackingSystem';
import { 
  Package, 
  Inventory, 
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لم يتم العثور على متجر</h3>
          <p className="text-muted-foreground mb-4">
            يرجى إنشاء متجر أولاً لاستخدام هذه الميزات
          </p>
          <Button>إنشاء متجر جديد</Button>
        </CardContent>
      </Card>
    );
  }

  const baseUrl = window.location.origin;
  const storeUrl = `${baseUrl}/${store.store_slug}`;

  // Feature completion status
  const features = [
    { name: 'فئات المنتجات', completed: true, description: 'تنظيم المنتجات في فئات' },
    { name: 'إدارة المخزون', completed: true, description: 'تتبع المخزون والتنبيهات' },
    { name: 'نظام الكوبونات', completed: true, description: 'كوبونات خصم متقدمة' },
    { name: 'تتبع الإحالات', completed: true, description: 'روابط إحالة وتتبع الأداء' },
    { name: 'تحليلات متقدمة', completed: true, description: 'تقارير مفصلة للمبيعات' },
    { name: 'دعم العملاء', completed: false, description: 'دردشة مباشرة وتذاكر الدعم' },
    { name: 'إدارة المدفوعات', completed: false, description: 'بوابات دفع وسحب الأرباح' },
    { name: 'التسويق التلقائي', completed: false, description: 'حملات بريد إلكتروني وإشعارات' }
  ];

  const completedFeatures = features.filter(f => f.completed).length;
  const completionPercentage = Math.round((completedFeatures / features.length) * 100);

  return (
    <div className="space-y-6">
      {/* Store Overview Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{store.store_name}</h1>
            <p className="text-muted-foreground mb-4">إدارة شاملة لمتجرك التابع</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">متجر نشط</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm">{store.total_orders} طلب</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                <span className="text-sm">{store.total_sales?.toFixed(2)} ر.س مبيعات</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">اكتمال النظام</div>
            <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">
              {completedFeatures} من {features.length} ميزة
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feature Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.slice(0, 4).map((feature, index) => (
          <Card key={index} className={feature.completed ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {feature.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <div className="font-medium text-sm">{feature.name}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            الفئات
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Inventory className="w-4 h-4" />
            المخزون
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            الكوبونات
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            الإحالات
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Store Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  أداء المتجر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">إجمالي الطلبات</span>
                  <span className="font-bold">{store.total_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">إجمالي المبيعات</span>
                  <span className="font-bold">{store.total_sales?.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">متوسط قيمة الطلب</span>
                  <span className="font-bold">
                    {store.total_orders > 0 
                      ? ((store.total_sales || 0) / store.total_orders).toFixed(2)
                      : '0.00'
                    } ر.س
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('categories')}>
                  <Package className="w-4 h-4 ml-2" />
                  إدارة فئات المنتجات
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('coupons')}>
                  <Gift className="w-4 h-4 ml-2" />
                  إنشاء كوبون خصم
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('referrals')}>
                  <Share2 className="w-4 h-4 ml-2" />
                  إنشاء رابط إحالة
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{feature.name}</span>
                    {feature.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Store Link */}
          <Card>
            <CardHeader>
              <CardTitle>رابط المتجر</CardTitle>
              <CardDescription>شارك هذا الرابط مع عملائك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <code className="bg-muted px-3 py-2 rounded flex-1 text-sm">
                  {storeUrl}
                </code>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(storeUrl);
                  }}
                >
                  نسخ
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.open(storeUrl, '_blank')}
                >
                  زيارة المتجر
                </Button>
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
          <ReferralTrackingSystem storeId={store.id} baseUrl={storeUrl} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المتجر</CardTitle>
              <CardDescription>تخصيص وإدارة إعدادات متجرك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">الإعدادات الأساسية</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">اسم المتجر</span>
                      <span className="font-medium">{store.store_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">رابط المتجر</span>
                      <span className="font-medium">{store.store_slug}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الثيم</span>
                      <span className="font-medium">{store.theme}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    تعديل الإعدادات الأساسية
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">الميزات المتقدمة</h3>
                  <div className="space-y-3">
                    {features.filter(f => !f.completed).map((feature, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                          </div>
                          <Button size="sm" variant="outline">
                            تفعيل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>النسخ الاحتياطي والأمان</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  تصدير بيانات المتجر
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  إعدادات الأمان
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};