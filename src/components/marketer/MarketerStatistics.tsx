import React, { Suspense, lazy } from 'react';
import { ShoppingCart, LineChart, Trophy } from 'lucide-react';
import { KpiCard } from '@/components/home/KpiCard';
import type { KpiCardProps } from '@/components/home/KpiCard';
import { Skeleton } from '@/ui/Skeleton';

const MiniChart = lazy(() => import('@/components/home/MiniChart'));

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ar-EG');

interface MarketerStatisticsProps {
  totalSales: number;
  monthlyCommission: number;
  leaderboardRank: number;
  leaderboardOutOf: number;
  userStatistics: Record<string, any>;
  chartData: number[];
}

export const MarketerStatistics: React.FC<MarketerStatisticsProps> = ({
  totalSales,
  monthlyCommission,
  leaderboardRank,
  leaderboardOutOf,
  userStatistics,
  chartData,
}) => {
  const metrics = React.useMemo((): KpiCardProps[] => [
    {
      title: 'مبيعات المتجر الإجمالية',
      value: currencyFormatter.format(totalSales),
      icon: ShoppingCart,
      delta: { value: userStatistics?.storeGrowth ?? 9.2, trend: 'up', label: 'خلال 7 أيام' },
      footer: 'يشمل جميع القنوات المرتبطة',
      accent: 'success',
    },
    {
      title: 'عمولات هذا الشهر',
      value: currencyFormatter.format(monthlyCommission),
      icon: LineChart,
      delta: { value: userStatistics?.commissionGrowth ?? 6.4, trend: 'up', label: 'مقارنة بالشهر الماضي' },
      footer: 'يتم تحديثها يومياً بعد التسويات',
      accent: 'accent',
    },
    {
      title: 'ترتيبك في لوحة الشرف',
      value: `#${leaderboardRank} من ${numberFormatter.format(leaderboardOutOf)}`,
      icon: Trophy,
      delta: { value: userStatistics?.leaderboardDelta ?? 1.0, trend: 'up', label: 'تحسن خلال الأسبوع' },
      footer: 'حافظ على معدل تحويل مرتفع للصعود',
      accent: 'warning',
    },
  ], [leaderboardOutOf, leaderboardRank, monthlyCommission, totalSales, userStatistics]);

  return (
    <>
      <section className="grid gap-[var(--spacing-lg)] md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.title} className="gradient-card-primary rounded-[var(--radius-l)] p-[1px] transition-all duration-500 group">
            <div className="rounded-[inherit] p-[var(--spacing-md)] transition-transform duration-200 group-hover:-translate-y-0.5 bg-card/90">
              <KpiCard {...metric} />
            </div>
          </div>
        ))}
      </section>

      <section>
        <Suspense
          fallback={
            <div className="gradient-card-muted rounded-[var(--radius-l)] p-[var(--spacing-lg)]" aria-busy="true">
              <p className="text-sm font-medium text-foreground">إيراداتك اليومية</p>
              <p className="text-xs text-muted-foreground">جاري تجهيز الرسم البياني...</p>
              <Skeleton className="mt-[var(--spacing-md)] h-32 w-full rounded-[var(--radius-m)] bg-muted" />
            </div>
          }
        >
          <MiniChart
            title="إيراداتك اليومية"
            data={chartData}
            labels={['س', 'أ', 'ث', 'ر', 'خ', 'ج', 'س']}
            trend={chartData[chartData.length - 1] >= chartData[0] ? 'up' : 'down'}
            accent="accent"
          />
        </Suspense>
      </section>
    </>
  );
};
