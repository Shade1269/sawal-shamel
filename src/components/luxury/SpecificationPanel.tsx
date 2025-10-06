import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Gauge,
  Zap,
  Shield,
  Award,
  CheckCircle2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpecificationGroup {
  id: string;
  title: string;
  icon?: any;
  specs: Specification[];
  defaultExpanded?: boolean;
}

export interface Specification {
  label: string;
  value: string | number;
  icon?: any;
  progress?: number;
  highlight?: boolean;
  badge?: string;
}

export interface SpecificationPanelProps {
  title?: string;
  description?: string;
  groups: SpecificationGroup[];
  className?: string;
}

const defaultIcons = {
  performance: Gauge,
  technical: Cpu,
  features: Zap,
  quality: Shield,
  certification: Award
};

export function SpecificationPanel({
  title = "المواصفات التقنية",
  description,
  groups,
  className
}: SpecificationPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.defaultExpanded).map(g => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <Card
      className={cn(
        "border-2 border-red-600/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_rgba(196,30,58,0.25),0_0_24px_rgba(196,30,58,0.15)] hover:border-red-600/35 transition-all duration-500",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Info className="h-6 w-6 text-red-500" />
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-slate-300">{description}</p>
            )}
          </div>
          <Badge
            variant="secondary"
            className="bg-red-600/20 text-red-400 border-red-600/30"
          >
            {groups.length} مجموعات
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {groups.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(group.id);
          const IconComponent = group.icon || defaultIcons.technical;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="rounded-xl border-2 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm overflow-hidden hover:border-red-600/30 transition-all duration-300"
            >
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-800/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-600/20 border border-red-600/30">
                    <IconComponent className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {group.specs.length} مواصفة
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-red-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-3">
                      {group.specs.map((spec, specIndex) => {
                        const SpecIcon = spec.icon;

                        return (
                          <motion.div
                            key={specIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: specIndex * 0.05 }}
                            className={cn(
                              "flex items-start justify-between p-3 rounded-lg transition-all duration-300",
                              spec.highlight
                                ? "bg-red-900/20 border border-red-600/30"
                                : "bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {SpecIcon && (
                                  <SpecIcon
                                    className={cn(
                                      "h-4 w-4",
                                      spec.highlight ? "text-red-400" : "text-slate-400"
                                    )}
                                  />
                                )}
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    spec.highlight ? "text-red-300" : "text-slate-300"
                                  )}
                                >
                                  {spec.label}
                                </span>
                                {spec.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-600/20 text-green-400 border-green-600/30"
                                  >
                                    {spec.badge}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "text-base font-semibold",
                                    spec.highlight ? "text-white" : "text-slate-200"
                                  )}
                                >
                                  {spec.value}
                                </span>

                                {spec.progress !== undefined && (
                                  <div className="flex-1 max-w-xs">
                                    <Progress
                                      value={spec.progress}
                                      className={cn(
                                        "h-2",
                                        spec.highlight
                                          ? "[&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-500"
                                          : "[&>div]:bg-slate-600"
                                      )}
                                    />
                                    <span className="text-xs text-slate-400 mt-1">
                                      {spec.progress}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {spec.highlight && (
                              <CheckCircle2 className="h-5 w-5 text-red-400 flex-shrink-0 mr-2" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
