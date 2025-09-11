import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Trash2
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { profile } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // إحصائيات المستخدمين
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // إحصائيات الطلبات
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_sar, status, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // حساب الإحصائيات
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.is_active)?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_sar || 0), 0) || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue
      });

      setRecentUsers(usersData?.slice(0, 5) || []);
      setRecentOrders(ordersData || []);
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
          .from('profiles')
          .update({ is_active: true })
          .eq('id', userId);
        
        toast({
          title: "تم تفعيل المستخدم",
          description: "تم تفعيل المستخدم بنجاح",
        });
      } else if (action === 'deactivate') {
        await supabase
          .from('profiles')
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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            لوحة الإدارة
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {profile?.full_name}، إليك نظرة عامة على أداء المنصة
          </p>
        </div>
        <Badge className="bg-gradient-luxury text-luxury-foreground">
          <Crown className="ml-1 h-4 w-4" />
          مدير النظام
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المستخدمين
            </CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{stats.activeUsers} نشط</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المستخدمين النشطين
            </CardTitle>
            <Store className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              من أصل {stats.totalUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
            <ShoppingCart className="h-6 w-6 text-premium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              طلب جديد
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المبيعات
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-luxury" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ريال</div>
            <p className="text-xs text-muted-foreground mt-1">
              من الطلبات الحالية
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users and Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              المستخدمين الجدد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
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
              ))}
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-premium/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-premium" />
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle>إدارة المستخدمين</CardTitle>
            <CardDescription>
              مراجعة المسوقين والتجار وإدارة الصلاحيات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90"
              onClick={() => navigate('/admin/users')}
            >
              إدارة المستخدمين
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <CardTitle>التقارير والإحصائيات</CardTitle>
            <CardDescription>
              تحليلات شاملة لأداء المنصة والمبيعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-luxury hover:opacity-90"
              onClick={() => navigate('/admin/reports')}
            >
              عرض التقارير
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <CardTitle>إعدادات النظام</CardTitle>
            <CardDescription>
              إدارة العمولات والثيمات والإعدادات العامة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-premium hover:opacity-90"
              onClick={() => navigate('/admin/settings')}
            >
              الإعدادات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;