import { LucideIcon } from 'lucide-react';
import { UnifiedCard, UnifiedCardContent } from '@/components/design-system';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  isLoading = false,
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/10 border-primary/20',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    danger: 'bg-destructive/10 border-destructive/20',
  };

  const iconStyles = {
    default: 'text-muted-foreground bg-muted',
    primary: 'text-primary bg-primary/20',
    success: 'text-success bg-success/20',
    warning: 'text-warning bg-warning/20',
    danger: 'text-destructive bg-destructive/20',
  };

  if (isLoading) {
    return (
      <UnifiedCard variant="glass" className={cn("relative overflow-hidden", variantStyles[variant])}>
        <UnifiedCardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-12 w-12 bg-muted animate-pulse rounded-xl" />
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    );
  }

  return (
    <UnifiedCard 
      variant="glass" 
      hover="lift"
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variantStyles[variant]
      )}
    >
      <UnifiedCardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">
                {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
              </h3>
              {trend && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                    trend.isPositive 
                      ? "text-success bg-success/10" 
                      : trend.value === 0 
                        ? "text-muted-foreground bg-muted" 
                        : "text-destructive bg-destructive/10"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 ml-0.5" />
                  ) : trend.value === 0 ? (
                    <Minus className="h-3 w-3 ml-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 ml-0.5" />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          <div className={cn(
            "p-3 rounded-xl",
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </UnifiedCardContent>
      
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
    </UnifiedCard>
  );
}
