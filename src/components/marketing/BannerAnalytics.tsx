import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Users, 
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface BannerAnalyticsProps {
  bannerId: string;
  onClose: () => void;
}

export const BannerAnalytics: React.FC<BannerAnalyticsProps> = ({
  bannerId,
  onClose
}) => {
  const { analytics, fetchBannerAnalytics } = usePromotionalBanners();
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  const bannerAnalytics = analytics[bannerId];

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      await fetchBannerAnalytics(bannerId, parseInt(timeRange));
      setIsLoading(false);
    };

    loadAnalytics();
  }, [bannerId, timeRange, fetchBannerAnalytics]);

  const generateMockHourlyData = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: `${i}:00`,
        impressions: Math.floor(Math.random() * 100) + 20,
        clicks: Math.floor(Math.random() * 20) + 2
      });
    }
    return hours;
  };

  const generateMockDailyData = () => {
    const days = [];
    const daysCount = parseInt(timeRange);
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('ar-SA'),
        impressions: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 10) + 1
      });
    }
    return days;
  };

  const mockHourlyData = generateMockHourlyData();
  const mockDailyData = generateMockDailyData();

  const deviceColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            رجوع
          </Button>
          <div>
            <h2 className="text-2xl font-bold">تحليلات البانر</h2>
            <p className="text-muted-foreground">
              إحصائيات الأداء والتفاعل
            </p>
          </div>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">آخر 7 أيام</SelectItem>
            <SelectItem value="30">آخر 30 يوم</SelectItem>
            <SelectItem value="90">آخر 90 يوم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المشاهدات</p>
                  <p className="text-2xl font-bold">
                    {bannerAnalytics?.impressions?.toLocaleString() || '12,450'}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +15% من الأسبوع الماضي
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MousePointer className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">النقرات</p>
                  <p className="text-2xl font-bold">
                    {bannerAnalytics?.clicks?.toLocaleString() || '1,245'}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8% من الأسبوع الماضي
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">معدل النقر (CTR)</p>
                  <p className="text-2xl font-bold">
                    {bannerAnalytics?.ctr?.toFixed(2) || '10.0'}%
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2.3% من الأسبوع الماضي
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التحويلات</p>
                  <p className="text-2xl font-bold">
                    {bannerAnalytics?.conversions?.toLocaleString() || '124'}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% من الأسبوع الماضي
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="audience">الجمهور</TabsTrigger>
          <TabsTrigger value="timing">التوقيت</TabsTrigger>
          <TabsTrigger value="pages">الصفحات</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الأداء اليومي</CardTitle>
                <CardDescription>
                  المشاهدات والنقرات خلال الفترة المحددة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="impressions" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="المشاهدات"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      name="النقرات"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع التفاعل</CardTitle>
                <CardDescription>
                  نسب أنواع التفاعل المختلفة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'مشاهدات', value: bannerAnalytics?.impressions || 12450 },
                        { name: 'نقرات', value: bannerAnalytics?.clicks || 1245 },
                        { name: 'تحويلات', value: bannerAnalytics?.conversions || 124 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {mockDailyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الأجهزة</CardTitle>
                <CardDescription>
                  توزيع المشاهدات حسب نوع الجهاز
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <span>الهاتف المحمول</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">65%</span>
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div className="w-[65%] h-2 bg-blue-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-green-600" />
                      <span>سطح المكتب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">28%</span>
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div className="w-[28%] h-2 bg-green-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Tablet className="w-5 h-5 text-purple-600" />
                      <span>الجهاز اللوحي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">7%</span>
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div className="w-[7%] h-2 bg-purple-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المواقع الجغرافية</CardTitle>
                <CardDescription>
                  أكثر المدن مشاهدة للبانر
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { city: 'الرياض', percentage: 35, flag: '🇸🇦' },
                    { city: 'جدة', percentage: 25, flag: '🇸🇦' },
                    { city: 'الدمام', percentage: 18, flag: '🇸🇦' },
                    { city: 'مكة المكرمة', percentage: 12, flag: '🇸🇦' },
                    { city: 'المدينة المنورة', percentage: 10, flag: '🇸🇦' }
                  ].map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{location.flag}</span>
                        <span>{location.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{location.percentage}%</span>
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle>التفاعل حسب الساعة</CardTitle>
              <CardDescription>
                أفضل أوقات التفاعل مع البانر خلال اليوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockHourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impressions" fill="#0088FE" name="المشاهدات" />
                  <Bar dataKey="clicks" fill="#00C49F" name="النقرات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>أكثر الصفحات مشاهدة</CardTitle>
              <CardDescription>
                الصفحات التي حققت أكبر عدد من المشاهدات للبانر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bannerAnalytics?.topPages?.length > 0 ? (
                  bannerAnalytics.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium truncate max-w-md">
                            {page.page}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {page.views} مشاهدة
                          </p>
                        </div>
                      </div>
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  [
                    { page: '/home', views: 3450 },
                    { page: '/products', views: 2100 },
                    { page: '/categories/electronics', views: 1800 },
                    { page: '/sale', views: 1200 },
                    { page: '/about', views: 890 }
                  ].map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{page.page}</p>
                          <p className="text-sm text-muted-foreground">
                            {page.views} مشاهدة
                          </p>
                        </div>
                      </div>
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};