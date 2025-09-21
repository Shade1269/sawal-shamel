import { useState, useEffect, useCallback, useMemo } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package } from 'lucide-react';
import { useFastAuth } from './useFastAuth';
import type { SmartWidgetData } from '@/components/dashboard/SmartWidget';
import type { SmartNotification } from '@/components/dashboard/SmartNotifications';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  conversionRate: number;
  averageOrderValue: number;
  previousPeriodStats?: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
  };
}

interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
  category?: string;
  target?: number;
  previous?: number;
}

interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'combo';
  data: ChartDataPoint[];
  colors?: string[];
  showTarget?: boolean;
  showPrevious?: boolean;
  dateRange?: string;
  unit?: string;
  growth?: number;
  status?: 'up' | 'down' | 'stable';
}

export function useDashboardData() {
  const { profile } = useFastAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');

  // Mock data generator - في التطبيق الحقيقي، سيتم جلب البيانات من Supabase
  const generateMockData = useCallback(() => {
    const baseRevenue = 125000;
    const baseOrders = 450;
    const baseCustomers = 1200;
    const baseProducts = 89;
    
    // Generate some variance based on user role and period
    const multiplier = period === 'today' ? 0.1 : 
                     period === 'week' ? 0.3 : 
                     period === 'month' ? 1 : 
                     period === 'quarter' ? 3 : 12;

    const roleMultiplier = profile?.role === 'admin' ? 5 : 
                          profile?.role === 'merchant' ? 2 : 1;

    return {
      totalRevenue: Math.floor(baseRevenue * multiplier * roleMultiplier),
      totalOrders: Math.floor(baseOrders * multiplier * roleMultiplier),
      totalCustomers: Math.floor(baseCustomers * roleMultiplier),
      totalProducts: Math.floor(baseProducts * roleMultiplier),
      conversionRate: 3.4 + Math.random() * 2,
      averageOrderValue: baseRevenue / baseOrders,
      previousPeriodStats: {
        totalRevenue: Math.floor((baseRevenue * multiplier * roleMultiplier) * 0.85),
        totalOrders: Math.floor((baseOrders * multiplier * roleMultiplier) * 0.9),
        totalCustomers: Math.floor((baseCustomers * roleMultiplier) * 0.95),
        conversionRate: 3.1 + Math.random() * 1.5
      }
    };
  }, [profile?.role, period]);

  // Generate smart widgets based on role and data
  const widgets = useMemo((): SmartWidgetData[] => {
    if (!stats) return [];

    const calculateChange = (current: number, previous: number) => {
      return Math.round(((current - previous) / previous) * 100);
    };

    const baseWidgets: SmartWidgetData[] = [
      {
        id: 'revenue',
        title: 'إجمالي المبيعات',
        value: stats.totalRevenue.toLocaleString('ar'),
        unit: 'ر.س',
        change: stats.previousPeriodStats ? 
               calculateChange(stats.totalRevenue, stats.previousPeriodStats.totalRevenue) : undefined,
        changeType: stats.previousPeriodStats && stats.totalRevenue > stats.previousPeriodStats.totalRevenue ? 'positive' : 'negative',
        description: `متوسط قيمة الطلب: ${Math.round(stats.averageOrderValue)} ر.س`,
        icon: DollarSign,
        color: 'bg-green-500',
        status: 'success',
        progress: 75,
        target: Math.round(stats.totalRevenue * 1.2),
        lastUpdated: new Date()
      },
      {
        id: 'orders',
        title: 'إجمالي الطلبات',
        value: stats.totalOrders.toLocaleString('ar'),
        unit: 'طلب',
        change: stats.previousPeriodStats ? 
               calculateChange(stats.totalOrders, stats.previousPeriodStats.totalOrders) : undefined,
        changeType: stats.previousPeriodStats && stats.totalOrders > stats.previousPeriodStats.totalOrders ? 'positive' : 'negative',
        description: 'عدد الطلبات المكتملة',
        icon: ShoppingCart,
        color: 'bg-blue-500',
        status: 'info',
        progress: 68,
        lastUpdated: new Date()
      },
      {
        id: 'customers',
        title: 'إجمالي العملاء',
        value: stats.totalCustomers.toLocaleString('ar'),
        unit: 'عميل',
        change: stats.previousPeriodStats ? 
               calculateChange(stats.totalCustomers, stats.previousPeriodStats.totalCustomers) : undefined,
        changeType: 'positive',
        description: 'العملاء النشطين',
        icon: Users,
        color: 'bg-purple-500',
        status: 'success',
        progress: 82,
        lastUpdated: new Date()
      },
      {
        id: 'conversion',
        title: 'معدل التحويل',
        value: stats.conversionRate.toFixed(1),
        unit: '%',
        change: stats.previousPeriodStats ? 
               Number((stats.conversionRate - stats.previousPeriodStats.conversionRate).toFixed(1)) : undefined,
        changeType: stats.previousPeriodStats && stats.conversionRate > stats.previousPeriodStats.conversionRate ? 'positive' : 'negative',
        description: 'نسبة تحويل الزوار لعملاء',
        icon: TrendingUp,
        color: 'bg-orange-500',
        status: 'warning',
        progress: Math.round(stats.conversionRate * 10),
        target: 5.0,
        lastUpdated: new Date()
      }
    ];

    // Add role-specific widgets
    if (profile?.role === 'admin') {
      baseWidgets.push({
        id: 'products',
        title: 'إجمالي المنتجات',
        value: stats.totalProducts.toLocaleString('ar'),
        unit: 'منتج',
        change: 5,
        changeType: 'positive',
        description: 'المنتجات النشطة في النظام',
        icon: Package,
        color: 'bg-indigo-500',
        status: 'info',
        lastUpdated: new Date()
      });
    }

    return baseWidgets;
  }, [stats, profile?.role]);

  // Generate chart configurations
  const charts = useMemo((): ChartConfig[] => {
    if (!stats) return [];

    // Generate sample time series data
    const generateTimeSeriesData = (baseValue: number, points: number = 7) => {
      const data: ChartDataPoint[] = [];
      const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      
      for (let i = 0; i < points; i++) {
        const variance = 0.8 + Math.random() * 0.4; // 80-120% variance
        data.push({
          name: days[i] || `يوم ${i + 1}`,
          value: Math.round(baseValue * variance),
          target: baseValue,
          previous: Math.round(baseValue * 0.9 * variance)
        });
      }
      return data;
    };

    return [
      {
        id: 'revenue_trend',
        title: 'اتجاه المبيعات',
        description: 'تطور المبيعات خلال الفترة الحالية',
        type: 'area',
        data: generateTimeSeriesData(stats.totalRevenue / 7),
        unit: 'ر.س',
        growth: stats.previousPeriodStats ? 
               Math.round(((stats.totalRevenue - stats.previousPeriodStats.totalRevenue) / stats.previousPeriodStats.totalRevenue) * 100) : 0,
        status: 'up',
        showTarget: true,
        dateRange: `${period === 'week' ? 'آخر 7 أيام' : 'آخر 30 يوم'}`
      },
      {
        id: 'orders_trend', 
        title: 'اتجاه الطلبات',
        description: 'عدد الطلبات اليومية',
        type: 'bar',
        data: generateTimeSeriesData(stats.totalOrders / 7),
        unit: 'طلب',
        growth: stats.previousPeriodStats ? 
               Math.round(((stats.totalOrders - stats.previousPeriodStats.totalOrders) / stats.previousPeriodStats.totalOrders) * 100) : 0,
        status: 'up',
        dateRange: `${period === 'week' ? 'آخر 7 أيام' : 'آخر 30 يوم'}`
      },
      {
        id: 'categories_breakdown',
        title: 'توزيع المبيعات حسب الفئة',
        description: 'أداء الفئات المختلفة',
        type: 'pie',
        data: [
          { name: 'الإلكترونيات', value: 35, category: 'electronics' },
          { name: 'الملابس', value: 25, category: 'fashion' },
          { name: 'المنزل والحديقة', value: 20, category: 'home' },
          { name: 'الكتب', value: 12, category: 'books' },
          { name: 'أخرى', value: 8, category: 'other' }
        ]
      },
      {
        id: 'performance_comparison',
        title: 'مقارنة الأداء',
        description: 'مقارنة الفترة الحالية مع السابقة',
        type: 'combo', 
        data: generateTimeSeriesData(stats.totalRevenue / 7),
        showPrevious: true,
        unit: 'ر.س',
        growth: 15,
        status: 'up'
      }
    ];
  }, [stats, period]);

  // Generate smart notifications
  const notifications = useMemo((): SmartNotification[] => {
    if (!stats) return [];

    const notifications: SmartNotification[] = [
      {
        id: '1',
        type: 'success',
        title: 'هدف المبيعات محقق!',
        message: 'تم تحقيق هدف المبيعات لهذا الشهر بنسبة 110%',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isRead: false,
        isImportant: true,
        category: 'sales',
        actionLabel: 'عرض التفاصيل',
        actionUrl: '/analytics/sales'
      },
      {
        id: '2',
        type: 'warning',
        title: 'انخفاض في معدل التحويل',
        message: 'معدل التحويل انخفض بنسبة 0.5% مقارنة بالأسبوع الماضي',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        isImportant: false,
        category: 'analytics',
        actionLabel: 'تحليل الأسباب',
        actionUrl: '/analytics/conversion'
      },
      {
        id: '3',
        type: 'info',
        title: 'عميل جديد مميز',
        message: 'انضم عميل جديد بقيمة طلبات تزيد عن 5000 ر.س',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        isImportant: false,
        category: 'users',
        actionLabel: 'عرض الملف',
        actionUrl: '/customers/premium'
      },
      {
        id: '4',
        type: 'achievement',
        title: 'إنجاز جديد مفتوح!',
        message: 'حققت مستوى "التاجر الذهبي" - تهانينا!',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false,
        isImportant: true,
        category: 'system',
        actionLabel: 'مشاهدة المكافآت',
        actionUrl: '/achievements'
      },
      {
        id: '5',
        type: 'update',
        title: 'تحديث النظام',
        message: 'تم إطلاق تحديثات جديدة لتحسين الأداء',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        isRead: true,
        isImportant: false,
        category: 'system',
        actionLabel: 'عرض التحديثات',
        actionUrl: '/updates'
      }
    ];

    return notifications;
  }, [stats]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats = generateMockData();
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  // Initialize data on mount and when period changes
  useEffect(() => {
    fetchData();
  }, [fetchData, period]);

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    stats,
    widgets,
    charts,
    notifications,
    period,
    setPeriod,
    refreshData
  };
}