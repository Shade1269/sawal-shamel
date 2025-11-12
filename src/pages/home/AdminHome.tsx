import React, { useMemo } from 'react';
import SystemAlertsWidget, { type SystemAlert } from '@/components/home/SystemAlertsWidget';
import type { RecentOrder } from '@/components/home/AdminRecentOrdersTable';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { AdminStatistics } from '@/components/admin/AdminStatistics';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { AdminRecentOrders } from '@/components/admin/AdminRecentOrders';

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

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
      <AdminStatistics metricById={metricById} userStatistics={userStatistics} />

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AdminCharts chartData={chartData} chartLabels={chartLabels} />
        <SystemAlertsWidget alerts={alerts} />
      </section>

      <AdminRecentOrders orders={recentOrders} />

      <footer className="flex flex-wrap items-center justify-between gap-[var(--spacing-md)] text-xs text-muted-foreground">
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
