import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Brain, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  category: 'sales' | 'inventory' | 'customers' | 'market';
  trend: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

interface ForecastData {
  period: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

export const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    const loadPredictions = async () => {
      setIsLoading(true);
      
      // محاكاة تحميل البيانات التنبؤية
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          title: 'ارتفاع المبيعات المتوقع',
          description: 'نتوقع زيادة في المبيعات بنسبة 23% خلال الأسبوع القادم بناء على الاتجاهات الحالية',
          probability: 87,
          timeframe: 'الأسبوع القادم',
          category: 'sales',
          trend: 'positive',
          impact: 'high',
          confidence: 85
        },
        {
          id: '2',
          title: 'نقص مخزون متوقع',
          description: 'قد ينفد مخزون فئة الهواتف الذكية خلال 5 أيام إذا استمر معدل البيع الحالي',
          probability: 78,
          timeframe: '5 أيام',
          category: 'inventory',
          trend: 'negative',
          impact: 'high',
          confidence: 82
        },
        {
          id: '3',
          title: 'زيادة عدد العملاء الجدد',
          description: 'نتوقع انضمام 450 عميل جديد هذا الشهر بناء على حملاتنا التسويقية',
          probability: 72,
          timeframe: 'هذا الشهر',
          category: 'customers',
          trend: 'positive',
          impact: 'medium',
          confidence: 76
        },
        {
          id: '4',
          title: 'تراجع في قطاع الأزياء',
          description: 'قد نشهد انخفاضاً في مبيعات الأزياء بنسبة 12% مع بداية الصيف',
          probability: 65,
          timeframe: 'الشهر القادم',
          category: 'market',
          trend: 'negative',
          impact: 'medium',
          confidence: 71
        }
      ];

      const mockForecasts: ForecastData[] = [
        { period: 'الأسبوع 1', predicted: 45000, actual: 43500, confidence: 92 },
        { period: 'الأسبوع 2', predicted: 48000, actual: 47200, confidence: 89 },
        { period: 'الأسبوع 3', predicted: 52000, actual: 51800, confidence: 87 },
        { period: 'الأسبوع 4', predicted: 55000, confidence: 85 },
        { period: 'الأسبوع 5', predicted: 58000, confidence: 82 },
        { period: 'الأسبوع 6', predicted: 61000, confidence: 78 }
      ];

      setPredictions(mockPredictions);
      setForecasts(mockForecasts);
      setIsLoading(false);
    };

    loadPredictions();
  }, [selectedTimeframe]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales':
        return <DollarSign className="h-4 w-4" />;
      case 'inventory':
        return <BarChart3 className="h-4 w-4" />;
      case 'customers':
        return <Users className="h-4 w-4" />;
      case 'market':
        return <Target className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sales':
        return 'المبيعات';
      case 'inventory':
        return 'المخزون';
      case 'customers':
        return 'العملاء';
      case 'market':
        return 'السوق';
      default:
        return 'عام';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-error" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-error/20 text-error';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-2 bg-muted rounded w-full"></div>
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
          <h1 className="text-2xl font-bold">التحليلات التنبؤية</h1>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            ذكاء اصطناعي متقدم
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={selectedTimeframe === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeframe('week')}
          >
            أسبوعي
          </Button>
          <Button 
            variant={selectedTimeframe === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeframe('month')}
          >
            شهري
          </Button>
          <Button 
            variant={selectedTimeframe === 'quarter' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeframe('quarter')}
          >
            ربع سنوي
          </Button>
        </div>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="forecasts">التوقعات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="hover-lift cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(prediction.category)}
                      <Badge variant="outline" size="sm">
                        {getCategoryLabel(prediction.category)}
                      </Badge>
                    </div>
                    {getTrendIcon(prediction.trend)}
                  </div>
                  <CardTitle className="text-lg">{prediction.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{prediction.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>احتمالية الحدوث</span>
                      <span className="font-medium">{prediction.probability}%</span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>مستوى الثقة</span>
                      <span className="font-medium">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{prediction.timeframe}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs', getImpactColor(prediction.impact))}
                    >
                      تأثير {prediction.impact === 'high' ? 'عالي' : prediction.impact === 'medium' ? 'متوسط' : 'منخفض'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                توقعات المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecasts.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{forecast.period}</span>
                      </div>
                      {forecast.actual && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">متوقع</div>
                        <div className="font-semibold">{forecast.predicted.toLocaleString()} ريال</div>
                      </div>
                      
                      {forecast.actual && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">فعلي</div>
                          <div className="font-semibold text-success">{forecast.actual.toLocaleString()} ريال</div>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">الثقة</div>
                        <div className="font-medium">{forecast.confidence}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  الاتجاهات الصاعدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="font-medium text-success">التسوق عبر المحمول</div>
                  <div className="text-sm text-muted-foreground">نمو بنسبة 45% شهرياً</div>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="font-medium text-success">منتجات صديقة للبيئة</div>
                  <div className="text-sm text-muted-foreground">زيادة الطلب بنسبة 32%</div>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="font-medium text-success">الدفع الرقمي</div>
                  <div className="text-sm text-muted-foreground">اعتماد أكبر بنسبة 28%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  اتجاهات تحتاج مراقبة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <div className="font-medium text-warning">معدلات الإرجاع</div>
                  <div className="text-sm text-muted-foreground">ارتفاع طفيف 8%</div>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <div className="font-medium text-warning">تكلفة الحصول على العملاء</div>
                  <div className="text-sm text-muted-foreground">زيادة بنسبة 15%</div>
                </div>
                <div className="p-3 bg-error/10 rounded-lg">
                  <div className="font-medium text-error">المنافسة في أسعار الشحن</div>
                  <div className="text-sm text-muted-foreground">ضغط تنافسي متزايد</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};