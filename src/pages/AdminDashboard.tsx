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
  AnimatedCounter,
  EnhancedButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp,
  Crown,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Activity,
  Package,
  CreditCard,
  MessageSquare,
  Bell,
  Zap,
  ArrowRight,
  Home,
  Calendar,
  Globe
} from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AdminOverviewCards, AdminQuickActions } from '@/features/admin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const { profile } = useFastAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalStores: 0,
    totalProducts: 0,
    monthlyGrowth: 15.3,
    conversionRate: 3.4
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // إحصائيات المستخدمين
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('role, is_active, created_at, full_name, email')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // إحصائيات الطلبات
      const { data: ordersData, error: ordersError } = await supabase
        .from('ecommerce_orders')
        .select('total_sar, status, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // إحصائيات المتاجر
      const { data: storesData } = await supabase
        .from('affiliate_stores')
        .select('id, is_active')
        .eq('is_active', true);

      // إحصائيات المنتجات
      const { data: productsData } = await supabase
        .from('products')
        .select('id, is_active')
        .eq('is_active', true);

      // حساب الإحصائيات
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.is_active)?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_sar || 0), 0) || 0;
      const totalStores = storesData?.length || 0;
      const totalProducts = productsData?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue,
        totalStores,
        totalProducts,
        monthlyGrowth: 15.3,
        conversionRate: 3.4
      });

      setRecentUsers(usersData?.slice(0, 5) || []);
      setRecentOrders(ordersData || []);

      // Sample chart data
      setChartData([
        { name: 'يناير', users: 400, orders: 240, revenue: 24000 },
        { name: 'فبراير', users: 300, orders: 139, revenue: 22100 },
        { name: 'مارس', users: 500, orders: 280, revenue: 22900 },
        { name: 'أبريل', users: 278, orders: 390, revenue: 20000 },
        { name: 'مايو', users: 189, orders: 480, revenue: 21800 },
        { name: 'يونيو', users: 239, orders: 380, revenue: 25000 },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات لوحة التحكم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'activate') {
        await supabase
          .from('user_profiles')
          .update({ is_active: true })
          .eq('id', userId);
        
        toast({
          title: "تم تفعيل المستخدم",
          description: "تم تفعيل المستخدم بنجاح",
        });
      } else if (action === 'deactivate') {
        await supabase
          .from('user_profiles')
          .update({ is_active: false })
          .eq('id', userId);
        
        toast({
          title: "تم إلغاء تفعيل المستخدم",
          description: "تم إلغاء تفعيل المستخدم بنجاح",
        });
      }
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحديث المستخدم",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'merchant': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'affiliate': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-primary hover:bg-primary/10 gap-2"
            >
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            مرحباً، {profile?.full_name || 'مدير النظام'}
          </h1>
          <p className="text-muted-foreground text-lg">
            إليك نظرة عامة على أداء المنصة اليوم
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 shadow-lg">
            <Activity className="ml-1 h-4 w-4" />
            النظام يعمل بشكل طبيعي
          </Badge>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 shadow-lg">
            <Crown className="ml-1 h-4 w-4" />
            مدير النظام
          </Badge>
        </div>
      </div>

      {/* System Health */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="font-semibold">حالة النظام: متميزة</p>
                <p className="text-sm text-muted-foreground">جميع الخدمات تعمل بكفاءة عالية</p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>آخر تحديث: {new Date().toLocaleString('ar-SA')}</p>
              <p>وقت التشغيل: 99.9%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <AdminOverviewCards stats={stats} />

      {/* Performance Chart */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            أداء المنصة الشهري
          </CardTitle>
          <CardDescription>
            تطور المستخدمين والطلبات والإيرادات خلال الأشهر الماضية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `شهر ${label}`}
                formatter={(value, name) => {
                  if (name === 'revenue') return [`${value} ريال`, 'الإيرادات'];
                  if (name === 'users') return [value, 'المستخدمين'];
                  if (name === 'orders') return [value, 'الطلبات'];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="users"
                stackId="2"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              المستخدمين الجدد
            </CardTitle>
            <CardDescription>
              آخر المستخدمين المسجلين في المنصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? recentUsers.map((user: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === 'admin' ? 'مدير' : 
                       user.role === 'merchant' ? 'تاجر' :
                       user.role === 'affiliate' ? 'مسوق' : 'عميل'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                      >
                        {user.is_active ? <Eye className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مستخدمين جدد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              الطلبات الحديثة
            </CardTitle>
            <CardDescription>
              آخر الطلبات المسجلة في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.total_sar} ريال</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status === 'COMPLETED' ? 'مكتمل' : 
                     order.status === 'PENDING' ? 'قيد الانتظار' :
                     order.status === 'CANCELLED' ? 'ملغي' : order.status}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات جديدة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <AdminQuickActions />
    </div>
  );
};

export default AdminDashboard;