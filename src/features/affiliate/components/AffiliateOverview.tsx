import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  ShoppingCart, 
  Users, 
  Target,
  Calendar,
  Award,
  Zap,
  Crown,
  Trophy,
  Star,
  Gift
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AffiliateOverviewProps {
  stats: {
    totalCommissions: number;
    thisMonthCommissions: number;
    totalSales: number;
    conversionRate: number;
    totalVisits: number;
    totalClicks: number;
    activeProducts: number;
    monthlyGrowth: number;
    weeklyGoal: number;
    weeklyProgress: number;
  };
  chartData: any[];
  level?: string;
  affiliateStore?: any;
}

export const AffiliateOverview = ({ 
  stats, 
  chartData, 
  level = 'bronze',
  affiliateStore 
}: AffiliateOverviewProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'legendary': return 'text-premium';
      case 'gold': return 'text-premium';
      case 'silver': return 'text-muted-foreground';
      default: return 'text-warning';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'legendary': return <Trophy className="h-4 w-4" />;
      case 'gold': return <Star className="h-4 w-4" />;
      case 'silver': return <Award className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const statsCards = [
    {
      title: "إجمالي العمولات",
      value: `${stats.totalCommissions.toFixed(2)} ريال`,
      change: "+12%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "عمولات هذا الشهر",
      value: `${stats.thisMonthCommissions.toFixed(2)} ريال`,
      change: `+${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "إجمالي المبيعات",
      value: `${stats.totalSales.toFixed(2)} ريال`,
      change: "+8%",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "معدل التحويل",
      value: `${stats.conversionRate}%`,
      change: "+2%",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Store Info Card */}
      {affiliateStore && (
        <Card className="border-0 gradient-bg-accent backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{affiliateStore.store_name}</h2>
                <p className="text-muted-foreground">{affiliateStore.bio}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${getLevelColor(level)} border-current`}>
                    <div className="flex items-center gap-1">
                      {getLevelIcon(level)}
                      <span className="capitalize">{level}</span>
                    </div>
                  </Badge>
                  <Badge variant="outline">
                    {stats.activeProducts} منتج نشط
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{affiliateStore.total_orders}</div>
                <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            هدف هذا الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>التقدم نحو الهدف</span>
            <span className="font-bold">{stats.weeklyProgress.toFixed(2)} / {stats.weeklyGoal} ريال</span>
          </div>
          <Progress 
            value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
            className="h-3"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}% مكتمل</span>
            <span>باقي {(stats.weeklyGoal - stats.weeklyProgress).toFixed(2)} ريال</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.color} flex items-center gap-1`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            أداء العمولات الشهرية
          </CardTitle>
          <CardDescription>
            تتبع أداء عمولاتك على مدار الأشهر الماضية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="commissions"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات أداء بعد</p>
                <p className="text-sm">ابدأ بإضافة منتجات والتسويق لها لرؤية الإحصائيات</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">إجمالي النقرات</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-sm text-muted-foreground">مستوى العضوية</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};