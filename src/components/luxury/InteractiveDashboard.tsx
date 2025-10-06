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
  primary: "bg-red-600",
  success: "bg-green-600",
  warning: "bg-yellow-600",
  info: "bg-blue-600",
  purple: "bg-purple-600"
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
    if (type === 'increase') return "text-green-400 bg-green-600/20 border-green-600/30";
    if (type === 'decrease') return "text-red-400 bg-red-600/20 border-red-600/30";
    return "text-slate-400 bg-slate-600/20 border-slate-600/30";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <Activity className="h-8 w-8 text-red-500" />
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-300">{subtitle}</p>
            )}
          </div>
          <Badge
            variant="secondary"
            className="bg-red-600/20 text-red-400 border-red-600/30 animate-pulse"
          >
            <Zap className="h-3 w-3 ml-1" />
            تحديث مباشر
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget, index) => {
          const IconComponent = widget.icon || Target;
          const colorClass = widget.color || defaultColors.primary;

          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="border-2 border-red-600/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_rgba(196,30,58,0.25),0_0_24px_rgba(196,30,58,0.15)] hover:border-red-600/35 transition-all duration-500 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl shadow-lg",
                        colorClass.replace('bg-', 'bg-') + "/20",
                        "border-2",
                        colorClass.replace('bg-', 'border-') + "/30"
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
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-white">
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
                          className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-500"
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
        <Card className="border-2 border-red-600/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                const colorClass = action.color || defaultColors.primary;

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={action.onClick}
                      variant="outline"
                      className="w-full h-auto flex flex-col items-start p-4 border-2 border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-red-600/50 transition-all duration-300 text-right"
                    >
                      <div className={cn(
                        "p-2 rounded-lg mb-2",
                        colorClass.replace('bg-', 'bg-') + "/20",
                        "border",
                        colorClass.replace('bg-', 'border-') + "/30"
                      )}>
                        <ActionIcon className={cn(
                          "h-5 w-5",
                          colorClass.replace('bg-', 'text-')
                        )} />
                      </div>
                      <div className="space-y-1 text-right w-full">
                        <div className="font-semibold text-white text-sm">
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
