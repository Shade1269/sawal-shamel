import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  RefreshCw,
  Bell,
  Zap,
  Activity,
  Target,
  AlertTriangle
} from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SmartWidget } from "@/components/dashboard/SmartWidget";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { SmartNotifications } from "@/components/dashboard/SmartNotifications";
import { motion } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    loading,
    error,
    widgets,
    charts,
    notifications,
    period,
    setPeriod,
    refreshData
  } = useDashboardData();

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

  const handleNotificationRead = (id: string) => {
    // في التطبيق الحقيقي، سيتم تحديث قاعدة البيانات
    console.log('Marking notification as read:', id);
  };

  const handleNotificationAction = (notification: any) => {
    // في التطبيق الحقيقي، سيتم التنقل للصفحة المطلوبة
    console.log('Notification action:', notification);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-medium mb-2">خطأ في تحميل البيانات</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header - Mobile Responsive */}
      <motion.div 
        className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20`}>
            <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${config.primaryColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text truncate">
              {config.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground truncate">{config.description}</p>
            <div className="flex items-center gap-1 md:gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">متصل الآن</span>
                <span className="sm:hidden">متصل</span>
              </Badge>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                آخر تحديث: منذ دقيقتين
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Filter className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">تصفية</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">تصدير</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">تحديث</span>
          </Button>
        </div>
      </motion.div>

      {/* Smart Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SmartWidget
              data={widget}
              variant="default"
              showProgress={index < 2}
              animated={true}
              refreshable={true}
              onRefresh={refreshData}
            />
          </motion.div>
        ))}
      </div>

      {/* Enhanced Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">عامة</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">التحليلات</span>
              <span className="sm:hidden">تحليل</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">الإشعارات</span>
              <span className="sm:hidden">تنبيه</span>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1 py-0 hidden md:inline-flex">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Target className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">الأداء</span>
              <span className="sm:hidden">أداء</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Mobile notification badge */}
          {notifications.filter(n => !n.isRead).length > 0 && (
            <Badge variant="destructive" className="md:hidden text-xs">
              {notifications.filter(n => !n.isRead).length}
            </Badge>
          )}
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions with Enhanced Design */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    الإجراءات السريعة
                  </CardTitle>
                  <CardDescription>الأدوات والوظائف الأكثر استخداماً</CardDescription>
                </div>
                <Badge variant="outline">
                  {config.quickActions.length} إجراء
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {config.quickActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto p-3 md:p-4 flex flex-col sm:flex-row items-start gap-3 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 w-full"
                        asChild
                      >
                        <a href={action.href}>
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full">
                            <div className={`p-2 md:p-3 rounded-lg ${action.color} shadow-lg flex-shrink-0`}>
                              <ActionIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="text-center sm:text-left flex-1 min-w-0">
                              <div className="font-semibold text-sm md:text-base truncate">{action.title}</div>
                              <div className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {action.description}
                              </div>
                            </div>
                          </div>
                        </a>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الأداء</CardTitle>
              <CardDescription>مؤشرات الأداء الرئيسية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="truncate">تحقيق الهدف الشهري</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="truncate">رضا العملاء</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="truncate">معدل النمو</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <DashboardCharts
            charts={charts}
            period={period}
            onPeriodChange={(p) => setPeriod(p as any)}
            onRefresh={refreshData}
            onExport={(chartId) => console.log('Exporting chart:', chartId)}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <SmartNotifications
            notifications={notifications}
            onNotificationRead={handleNotificationRead}
            onNotificationAction={handleNotificationAction}
            onMarkAllRead={() => console.log('Mark all read')}
            onClearAll={() => console.log('Clear all')}
          />
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأداء المتقدم</CardTitle>
              <CardDescription>مقاييس مفصلة للأداء والنمو</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'معدل النمو الشهري', value: '+15.2%', status: 'positive' },
                    { label: 'متوسط قيمة الطلب', value: '285 ر.س', status: 'positive' },
                    { label: 'معدل الاحتفاظ', value: '87%', status: 'positive' },
                    { label: 'وقت الاستجابة', value: '1.2 ثانية', status: 'neutral' }
                  ].map((metric, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Goals Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>تقدم الأهداف</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { goal: 'مبيعات الشهر', current: 125000, target: 150000 },
                      { goal: 'عملاء جدد', current: 45, target: 60 },
                      { goal: 'معدل التحويل', current: 3.4, target: 4.0 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.goal}</span>
                          <span>{item.current} / {item.target}</span>
                        </div>
                        <Progress 
                          value={(item.current / item.target) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}