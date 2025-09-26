import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KpiDelta = {
  value: number;
  trend: 'up' | 'down';
  label?: string;
};

export interface KpiCardProps {
  title: string;
  value: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  delta?: KpiDelta | null;
  accent?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  footer?: React.ReactNode;
  className?: string;
  description?: string;
}

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
} as const;

export const KpiCard: React.FC<KpiCardProps> = React.memo(
  ({ title, value, icon: Icon, delta, accent = 'primary', footer, className, description }) => {
    const trendColor = delta?.trend === 'down' ? 'var(--danger)' : 'var(--success)';
    const accentColorMap: Record<NonNullable<KpiCardProps['accent']>, string> = {
      primary: 'var(--primary)',
      accent: 'var(--accent)',
      success: 'var(--success)',
      warning: 'var(--warning)',
      danger: 'var(--danger)',
    };

    const AccentIcon = delta ? trendIcon[delta.trend] : null;

    return (
      <article
        className={cn(
          'flex flex-col gap-[var(--spacing-md)] rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-lg)] shadow-[var(--shadow-glass-soft)] backdrop-blur-xl',
          'transition-all duration-200 hover:shadow-[var(--shadow-glass-strong)] focus-within:shadow-[var(--shadow-glass-strong)]',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-[color:var(--state-focus-ring)]',
          className
        )}
        style={{ color: 'var(--glass-fg)' }}
        role="group"
        data-component="kpi-card"
        aria-live="polite"
      >
        <header className="flex items-center justify-between gap-[var(--spacing-md)]">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted-foreground)]">{title}</p>
            {description ? (
              <p className="text-xs text-[color:var(--fg-muted, var(--muted-foreground))]">{description}</p>
            ) : null}
          </div>
          {Icon ? (
            <span
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))]"
              aria-hidden
            >
              <Icon className="h-5 w-5" style={{ color: accentColorMap[accent] }} />
            </span>
          ) : null}
        </header>

        <div className="flex flex-wrap items-end justify-between gap-[var(--spacing-md)]">
          <span className="text-3xl font-semibold leading-none" style={{ color: 'var(--glass-fg)' }}>
            {value}
          </span>
          {delta ? (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] px-3 py-1 text-sm font-medium"
              style={{ color: trendColor }}
            >
              {AccentIcon ? <AccentIcon className="h-4 w-4" aria-hidden /> : null}
              <span>{delta.value.toLocaleString('ar-EG', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
              {delta.label ? <span className="sr-only">{delta.label}</span> : null}
            </span>
          ) : null}
        </div>

        {footer ? <footer className="text-sm text-[color:var(--muted-foreground)]">{footer}</footer> : null}
      </article>
    );
  }
);

KpiCard.displayName = 'KpiCard';

export default KpiCard;
