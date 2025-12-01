import { useMemo } from 'react';
import { BarChart3, CreditCard, ShoppingBag } from 'lucide-react';
import type { KpiCardProps } from '@/components/home/KpiCard';
import type { SystemAlert } from '@/components/home/SystemAlertsWidget';
import type { RecentOrder } from '@/components/home/AdminRecentOrdersTable';
import type { AnalyticsMetric, AnalyticsTrendPoint } from '@/hooks/useAdminAnalytics';

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ar-EG');

const formatMetric = (value: number, unit: 'currency' | 'count') => {
  if (unit === 'currency') {
    return currencyFormatter.format(value);
  }
  return numberFormatter.format(value);
};

const getFallbackOrders = (): RecentOrder[] => [
  { id: '98231', customer: 'عمر السالمي', total: currencyFormatter.format(1840), status: 'pending', createdAt: 'منذ 12 دقيقة' },
  { id: '98224', customer: 'ليان الحربي', total: currencyFormatter.format(920), status: 'processing', createdAt: 'منذ 25 دقيقة' },
  { id: '98218', customer: 'جمانة الشهري', total: currencyFormatter.format(2640), status: 'paid', createdAt: 'منذ ساعة' },
  { id: '98192', customer: 'أيمن العمري', total: currencyFormatter.format(780), status: 'failed', createdAt: 'منذ ساعتين' },
  { id: '98174', customer: 'هنادي التركي', total: currencyFormatter.format(1120), status: 'paid', createdAt: 'منذ 3 ساعات' },
];

const getFallbackAlerts = (): SystemAlert[] => [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'مخزون محدود لمنتج مميز',
    description: 'تبقى 8 قطع فقط من عباءة السندس – يُفضل إعادة الطلب اليوم.',
    timestamp: 'قبل 8 دقائق',
  },
  {
    id: 'alert-2',
    type: 'error',
    title: 'فشل مزامنة بوابة الدفع',
    description: 'محاولة Stripe الأخيرة لم تكتمل – تم إيقاف التحويلات مؤقتاً.',
    timestamp: 'قبل 26 دقيقة',
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'مسودة تقرير شهرية جاهزة',
    description: 'تم إنشاء تقرير الأداء لشهر مارس، يمكنك مراجعته قبل المشاركة.',
    timestamp: 'قبل ساعة',
  },
];

export interface UseAdminHomeContentOptions {
  analyticsMetrics: AnalyticsMetric[];
  analyticsTrend: AnalyticsTrendPoint[];
  statistics: Record<string, any>;
  alertsOverride?: SystemAlert[] | null;
  ordersOverride?: RecentOrder[] | null;
  displayName?: string | null;
}

