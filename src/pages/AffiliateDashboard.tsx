import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingCart,
  Medal,
  Target,
  Link2,
  Store,
  Users,
  Palette,
  BarChart3,
  Gift,
  Crown
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const AffiliateDashboard = () => {
  const { profile } = useAuthContext();

  const stats = [
    {
      title: "عمولاتي هذا الشهر",
      value: "3,450 ريال",
      change: "+23%",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-luxury"
    },
    {
      title: "زيارات متجري",
      value: "2,847",
      change: "+15%",
      icon: <Eye className="h-6 w-6" />,
      color: "text-primary"
    },
    {
      title: "معدل التحويل",
      value: "4.2%",
      change: "+0.8%",
      icon: <MousePointer className="h-6 w-6" />,
      color: "text-accent"
    },
    {
      title: "المبيعات المكتملة",
      value: "127",
      change: "+31 هذا الشهر",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "text-premium"
    }
  ];

  const nextLevelProgress = {
    current: profile?.level || 'bronze',
    currentPoints: profile?.points || 0,
    nextLevel: 'silver',
    pointsNeeded: 1000,
    pointsToNext: 1000 - (profile?.points || 0)
  };

  const topProducts = [
    { name: "فستان مطرز أزرق", sales: 12, commission: "720 ريال", clicks: 234 },
    { name: "عباءة كاجوال", sales: 8, commission: "480 ريال", clicks: 156 },
    { name: "طقم تطريز", sales: 15, commission: "360 ريال", clicks: 289 },
    { name: "شال حريري", sales: 6, commission: "180 ريال", clicks: 98 }
  ];

  const recentActivities = [
    { type: "sale", description: "بيع فستان مطرز أزرق", amount: "+60 ريال", time: "منذ ساعتين" },
    { type: "click", description: "نقرة على رابط المنتج", amount: "+5 نقاط", time: "منذ 3 ساعات" },
    { type: "sale", description: "بيع طقم تطريز", amount: "+24 ريال", time: "منذ 5 ساعات" },
    { type: "visit", description: "زيارة جديدة للمتجر", amount: "+2 نقاط", time: "منذ 6 ساعات" }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-bronze text-bronze-foreground';
      case 'silver': return 'bg-muted text-muted-foreground';
      case 'gold': return 'bg-premium text-premium-foreground';
      case 'legendary': return 'bg-gradient-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return <Medal className="h-4 w-4" />;
      case 'silver': return <Star className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Gift className="h-4 w-4" />;
      default: return <Medal className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-premium bg-clip-text text-transparent">
            متجري
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {profile?.full_name}، إليك نظرة عامة على أدائك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getLevelColor(profile?.level || 'bronze')} flex items-center gap-1`}>
            {getLevelIcon(profile?.level || 'bronze')}
            {profile?.level || 'bronze'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {profile?.points || 0} نقطة
          </Badge>
          <Button className="bg-gradient-premium hover:opacity-90">
            <Store className="ml-2 h-4 w-4" />
            زيارة متجري
          </Button>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="border-0 bg-gradient-premium/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-premium">
            <Target className="h-5 w-5" />
            تقدمك نحو المستوى التالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">المستوى الحالي: {nextLevelProgress.current}</span>
              <span className="text-sm text-muted-foreground">
                تحتاج {nextLevelProgress.pointsToNext} نقطة للوصول لـ {nextLevelProgress.nextLevel}
              </span>
            </div>
            <Progress 
              value={(nextLevelProgress.currentPoints / nextLevelProgress.pointsNeeded) * 100} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{nextLevelProgress.currentPoints} نقطة</span>
              <span>{nextLevelProgress.pointsNeeded} نقطة</span>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أفضل منتجاتي أداءً
            </CardTitle>
            <CardDescription>
              المنتجات الأكثر مبيعاً في متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} مبيعة • {product.clicks} نقرة</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-green-600">{product.commission}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              عرض جميع المنتجات
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              الأنشطة الأخيرة
            </CardTitle>
            <CardDescription>
              آخر الأنشطة على متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-green-600">{activity.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              عرض جميع الأنشطة
            </Button>
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
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>
              اختر المنتجات لعرضها في متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-primary hover:opacity-90">
              اختيار المنتجات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle>روابط الحملات</CardTitle>
            <CardDescription>
              إنشأ وإدارة روابط الحملات التسويقية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-luxury hover:opacity-90">
              إدارة الروابط
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <CardTitle>تخصيص المتجر</CardTitle>
            <CardDescription>
              اختر الثيم واللوجو وخصص مظهر متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-premium hover:opacity-90">
              تخصيص المتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;