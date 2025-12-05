import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  Zap,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: any;
  description?: string;
  progress?: number;
  target?: number;
  trend?: number[];
  color?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color?: string;
}

export interface InteractiveDashboardProps {
  title?: string;
  subtitle?: string;
  widgets: DashboardWidget[];
  quickActions?: QuickAction[];
  className?: string;
}

const defaultColors = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  purple: "bg-premium"
};

export function InteractiveDashboard({
  title = "لوحة التحكم التفاعلية",
  subtitle,
  widgets,
  quickActions = [],
  className
}: InteractiveDashboardProps) {
  const getChangeIcon = (type?: string) => {
    if (type === 'increase') return <TrendingUp className="h-3 w-3" />;
    if (type === 'decrease') return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const getChangeColor = (type?: string) => {
    if (type === 'increase') return "text-success bg-success/20 border-success/30";
    if (type === 'decrease') return "text-destructive bg-destructive/20 border-destructive/30";
    return "text-muted-foreground bg-muted border-border";
  };

  return (
    <div className={cn("space-y-8", className)}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
          <h2 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/20 text-primary border-primary/30 animate-pulse"
          >
            <Zap className="h-3 w-3 ml-1" />
            تحديث مباشر
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget, index) => {
          const IconComponent = widget.icon || Target;
          const colorClass = widget.color || defaultColors.primary;

          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <Card className="border border-primary/15 bg-gradient-subtle backdrop-blur-sm shadow-lg shadow-black/30 hover:shadow-glow hover:border-primary/25 transition-all duration-500 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl shadow-md",
                        colorClass.replace('bg-', 'bg-') + "/15",
                        "border",
                        colorClass.replace('bg-', 'border-') + "/25"
                      )}>
                        <IconComponent className={cn(
                          "h-6 w-6",
                          colorClass.replace('bg-', 'text-')
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium text-slate-300">
                          {widget.title}
                        </CardTitle>
                        {widget.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {widget.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-foreground">
                        {typeof widget.value === 'number' 
                          ? widget.value.toLocaleString('ar')
                          : widget.value
                        }
                      </span>
                      {widget.change !== undefined && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-semibold",
                            getChangeColor(widget.changeType)
                          )}
                        >
                          {getChangeIcon(widget.changeType)}
                          <span className="mr-1">
                            {widget.change > 0 ? '+' : ''}{widget.change}%
                          </span>
                        </Badge>
                      )}
                    </div>

                    {widget.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">التقدم</span>
                          <span className="text-slate-300">{widget.progress}%</span>
                        </div>
                        <Progress
                          value={widget.progress}
                          className="h-2 [&>div]:bg-gradient-primary"
                        />
                        {widget.target && (
                          <p className="text-xs text-slate-400">
                            الهدف: {widget.target.toLocaleString('ar')}
                          </p>
                        )}
                      </div>
                    )}

                    {widget.trend && widget.trend.length > 0 && (
                      <div className="flex items-end gap-1 h-12">
                        {widget.trend.map((value, idx) => {
                          const maxValue = Math.max(...widget.trend!);
                          const height = (value / maxValue) * 100;
                          
                          return (
                            <motion.div
                              key={idx}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: idx * 0.05 }}
                              className={cn(
                                "flex-1 rounded-sm",
                                colorClass,
                                idx === widget.trend!.length - 1 ? "opacity-100" : "opacity-60"
                              )}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {quickActions.length > 0 && (
        <Card className="border border-primary/15 bg-gradient-subtle backdrop-blur-sm shadow-lg shadow-black/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                const colorClass = action.color || defaultColors.primary;

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={action.onClick}
                      variant="outline"
                      className="w-full h-auto flex flex-col items-start p-5 border border-slate-700/80 bg-slate-800/50 hover:bg-slate-800/60 hover:border-red-600/40 transition-all duration-300 text-right"
                    >
                      <div className={cn(
                        "p-2 rounded-lg mb-3",
                        colorClass.replace('bg-', 'bg-') + "/15",
                        "border",
                        colorClass.replace('bg-', 'border-') + "/25"
                      )}>
                        <ActionIcon className={cn(
                          "h-5 w-5",
                          colorClass.replace('bg-', 'text-')
                        )} />
                      </div>
                      <div className="space-y-1 text-right w-full">
                        <div className="font-semibold text-foreground text-sm">
                          {action.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {action.description}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 absolute top-4 left-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
