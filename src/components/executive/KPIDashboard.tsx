import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveKPIs } from "@/hooks/useExecutiveAnalytics";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KPIDashboardProps {
  kpis: ExecutiveKPIs | null;
  loading: boolean;
}

export const KPIDashboard = ({ kpis, loading }: KPIDashboardProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const kpiItems = [
    {
      title: "إجمالي الإيرادات",
      value: `${kpis.totalRevenue.toLocaleString('ar-SA')} ريال`,
      icon: DollarSign,
      trend: kpis.monthlyGrowth,
      color: "text-green-600"
    },
    {
      title: "إجمالي الطلبات",
      value: kpis.totalOrders.toLocaleString('ar-SA'),
      icon: ShoppingCart,
      trend: 12.5,
      color: "text-blue-600"
    },
    {
      title: "إجمالي العملاء",
      value: kpis.totalCustomers.toLocaleString('ar-SA'),
      icon: Users,
      trend: 8.2,
      color: "text-purple-600"
    },
    {
      title: "إجمالي المنتجات",
      value: kpis.totalProducts.toLocaleString('ar-SA'),
      icon: Package,
      trend: 5.1,
      color: "text-orange-600"
    },
    {
      title: "متوسط قيمة الطلب",
      value: `${kpis.averageOrderValue.toFixed(0)} ريال`,
      icon: TrendingUp,
      trend: 3.7,
      color: "text-emerald-600"
    },
    {
      title: "معدل الاحتفاظ بالعملاء",
      value: `${kpis.customerRetention.toFixed(1)}%`,
      icon: Users,
      trend: -2.1,
      color: "text-cyan-600"
    },
    {
      title: "معدل التحويل",
      value: `${kpis.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: 4.3,
      color: "text-indigo-600"
    },
    {
      title: "النمو الشهري",
      value: `${kpis.monthlyGrowth.toFixed(1)}%`,
      icon: kpis.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      trend: kpis.monthlyGrowth,
      color: kpis.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiItems.map((item, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {item.value}
            </div>
            <div className="flex items-center gap-1">
              {item.trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <Badge 
                variant={item.trend >= 0 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {item.trend >= 0 ? '+' : ''}{item.trend.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};