export const useAdminHomeContent = ({
  analyticsMetrics,
  analyticsTrend,
  statistics,
  alertsOverride,
  ordersOverride,
  displayName,
}: UseAdminHomeContentOptions) => {
  const metricById = useMemo(() => {
    return analyticsMetrics.reduce<Record<string, (typeof analyticsMetrics)[number]>>((acc, metric) => {
      acc[metric.id] = metric;
      return acc;
    }, {});
  }, [analyticsMetrics]);

  const metrics = useMemo((): KpiCardProps[] => {
    const dayMetric = metricById['sales-day'];
    const weekMetric = metricById['sales-week'];
    const monthMetric = metricById['sales-month'];
    const pendingMetric = metricById['orders-count'];

    const fallbackMetrics = {
      revenueToday: typeof statistics?.revenueToday === 'number' ? statistics.revenueToday : 45200,
      revenueWeek: typeof statistics?.revenueWeek === 'number' ? statistics.revenueWeek : 318000,
      revenueMonth: typeof statistics?.revenueMonth === 'number' ? statistics.revenueMonth : 1689000,
      pendingPayments: typeof statistics?.pendingPayments === 'number' ? statistics.pendingPayments : 9,
    };

    return [
      {
        title: 'مبيعات اليوم',
        value: formatMetric(dayMetric?.value ?? fallbackMetrics.revenueToday, dayMetric?.unit ?? 'currency'),
        icon: CreditCard,
        delta:
          dayMetric?.changeDirection
            ? { value: Math.abs(dayMetric.change), trend: dayMetric.changeDirection === 'down' ? 'down' : 'up', label: 'مقارنة بالأمس' }
            : { value: 8.4, trend: 'up', label: 'مقارنة بالأمس' },
        footer: 'أعلى قناة مبيعاً: المتجر العام',
        accent: 'accent',
      },
      {
        title: 'آخر 7 أيام',
        value: formatMetric(weekMetric?.value ?? fallbackMetrics.revenueWeek, weekMetric?.unit ?? 'currency'),
        icon: BarChart3,
        delta:
          weekMetric?.changeDirection
            ? { value: Math.abs(weekMetric.change), trend: weekMetric.changeDirection === 'down' ? 'down' : 'up', label: 'مقارنة بالأسبوع الماضي' }
            : { value: 11.2, trend: 'up', label: 'مقارنة بالأسبوع الماضي' },
        footer: 'يشمل المتجر العام وقنوات المسوّقات',
        accent: 'primary',
      },
      {
        title: 'آخر 30 يوم',
        value: formatMetric(monthMetric?.value ?? fallbackMetrics.revenueMonth, monthMetric?.unit ?? 'currency'),
        icon: ShoppingBag,
        delta:
          monthMetric?.changeDirection
            ? { value: Math.abs(monthMetric.change), trend: monthMetric.changeDirection === 'down' ? 'down' : 'up', label: 'مقارنة بالشهر السابق' }
            : { value: 6.8, trend: 'up', label: 'مقارنة بالشهر السابق' },
        footer: 'الميزانية الشهرية المتوقعة',
        accent: 'success',
      },
      {
        title: 'طلبات بانتظار الدفع',
        value: formatMetric(pendingMetric?.value ?? fallbackMetrics.pendingPayments, pendingMetric?.unit ?? 'count'),
        icon: ShoppingBag,
        delta:
          pendingMetric?.changeDirection
            ? { value: Math.abs(pendingMetric.change), trend: pendingMetric.changeDirection === 'down' ? 'down' : 'up', label: 'مقارنة باليوم السابق' }
            : { value: 4.6, trend: 'down', label: 'مقارنة باليوم السابق' },
        footer: 'تحتاج متابعة فريق التحصيل',
        accent: 'warning',
      },
    ];
  }, [metricById, statistics]);

  const chartData = useMemo(() => {
    if (analyticsTrend.length > 0) {
      return analyticsTrend.map((point) => point.orders);
    }
    if (Array.isArray(statistics?.dailyRevenue)) {
      return statistics.dailyRevenue as number[];
    }
    return [62_000, 58_000, 71_200, 69_800, 75_400, 82_100, 88_600];
  }, [analyticsTrend, statistics]);

  const chartLabels = useMemo(() => {
    if (analyticsTrend.length > 0) {
      return analyticsTrend.map((point) => new Intl.DateTimeFormat('ar-SA', { weekday: 'short' }).format(new Date(point.date)));
    }
    return ['س', 'أ', 'ث', 'ر', 'خ', 'ج', 'س'];
  }, [analyticsTrend]);

  const recentOrders = useMemo<RecentOrder[]>(() => {
    if (Array.isArray(ordersOverride)) {
      return ordersOverride as RecentOrder[];
    }
    if (Array.isArray(statistics?.recentOrders)) {
      return statistics.recentOrders as RecentOrder[];
    }
    return getFallbackOrders();
  }, [ordersOverride, statistics]);

  const alerts = useMemo<SystemAlert[]>(() => {
    if (Array.isArray(alertsOverride)) {
      return alertsOverride as SystemAlert[];
    }
    if (Array.isArray(statistics?.systemAlerts)) {
      return statistics.systemAlerts as SystemAlert[];
    }
    return getFallbackAlerts();
  }, [alertsOverride, statistics]);

  const userName = useMemo(() => (displayName?.split(' ')[0] ?? 'بك'), [displayName]);

  return {
    metrics,
    chartData,
    chartLabels,
    recentOrders,
    alerts,
    userName,
  } as const;
};
