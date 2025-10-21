import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Activity,
  Zap,
  Target,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

interface SmartInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

export const SmartDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل البيانات الذكية
    const loadSmartData = async () => {
      setIsLoading(true);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockMetrics: MetricCard[] = [
        {
          id: '1',
          title: 'إجمالي المبيعات',
          value: '47,250 ريال',
          change: '+12.5%',
          trend: 'up',
          icon: <DollarSign className="h-5 w-5" />,
          description: 'زيادة ملحوظة في المبيعات هذا الشهر'
        },
        {
          id: '2',
          title: 'العملاء النشطون',
          value: '2,847',
          change: '+8.2%',
          trend: 'up',
          icon: <Users className="h-5 w-5" />,
          description: 'نمو مستمر في قاعدة العملاء'
        },
        {
          id: '3',
          title: 'الطلبات اليومية',
          value: '156',
          change: '+15.3%',
          trend: 'up',
          icon: <ShoppingCart className="h-5 w-5" />,
          description: 'أداء ممتاز في الطلبات اليوم'
        },
        {
          id: '4',
          title: 'معدل التحويل',
          value: '3.8%',
          change: '+0.5%',
          trend: 'up',
          icon: <Target className="h-5 w-5" />,
          description: 'تحسن في معدلات التحويل'
        }
      ];

      const mockInsights: SmartInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'فرصة زيادة المبيعات',
          description: 'اكتشفنا أن المنتجات في فئة الإلكترونيات تحقق أداءً ممتازاً. يمكن زيادة المخزون بـ 30%',
          confidence: 87,
          impact: 'high',
          action: 'زيادة المخزون'
        },
        {
          id: '2',
          type: 'trend',
          title: 'اتجاه صاعد في التسوق المحمول',
          description: 'ارتفعت مبيعات التطبيق المحمول بنسبة 45% خلال الأسبوع الماضي',
          confidence: 92,
          impact: 'medium',
          action: 'تحسين تجربة المحمول'
        },
        {
          id: '3',
          type: 'anomaly',
          title: 'انخفاض غير متوقع في منطقة الرياض',
          description: 'لاحظنا انخفاضاً بنسبة 15% في المبيعات من منطقة الرياض مقارنة بالأسبوع الماضي',
          confidence: 78,
          impact: 'medium',
          action: 'فحص الحملات التسويقية'
        }
      ];

      setMetrics(mockMetrics);
      setInsights(mockInsights);
      setIsLoading(false);
    };

    loadSmartData();
  }, []);

  const getInsightIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Sparkles className="h-4 w-4 text-success" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-info" />;
      case 'anomaly':
        return <Activity className="h-4 w-4 text-warning" />;
      case 'warning':
        return <Zap className="h-4 w-4 text-error" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightBadgeVariant = (type: SmartInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'default';
      case 'trend':
        return 'secondary';
      case 'anomaly':
        return 'outline';
      case 'warning':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-error rotate-180" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-32">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">لوحة التحكم الذكية</h1>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            مدعوم بالذكاء الاصطناعي
          </Badge>
        </div>
        <Button variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover-lift cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  <span className={cn(
                    'font-medium',
                    metric.trend === 'up' && 'text-success',
                    metric.trend === 'down' && 'text-error',
                    metric.trend === 'neutral' && 'text-muted-foreground'
                  )}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">من الشهر الماضي</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            رؤى ذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getInsightBadgeVariant(insight.type)} size="sm">
                        {insight.type === 'opportunity' && 'فرصة'}
                        {insight.type === 'trend' && 'اتجاه'}
                        {insight.type === 'anomaly' && 'شذوذ'}
                        {insight.type === 'warning' && 'تحذير'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>الثقة: {insight.confidence}%</span>
                      <span className={cn(
                        'px-2 py-1 rounded',
                        insight.impact === 'high' && 'bg-error/20 text-error',
                        insight.impact === 'medium' && 'bg-warning/20 text-warning',
                        insight.impact === 'low' && 'bg-success/20 text-success'
                      )}>
                        التأثير: {insight.impact === 'high' ? 'عالي' : insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {insight.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  الأداء العام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>مخطط الأداء العام سيظهر هنا</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  توزيع القنوات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>مخطط توزيع القنوات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                تحليل المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>مخططات تحليل المبيعات المفصلة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                تحليل العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>تحليلات سلوك العملاء والتقسيمات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                تحليل المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>أداء المنتجات والتوصيات الذكية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};