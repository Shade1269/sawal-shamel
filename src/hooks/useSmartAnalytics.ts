import { useState, useEffect, useCallback } from 'react';

interface SmartMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  category: 'sales' | 'customers' | 'inventory' | 'performance';
  timestamp: Date;
}

interface SmartInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendedAction: string;
  metadata?: Record<string, any>;
}

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  predictions: Array<{
    date: string;
    value: number;
    confidence: number;
  }>;
}

interface UseSmartAnalyticsOptions {
  refreshInterval?: number;
  enableRealtime?: boolean;
  categories?: Array<'sales' | 'customers' | 'inventory' | 'performance'>;
}

interface UseSmartAnalyticsReturn {
  // Data
  metrics: SmartMetric[];
  insights: SmartInsight[];
  predictions: PredictionModel[];
  
  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshData: () => Promise<void>;
  generateInsights: () => Promise<void>;
  runPredictions: (timeframe: 'week' | 'month' | 'quarter') => Promise<void>;
  
  // Filters and utilities
  getMetricsByCategory: (category: string) => SmartMetric[];
  getInsightsByType: (type: string) => SmartInsight[];
  calculateTrend: (current: number, previous: number) => 'up' | 'down' | 'stable';
  formatMetricValue: (value: number, category: string) => string;
}

