import { useState, useEffect, useCallback } from 'react';

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
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationFilters {
  category?: string;
  priority?: string;
  status?: string;
  minImpact?: number;
  maxEffort?: number;
}

interface RecommendationStats {
  total: number;
  new: number;
  in_progress: number;
  completed: number;
  dismissed: number;
  avg_impact: number;
  avg_roi: number;
  total_potential_roi: number;
}

interface UseSmartRecommendationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
}

interface UseSmartRecommendationsReturn {
  // Data
  recommendations: Recommendation[];
  filteredRecommendations: Recommendation[];
  stats: RecommendationStats | null;
  
  // States
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Filters
  filters: RecommendationFilters;
  setFilters: (filters: RecommendationFilters) => void;
  clearFilters: () => void;
  
  // Actions
  refreshRecommendations: () => Promise<void>;
  generateNewRecommendations: () => Promise<void>;
  updateRecommendationStatus: (id: string, status: Recommendation['status']) => Promise<void>;
  dismissRecommendation: (id: string) => Promise<void>;
  implementRecommendation: (id: string) => Promise<void>;
  
  // Analytics
  getRecommendationsByCategory: (category: string) => Recommendation[];
  getHighPriorityRecommendations: () => Recommendation[];
  getQuickWins: () => Recommendation[]; // High impact, low effort
  calculatePotentialROI: () => number;
}

