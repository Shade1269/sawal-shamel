import React, { Suspense, lazy, useMemo } from 'react';
import { Skeleton } from '@/ui/Skeleton';

const MiniChart = lazy(() => import('@/components/home/MiniChart'));

interface AdminChartsProps {
  chartData: number[];
  chartLabels: string[];
}

export const AdminCharts: React.FC<AdminChartsProps> = ({
  chartData,
  chartLabels,
}) => {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-full flex-col justify-between rounded-[var(--radius-l)] border border-border bg-card/80 p-[var(--spacing-lg)] shadow-soft"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="space-y-[var(--spacing-sm)] text-muted-foreground">
            <p className="text-sm font-medium text-foreground">المبيعات اليومية</p>
            <p className="text-xs">جاري توليد الرسم البياني...</p>
          </div>
          <Skeleton className="mt-[var(--spacing-lg)] h-32 w-full rounded-[var(--radius-m)] bg-muted" />
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
  );
};