export const useSmartAnalytics = (
  options: UseSmartAnalyticsOptions = {}
): UseSmartAnalyticsReturn => {
  const {
    refreshInterval = 300000, // 5 minutes
    enableRealtime = false,
    categories = ['sales', 'customers', 'inventory', 'performance']
  } = options;

  // States
  const [metrics, setMetrics] = useState<SmartMetric[]>([]);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictionModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock data generation
  const generateMockMetrics = useCallback((): SmartMetric[] => {
    const baseMetrics = [
      {
        id: 'total_sales',
        name: 'إجمالي المبيعات',
        category: 'sales' as const,
        baseValue: 45000,
        variation: 0.15
      },
      {
        id: 'active_customers',
        name: 'العملاء النشطون',
        category: 'customers' as const,
        baseValue: 2847,
        variation: 0.08
      },
      {
        id: 'conversion_rate',
        name: 'معدل التحويل',
        category: 'performance' as const,
        baseValue: 3.2,
        variation: 0.12
      },
      {
        id: 'inventory_turnover',
        name: 'دوران المخزون',
        category: 'inventory' as const,
        baseValue: 6.5,
        variation: 0.10
      },
      {
        id: 'average_order_value',
        name: 'متوسط قيمة الطلب',
        category: 'sales' as const,
        baseValue: 180,
        variation: 0.20
      },
      {
        id: 'customer_lifetime_value',
        name: 'قيمة العميل مدى الحياة',
        category: 'customers' as const,
        baseValue: 950,
        variation: 0.25
      }
    ];

    return baseMetrics
      .filter(metric => categories.includes(metric.category))
      .map(metric => {
        const variation = (Math.random() - 0.5) * metric.variation;
        const currentValue = Math.round(metric.baseValue * (1 + variation));
        const previousValue = Math.round(metric.baseValue);
        const changePercent = Math.round(((currentValue - previousValue) / previousValue) * 100);
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(changePercent) > 2) {
          trend = changePercent > 0 ? 'up' : 'down';
        }

        return {
          id: metric.id,
          name: metric.name,
          value: currentValue,
          previousValue,
          trend,
          changePercent,
          category: metric.category,
          timestamp: new Date()
        };
      });
  }, [categories]);

  const generateMockInsights = useCallback((): SmartInsight[] => {
    const insightTemplates = [
      {
        type: 'opportunity' as const,
        title: 'فرصة تحسين معدل التحويل',
        description: 'اكتشفنا أن صفحات المنتجات ذات الصور عالية الجودة تحقق معدل تحويل أعلى بنسبة 35%',
        confidence: 87,
        impact: 'high' as const,
        recommendedAction: 'تحسين صور المنتجات وإضافة فيديوهات توضيحية'
      },
      {
        type: 'trend' as const,
        title: 'اتجاه صاعد في التسوق المحمول',
        description: 'ازداد التسوق عبر الهواتف المحمولة بنسبة 45% خلال الشهر الماضي',
        confidence: 92,
        impact: 'medium' as const,
        recommendedAction: 'تحسين تجربة التطبيق المحمول وتسريع أوقات التحميل'
      },
      {
        type: 'anomaly' as const,
        title: 'انخفاض غير متوقع في المبيعات',
        description: 'لاحظنا انخفاضاً بنسبة 18% في مبيعات فئة الإلكترونيات مقارنة بالأسبوع الماضي',
        confidence: 78,
        impact: 'high' as const,
        recommendedAction: 'فحص أسعار المنافسين ومراجعة استراتيجية التسويق'
      },
      {
        type: 'warning' as const,
        title: 'مخزون منخفض في منتجات شائعة',
        description: 'من المتوقع نفاد مخزون 5 منتجات شائعة خلال 3 أيام',
        confidence: 95,
        impact: 'high' as const,
        recommendedAction: 'طلب مخزون إضافي فوراً أو إيقاف الحملات التسويقية مؤقتاً'
      }
    ];

    return insightTemplates.map((template, index) => ({
      id: `insight_${index + 1}`,
      ...template
    }));
  }, []);

  const generateMockPredictions = useCallback((): PredictionModel[] => {
    const models = [
      {
        id: 'sales_prediction',
        name: 'توقعات المبيعات',
        accuracy: 85
      },
      {
        id: 'customer_growth',
        name: 'نمو قاعدة العملاء',
        accuracy: 78
      }
    ];

    return models.map(model => {
      const predictions = [];
      let baseValue = 45000 + Math.random() * 10000;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const trend = 1 + (Math.random() - 0.5) * 0.1;
        baseValue *= trend;
        
        predictions.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(baseValue),
          confidence: Math.max(60, model.accuracy - i * 2)
        });
      }

      return {
        ...model,
        predictions
      };
    });
  }, []);

  // Load data function
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock data
      const mockMetrics = generateMockMetrics();
      const mockInsights = generateMockInsights();
      const mockPredictions = generateMockPredictions();

      setMetrics(mockMetrics);
      setInsights(mockInsights);
      setPredictions(mockPredictions);
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [generateMockMetrics, generateMockInsights, generateMockPredictions]);

  // Initialize data
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Setup refresh interval
  useEffect(() => {
    if (!enableRealtime) return;

    const interval = setInterval(() => {
      loadData(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableRealtime, refreshInterval, loadData]);

  // Actions
  const refreshData = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const generateInsights = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate insight generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newInsights = generateMockInsights();
      setInsights(newInsights);
    } catch (err) {
      setError('فشل في توليد الرؤى الجديدة');
    } finally {
      setIsRefreshing(false);
    }
  }, [generateMockInsights]);

  const runPredictions = useCallback(async (timeframe: 'week' | 'month' | 'quarter') => {
    setIsRefreshing(true);
    try {
      // Simulate prediction calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newPredictions = generateMockPredictions();
      setPredictions(newPredictions);
    } catch (err) {
      setError('فشل في حساب التوقعات');
    } finally {
      setIsRefreshing(false);
    }
  }, [generateMockPredictions]);

  // Utility functions
  const getMetricsByCategory = useCallback((category: string) => {
    return metrics.filter(metric => metric.category === category);
  }, [metrics]);

  const getInsightsByType = useCallback((type: string) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  const calculateTrend = useCallback((current: number, previous: number): 'up' | 'down' | 'stable' => {
    const changePercent = Math.abs((current - previous) / previous) * 100;
    if (changePercent < 2) return 'stable';
    return current > previous ? 'up' : 'down';
  }, []);

  const formatMetricValue = useCallback((value: number, category: string): string => {
    switch (category) {
      case 'sales':
        return `${value.toLocaleString()} ريال`;
      case 'customers':
        return value.toLocaleString();
      case 'performance':
        return `${value.toFixed(1)}%`;
      case 'inventory':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  }, []);

  return {
    // Data
    metrics,
    insights,
    predictions,
    
    // States
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    
    // Actions
    refreshData,
    generateInsights,
    runPredictions,
    
    // Utilities
    getMetricsByCategory,
    getInsightsByType,
    calculateTrend,
    formatMetricValue
  };
};