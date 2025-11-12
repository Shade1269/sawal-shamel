import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/ui/Skeleton';

const MiniChart = lazy(() => import('@/components/home/MiniChart'));

interface DailyRevenueChartProps {
  chartData: number[];
}

export function DailyRevenueChart({ chartData }: DailyRevenueChartProps) {
  return (
    <section>
      <Suspense
        fallback={
          <div
            className="rounded-[var(--radius-l)] border border-border bg-card/80 p-[var(--spacing-lg)] shadow-glass-soft"
            aria-busy="true"
          >
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
  );
}