export const useSmartRecommendations = (
  options: UseSmartRecommendationsOptions = {}
): UseSmartRecommendationsReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 600000, // 10 minutes
    enableNotifications = true
  } = options;

  // States
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({});

  // Mock data generator
  const generateMockRecommendations = useCallback((): Recommendation[] => {
    const mockData = [
      {
        title: 'تحسين صفحات المنتجات للموبايل',
        description: 'تحسين تجربة التسوق عبر الهاتف المحمول يمكن أن يزيد التحويلات بنسبة 35%',
        category: 'marketing' as const,
        priority: 'high' as const,
        impact: 85,
        effort: 40,
        roi: 240,
        timeframe: '2-3 أسابيع',
        tags: ['موبايل', 'تحويل', 'UX'],
        details: [
          'تحسين سرعة تحميل الصفحات',
          'تبسيط عملية الشراء',
          'تحسين عرض الصور',
          'إضافة خيارات دفع سريعة'
        ],
        confidence: 92
      },
      {
        title: 'تطبيق استراتيجية التسعير الديناميكي',
        description: 'استخدام الذكاء الاصطناعي لتحديد أسعار تنافسية مع زيادة الأرباح',
        category: 'pricing' as const,
        priority: 'high' as const,
        impact: 78,
        effort: 65,
        roi: 180,
        timeframe: '4-6 أسابيع',
        tags: ['تسعير', 'AI', 'ربحية'],
        details: [
          'تحليل أسعار المنافسين',
          'تحديد نقاط السعر المثلى',
          'تطبيق تجارب A/B',
          'مراقبة تأثير التغييرات'
        ],
        confidence: 87
      },
      {
        title: 'برنامج ولاء العملاء المتقدم',
        description: 'إطلاق برنامج ولاء ذكي يزيد من احتفاظ العملاء ويرفع قيمة الطلب',
        category: 'customer' as const,
        priority: 'medium' as const,
        impact: 72,
        effort: 55,
        roi: 160,
        timeframe: '6-8 أسابيع',
        tags: ['ولاء', 'احتفاظ', 'قيمة'],
        details: [
          'نظام نقاط متدرج',
          'عروض مخصصة',
          'تجربة VIP للعملاء المميزين',
          'تكامل مع وسائل التواصل'
        ],
        confidence: 81
      },
      {
        title: 'تحسين إدارة المخزون بالذكاء الاصطناعي',
        description: 'تقليل تكاليف المخزون بنسبة 25% مع تجنب نفاد المخزون',
        category: 'inventory' as const,
        priority: 'medium' as const,
        impact: 68,
        effort: 70,
        roi: 140,
        timeframe: '8-10 أسابيع',
        tags: ['مخزون', 'AI', 'تكلفة'],
        details: [
          'تنبؤ بالطلب باستخدام AI',
          'تحسين مستويات الطلب',
          'تتبع دوران المخزون',
          'تحليل الموسمية'
        ],
        confidence: 76
      },
      {
        title: 'تحسين خدمة العملاء بالشات بوت',
        description: 'تقليل وقت الاستجابة وتحسين رضا العملاء',
        category: 'operations' as const,
        priority: 'low' as const,
        impact: 55,
        effort: 35,
        roi: 120,
        timeframe: '3-4 أسابيع',
        tags: ['خدمة عملاء', 'أتمتة', 'رضا'],
        details: [
          'إجابة فورية على الاستفسارات',
          'توجيه الطلبات المعقدة',
          'تتبع حالة الطلبات',
          'جمع تقييمات العملاء'
        ],
        confidence: 89
      },
      {
        title: 'تحسين حملات البريد الإلكتروني',
        description: 'زيادة معدل الفتح والنقر في حملات البريد الإلكتروني',
        category: 'marketing' as const,
        priority: 'low' as const,
        impact: 45,
        effort: 25,
        roi: 95,
        timeframe: '1-2 أسابيع',
        tags: ['إيميل', 'تسويق', 'أتمتة'],
        details: [
          'تخصيص المحتوى حسب السلوك',
          'تحسين أوقات الإرسال',
          'اختبار عناوين مختلفة',
          'تقسيم قوائم المراسلة'
        ],
        confidence: 94
      }
    ];

    const statusOptions: Recommendation['status'][] = ['new', 'in_progress', 'completed', 'dismissed'];
    
    return mockData.map((item, index) => ({
      id: `rec_${index + 1}`,
      ...item,
      status: index < 2 ? 'new' : statusOptions[Math.floor(Math.random() * statusOptions.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
  }, []);

  // Calculate stats
  const calculateStats = useCallback((recs: Recommendation[]): RecommendationStats => {
    const total = recs.length;
    const new_count = recs.filter(r => r.status === 'new').length;
    const in_progress = recs.filter(r => r.status === 'in_progress').length;
    const completed = recs.filter(r => r.status === 'completed').length;
    const dismissed = recs.filter(r => r.status === 'dismissed').length;
    
    const avg_impact = recs.reduce((sum, r) => sum + r.impact, 0) / total;
    const avg_roi = recs.reduce((sum, r) => sum + r.roi, 0) / total;
    
    // Calculate potential ROI for new and in-progress recommendations
    const activeRecs = recs.filter(r => ['new', 'in_progress'].includes(r.status));
    const total_potential_roi = activeRecs.reduce((sum, r) => sum + r.roi, 0);

    return {
      total,
      new: new_count,
      in_progress,
      completed,
      dismissed,
      avg_impact: Math.round(avg_impact),
      avg_roi: Math.round(avg_roi),
      total_potential_roi: Math.round(total_potential_roi)
    };
  }, []);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.category && rec.category !== filters.category) return false;
    if (filters.priority && rec.priority !== filters.priority) return false;
    if (filters.status && rec.status !== filters.status) return false;
    if (filters.minImpact && rec.impact < filters.minImpact) return false;
    if (filters.maxEffort && rec.effort > filters.maxEffort) return false;
    return true;
  });

  // Load recommendations
  const loadRecommendations = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsUpdating(true);
      }
      
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockRecommendations = generateMockRecommendations();
      const calculatedStats = calculateStats(mockRecommendations);

      setRecommendations(mockRecommendations);
      setStats(calculatedStats);
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل التوصيات');
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  }, [generateMockRecommendations, calculateStats]);

  // Initialize
  useEffect(() => {
    loadRecommendations(true);
  }, [loadRecommendations]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRecommendations(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadRecommendations]);

  // Actions
  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations(false);
  }, [loadRecommendations]);

  const generateNewRecommendations = useCallback(async () => {
    setIsUpdating(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newRecommendations = generateMockRecommendations();
      setRecommendations(newRecommendations);
      setStats(calculateStats(newRecommendations));
      
      if (enableNotifications) {
        console.log('تم توليد توصيات جديدة!');
      }
    } catch (err) {
      setError('فشل في توليد توصيات جديدة');
    } finally {
      setIsUpdating(false);
    }
  }, [generateMockRecommendations, calculateStats, enableNotifications]);

  const updateRecommendationStatus = useCallback(async (id: string, status: Recommendation['status']) => {
    try {
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, status, updatedAt: new Date() }
            : rec
        )
      );

      // Update stats
      const updatedRecs = recommendations.map(rec => 
        rec.id === id ? { ...rec, status } : rec
      );
      setStats(calculateStats(updatedRecs));

    } catch (err) {
      setError('فشل في تحديث حالة التوصية');
    }
  }, [recommendations, calculateStats]);

  const dismissRecommendation = useCallback(async (id: string) => {
    await updateRecommendationStatus(id, 'dismissed');
  }, [updateRecommendationStatus]);

  const implementRecommendation = useCallback(async (id: string) => {
    await updateRecommendationStatus(id, 'in_progress');
  }, [updateRecommendationStatus]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Analytics functions
  const getRecommendationsByCategory = useCallback((category: string) => {
    return recommendations.filter(rec => rec.category === category);
  }, [recommendations]);

  const getHighPriorityRecommendations = useCallback(() => {
    return recommendations.filter(rec => rec.priority === 'high' && rec.status !== 'dismissed');
  }, [recommendations]);

  const getQuickWins = useCallback(() => {
    return recommendations.filter(rec => 
      rec.impact >= 60 && 
      rec.effort <= 40 && 
      rec.status !== 'dismissed'
    ).sort((a, b) => (b.impact - b.effort) - (a.impact - a.effort));
  }, [recommendations]);

  const calculatePotentialROI = useCallback(() => {
    const activeRecs = recommendations.filter(rec => ['new', 'in_progress'].includes(rec.status));
    return activeRecs.reduce((sum, rec) => sum + rec.roi, 0);
  }, [recommendations]);

  return {
    // Data
    recommendations,
    filteredRecommendations,
    stats,
    
    // States
    isLoading,
    isUpdating,
    error,
    lastUpdated,
    
    // Filters
    filters,
    setFilters,
    clearFilters,
    
    // Actions
    refreshRecommendations,
    generateNewRecommendations,
    updateRecommendationStatus,
    dismissRecommendation,
    implementRecommendation,
    
    // Analytics
    getRecommendationsByCategory,
    getHighPriorityRecommendations,
    getQuickWins,
    calculatePotentialROI
  };
};