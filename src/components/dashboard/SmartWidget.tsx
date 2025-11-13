import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface SmartWidgetData {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  unit?: string;
  description?: string;
  icon: any;
  color: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  progress?: number;
  target?: number;
  trend?: number[];
  lastUpdated?: Date;
  isLoading?: boolean;
  onClick?: () => void;
}

interface SmartWidgetProps {
  data: SmartWidgetData;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  showTrend?: boolean;
  animated?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export function SmartWidget({ 
  data, 
  variant = 'default',
  showProgress = false,
  showTrend = false,
  animated = true,
  refreshable = false,
  onRefresh 
}: SmartWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const IconComponent = data.icon;

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const getTrendIcon = () => {
    if (!data.change) return <Minus className="h-3 w-3" />;
    if (data.changeType === 'positive') return <TrendingUp className="h-3 w-3" />;
    if (data.changeType === 'negative') return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'success': return <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />;
      case 'info': return <Clock className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'p-3 md:p-4';
      case 'detailed':
        return 'p-4 md:p-6';
      default:
        return 'p-4 md:p-5';
    }
  };

  const MotionCard = animated ? motion(Card) : Card;

  return (
    <MotionCard 
      className={cn(
        "relative overflow-hidden hover:shadow-lg transition-all duration-300",
        data.onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        data.isLoading && "opacity-60"
      )}
      onClick={data.onClick}
      {...(animated && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        whileHover: { y: -2 },
        transition: { duration: 0.3 }
      })}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-5 gradient-bg-card",
        data.color
      )} />
      
      <CardContent className={getVariantStyles()}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 md:p-2 rounded-lg", data.color.replace('bg-', 'bg-') + "/10")}>
                <IconComponent className={cn("h-3 w-3 md:h-4 md:w-4", data.color.replace('bg-', 'text-'))} />
              </div>
              {data.status && getStatusIcon()}
              {refreshable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto touch-target"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefresh();
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                </Button>
              )}
            </div>

            <div className="space-y-1 md:space-y-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                {data.title}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <p className="text-lg md:text-2xl font-bold leading-tight">
                  {data.isLoading ? "..." : data.value}
                  {data.unit && <span className="text-xs md:text-sm font-normal mr-1">{data.unit}</span>}
                </p>
                
                {data.change !== undefined && (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={
                        data.changeType === 'positive' ? 'default' : 
                        data.changeType === 'negative' ? 'destructive' : 
                        'secondary'
                      }
                      className="text-xs px-1 py-0"
                    >
                      {getTrendIcon()}
                      {Math.abs(data.change)}%
                    </Badge>
                  </div>
                )}
              </div>

              {variant === 'detailed' && data.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {data.description}
                </p>
              )}

              {showProgress && data.progress !== undefined && (
                <div className="mt-2 md:mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>التقدم</span>
                    <span>{data.progress}%</span>
                  </div>
                  <Progress value={data.progress} className="h-1 md:h-1" />
                  {data.target && (
                    <p className="text-xs text-muted-foreground">
                      الهدف: {data.target} {data.unit}
                    </p>
                  )}
                </div>
              )}

              {showTrend && data.trend && data.trend.length > 0 && (
                <div className="mt-2 md:mt-3">
                  <div className="flex items-center gap-0.5 h-6 md:h-8">
                    {data.trend.map((value, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex-1 rounded-sm opacity-60",
                          data.color
                        )}
                        style={{ 
                          height: `${Math.max(2, (value / Math.max(...data.trend!)) * 100)}%` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {data.lastUpdated && variant === 'detailed' && (
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    آخر تحديث: {data.lastUpdated.toLocaleTimeString('ar')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {data.onClick && (
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground opacity-60 flex-shrink-0" />
          )}
        </div>

        {data.isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-xs md:text-sm">جاري التحديث...</span>
            </div>
          </div>
        )}
      </CardContent>
    </MotionCard>
  );
}