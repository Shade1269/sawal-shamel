import React, { Suspense, lazy, useMemo } from 'react';
import { CreditCard, ShoppingBag, BarChart3 } from 'lucide-react';
import { KpiCard } from '@/components/home/KpiCard';
import type { KpiCardProps } from '@/components/home/KpiCard';
import SystemAlertsWidget, { type SystemAlert } from '@/components/home/SystemAlertsWidget';
import type { RecentOrder } from '@/components/home/AdminRecentOrdersTable';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { Skeleton } from '@/ui/Skeleton';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';

const MiniChart = lazy(() => import('@/components/home/MiniChart'));
const AdminRecentOrdersTable = lazy(() => import('@/components/home/AdminRecentOrdersTable'));

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

export interface AdminHomeProps {
  statisticsOverride?: Record<string, unknown> | null;
  alertsOverride?: SystemAlert[] | null;
  ordersOverride?: RecentOrder[] | null;
  nameOverride?: string | null;
}

const AdminHome: React.FC<AdminHomeProps> = ({ statisticsOverride, alertsOverride, ordersOverride, nameOverride }) => {
  const { profile } = useFastAuth();
  let contextStatistics: Record<string, unknown> | null = null;
  try {
    const context = useUserDataContext();
    contextStatistics = (context?.userStatistics as Record<string, unknown> | null) ?? null;
  } catch (error) {
    contextStatistics = null;
  }
  const reduceMotion = usePrefersReducedMotion();
  const userStatistics = (statisticsOverride ?? contextStatistics ?? {}) as Record<string, any>;
  const { metrics: analyticsMetrics, trend: analyticsTrend } = useAdminAnalytics();

  const metricById = useMemo(() => {
    return analyticsMetrics.reduce<Record<string, typeof analyticsMetrics[number]>>((acc, metric) => {
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
      revenueToday: typeof userStatistics?.revenueToday === 'number' ? userStatistics.revenueToday : 45200,
      revenueWeek: typeof userStatistics?.revenueWeek === 'number' ? userStatistics.revenueWeek : 318000,
      revenueMonth: typeof userStatistics?.revenueMonth === 'number' ? userStatistics.revenueMonth : 1689000,
      pendingPayments: typeof userStatistics?.pendingPayments === 'number' ? userStatistics.pendingPayments : 9,
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
  }, [metricById, userStatistics]);

  const chartData = useMemo(() => {
    if (analyticsTrend.length > 0) {
      return analyticsTrend.map((point) => point.orders);
    }
    if (Array.isArray(userStatistics?.dailyRevenue)) {
      return userStatistics.dailyRevenue as number[];
    }
    return [62_000, 58_000, 71_200, 69_800, 75_400, 82_100, 88_600];
  }, [analyticsTrend, userStatistics]);

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
    if (Array.isArray(userStatistics?.recentOrders)) {
      return userStatistics.recentOrders as RecentOrder[];
    }
    return getFallbackOrders();
  }, [ordersOverride, userStatistics]);

  const alerts = useMemo<SystemAlert[]>(() => {
    if (Array.isArray(alertsOverride)) {
      return alertsOverride as SystemAlert[];
    }
    if (Array.isArray(userStatistics?.systemAlerts)) {
      return userStatistics.systemAlerts as SystemAlert[];
    }
    return getFallbackAlerts();
  }, [alertsOverride, userStatistics]);

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Suspense
          fallback={
            <div
              className="flex h-full flex-col justify-between rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-[var(--spacing-lg)] shadow-[var(--shadow-glass-soft)]"
              aria-busy="true"
              aria-live="polite"
            >
              <div className="space-y-[var(--spacing-sm)] text-[color:var(--muted-foreground)]">
                <p className="text-sm font-medium text-[color:var(--glass-fg)]">المبيعات اليومية</p>
                <p className="text-xs">جاري توليد الرسم البياني...</p>
              </div>
              <Skeleton className="mt-[var(--spacing-lg)] h-32 w-full rounded-[var(--radius-m)] bg-[color:var(--glass-bg-strong, var(--surface-2))]" />
            </div>
          }
        >
          <MiniChart
            title="المبيعات اليومية"
            data={chartData}
            labels={chartLabels}
            trend={chartData[chartData.length - 1] >= chartData[0] ? 'up' : 'down'}
            accent={chartData[chartData.length - 1] >= chartData[0] ? 'success' : 'warning'}
          />
        </Suspense>

        <SystemAlertsWidget alerts={alerts} />
      </section>

      <section>
        <Suspense
          fallback={
            <div
              className="rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-[var(--spacing-lg)] shadow-[var(--shadow-glass-soft)]"
              aria-busy="true"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--glass-fg)]">آخر 5 طلبات</p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">جاري تحميل أحدث البيانات...</p>
                </div>
                <Skeleton className="h-6 w-16 rounded-full bg-[color:var(--glass-bg-strong, var(--surface-2))]" />
              </div>
              <div className="mt-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={`order-skeleton-${index}`}
                    className="h-10 w-full rounded-[var(--radius-m)] bg-[color:var(--glass-bg-strong, var(--surface-2))]"
                  />
                ))}
              </div>
            </div>
          }
        >
          <AdminRecentOrdersTable orders={recentOrders} />
        </Suspense>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-[var(--spacing-md)] text-xs text-[color:var(--muted-foreground)]">
        <span>
          أهلاً {(nameOverride ?? profile?.full_name)?.split(' ')[0] ?? 'بك'} — تم تحديث البيانات آخر مرة عند
          الساعة 09:20 صباحاً.
        </span>
        <span>{reduceMotion ? 'الرسوم المتحركة معطّلة احتراماً لتفضيلاتك.' : 'الرسوم المتحركة مفعلة لإظهار التغيّرات.'}</span>
      </footer>
    </div>
  );
};

export default AdminHome;
