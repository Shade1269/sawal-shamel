import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp,
  Crown,
  Activity,
  Eye,
  DollarSign,
  Package,
  UserCheck,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface OverviewCardsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalStores?: number;
    totalProducts?: number;
    monthlyGrowth?: number;
    conversionRate?: number;
  };
}

export const AdminOverviewCards = ({ stats }: OverviewCardsProps) => {
  const cardData = [
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      changeType: "increase" as const,
      icon: Users,
      color: "blue",
      description: `${stats.activeUsers} مستخدم نشط`
    },
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders.toLocaleString(),
      change: "+8.2%",
      changeType: "increase" as const,
      icon: ShoppingCart,
      color: "green",
      description: "طلب هذا الشهر"
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ريال`,
      change: "+15.3%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "purple",
      description: "من جميع المبيعات"
    },
    {
      title: "معدل التحويل",
      value: `${stats.conversionRate || 3.4}%`,
      change: "+0.5%",
      changeType: "increase" as const,
      icon: TrendingUp,
      color: "orange",
      description: "متوسط التحويل"
    },
    {
      title: "المتاجر النشطة",
      value: (stats.totalStores || 45).toLocaleString(),
      change: "+5.8%",
      changeType: "increase" as const,
      icon: Store,
      color: "indigo",
      description: "متجر مسجل"
    },
    {
      title: "المنتجات المتاحة",
      value: (stats.totalProducts || 1250).toLocaleString(),
      change: "+22.1%",
      changeType: "increase" as const,
      icon: Package,
      color: "teal",
      description: "منتج متاح للبيع"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        icon: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200/50 dark:border-blue-800/50"
      },
      green: {
        icon: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200/50 dark:border-green-800/50"
      },
      purple: {
        icon: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200/50 dark:border-purple-800/50"
      },
      orange: {
        icon: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200/50 dark:border-orange-800/50"
      },
      indigo: {
        icon: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        border: "border-indigo-200/50 dark:border-indigo-800/50"
      },
      teal: {
        icon: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-50 dark:bg-teal-900/20",
        border: "border-teal-200/50 dark:border-teal-800/50"
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardData.map((card, index) => {
        const colors = getColorClasses(card.color);
        return (
          <Card 
            key={index} 
            className={`border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${colors.border} hover:scale-105`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <card.icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      card.changeType === 'increase' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {card.changeType === 'increase' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {card.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {card.description}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};