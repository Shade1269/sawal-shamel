import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  BarChart3,
  Target,
  Globe,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { useSEOAnalytics } from '@/hooks/useContentManagement';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for demonstration
const mockSEOData = [
  { keyword: 'متجر إلكتروني', position: 3, volume: 1500, ctr: 12.5, impressions: 2400, clicks: 300 },
  { keyword: 'تسويق رقمي', position: 7, volume: 800, ctr: 8.2, impressions: 1200, clicks: 98 },
  { keyword: 'بيع أونلاين', position: 12, volume: 600, ctr: 5.1, impressions: 800, clicks: 41 },
  { keyword: 'منتجات رقمية', position: 5, volume: 400, ctr: 9.8, impressions: 650, clicks: 64 }
];

const trafficData = [
  { date: '01/12', organic: 1200, direct: 800, social: 400, referral: 200 },
  { date: '02/12', organic: 1400, direct: 900, social: 450, referral: 250 },
  { date: '03/12', organic: 1600, direct: 850, social: 500, referral: 180 },
  { date: '04/12', organic: 1800, direct: 920, social: 480, referral: 220 },
  { date: '05/12', organic: 2000, direct: 1000, social: 520, referral: 300 },
  { date: '06/12', organic: 2200, direct: 1100, social: 600, referral: 280 },
  { date: '07/12', organic: 2400, direct: 1200, social: 650, referral: 350 }
];

const pagePerformance = [
  { page: 'الصفحة الرئيسية', visits: 15420, bounceRate: 35, avgTime: '2:45' },
  { page: 'المنتجات', visits: 8900, bounceRate: 42, avgTime: '3:12' },
  { page: 'من نحن', visits: 3400, bounceRate: 28, avgTime: '1:58' },
  { page: 'اتصل بنا', visits: 2100, bounceRate: 15, avgTime: '1:30' }
];

export function SEOAnalyticsSection() {
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const { analytics, isLoading } = useSEOAnalytics(selectedPageId);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  // Mock pages - في الواقع سيتم جلبها من useCustomPages
  const mockPages = [
    { id: 'all', page_title: 'جميع الصفحات', page_slug: '' },
    { id: '1', page_title: 'الصفحة الرئيسية', page_slug: 'home' },
    { id: '2', page_title: 'من نحن', page_slug: 'about' },
    { id: '3', page_title: 'المنتجات', page_slug: 'products' }
  ];

  const filteredKeywords = mockSEOData.filter(item => 
    item.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-success';
    if (position <= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) return 'default';
    if (position <= 10) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">تحليلات SEO والأداء</h2>
          <p className="text-muted-foreground">تتبع أداء صفحاتك في محركات البحث</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر الصفحة" />
              </SelectTrigger>
              <SelectContent>
                {mockPages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.page_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 أيام</SelectItem>
                <SelectItem value="30d">30 يوم</SelectItem>
                <SelectItem value="90d">90 يوم</SelectItem>
                <SelectItem value="1y">سنة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في الكلمات المفتاحية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:flex">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-2">
            <Target className="h-4 w-4" />
            الكلمات المفتاحية
          </TabsTrigger>
          <TabsTrigger value="traffic" className="gap-2">
            <Users className="h-4 w-4" />
            الزيارات
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            أداء الصفحات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Eye className="h-5 w-5 text-info" />
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.5k</div>
                <p className="text-sm text-muted-foreground">إجمالي الظهور</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <MousePointer className="h-5 w-5 text-success" />
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.8k</div>
                <p className="text-sm text-muted-foreground">النقرات</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Target className="h-5 w-5 text-warning" />
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2.1%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.3%</div>
                <p className="text-sm text-muted-foreground">نسبة النقر</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-5 w-5 text-premium" />
                  <Badge variant="secondary" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -0.5
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.2</div>
                <p className="text-sm text-muted-foreground">متوسط الترتيب</p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الزيارات حسب المصدر</CardTitle>
              <CardDescription>تطور الزيارات خلال الأسبوع الماضي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="organic" stroke="#8884d8" strokeWidth={2} name="بحث طبيعي" />
                    <Line type="monotone" dataKey="direct" stroke="#82ca9d" strokeWidth={2} name="مباشر" />
                    <Line type="monotone" dataKey="social" stroke="#ffc658" strokeWidth={2} name="وسائل التواصل" />
                    <Line type="monotone" dataKey="referral" stroke="#ff7c7c" strokeWidth={2} name="إحالة" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء الكلمات المفتاحية</CardTitle>
              <CardDescription>تتبع ترتيب كلماتك المفتاحية في محركات البحث</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{keyword.keyword}</h4>
                        <Badge variant={getPositionBadge(keyword.position)}>
                          #{keyword.position}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>الحجم: {keyword.volume.toLocaleString()}</span>
                        <span>الظهور: {keyword.impressions.toLocaleString()}</span>
                        <span>النقرات: {keyword.clicks}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{keyword.ctr}%</div>
                      <div className="text-sm text-muted-foreground">نسبة النقر</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مصادر الزيارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'بحث طبيعي', value: 45, fill: '#8884d8' },
                          { name: 'مباشر', value: 30, fill: '#82ca9d' },
                          { name: 'وسائل التواصل', value: 15, fill: '#ffc658' },
                          { name: 'إحالة', value: 10, fill: '#ff7c7c' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {[
                          { name: 'بحث طبيعي', value: 45, fill: '#8884d8' },
                          { name: 'مباشر', value: 30, fill: '#82ca9d' },
                          { name: 'وسائل التواصل', value: 15, fill: '#ffc658' },
                          { name: 'إحالة', value: 10, fill: '#ff7c7c' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الزيارات اليومية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="organic" stackId="a" fill="#8884d8" name="بحث طبيعي" />
                      <Bar dataKey="direct" stackId="a" fill="#82ca9d" name="مباشر" />
                      <Bar dataKey="social" stackId="a" fill="#ffc658" name="وسائل التواصل" />
                      <Bar dataKey="referral" stackId="a" fill="#ff7c7c" name="إحالة" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء الصفحات</CardTitle>
              <CardDescription>إحصائيات مفصلة عن أداء كل صفحة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagePerformance.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{page.page}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {page.visits.toLocaleString()} زيارة
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {page.avgTime} متوسط الوقت
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        page.bounceRate <= 30 ? 'text-success' : 
                        page.bounceRate <= 50 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {page.bounceRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">معدل الارتداد</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}