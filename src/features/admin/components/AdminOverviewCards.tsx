import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Package,
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
        icon: "text-info dark:text-info",
        bg: "bg-info/10 dark:bg-info/20",
        border: "border-info/20 dark:border-info/30"
      },
      green: {
        icon: "text-success dark:text-success",
        bg: "bg-success/10 dark:bg-success/20",
        border: "border-success/20 dark:border-success/30"
      },
      purple: {
        icon: "text-accent dark:text-accent",
        bg: "bg-accent/10 dark:bg-accent/20",
        border: "border-accent/20 dark:border-accent/30"
      },
      orange: {
        icon: "text-warning dark:text-warning",
        bg: "bg-warning/10 dark:bg-warning/20",
        border: "border-warning/20 dark:border-warning/30"
      },
      indigo: {
        icon: "text-primary dark:text-primary",
        bg: "bg-primary/10 dark:bg-primary/20",
        border: "border-primary/20 dark:border-primary/30"
      },
      teal: {
        icon: "text-info dark:text-info",
        bg: "bg-info/10 dark:bg-info/20",
        border: "border-info/20 dark:border-info/30"
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
                        ? 'bg-success/10 text-success dark:bg-success/20 dark:text-success' 
                        : 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'
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