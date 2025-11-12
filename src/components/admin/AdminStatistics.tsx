import React, { useMemo } from 'react';
import { CreditCard, ShoppingBag, BarChart3 } from 'lucide-react';
import { KpiCard } from '@/components/home/KpiCard';
import type { KpiCardProps } from '@/components/home/KpiCard';

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

interface AdminStatisticsProps {
  metricById: Record<string, any>;
  userStatistics: Record<string, any>;
}

export const AdminStatistics: React.FC<AdminStatisticsProps> = ({
  metricById,
  userStatistics,
}) => {
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

  return (
    <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-4">
      {metrics.map((metric) => (
        <KpiCard key={metric.title} {...metric} />
      ))}
    </section>
  );
};
