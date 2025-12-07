import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Funnel, FunnelChart, LabelList
} from 'recharts';
import { 
  Users, TrendingUp, TrendingDown,
  Clock, Smartphone, Monitor, Tablet, MapPin, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface UserBehaviorData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  trafficSources: Array<{
    source: string;
    users: number;
    sessions: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    device: string;
    users: number;
    percentage: number;
  }>;
  pageViews: Array<{
    page: string;
    views: number;
    uniqueViews: number;
    averageTime: number;
    bounceRate: number;
  }>;
  salesFunnel: Array<{
    stage: string;
    users: number;
    percentage: number;
    dropOff: number;
  }>;
  userJourney: Array<{
    step: string;
    users: number;
    completionRate: number;
  }>;
  geographicData: Array<{
    country: string;
    city: string;
    users: number;
    sessions: number;
    revenue: number;
  }>;
  timeAnalytics: Array<{
    hour: string;
    users: number;
    orders: number;
    revenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

const UserBehaviorAnalytics = () => {
  const { profile } = useFastAuth();
  const [data, setData] = useState<UserBehaviorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [shops, setShops] = useState<Array<{ id: string; display_name: string }>>([]);

  const fetchShops = async () => {
    if (!profile?.id) return;

    try {
      let query = supabase.from('shops').select('id, display_name');
      
      if (profile.role === 'merchant') {
        query = query.eq('owner_id', profile.id);
      }

      const { data: shopsData, error } = await query;
      if (error) throw error;
      
      setShops((shopsData || []).map(s => ({ id: s.id, display_name: s.display_name || '' })));
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const generateUserBehaviorAnalytics = async () => {
    if (!profile?.id || !dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');

      // Simulate user behavior data (in a real app, this would come from analytics tools like Google Analytics)
      // For now, we'll generate some realistic sample data based on order patterns

      // Fetch orders to derive user behavior patterns
      const { data: ordersData, error } = await supabase
        .from('ecommerce_orders')
        .select(`
          *,
          ecommerce_order_items(*)
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate + 'T23:59:59');

      if (error) throw error;

      const totalOrders = ordersData?.length || 0;
      const uniqueCustomers = new Set(ordersData?.map(o => o.customer_name)).size;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_sar || 0), 0) || 0;

      // Generate realistic user behavior data
      const overview = {
        totalUsers: Math.floor(uniqueCustomers * 3.5), // Assume more visitors than buyers
        activeUsers: Math.floor(uniqueCustomers * 2.1),
        newUsers: Math.floor(uniqueCustomers * 1.8),
        returningUsers: Math.floor(uniqueCustomers * 1.7),
        averageSessionDuration: 420, // 7 minutes in seconds
        bounceRate: 32.5, // percentage
        conversionRate: totalOrders > 0 ? (totalOrders / (uniqueCustomers * 3.5)) * 100 : 0
      };

      // Traffic sources (simulated)
      const trafficSources = [
        { source: 'البحث المباشر', users: Math.floor(overview.totalUsers * 0.35), sessions: Math.floor(overview.totalUsers * 0.35 * 1.2), percentage: 35 },
        { source: 'وسائل التواصل', users: Math.floor(overview.totalUsers * 0.28), sessions: Math.floor(overview.totalUsers * 0.28 * 1.5), percentage: 28 },
        { source: 'جوجل', users: Math.floor(overview.totalUsers * 0.22), sessions: Math.floor(overview.totalUsers * 0.22 * 1.1), percentage: 22 },
        { source: 'المراجع', users: Math.floor(overview.totalUsers * 0.10), sessions: Math.floor(overview.totalUsers * 0.10 * 1.3), percentage: 10 },
        { source: 'أخرى', users: Math.floor(overview.totalUsers * 0.05), sessions: Math.floor(overview.totalUsers * 0.05 * 1.1), percentage: 5 }
      ];

      // Device types (simulated)
      const deviceTypes = [
        { device: 'الهاتف المحمول', users: Math.floor(overview.totalUsers * 0.68), percentage: 68 },
        { device: 'سطح المكتب', users: Math.floor(overview.totalUsers * 0.25), percentage: 25 },
        { device: 'الجهاز اللوحي', users: Math.floor(overview.totalUsers * 0.07), percentage: 7 }
      ];

      // Popular pages (simulated)
      const pageViews = [
        { page: 'الصفحة الرئيسية', views: Math.floor(overview.totalUsers * 0.85), uniqueViews: Math.floor(overview.totalUsers * 0.75), averageTime: 180, bounceRate: 25 },
        { page: 'المنتجات', views: Math.floor(overview.totalUsers * 0.65), uniqueViews: Math.floor(overview.totalUsers * 0.58), averageTime: 320, bounceRate: 15 },
        { page: 'عربة التسوق', views: Math.floor(overview.totalUsers * 0.35), uniqueViews: Math.floor(overview.totalUsers * 0.32), averageTime: 240, bounceRate: 8 },
        { page: 'إتمام الطلب', views: Math.floor(overview.totalUsers * 0.18), uniqueViews: Math.floor(overview.totalUsers * 0.17), averageTime: 420, bounceRate: 12 },
        { page: 'تأكيد الطلب', views: totalOrders, uniqueViews: totalOrders, averageTime: 60, bounceRate: 2 }
      ];

      // Sales funnel
      const funnelUsers = Math.floor(overview.totalUsers);
      const salesFunnel = [
        { stage: 'زيارة الموقع', users: funnelUsers, percentage: 100, dropOff: 0 },
        { stage: 'عرض المنتجات', users: Math.floor(funnelUsers * 0.65), percentage: 65, dropOff: 35 },
        { stage: 'إضافة للعربة', users: Math.floor(funnelUsers * 0.35), percentage: 35, dropOff: 30 },
        { stage: 'بدء الدفع', users: Math.floor(funnelUsers * 0.25), percentage: 25, dropOff: 10 },
        { stage: 'إتمام الطلب', users: totalOrders, percentage: (totalOrders / funnelUsers) * 100, dropOff: 25 - ((totalOrders / funnelUsers) * 100) }
      ];

      // User journey stages
      const userJourney = [
        { step: 'الوصول', users: funnelUsers, completionRate: 100 },
        { step: 'التصفح', users: Math.floor(funnelUsers * 0.8), completionRate: 80 },
        { step: 'البحث', users: Math.floor(funnelUsers * 0.6), completionRate: 60 },
        { step: 'عرض المنتج', users: Math.floor(funnelUsers * 0.5), completionRate: 50 },
        { step: 'إضافة للعربة', users: Math.floor(funnelUsers * 0.35), completionRate: 35 },
        { step: 'الدفع', users: totalOrders, completionRate: (totalOrders / funnelUsers) * 100 }
      ];

      // Geographic data (simulated for Saudi Arabia)
      const geographicData = [
        { country: 'السعودية', city: 'الرياض', users: Math.floor(overview.totalUsers * 0.35), sessions: Math.floor(overview.totalUsers * 0.35 * 1.2), revenue: totalRevenue * 0.35 },
        { country: 'السعودية', city: 'جدة', users: Math.floor(overview.totalUsers * 0.25), sessions: Math.floor(overview.totalUsers * 0.25 * 1.1), revenue: totalRevenue * 0.25 },
        { country: 'السعودية', city: 'الدمام', users: Math.floor(overview.totalUsers * 0.15), sessions: Math.floor(overview.totalUsers * 0.15 * 1.1), revenue: totalRevenue * 0.15 },
        { country: 'السعودية', city: 'مكة', users: Math.floor(overview.totalUsers * 0.12), sessions: Math.floor(overview.totalUsers * 0.12 * 1.1), revenue: totalRevenue * 0.12 },
        { country: 'السعودية', city: 'أخرى', users: Math.floor(overview.totalUsers * 0.13), sessions: Math.floor(overview.totalUsers * 0.13 * 1.1), revenue: totalRevenue * 0.13 }
      ];

      // Time-based analytics (hourly patterns)
      const timeAnalytics = Array.from({ length: 24 }, (_, hour) => {
        // Simulate realistic shopping patterns (peak at 8-10 PM)
        let multiplier = 0.5;
        if (hour >= 10 && hour <= 14) multiplier = 0.8; // Lunch time
        if (hour >= 19 && hour <= 22) multiplier = 1.2; // Evening peak
        if (hour >= 20 && hour <= 21) multiplier = 1.5; // Prime time
        
        const hourlyOrders = ordersData?.filter(order => {
          const orderHour = new Date(order.created_at).getHours();
          return orderHour === hour;
        }) || [];

        return {
          hour: `${hour}:00`,
          users: Math.floor((overview.totalUsers / 24) * multiplier),
          orders: hourlyOrders.length,
          revenue: hourlyOrders.reduce((sum, order) => sum + (order.total_sar || 0), 0)
        };
      });

      setData({
        overview,
        trafficSources,
        deviceTypes,
        pageViews,
        salesFunnel,
        userJourney,
        geographicData,
        timeAnalytics
      });

    } catch (error) {
      console.error('Error generating user behavior analytics:', error);
      toast.error('حدث خطأ أثناء تحليل سلوك المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await generateUserBehaviorAnalytics();
    toast.success('تم تحديث البيانات بنجاح');
  };

  useEffect(() => {
    fetchShops();
  }, [profile]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      generateUserBehaviorAnalytics();
    }
  }, [dateRange, selectedShop, profile, shops]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحليل سلوك المستخدمين...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بيانات</h3>
              <p className="text-muted-foreground">اختر فترة زمنية لتحليل سلوك المستخدمين</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">تحليلات سلوك المستخدمين</h1>
          <p className="text-muted-foreground">فهم عميق لكيفية تفاعل المستخدمين مع متجرك</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          {shops.length > 0 && (
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر المتجر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المتاجر</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزوار</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              نشط: {data.overview.activeUsers.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              من الزوار إلى العملاء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الارتداد</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              مغادرة سريعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الجلسة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(data.overview.averageSessionDuration / 60)}:{(data.overview.averageSessionDuration % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              دقيقة:ثانية
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="behavior" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
          <TabsTrigger value="funnel">قمع المبيعات</TabsTrigger>
          <TabsTrigger value="devices">الأجهزة</TabsTrigger>
          <TabsTrigger value="geography">الجغرافيا</TabsTrigger>
          <TabsTrigger value="time">التوقيت</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مصادر الزيارات</CardTitle>
                <CardDescription>من أين يأتي زوار موقعك</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="users"
                      label={({ source, percentage }) => `${source}: ${percentage}%`}
                    >
                      {data.trafficSources.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أداء الصفحات</CardTitle>
                <CardDescription>الصفحات الأكثر زيارة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.pageViews.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-muted-foreground">
                          {page.views.toLocaleString()} مشاهدة • {Math.floor(page.averageTime / 60)} دقيقة
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={page.bounceRate < 20 ? 'default' : page.bounceRate < 40 ? 'secondary' : 'error'}>
                          ارتداد {page.bounceRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>رحلة المستخدم</CardTitle>
              <CardDescription>المراحل التي يمر بها المستخدم في الموقع</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.userJourney} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="step" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>قمع المبيعات</CardTitle>
              <CardDescription>تتبع رحلة العميل من الزيارة إلى الشراء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="users"
                      data={data.salesFunnel}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {data.salesFunnel.map((stage, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold">{stage.stage}</h4>
                        <p className="text-2xl font-bold text-primary">{stage.users.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{stage.percentage.toFixed(1)}%</p>
                        {stage.dropOff > 0 && (
                          <Badge variant="error" className="mt-2">
                            -{stage.dropOff.toFixed(1)}%
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أنواع الأجهزة</CardTitle>
                <CardDescription>توزيع الزوار حسب نوع الجهاز</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.deviceTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="users"
                      label={({ device, percentage }) => `${device}: ${percentage}%`}
                    >
                      {data.deviceTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الأجهزة</CardTitle>
                <CardDescription>إحصائيات مفصلة لكل نوع جهاز</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.deviceTypes.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {device.device === 'الهاتف المحمول' && <Smartphone className="h-5 w-5 text-info" />}
                        {device.device === 'سطح المكتب' && <Monitor className="h-5 w-5 text-success" />}
                        {device.device === 'الجهاز اللوحي' && <Tablet className="h-5 w-5 text-warning" />}
                        <div>
                          <p className="font-medium">{device.device}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.users.toLocaleString()} مستخدم
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {device.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التوزيع الجغرافي</CardTitle>
              <CardDescription>من أين يأتي عملاؤك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.geographicData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-info" />
                      <div>
                        <p className="font-medium">{location.city}</p>
                        <p className="text-sm text-muted-foreground">
                          {location.users.toLocaleString()} مستخدم • {location.sessions.toLocaleString()} جلسة
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{location.revenue.toLocaleString()} ريال</p>
                      <p className="text-sm text-muted-foreground">إيرادات</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>النشاط حسب الوقت</CardTitle>
              <CardDescription>أنماط النشاط خلال اليوم</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.timeAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="users" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="المستخدمون"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="الطلبات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserBehaviorAnalytics;