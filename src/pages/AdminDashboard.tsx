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
  Clock
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { profile } = useAuthContext();

  const stats = [
    {
      title: "إجمالي المسوقين",
      value: "1,247",
      change: "+12%",
      icon: <Users className="h-6 w-6" />,
      color: "text-primary"
    },
    {
      title: "التجار النشطين",
      value: "342",
      change: "+8%",
      icon: <Store className="h-6 w-6" />,
      color: "text-accent"
    },
    {
      title: "إجمالي الطلبات",
      value: "15,234",
      change: "+25%",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "text-premium"
    },
    {
      title: "إجمالي المبيعات",
      value: "2.4M ريال",
      change: "+18%",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-luxury"
    }
  ];

  const pendingActions = [
    { type: "merchant_approval", count: 12, title: "طلبات تجار قيد المراجعة" },
    { type: "product_review", count: 34, title: "منتجات تحتاج مراجعة" },
    { type: "support_tickets", count: 8, title: "تذاكر دعم عاجلة" },
    { type: "payout_requests", count: 23, title: "طلبات سحب عمولات" }
  ];

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
                <span className="text-green-600">{stat.change}</span> من الشهر الماضي
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Actions */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            الإجراءات المطلوبة
          </CardTitle>
          <CardDescription>
            مهام تحتاج إلى اهتمامك الفوري
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingActions.map((action, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">يحتاج مراجعة</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-orange-600 bg-orange-100 dark:bg-orange-900/20">
                  {action.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <Button className="w-full bg-gradient-primary hover:opacity-90">
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
            <Button className="w-full bg-gradient-luxury hover:opacity-90">
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
            <Button className="w-full bg-gradient-premium hover:opacity-90">
              الإعدادات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;