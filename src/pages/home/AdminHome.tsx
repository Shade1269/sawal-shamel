import React, { Suspense, lazy } from 'react';
import { KpiCard } from '@/components/home/KpiCard';
import SystemAlertsWidget, { type SystemAlert } from '@/components/home/SystemAlertsWidget';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { Skeleton } from '@/ui/Skeleton';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useAdminHomeContent } from './hooks/useAdminHomeContent';
import type { RecentOrder } from '@/components/home/AdminRecentOrdersTable';

const MiniChart = lazy(() => import('@/components/home/MiniChart'));
const AdminRecentOrdersTable = lazy(() => import('@/components/home/AdminRecentOrdersTable'));

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

  const { metrics, chartData, chartLabels, recentOrders, alerts, userName } = useAdminHomeContent({
    analyticsMetrics,
    analyticsTrend,
    statistics: userStatistics,
    alertsOverride,
    ordersOverride,
    displayName: nameOverride ?? profile?.full_name ?? null,
  });

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
          أهلاً {userName} — تم تحديث البيانات آخر مرة عند
          الساعة 09:20 صباحاً.
        </span>
        <span>{reduceMotion ? 'الرسوم المتحركة معطّلة احتراماً لتفضيلاتك.' : 'الرسوم المتحركة مفعلة لإظهار التغيّرات.'}</span>
      </footer>
    </div>
  );
};

export default AdminHome;
