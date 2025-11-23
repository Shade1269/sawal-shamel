import { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Star,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

interface StoreAnalyticsProps {
  storeId: string;
}

const StoreAnalyticsDashboard = ({ storeId }: StoreAnalyticsProps) => {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - في التطبيق الحقيقي سيتم جلبها من قاعدة البيانات
  const overviewStats = [
    {
      title: 'إجمالي المشاهدات',
      value: '12,547',
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'النقرات على المنتجات',
      value: '3,428',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600'
    },
    {
      title: 'معدل التحويل',
      value: '2.8%',
      change: '-0.3%',
      trend: 'down',
      icon: Target,
      color: 'text-orange-600'
    },
    {
      title: 'متوسط قيمة الطلب',
      value: '285 ر.س',
      change: '+15.4%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  const visitsData = [
    { date: '2024-01-01', visits: 120, unique: 95, sales: 8 },
    { date: '2024-01-02', visits: 145, unique: 110, sales: 12 },
    { date: '2024-01-03', visits: 180, unique: 140, sales: 15 },
    { date: '2024-01-04', visits: 220, unique: 170, sales: 18 },
    { date: '2024-01-05', visits: 190, unique: 150, sales: 14 },
    { date: '2024-01-06', visits: 250, unique: 200, sales: 22 },
    { date: '2024-01-07', visits: 280, unique: 220, sales: 25 }
  ];

  const deviceData = [
    { name: 'الجوال', value: 65, color: '#3B82F6' },
    { name: 'الكمبيوتر', value: 25, color: '#10B981' },
    { name: 'التابلت', value: 10, color: '#F59E0B' }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', views: 1250, sales: 45, conversion: '3.6%' },
    { name: 'Samsung Galaxy S24', views: 890, sales: 32, conversion: '3.6%' },
    { name: 'iPad Air', views: 720, sales: 18, conversion: '2.5%' },
    { name: 'MacBook Pro', views: 650, sales: 25, conversion: '3.8%' },
    { name: 'AirPods Pro', views: 580, sales: 35, conversion: '6.0%' }
  ];

  const geographicData = [
    { city: 'الرياض', visitors: 2850, percentage: 35 },
    { city: 'جدة', visitors: 1920, percentage: 24 },
    { city: 'الدمام', visitors: 1240, percentage: 15 },
    { city: 'مكة المكرمة', visitors: 890, percentage: 11 },
    { city: 'المدينة المنورة', visitors: 720, percentage: 9 },
    { city: 'أخرى', visitors: 480, percentage: 6 }
  ];

  const timeData = [
    { hour: '00:00', visitors: 45 },
    { hour: '03:00', visitors: 25 },
    { hour: '06:00', visitors: 35 },
    { hour: '09:00', visitors: 120 },
    { hour: '12:00', visitors: 180 },
    { hour: '15:00', visitors: 220 },
    { hour: '18:00', visitors: 280 },
    { hour: '21:00', visitors: 350 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تحليلات المتجر</h1>
          <p className="text-muted-foreground">تتبع أداء متجرك وسلوك العملاء</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 3 أشهر</SelectItem>
              <SelectItem value="1y">السنة الماضية</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="audience">الجمهور</TabsTrigger>
          <TabsTrigger value="geography">الجغرافيا</TabsTrigger>
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Chart */}
            <Card>
              <CardHeader>
                <CardTitle>حركة المرور</CardTitle>
                <CardDescription>الزيارات والمبيعات اليومية</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={visitsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                      formatter={(value, name) => [value, name === 'visits' ? 'الزيارات' : name === 'unique' ? 'زوار فريدون' : 'المبيعات']}
                    />
                    <Area type="monotone" dataKey="visits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="unique" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الأجهزة</CardTitle>
                <CardDescription>الأجهزة المستخدمة للوصول للمتجر</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'النسبة']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {deviceData.map((device, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: device.color }}
                      />
                      <span className="text-sm">{device.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المنتجات</CardTitle>
              <CardDescription>أكثر المنتجات مشاهدة ومبيعاً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {product.views} مشاهدة
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            {product.sales} مبيعة
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{product.conversion}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">معدل التحويل</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>الديموغرافيا</CardTitle>
                <CardDescription>معلومات عن جمهورك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">العمر 18-24</span>
                      <span className="text-sm text-muted-foreground">25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">العمر 25-34</span>
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">العمر 35-44</span>
                      <span className="text-sm text-muted-foreground">30%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">العمر 45+</span>
                      <span className="text-sm text-muted-foreground">10%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Behavior Times */}
            <Card>
              <CardHeader>
                <CardTitle>أوقات النشاط</CardTitle>
                <CardDescription>أوقات زيارة المتجر خلال اليوم</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التوزيع الجغرافي</CardTitle>
              <CardDescription>مواقع الزوار حسب المدن</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <span className="font-medium">{location.city}</span>
                        <p className="text-sm text-muted-foreground">{location.visitors.toLocaleString()} زائر</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{location.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <div className="text-2xl font-bold mb-2">3:45</div>
                <div className="text-sm text-muted-foreground">متوسط وقت التصفح</div>
                <div className="text-xs text-green-500 mt-1">+15% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <div className="text-2xl font-bold mb-2">4.2</div>
                <div className="text-sm text-muted-foreground">متوسط الصفحات المشاهدة</div>
                <div className="text-xs text-green-500 mt-1">+8% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <div className="text-2xl font-bold mb-2">32%</div>
                <div className="text-sm text-muted-foreground">معدل الارتداد</div>
                <div className="text-xs text-red-500 mt-1">-5% من الشهر الماضي</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreAnalyticsDashboard;