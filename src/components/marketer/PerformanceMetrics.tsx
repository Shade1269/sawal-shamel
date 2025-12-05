import { KpiCard } from '@/components/home/KpiCard';
import type { KpiCardProps } from '@/components/home/KpiCard';
import { ShoppingCart, LineChart, Trophy } from 'lucide-react';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

interface PerformanceMetricsProps {
  metrics: KpiCardProps[];
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const { isDarkMode } = useDarkMode();

  return (
    <section className="grid gap-[var(--spacing-lg)] md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.title} className={`group rounded-[var(--radius-l)] p-[1px] transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gradient-luxury shadow-glass-soft'
            : 'bg-gradient-subtle shadow-lg'
        }`}>
          <div className={`rounded-[inherit] p-[var(--spacing-md)] transition-transform duration-200 group-hover:-translate-y-0.5 ${
            isDarkMode 
              ? 'bg-card/90'
              : 'bg-card/90'
          }`}>
            <KpiCard {...metric} />
          </div>
        </div>
      ))}
    </section>
  );
}
