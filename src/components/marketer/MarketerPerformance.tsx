import React from 'react';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ar-EG');

interface MarketerPerformanceProps {
  conversionRate: number;
  averageOrder: number;
  userStatistics: Record<string, any>;
  userName?: string;
}

export const MarketerPerformance: React.FC<MarketerPerformanceProps> = ({
  conversionRate,
  averageOrder,
  userStatistics,
  userName,
}) => {
  const { isDarkMode } = useDarkMode();

  const performanceHighlights = React.useMemo(
    () => [
      {
        label: 'معدل التحويل',
        value: `${conversionRate.toFixed(1)}%`,
      },
      {
        label: 'متوسط الطلب',
        value: currencyFormatter.format(averageOrder),
      },
      {
        label: 'جلسات هذا الأسبوع',
        value: numberFormatter.format(userStatistics?.sessionsThisWeek ?? 2_430),
      },
    ],
    [averageOrder, conversionRate, userStatistics]
  );

  return (
    <div className="gradient-card-muted flex h-full flex-col justify-between rounded-[var(--radius-l)] p-[var(--spacing-lg)] backdrop-blur-xl transition-colors duration-500">
      <header className="mb-[var(--spacing-md)]">
        <h2 className="heading-ar text-xl font-extrabold tracking-tight transition-colors duration-500 text-foreground">
          أداءك هذا الأسبوع
        </h2>
        <p className="elegant-text text-sm transition-colors duration-500 text-muted-foreground">
          {userName?.split(' ')[0] ?? 'مرحبا'}, هذه لمحة سريعة عن حملاتك النشطة.
        </p>
      </header>
      <ul className="grid gap-[var(--spacing-md)] sm:grid-cols-3">
        {performanceHighlights.map((item) => (
          <li
            key={item.label}
            className="gradient-hover-primary rounded-[var(--radius-m)] border border-border bg-card p-[var(--spacing-md)] text-sm transition-all duration-500 hover:scale-105"
          >
            <p className="text-xs transition-colors duration-500 text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-lg font-semibold premium-text">{item.value}</p>
          </li>
        ))}
      </ul>
      <div className="mt-[var(--spacing-lg)] rounded-[var(--radius-m)] border border-dashed border-border/50 bg-muted/50 p-[var(--spacing-md)] text-xs transition-colors duration-500 text-muted-foreground">
        نصيحة: شارك رابطك بعد تحديث المحتوى – العملاء الذين يشاهدون قصة جديدة ينفقون 18٪ أكثر.
      </div>
    </div>
  );
};
