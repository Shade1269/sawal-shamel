import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Eye, 
  Clock,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  format: 'currency' | 'number' | 'percentage' | 'time';
}

interface PerformanceData {
  overview: MetricData[];
  traffic: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionTime: number;
    sources: Array<{
      source: string;
      visitors: number;
      percentage: number;
    }>;
  };
  sales: {
    revenue: number;
    orders: number;
    conversionRate: number;
    avgOrderValue: number;
    topProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  engagement: {
    clickThroughRate: number;
    addToCartRate: number;
    checkoutRate: number;
    returnCustomers: number;
  };
}

const PerformanceMetrics = () => {
  const [timeframe, setTimeframe] = useState('7d');
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب البيانات
    const fetchData = async () => {
      setLoading(true);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: PerformanceData = {
        overview: [
          { label: 'إجمالي الزوار', value: 2420, change: 12.5, trend: 'up', format: 'number' },
          { label: 'معدل التحويل', value: 3.2, change: -0.5, trend: 'down', target: 5, format: 'percentage' },
          { label: 'متوسط قيمة الطلب', value: 185.50, change: 8.3, trend: 'up', format: 'currency' },
          { label: 'وقت التحميل', value: 2.1, change: -15.2, trend: 'up', target: 3, format: 'time' },
        ],
        traffic: {
          visitors: 2420,
          pageViews: 8940,
          bounceRate: 45.2,
          avgSessionTime: 4.3,
          sources: [
            { source: 'البحث المباشر', visitors: 1200, percentage: 49.6 },
            { source: 'وسائل التواصل', visitors: 730, percentage: 30.2 },
            { source: 'الإحالات', visitors: 320, percentage: 13.2 },
            { source: 'البريد الإلكتروني', visitors: 170, percentage: 7.0 },
          ]
        },
        sales: {
          revenue: 15420.50,
          orders: 87,
          conversionRate: 3.2,
          avgOrderValue: 185.50,
          topProducts: [
            { name: 'فستان صيفي أنيق', sales: 25, revenue: 2500 },
            { name: 'حقيبة يد فاخرة', sales: 18, revenue: 1800 },
            { name: 'أحذية رياضية', sales: 15, revenue: 1200 }
          ]
        },
        engagement: {
          clickThroughRate: 2.8,
          addToCartRate: 12.5,
          checkoutRate: 68.3,
          returnCustomers: 34.7
        }
      };
      
      setData(mockData);
      setLoading(false);
    };

    fetchData();
  }, [timeframe]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `${value.toFixed(2)} ر.س`;
      case 'percentage':
        return `${value}%`;
      case 'time':
        return `${value}ث`;
      case 'number':
      default:
        return new Intl.NumberFormat('ar-SA').format(value);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (trend === 'stable') return 'text-gray-500';
    const positive = trend === 'up';
    return positive === isPositive ? 'text-green-500' : 'text-red-500';
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">مقاييس الأداء</h2>
            <p className="text-muted-foreground">تحليل شامل لأداء متجرك</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">مقاييس الأداء</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء متجرك وإحصائيات مفصلة</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={timeframe === '24h' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('24h')}
          >
            24 ساعة
          </Button>
          <Button 
            variant={timeframe === '7d' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('7d')}
          >
            7 أيام
          </Button>
          <Button 
            variant={timeframe === '30d' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('30d')}
          >
            30 يوم
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {data.overview.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatValue(metric.value, metric.format)}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getTrendColor(metric.trend, metric.format !== 'time')}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    مقارنة بالفترة السابقة
                  </span>
                </div>
                
                {metric.target && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>الهدف: {formatValue(metric.target, metric.format)}</span>
                      <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            الزوار
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            المبيعات
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            التفاعل
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            الأداء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  نظرة عامة على الزوار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.traffic.visitors.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الزوار</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.traffic.pageViews.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">مشاهدات الصفحات</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{data.traffic.bounceRate}%</div>
                    <div className="text-sm text-muted-foreground">معدل الارتداد</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{data.traffic.avgSessionTime} دقيقة</div>
                    <div className="text-sm text-muted-foreground">متوسط مدة الزيارة</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  مصادر الزوار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.traffic.sources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{source.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {source.visitors.toLocaleString()} ({source.percentage}%)
                        </span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  نظرة عامة على المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.sales.revenue.toLocaleString()} ر.س
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي الإيرادات</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.sales.orders}</div>
                    <div className="text-sm text-muted-foreground">عدد الطلبات</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{data.sales.conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">معدل التحويل</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.sales.avgOrderValue.toFixed(2)} ر.س
                    </div>
                    <div className="text-sm text-muted-foreground">متوسط قيمة الطلب</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  المنتجات الأكثر مبيعاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.sales.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.sales} مبيعة
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm text-green-600">
                          {product.revenue.toLocaleString()} ر.س
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {data.engagement.clickThroughRate}%
                </div>
                <div className="text-sm text-muted-foreground">معدل النقر</div>
                <Progress value={data.engagement.clickThroughRate * 10} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {data.engagement.addToCartRate}%
                </div>
                <div className="text-sm text-muted-foreground">إضافة للسلة</div>
                <Progress value={data.engagement.addToCartRate * 5} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {data.engagement.checkoutRate}%
                </div>
                <div className="text-sm text-muted-foreground">إتمام الشراء</div>
                <Progress value={data.engagement.checkoutRate} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {data.engagement.returnCustomers}%
                </div>
                <div className="text-sm text-muted-foreground">عملاء عائدون</div>
                <Progress value={data.engagement.returnCustomers} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  أداء الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">سرعة التحميل</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ممتاز (2.1ث)
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">تحسين الصور</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    يحتاج تحسين
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">الاستجابة على الجوال</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ممتاز
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  توصيات التحسين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-1">تحسين معدل التحويل</h4>
                  <p className="text-sm text-blue-700">
                    أضف المزيد من التقييمات لزيادة ثقة العملاء
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-1">تحسين تجربة الجوال</h4>
                  <p className="text-sm text-purple-700">
                    قم بتحسين أزرار الشراء للأجهزة المحمولة
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-1">استغل وسائل التواصل</h4>
                  <p className="text-sm text-green-700">
                    30% من زوارك يأتون من وسائل التواصل
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMetrics;