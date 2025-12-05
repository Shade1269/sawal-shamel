import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Star,
  Heart,
  Eye,
  Users,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Clock,
  Calendar,
  Target,
  Award
} from 'lucide-react';

const widgetVariants = cva(
  "relative overflow-hidden transition-all duration-500 cursor-pointer group",
  {
    variants: {
      variant: {
        default: "bg-card border border-border hover:border-primary/30",
        glass: "glass-effect backdrop-blur-sm border border-border/30 hover:border-border/60",
        luxury: "luxury-effect text-luxury-foreground hover:shadow-luxury-glow",
        persian: "persian-effect text-persian-foreground hover:shadow-persian-glow",
        gradient: "bg-gradient-subtle border border-primary/30"
      },
      size: {
        sm: "p-4 h-32",
        md: "p-6 h-40",
        lg: "p-8 h-48",
        xl: "p-10 h-56"
      },
      animation: {
        none: "",
        hover: "hover:scale-105 hover:-translate-y-1",
        pulse: "animate-pulse-slow",
        bounce: "hover:animate-bounce-gentle",
        glow: "hover:animate-glow",
        persian: "hover:animate-persian-float"
      },
      interactive: {
        true: "hover:shadow-lg active:scale-95",
        false: ""
      }
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
      animation: "hover",
      interactive: true
    }
  }
);

export interface WidgetMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface InteractiveWidgetProps 
  extends VariantProps<typeof widgetVariants> {
  title: string;
  description?: string;
  metric?: WidgetMetric;
  progress?: {
    value: number;
    max: number;
    label?: string;
    color?: string;
  };
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  }>;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'ghost';
  }>;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const InteractiveWidget: React.FC<InteractiveWidgetProps> = ({
  title,
  description,
  metric,
  progress,
  badges,
  actions,
  variant,
  size,
  animation,
  interactive,
  loading = false,
  onClick,
  className,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clicks, setClicks] = useState(0);
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
      setClicks(prev => prev + 1);
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
      default: return Activity;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      case 'stable': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className={cn(widgetVariants({ variant, size }), className)}>
        <CardContent className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      ref={widgetRef}
      className={cn(
        widgetVariants({ variant, size, animation, interactive }),
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-hover" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {metric?.icon && (
                <metric.icon className={cn(
                  "h-5 w-5",
                  metric.color || "text-primary"
                )} />
              )}
              {title}
              {clicks > 0 && (
                <Badge variant="outline" className="text-xs">
                  {clicks}
                </Badge>
              )}
            </CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant={badge.variant || 'secondary'}
                  className="text-xs"
                  style={badge.color ? { backgroundColor: badge.color } : undefined}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        <div className="space-y-4">
          {/* Main Metric */}
          {metric && (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {typeof metric.value === 'number' 
                    ? metric.value.toLocaleString('ar')
                    : metric.value
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.label}
                </div>
              </div>

              {/* Trend Indicator */}
              {(metric.change !== undefined || metric.trend) && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  getTrendColor(metric.trend)
                )}>
                  {metric.trend && React.createElement(getTrendIcon(metric.trend), {
                    className: "h-4 w-4"
                  })}
                  {metric.change !== undefined && (
                    <span>{formatChange(metric.change)}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {progress.label || 'التقدم'}
                </span>
                <span className="font-medium">
                  {progress.value} / {progress.max}
                </span>
              </div>
              <Progress 
                value={(progress.value / progress.max) * 100}
                className="h-2"
              />
            </div>
          )}

          {/* Custom Content */}
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}

          {/* Action Buttons */}
          {actions && actions.length > 0 && (
            <div className="flex gap-2 pt-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className="text-xs"
                >
                  {action.icon && (
                    <action.icon className="h-3 w-3 mr-1" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Hover Effects */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 opacity-60">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      )}
    </Card>
  );
};

// Predefined Widget Types
const MetricWidget: React.FC<Omit<InteractiveWidgetProps, 'metric'> & {
  value: string | number;
  label: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ value, label, change, trend, icon, ...props }) => (
  <InteractiveWidget
    {...props}
    metric={{ value, label, change, trend, icon }}
  />
);

const ProgressWidget: React.FC<Omit<InteractiveWidgetProps, 'progress'> & {
  current: number;
  target: number;
  progressLabel?: string;
}> = ({ current, target, progressLabel, ...props }) => (
  <InteractiveWidget
    {...props}
    progress={{ value: current, max: target, label: progressLabel }}
  />
);

const ActivityWidget: React.FC<InteractiveWidgetProps & {
  activities?: Array<{
    label: string;
    value: string;
    time?: string;
  }>;
}> = ({ activities, children, ...props }) => (
  <InteractiveWidget {...props}>
    {activities && (
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{activity.label}</span>
            <div className="text-right">
              <div className="font-medium">{activity.value}</div>
              {activity.time && (
                <div className="text-muted-foreground">{activity.time}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
    {children}
  </InteractiveWidget>
);

export { 
  InteractiveWidget, 
  MetricWidget, 
  ProgressWidget, 
  ActivityWidget,
  widgetVariants 
};