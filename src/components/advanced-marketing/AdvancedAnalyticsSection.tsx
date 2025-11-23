import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdvancedAnalyticsSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('page_views');

  // بيانات تجريبية للتحليلات
  const analyticsData = {
    overview: {
      total_sessions: 15420,
      unique_visitors: 8960,
      page_views: 45230,
      bounce_rate: 32.5,
      avg_session_duration: 245, // seconds
      conversion_rate: 3.2
    },
    traffic_sources: [
      { name: 'بحث طبيعي', value: 45, sessions: 6939 },
      { name: 'مباشر', value: 25, sessions: 3855 },
      { name: 'وسائل التواصل', value: 15, sessions: 2313 },
      { name: 'إعلانات مدفوعة', value: 10, sessions: 1542 },
      { name: 'إحالات', value: 5, sessions: 771 }
    ],
    device_breakdown: [
      { name: 'الجوال', value: 65, sessions: 10023 },
      { name: 'سطح المكتب', value: 25, sessions: 3855 },
      { name: 'الأجهزة اللوحية', value: 10, sessions: 1542 }
    ],
    hourly_traffic: [
      { hour: '00:00', sessions: 120, page_views: 450 },
      { hour: '01:00', sessions: 80, page_views: 280 },
      { hour: '02:00', sessions: 60, page_views: 200 },
      { hour: '03:00', sessions: 45, page_views: 150 },
      { hour: '04:00', sessions: 35, page_views: 120 },
      { hour: '05:00', sessions: 50, page_views: 180 },
      { hour: '06:00', sessions: 90, page_views: 320 },
      { hour: '07:00', sessions: 150, page_views: 520 },
      { hour: '08:00', sessions: 220, page_views: 780 },
      { hour: '09:00', sessions: 280, page_views: 950 },
      { hour: '10:00', sessions: 320, page_views: 1100 },
      { hour: '11:00', sessions: 350, page_views: 1200 },
      { hour: '12:00', sessions: 380, page_views: 1300 },
      { hour: '13:00', sessions: 340, page_views: 1150 },
      { hour: '14:00', sessions: 310, page_views: 1050 },
      { hour: '15:00', sessions: 290, page_views: 980 },
      { hour: '16:00', sessions: 270, page_views: 920 },
      { hour: '17:00', sessions: 250, page_views: 850 },
      { hour: '18:00', sessions: 230, page_views: 780 },
      { hour: '19:00', sessions: 210, page_views: 720 },
      { hour: '20:00', sessions: 180, page_views: 620 },
      { hour: '21:00', sessions: 160, page_views: 550 },
      { hour: '22:00', sessions: 140, page_views: 480 },
      { hour: '23:00', sessions: 130, page_views: 450 }
    ],
    daily_trends: [
      { date: '2024-01-01', sessions: 1200, conversions: 45, revenue: 12500 },
      { date: '2024-01-02', sessions: 1350, conversions: 52, revenue: 14200 },
      { date: '2024-01-03', sessions: 1180, conversions: 38, revenue: 11800 },
      { date: '2024-01-04', sessions: 1420, conversions: 58, revenue: 15600 },
      { date: '2024-01-05', sessions: 1580, conversions: 65, revenue: 17200 },
      { date: '2024-01-06', sessions: 1890, conversions: 78, revenue: 21400 },
      { date: '2024-01-07', sessions: 2100, conversions: 89, revenue: 24800 }
    ],
    top_pages: [
      { page: '/products', sessions: 3200, bounce_rate: 25.3, avg_time: 180 },
      { page: '/home', sessions: 2800, bounce_rate: 35.2, avg_time: 120 },
      { page: '/about', sessions: 1200, bounce_rate: 45.8, avg_time: 90 },
      { page: '/contact', sessions: 800, bounce_rate: 55.2, avg_time: 60 },
      { page: '/blog', sessions: 600, bounce_rate: 28.9, avg_time: 220 }
    ],
    conversion_funnel: [
      { step: 'زيارة الموقع', users: 15420, conversion_rate: 100 },
      { step: 'عرض المنتج', users: 8960, conversion_rate: 58.1 },
      { step: 'إضافة للسلة', users: 2688, conversion_rate: 17.4 },
      { step: 'بدء الدفع', users: 1344, conversion_rate: 8.7 },
      { step: 'إكمال الشراء', users: 493, conversion_rate: 3.2 }
    ]
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'الجوال':
        return Smartphone;
      case 'سطح المكتب':
        return Monitor;
      case 'الأجهزة اللوحية':
        return Tablet;
      default:
        return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">التحليلات المتقدمة</h2>
          <p className="text-muted-foreground">تحليل مفصل لأداء الموقع وسلوك الزوار</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">اليوم</SelectItem>
              <SelectItem value="7d">7 أيام</SelectItem>
              <SelectItem value="30d">30 يوم</SelectItem>
              <SelectItem value="90d">90 يوم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{analyticsData.overview.total_sessions.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">إجمالي الجلسات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.unique_visitors.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">زوار فريدون</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MousePointer className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{analyticsData.overview.page_views.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">مشاهدات الصفحة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{analyticsData.overview.bounce_rate}%</p>
            <p className="text-sm text-muted-foreground">معدل الارتداد</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{formatDuration(analyticsData.overview.avg_session_duration)}</p>
            <p className="text-sm text-muted-foreground">متوسط مدة الجلسة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{analyticsData.overview.conversion_rate}%</p>
            <p className="text-sm text-muted-foreground">معدل التحويل</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              الاتجاهات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.daily_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value as string).toLocaleDateString('ar-SA')}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name === 'sessions' ? 'الجلسات' : name === 'conversions' ? 'التحويلات' : 'الإيرادات'
                  ]}
                />
                <Area type="monotone" dataKey="sessions" stackId="1" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              مصادر الزيارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.traffic_sources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.traffic_sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Traffic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              حركة المرور حسب الساعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.hourly_traffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              توزيع الأجهزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.device_breakdown.map((device, index) => {
                const IconComponent = getDeviceIcon(device.name);
                return (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2 w-32">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${device.value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{device.value}%</span>
                      <span className="text-sm text-muted-foreground">({device.sessions.toLocaleString()})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              أكثر الصفحات زيارة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.top_pages.map((page, index) => (
                <div key={page.page} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{page.page}</span>
                    <Badge variant="outline">{page.sessions.toLocaleString()} زيارة</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <span>معدل الارتداد: {page.bounce_rate}%</span>
                    <span>متوسط الوقت: {formatDuration(page.avg_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              مسار التحويل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.conversion_funnel.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{step.users.toLocaleString()}</span>
                      <Badge variant={step.conversion_rate > 50 ? "default" : step.conversion_rate > 20 ? "secondary" : "outline"}>
                        {step.conversion_rate}%
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${step.conversion_rate}%` }}
                    ></div>
                  </div>
                  {index < analyticsData.conversion_funnel.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-muted-foreground"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};