import { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Target,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MousePointer,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AffiliateAnalyticsProps {
  analytics?: {
    visitorsData: any[];
    salesData: any[];
    topProducts: any[];
    trafficSources: any[];
    deviceTypes: any[];
    conversionFunnel: any[];
  };
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export const AffiliateAnalytics = ({ 
  analytics,
  timeRange = '30d',
  onTimeRangeChange 
}: AffiliateAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDarkMode } = useDarkMode();

  // Sample data when no analytics provided
  const sampleVisitorsData = [
    { day: 'الاثنين', visitors: 45, clicks: 12, conversions: 3 },
    { day: 'الثلاثاء', visitors: 52, clicks: 15, conversions: 4 },
    { day: 'الأربعاء', visitors: 38, clicks: 8, conversions: 2 },
    { day: 'الخميس', visitors: 67, clicks: 18, conversions: 5 },
    { day: 'الجمعة', visitors: 89, clicks: 25, conversions: 8 },
    { day: 'السبت', visitors: 76, clicks: 22, conversions: 6 },
    { day: 'الأحد', visitors: 43, clicks: 10, conversions: 2 }
  ];

  const sampleSalesData = [
    { month: 'يناير', sales: 1200, commissions: 120 },
    { month: 'فبراير', sales: 1850, commissions: 185 },
    { month: 'مارس', sales: 2100, commissions: 210 },
    { month: 'أبريل', sales: 1750, commissions: 175 },
    { month: 'مايو', sales: 2400, commissions: 240 },
    { month: 'يونيو', sales: 2800, commissions: 280 }
  ];

  const sampleTopProducts = [
    { name: 'فستان صيفي', sales: 45, commission: 450, rate: '12%' },
    { name: 'حقيبة يد', sales: 32, commission: 320, rate: '10%' },
    { name: 'أحذية رياضية', sales: 28, commission: 420, rate: '15%' },
    { name: 'ساعة ذكية', sales: 22, commission: 550, rate: '25%' },
    { name: 'إكسسوار شعر', sales: 19, commission: 190, rate: '10%' }
  ];

  const sampleTrafficSources = [
    { name: 'وسائل التواصل', value: 45, color: '#8884d8' },
    { name: 'البحث المباشر', value: 30, color: '#82ca9d' },
    { name: 'الإحالات', value: 15, color: '#ffc658' },
    { name: 'أخرى', value: 10, color: '#ff7300' }
  ];

  const sampleDeviceTypes = [
    { name: 'الهاتف المحمول', value: 65, color: '#8884d8' },
    { name: 'الكمبيوتر', value: 25, color: '#82ca9d' },
    { name: 'الجهاز اللوحي', value: 10, color: '#ffc658' }
  ];

  const visitorsData = analytics?.visitorsData || sampleVisitorsData;
  const salesData = analytics?.salesData || sampleSalesData;
  const topProducts = analytics?.topProducts || sampleTopProducts;
  const trafficSources = analytics?.trafficSources || sampleTrafficSources;
  const deviceTypes = analytics?.deviceTypes || sampleDeviceTypes;

  const overviewStats = [
    {
      title: "إجمالي الزوار",
      value: "2,847",
      change: "+15.3%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "معدل التحويل",
      value: "3.2%",
      change: "+0.5%",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "متوسط وقت التصفح",
      value: "2:34",
      change: "+12s",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "معدل النقر",
      value: "4.8%",
      change: "+0.3%",
      icon: MousePointer,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground transition-colors duration-500">تحليلات الأداء</h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">آخر 7 أيام</SelectItem>
            <SelectItem value="30d">آخر 30 يوم</SelectItem>
            <SelectItem value="90d">آخر 3 شهور</SelectItem>
            <SelectItem value="1y">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="traffic">حركة المرور</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="conversions">التحويلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, index) => (
              <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
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
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visitors and Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الزوار اليومي</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={visitorsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المبيعات والعمولات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="var(--primary)" />
                    <Bar dataKey="commissions" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  مصادر الزيارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  أنواع الأجهزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات أداءً</CardTitle>
              <CardDescription>
                المنتجات التي حققت أعلى مبيعات وعمولات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} مبيعة • معدل العمولة {product.rate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{product.commission} ريال</p>
                      <p className="text-sm text-muted-foreground">إجمالي العمولة</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>قمع التحويل</CardTitle>
              <CardDescription>
                تتبع رحلة العميل من الزيارة إلى الشراء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span>زيارات الصفحة</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">2,847</span>
                    <div className="text-xs text-muted-foreground">100%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-5 w-5 text-green-600" />
                    <span>نقرات على المنتجات</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">456</span>
                    <div className="text-xs text-muted-foreground">16%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span>إضافة للسلة</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">123</span>
                    <div className="text-xs text-muted-foreground">4.3%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5 text-purple-600" />
                    <span>إتمام الشراء</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">89</span>
                    <div className="text-xs text-muted-foreground">3.1%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};