import { useState, useEffect } from 'react';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  InteractiveWidget,
  EnhancedChart,
  AnimatedCounter,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { 
  PerformanceMonitor,
  SecurityCenter,
  AIAnalytics,
  InteractiveWidgets,
  NotificationCenter
} from '@/components/advanced';
import {
  SmartDashboard,
  PredictiveAnalytics,
  SmartRecommendations
} from '@/components/smart';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Store,
  Star,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalStores: number;
  monthlyGrowth: number;
  dailyActiveUsers: number;
  conversionRate: number;
  averageOrderValue: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
    type: 'new' | 'returning';
  }>;
}

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalStores: 0,
    monthlyGrowth: 0,
    dailyActiveUsers: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    recentActivities: [],
    salesTrend: [],
    topProducts: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch users data
      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      // Fetch orders data  
      const { data: orders } = await supabase
        .from('orders')
        .select('total_sar, status, created_at, customer_name');

      // Fetch products data
      const { data: products } = await supabase
        .from('products')
        .select('*');

      // Fetch stores data
      const { data: stores } = await supabase
        .from('shops')
        .select('*');

      // Calculate analytics
      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active)?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_sar || 0), 0) || 0;
      const totalProducts = products?.length || 0;
      const totalStores = stores?.length || 0;

      // Calculate growth metrics
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const currentMonthUsers = users?.filter(u => 
        new Date(u.created_at) >= lastMonth
      )?.length || 0;
      
      const monthlyGrowth = totalUsers > 0 ? (currentMonthUsers / totalUsers) * 100 : 0;
      const dailyActiveUsers = activeUsers; // Simplified
      const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Generate sample data for charts
      const salesTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 100) + 20
        };
      }).reverse();

      const userGrowth = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 50) + 5,
          type: (Math.random() > 0.5 ? 'new' : 'returning') as 'new' | 'returning'
        };
      }).reverse();

      const topProducts = products?.slice(0, 5).map(product => ({
        id: product.id,
        name: product.title,
        sales: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 10000) + 1000
      })) || [];

      const recentActivities = [
        {
          id: '1',
          type: 'order',
          description: 'طلب جديد تم إنشاؤه',
          timestamp: new Date().toISOString(),
          user: 'أحمد محمد'
        },
        {
          id: '2', 
          type: 'user',
          description: 'مستخدم جديد انضم للمنصة',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          user: 'فاطمة علي'
        }
      ];

      setData({
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        totalStores,
        monthlyGrowth,
        dailyActiveUsers,
        conversionRate,
        averageOrderValue,
        recentActivities,
        salesTrend,
        topProducts,
        userGrowth
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات التحليلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['المؤشر', 'القيمة'],
      ['إجمالي المستخدمين', data.totalUsers.toString()],
      ['المستخدمون النشطون', data.activeUsers.toString()],
      ['إجمالي الطلبات', data.totalOrders.toString()],
      ['إجمالي المبيعات', data.totalRevenue.toFixed(2)],
      ['إجمالي المنتجات', data.totalProducts.toString()],
      ['إجمالي المتاجر', data.totalStores.toString()],
      ['النمو الشهري %', data.monthlyGrowth.toFixed(2)],
      ['معدل التحويل %', data.conversionRate.toFixed(2)],
      ['متوسط قيمة الطلب', data.averageOrderValue.toFixed(2)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            التحليلات والإحصائيات
          </h1>
          <p className="text-muted-foreground mt-2">
            تحليلات شاملة لأداء المنصة والمبيعات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold">{data.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  +{data.monthlyGrowth.toFixed(1)}% هذا الشهر
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-3xl font-bold">{data.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <ShoppingCart className="h-3 w-3 ml-1" />
                  معدل التحويل {data.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-3xl font-bold">{data.totalRevenue.toLocaleString()} ريال</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <DollarSign className="h-3 w-3 ml-1" />
                  متوسط {data.averageOrderValue.toFixed(0)} ريال/طلب
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المتاجر النشطة</p>
                <p className="text-3xl font-bold">{data.totalStores.toLocaleString()}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Package className="h-3 w-3 ml-1" />
                  {data.totalProducts} منتج
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  اتجاه المبيعات
                </CardTitle>
                <CardDescription>المبيعات اليومية خلال الأسبوع الماضي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {data.salesTrend.map((day, index) => {
                    const maxSales = Math.max(...data.salesTrend.map(d => d.sales));
                    const height = (day.sales / maxSales) * 200;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-muted-foreground mb-2">
                          {day.orders} طلب
                        </div>
                        <div
                          className="bg-gradient-to-t from-primary to-primary/70 rounded-t w-full min-h-[20px] flex items-end justify-center transition-all hover:opacity-80"
                          style={{ height: `${height}px` }}
                        >
                          <span className="text-xs text-white font-medium mb-1">
                            {(day.sales / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(day.date).toLocaleDateString('ar-SA', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  أفضل المنتجات
                </CardTitle>
                <CardDescription>المنتجات الأكثر مبيعاً</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} مبيعة</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.revenue.toLocaleString()} ريال</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  نمو المستخدمين
                </CardTitle>
                <CardDescription>المستخدمون الجدد يومياً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {data.userGrowth.map((day, index) => {
                    const maxUsers = Math.max(...data.userGrowth.map(d => d.users));
                    const height = (day.users / maxUsers) * 200;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-full min-h-[20px] flex items-end justify-center transition-all hover:opacity-80"
                          style={{ height: `${height}px` }}
                        >
                          <span className="text-xs text-white font-medium mb-1">
                            {day.users}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(day.date).toLocaleDateString('ar-SA', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  إحصائيات المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>المستخدمون النشطون</span>
                  <Badge className="bg-green-100 text-green-800">
                    {data.activeUsers} ({((data.activeUsers / data.totalUsers) * 100).toFixed(1)}%)
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>المستخدمون غير النشطين</span>
                  <Badge variant="secondary">
                    {data.totalUsers - data.activeUsers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>النمو الشهري</span>
                  <Badge variant="outline" className="text-green-600">
                    +{data.monthlyGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>معدل التحويل</span>
                  <Badge variant="outline">
                    {data.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{data.totalProducts}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">1.2k</p>
                  <p className="text-sm text-muted-foreground">مشاهدات يومية</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">4.5</p>
                  <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-sm text-muted-foreground">معدل الرضا</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                النشاطات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} • {new Date(activity.timestamp).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceMonitor />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <SecurityCenter />
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <AIAnalytics />
        </TabsContent>
        
        <TabsContent value="widgets" className="space-y-4">
          <InteractiveWidgets />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationCenter />
        </TabsContent>
        
        <TabsContent value="smart-dashboard" className="space-y-4">
          <SmartDashboard />
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-4">
          <PredictiveAnalytics />
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <SmartRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;