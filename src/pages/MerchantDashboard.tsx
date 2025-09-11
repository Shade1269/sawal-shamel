import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Award,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const MerchantDashboard = () => {
  const { profile } = useAuthContext();

  const stats = [
    {
      title: "منتجاتي",
      value: "24",
      change: "+3 هذا الشهر",
      icon: <Package className="h-6 w-6" />,
      color: "text-primary"
    },
    {
      title: "الطلبات الجديدة",
      value: "18",
      change: "اليوم",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "text-accent"
    },
    {
      title: "إجمالي المبيعات",
      value: "45,230 ريال",
      change: "+12% هذا الشهر",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-luxury"
    },
    {
      title: "المسوقين النشطين",
      value: "156",
      change: "يروجون لمنتجاتي",
      icon: <Users className="h-6 w-6" />,
      color: "text-premium"
    }
  ];

  const recentOrders = [
    { id: "ORD-001", product: "فستان مطرز", customer: "فاطمة أحمد", amount: "450 ريال", status: "قيد التجهيز" },
    { id: "ORD-002", product: "عباءة كاجوال", customer: "سارة محمد", amount: "280 ريال", status: "تم الشحن" },
    { id: "ORD-003", product: "طقم تطريز", customer: "نورا علي", amount: "120 ريال", status: "جديد" },
    { id: "ORD-004", product: "شال حريري", customer: "مريم خالد", amount: "95 ريال", status: "تم التسليم" }
  ];

  const topProducts = [
    { name: "فستان مطرز - أزرق", sales: 45, revenue: "6,750 ريال", trend: "+15%" },
    { name: "عباءة كاجوال - أسود", sales: 32, revenue: "8,960 ريال", trend: "+8%" },
    { name: "طقم تطريز - متعدد", sales: 28, revenue: "3,360 ريال", trend: "+22%" },
    { name: "شال حريري - ذهبي", sales: 19, revenue: "1,805 ريال", trend: "+5%" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'قيد التجهيز': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'تم الشحن': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'تم التسليم': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent">
            لوحة التاجر
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {profile?.full_name}، إليك نظرة عامة على متجرك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-luxury text-luxury-foreground">
            <Award className="ml-1 h-4 w-4" />
            تاجر معتمد
          </Badge>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              الطلبات الأخيرة
            </CardTitle>
            <CardDescription>
              آخر الطلبات على منتجاتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{order.id}</span>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.product}</p>
                    <p className="text-xs text-muted-foreground">العميل: {order.customer}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{order.amount}</p>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              عرض جميع الطلبات
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أفضل المنتجات أداءً
            </CardTitle>
            <CardDescription>
              المنتجات الأكثر مبيعاً هذا الشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} عملية بيع</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{product.revenue}</p>
                    <p className="text-xs text-green-600">{product.trend}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              عرض تقرير مفصل
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>
              إضافة وتعديل منتجاتك وإدارة المخزون
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-primary hover:opacity-90">
              إدارة المنتجات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <CardTitle>تقارير المبيعات</CardTitle>
            <CardDescription>
              تحليلات مفصلة لمبيعاتك وأداء منتجاتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-luxury hover:opacity-90">
              عرض التقارير
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle>شبكة المسوقين</CardTitle>
            <CardDescription>
              تابع المسوقين الذين يروجون لمنتجاتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-premium hover:opacity-90">
              عرض المسوقين
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantDashboard;