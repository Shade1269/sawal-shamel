import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Crown,
  Star,
  Award,
  Eye,
  Plus,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";

interface DashboardConfig {
  title: string;
  description: string;
  primaryColor: string;
  icon: any;
  stats: StatCard[];
  charts: ChartConfig[];
  quickActions: QuickAction[];
  tabs: TabConfig[];
}

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
}

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

interface TabConfig {
  id: string;
  title: string;
  content: any;
}

const dashboardConfigs: Record<string, DashboardConfig> = {
  admin: {
    title: "لوحة الإدارة",
    description: "نظرة شاملة على النظام والمستخدمين",
    primaryColor: "text-yellow-500",
    icon: Crown,
    stats: [
      {
        title: "إجمالي المستخدمين",
        value: "1,234",
        change: "+12%",
        changeType: "positive",
        icon: Users,
        color: "bg-blue-500"
      },
      {
        title: "إجمالي المبيعات",
        value: "567,890 ر.س",
        change: "+8.2%",
        changeType: "positive", 
        icon: DollarSign,
        color: "bg-green-500"
      },
      {
        title: "الطلبات الجديدة",
        value: "89",
        change: "+15%",
        changeType: "positive",
        icon: ShoppingCart,
        color: "bg-purple-500"
      },
      {
        title: "المنتجات النشطة",
        value: "456",
        change: "+3%",
        changeType: "positive",
        icon: Package,
        color: "bg-orange-500"
      }
    ],
    charts: [],
    quickActions: [
      {
        title: "إدارة المستخدمين",
        description: "عرض وإدارة حسابات المستخدمين",
        icon: Users,
        href: "/admin/users",
        color: "bg-blue-500"
      },
      {
        title: "التقارير",
        description: "عرض التقارير والتحليلات",
        icon: BarChart3,
        href: "/admin/analytics",
        color: "bg-green-500"
      },
      {
        title: "الصلاحيات",
        description: "إدارة صلاحيات النظام",
        icon: Crown,
        href: "/admin/permissions",
        color: "bg-purple-500"
      }
    ],
    tabs: [
      { id: "overview", title: "نظرة عامة", content: null },
      { id: "users", title: "المستخدمين", content: null },
      { id: "analytics", title: "التحليلات", content: null }
    ]
  },
  
  affiliate: {
    title: "لوحة المسوق",
    description: "تتبع أدائك وعمولاتك",
    primaryColor: "text-purple-500",
    icon: Star,
    stats: [
      {
        title: "إجمالي العمولات",
        value: "12,450 ر.س",
        change: "+18%",
        changeType: "positive",
        icon: DollarSign,
        color: "bg-green-500"
      },
      {
        title: "المبيعات هذا الشهر",
        value: "89,230 ر.س",
        change: "+12%",
        changeType: "positive",
        icon: TrendingUp,
        color: "bg-blue-500"
      },
      {
        title: "المنتجات المروجة",
        value: "156",
        change: "+5",
        changeType: "positive",
        icon: Package,
        color: "bg-purple-500"
      },
      {
        title: "معدل التحويل",
        value: "3.4%",
        change: "+0.8%",
        changeType: "positive",
        icon: Eye,
        color: "bg-orange-500"
      }
    ],
    charts: [],
    quickActions: [
      {
        title: "إضافة منتج",
        description: "إضافة منتج جديد للترويج",
        icon: Plus,
        href: "/dashboard/products?action=add",
        color: "bg-green-500"
      },
      {
        title: "عرض العمولات",
        description: "تتبع العمولات المكتسبة",
        icon: DollarSign,
        href: "/dashboard/commissions",
        color: "bg-purple-500"
      },
      {
        title: "الطلبات",
        description: "متابعة حالة الطلبات",
        icon: ShoppingCart,
        href: "/dashboard/orders",
        color: "bg-blue-500"
      }
    ],
    tabs: [
      { id: "overview", title: "نظرة عامة", content: null },
      { id: "products", title: "المنتجات", content: null },
      { id: "commissions", title: "العمولات", content: null }
    ]
  },

  merchant: {
    title: "لوحة التاجر",
    description: "إدارة متجرك ومنتجاتك",
    primaryColor: "text-blue-500",
    icon: Award,
    stats: [
      {
        title: "إجمالي المبيعات",
        value: "245,680 ر.س",
        change: "+22%",
        changeType: "positive",
        icon: DollarSign,
        color: "bg-green-500"
      },
      {
        title: "الطلبات الجديدة",
        value: "67",
        change: "+15%",
        changeType: "positive",
        icon: ShoppingCart,
        color: "bg-blue-500"
      },
      {
        title: "المنتجات",
        value: "234",
        change: "+8",
        changeType: "positive",
        icon: Package,
        color: "bg-purple-500"
      },
      {
        title: "العملاء",
        value: "1,456",
        change: "+12%",
        changeType: "positive",
        icon: Users,
        color: "bg-orange-500"
      }
    ],
    charts: [],
    quickActions: [
      {
        title: "إضافة منتج",
        description: "إضافة منتج جديد للمتجر",
        icon: Plus,
        href: "/products?action=add",
        color: "bg-green-500"
      },
      {
        title: "إدارة الطلبات",
        description: "متابعة ومعالجة الطلبات",
        icon: ShoppingCart,
        href: "/orders",
        color: "bg-blue-500"
      },
      {
        title: "التقارير",
        description: "عرض تقارير الأداء",
        icon: BarChart3,
        href: "/analytics",
        color: "bg-purple-500"
      }
    ],
    tabs: [
      { id: "overview", title: "نظرة عامة", content: null },
      { id: "orders", title: "الطلبات", content: null },
      { id: "products", title: "المنتجات", content: null }
    ]
  }
};

export function UnifiedDashboard() {
  const { profile } = useFastAuth();
  const location = useLocation();

  const dashboardType = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/merchant')) return 'merchant';
    if (path.startsWith('/dashboard')) return 'affiliate';
    
    // تحديد النوع حسب دور المستخدم
    if (profile?.role === 'admin') return 'admin';
    if (profile?.role === 'merchant') return 'merchant';
    if (profile?.role === 'affiliate') return 'affiliate';
    
    return 'affiliate'; // افتراضي
  }, [location.pathname, profile?.role]);

  const config = dashboardConfigs[dashboardType];
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-primary/10`}>
            <IconComponent className={`h-6 w-6 ${config.primaryColor}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            تصفية
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {config.stats.map((stat, index) => {
          const StatIcon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <div className="flex items-center gap-1 mt-1">
                        <Badge 
                          variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <StatIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>الأدوات والوظائف الأكثر استخداماً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-md ${action.color}`}>
                        <ActionIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </a>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          {config.tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {config.tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardHeader>
                <CardTitle>{tab.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  المحتوى قيد التطوير - {tab.title}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}