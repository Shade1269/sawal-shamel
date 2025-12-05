import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { usePredictiveInsights, PredictiveInsight } from '@/hooks/useAdvancedMarketing';

export const PredictiveInsightsSection: React.FC = () => {
  const { insights, isLoading } = usePredictiveInsights();

  const getInsightTypeLabel = (type: PredictiveInsight['insight_type']) => {
    const labels = {
      sales_forecast: 'توقعات المبيعات',
      customer_churn: 'احتمالية فقدان العملاء',
      product_demand: 'طلب المنتجات',
      seasonal_trends: 'الاتجاهات الموسمية',
      customer_lifetime_value: 'القيمة الدائمة للعميل'
    };
    return labels[type];
  };

  const getInsightIcon = (type: PredictiveInsight['insight_type']) => {
    const icons = {
      sales_forecast: TrendingUp,
      customer_churn: Users,
      product_demand: ShoppingCart,
      seasonal_trends: Calendar,
      customer_lifetime_value: Target
    };
    return icons[type];
  };

  const getInsightColor = (type: PredictiveInsight['insight_type']) => {
    const colors = {
      sales_forecast: 'text-success',
      customer_churn: 'text-destructive',
      product_demand: 'text-info',
      seasonal_trends: 'text-premium',
      customer_lifetime_value: 'text-warning'
    };
    return colors[type];
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceLabel = (score?: number) => {
    if (!score) return 'غير متاح';
    if (score >= 0.8) return 'عالية';
    if (score >= 0.6) return 'متوسطة';
    return 'منخفضة';
  };

  // نموذج رؤى تجريبية للعرض
  const sampleInsights = [
    {
      id: 'sample-1',
      insight_type: 'sales_forecast' as const,
      insight_data: {
        predicted_sales: 125000,
        current_trend: 'increasing',
        growth_rate: 15.3,
        key_factors: ['موسم الأعياد', 'حملة تسويقية جديدة', 'منتجات شائعة']
      },
      confidence_score: 0.87,
      prediction_period: 'الشهر القادم',
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-2',
      insight_type: 'customer_churn' as const,
      insight_data: {
        at_risk_customers: 45,
        churn_probability: 0.23,
        main_reasons: ['عدم التفاعل', 'عدم الشراء لفترة طويلة', 'انخفاض معدل الفتح'],
        recommended_actions: ['حملة إعادة تفعيل', 'عرض خاص', 'تواصل شخصي']
      },
      confidence_score: 0.76,
      prediction_period: 'الأسبوعين القادمين',
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-3',
      insight_type: 'product_demand' as const,
      insight_data: {
        trending_products: [
          { name: 'منتج A', expected_demand: 'عالي', growth: 25 },
          { name: 'منتج B', expected_demand: 'متوسط', growth: 12 },
          { name: 'منتج C', expected_demand: 'منخفض', growth: -5 }
        ],
        seasonal_impact: 'إيجابي',
        inventory_recommendations: 'زيادة المخزون بنسبة 20%'
      },
      confidence_score: 0.81,
      prediction_period: 'الربع القادم',
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayInsights = insights.length > 0 ? insights : sampleInsights;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحليل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">التحليلات التنبؤية الذكية</h2>
        <p className="text-muted-foreground">رؤى مبنية على الذكاء الاصطناعي لتحسين القرارات التجارية</p>
      </div>

      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{displayInsights.length}</p>
            <p className="text-sm text-muted-foreground">رؤى نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">
              {displayInsights.filter(i => (i.confidence_score || 0) >= 0.8).length}
            </p>
            <p className="text-sm text-muted-foreground">رؤى عالية الدقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning">
              {displayInsights.filter(i => i.insight_type === 'customer_churn').length}
            </p>
            <p className="text-sm text-muted-foreground">تنبيهات هامة</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="space-y-4">
        {displayInsights.map((insight) => {
          const IconComponent = getInsightIcon(insight.insight_type);
          return (
            <Card key={insight.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${getInsightColor(insight.insight_type)}`} />
                    {getInsightTypeLabel(insight.insight_type)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.prediction_period}
                    </Badge>
                    <Badge 
                      variant={insight.confidence_score && insight.confidence_score >= 0.8 ? "default" : "secondary"}
                      className={getConfidenceColor(insight.confidence_score)}
                    >
                      دقة: {getConfidenceLabel(insight.confidence_score)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Confidence Score */}
                {insight.confidence_score && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>مستوى الثقة</span>
                      <span className={getConfidenceColor(insight.confidence_score)}>
                        {Math.round(insight.confidence_score * 100)}%
                      </span>
                    </div>
                    <Progress value={insight.confidence_score * 100} className="h-2" />
                  </div>
                )}

                {/* Insight Content */}
                <div className="space-y-4">
                  {insight.insight_type === 'sales_forecast' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">المبيعات المتوقعة</h4>
                        <p className="text-2xl font-bold text-success">
                          {insight.insight_data.predicted_sales?.toLocaleString('ar-SA')} ر.س
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-success" />
                          نمو متوقع: {insight.insight_data.growth_rate}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">العوامل المؤثرة</h4>
                        <ul className="text-sm space-y-1">
                          {insight.insight_data.key_factors?.map((factor: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {insight.insight_type === 'customer_churn' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-destructive/10 p-3 rounded-lg">
                          <h4 className="font-semibold text-destructive mb-2">عملاء في خطر</h4>
                          <p className="text-2xl font-bold text-destructive">
                            {insight.insight_data.at_risk_customers}
                          </p>
                          <p className="text-sm text-destructive">
                            احتمالية الفقدان: {Math.round((insight.insight_data.churn_probability || 0) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">الإجراءات المقترحة</h4>
                        <ul className="text-sm space-y-1">
                          {insight.insight_data.recommended_actions?.map((action: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {insight.insight_type === 'product_demand' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">المنتجات الرائجة</h4>
                      <div className="space-y-2">
                        {insight.insight_data.trending_products?.map((product: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="font-medium">{product.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={product.expected_demand === 'عالي' ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {product.expected_demand}
                              </Badge>
                              <span className={`text-sm ${product.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                                {product.growth > 0 ? '+' : ''}{product.growth}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-info/10 p-3 rounded-lg">
                        <h5 className="font-medium text-info mb-1">توصية المخزون</h5>
                        <p className="text-sm text-info">{insight.insight_data.inventory_recommendations}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Validity */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                  <Clock className="h-3 w-3" />
                  <span>
                    تم إنشاؤها: {new Date(insight.generated_at).toLocaleDateString('ar-SA')}
                  </span>
                  {insight.valid_until && (
                    <>
                      <span>•</span>
                      <span>
                        صالحة حتى: {new Date(insight.valid_until).toLocaleDateString('ar-SA')}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayInsights.length === 0 && (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد رؤى تنبؤية متاحة</h3>
          <p className="text-muted-foreground">سيتم إنشاء الرؤى التنبؤية تلقائياً بناءً على البيانات المتوفرة</p>
        </div>
      )}
    </div>
  );
};