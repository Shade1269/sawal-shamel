import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  isLoading?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-card border-border/50',
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  primary: {
    card: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
    icon: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
    value: 'text-primary',
  },
  success: {
    card: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
    icon: 'bg-success text-primary-foreground shadow-lg shadow-success/25',
    value: 'text-success',
  },
  warning: {
    card: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
    icon: 'bg-warning text-primary-foreground shadow-lg shadow-warning/25',
    value: 'text-warning',
  },
  info: {
    card: 'bg-gradient-to-br from-info/10 to-info/5 border-info/20',
    icon: 'bg-info text-primary-foreground shadow-lg shadow-info/25',
    value: 'text-info',
  },
};

export function EnhancedStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  isLoading = false,
  className,
}: EnhancedStatsCardProps) {
  const styles = variantStyles[variant];
  
  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  if (isLoading) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl p-5 border transition-all duration-300",
        styles.card,
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-5 border transition-all duration-300",
      "hover:shadow-lg hover:-translate-y-1",
      styles.card,
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl md:text-3xl font-bold", styles.value)}>
            {value}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            {trend && TrendIcon && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive 
                  ? "bg-success/10 text-success" 
                  : "bg-danger/10 text-danger"
              )}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 hover:scale-110",
          styles.icon
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
