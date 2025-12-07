import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Brain
} from 'lucide-react';


interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'inventory' | 'pricing' | 'customer' | 'operations';
  priority: 'high' | 'medium' | 'low';
  impact: number; // 1-100
  effort: number; // 1-100
  roi: number; // Return on Investment percentage
  timeframe: string;
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  tags: string[];
  details: string[];
}

interface RecommendationStats {
  total: number;
  implemented: number;
  potential_roi: number;
  avg_impact: number;
}

export const SmartRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      
      // محاكاة تحميل التوصيات الذكية
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          title: 'تحسين صفحات المنتجات للموبايل',
          description: 'تحسين تجربة التسوق عبر الهاتف المحمول يمكن أن يزيد التحويلات بنسبة 35%',
          category: 'marketing',
          priority: 'high',
          impact: 85,
          effort: 40,
          roi: 240,
          timeframe: '2-3 أسابيع',
          status: 'new',
          tags: ['موبايل', 'تحويل', 'UX'],
          details: [
            'تحسين سرعة تحميل الصفحات',
            'تبسيط عملية الشراء',
            'تحسين عرض الصور',
            'إضافة خيارات دفع سريعة'
          ]
        },
        {
          id: '2',
          title: 'تطبيق استراتيجية التسعير الديناميكي',
          description: 'استخدام الذكاء الاصطناعي لتحديد أسعار تنافسية مع زيادة الأرباح',
          category: 'pricing',
          priority: 'high',
          impact: 78,
          effort: 65,
          roi: 180,
          timeframe: '4-6 أسابيع',
          status: 'in_progress',
          tags: ['تسعير', 'AI', 'ربحية'],
          details: [
            'تحليل أسعار المنافسين',
            'تحديد نقاط السعر المثلى',
            'تطبيق تجارب A/B',
            'مراقبة تأثير التغييرات'
          ]
        },
        {
          id: '3',
          title: 'برنامج ولاء العملاء المتقدم',
          description: 'إطلاق برنامج ولاء ذكي يزيد من احتفاظ العملاء ويرفع قيمة الطلب',
          category: 'customer',
          priority: 'medium',
          impact: 72,
          effort: 55,
          roi: 160,
          timeframe: '6-8 أسابيع',
          status: 'new',
          tags: ['ولاء', 'احتفاظ', 'قيمة'],
          details: [
            'نظام نقاط متدرج',
            'عروض مخصصة',
            'تجربة VIP للعملاء المميزين',
            'تكامل مع وسائل التواصل'
          ]
        },
        {
          id: '4',
          title: 'تحسين إدارة المخزون بالذكاء الاصطناعي',
          description: 'تقليل تكاليف المخزون بنسبة 25% مع تجنب نفاد المخزون',
          category: 'inventory',
          priority: 'medium',
          impact: 68,
          effort: 70,
          roi: 140,
          timeframe: '8-10 أسابيع',
          status: 'new',
          tags: ['مخزون', 'AI', 'تكلفة'],
          details: [
            'تنبؤ بالطلب باستخدام AI',
            'تحسين مستويات الطلب',
            'تتبع دوران المخزون',
            'تحليل الموسمية'
          ]
        },
        {
          id: '5',
          title: 'تحسين خدمة العملاء بالشات بوت',
          description: 'تقليل وقت الاستجابة وتحسين رضا العملاء',
          category: 'operations',
          priority: 'low',
          impact: 55,
          effort: 35,
          roi: 120,
          timeframe: '3-4 أسابيع',
          status: 'completed',
          tags: ['خدمة عملاء', 'أتمتة', 'رضا'],
          details: [
            'إجابة فورية على الاستفسارات',
            'توجيه الطلبات المعقدة',
            'تتبع حالة الطلبات',
            'جمع تقييمات العملاء'
          ]
        }
      ];

      const mockStats: RecommendationStats = {
        total: 12,
        implemented: 3,
        potential_roi: 850,
        avg_impact: 71
      };

      setRecommendations(mockRecommendations);
      setStats(mockStats);
      setIsLoading(false);
    };

    loadRecommendations();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing':
        return <Target className="h-4 w-4" />;
      case 'inventory':
        return <ShoppingCart className="h-4 w-4" />;
      case 'pricing':
        return <TrendingUp className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'operations':
        return <Zap className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'marketing':
        return 'تسويق';
      case 'inventory':
        return 'مخزون';
      case 'pricing':
        return 'تسعير';
      case 'customer':
        return 'عملاء';
      case 'operations':
        return 'عمليات';
      default:
        return 'عام';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error text-error-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'new':
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'new':
        return 'جديدة';
      case 'dismissed':
        return 'مرفوضة';
      default:
        return 'غير محدد';
    }
  };

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === filter);

  const handleImplement = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'in_progress' as const }
          : rec
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-32">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
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
          <Lightbulb className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">التوصيات الذكية</h1>
          <Badge variant="secondary" className="gap-1">
            <Brain className="h-3 w-3" />
            مدعوم بالذكاء الاصطناعي
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm">إجمالي التوصيات</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">المنفذة</span>
              </div>
              <div className="text-2xl font-bold text-success">{stats.implemented}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">العائد المتوقع</span>
              </div>
              <div className="text-2xl font-bold text-primary">{stats.potential_roi}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Star className="h-4 w-4" />
                <span className="text-sm">متوسط التأثير</span>
              </div>
              <div className="text-2xl font-bold">{stats.avg_impact}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          الكل
        </Button>
        <Button 
          variant={filter === 'marketing' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('marketing')}
        >
          تسويق
        </Button>
        <Button 
          variant={filter === 'pricing' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('pricing')}
        >
          تسعير
        </Button>
        <Button 
          variant={filter === 'customer' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('customer')}
        >
          عملاء
        </Button>
        <Button 
          variant={filter === 'inventory' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('inventory')}
        >
          مخزون
        </Button>
        <Button 
          variant={filter === 'operations' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('operations')}
        >
          عمليات
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover-lift cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(recommendation.category)}
                      <div>
                        <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {getCategoryLabel(recommendation.category)}
                          </Badge>
                          <Badge 
                            size="sm" 
                            className={getPriorityColor(recommendation.priority)}
                          >
                            أولوية {recommendation.priority === 'high' ? 'عالية' : recommendation.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(recommendation.status)}
                            <span className="text-xs text-muted-foreground">
                              {getStatusLabel(recommendation.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">+{recommendation.roi}%</div>
                      <div className="text-xs text-muted-foreground">العائد المتوقع</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{recommendation.description}</p>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">التأثير المتوقع</div>
                      <Progress value={recommendation.impact} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{recommendation.impact}%</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">الجهد المطلوب</div>
                      <Progress value={recommendation.effort} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{recommendation.effort}%</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">الإطار الزمني</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{recommendation.timeframe}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {recommendation.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    تفاصيل التنفيذ: {recommendation.details.length} خطوات
                  </div>
                  <div className="flex items-center gap-2">
                    {recommendation.status === 'new' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleImplement(recommendation.id)}
                      >
                        بدء التنفيذ
                        <ArrowRight className="h-3 w-3 mr-1" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};