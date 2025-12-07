import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Download, Filter, RefreshCw, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
  category?: string;
  target?: number;
  previous?: number;
}

interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'combo';
  data: ChartDataPoint[];
  colors?: string[];
  showTarget?: boolean;
  showPrevious?: boolean;
  dateRange?: string;
  unit?: string;
  growth?: number;
  status?: 'up' | 'down' | 'stable';
}

interface DashboardChartsProps {
  charts: ChartConfig[];
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: string) => void;
  onRefresh?: () => void;
  onExport?: (chartId: string) => void;
}

const COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4', 
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: '#64748b'
};

const DEFAULT_COLORS = [
  COLORS.primary,
  COLORS.secondary, 
  COLORS.success,
  COLORS.warning,
  COLORS.danger
];

export function DashboardCharts({
  charts,
  period = 'month',
  onPeriodChange,
  onRefresh,
  onExport
}: DashboardChartsProps) {
  
  const periodOptions = [
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'الأسبوع' },
    { value: 'month', label: 'الشهر' },
    { value: 'quarter', label: '3 أشهر' },
    { value: 'year', label: 'السنة' }
  ];

  const formatTooltip = (value: any, name: string, props: any) => {
    const unit = props.payload?.unit || '';
    return [`${value.toLocaleString('ar')} ${unit}`, name];
  };

  const renderChart = (config: ChartConfig) => {
    const colors = config.colors || DEFAULT_COLORS;
    
    const commonProps = {
      data: config.data,
      margin: { top: 5, right: 10, left: 10, bottom: 5 }
    };

    const chartHeight = window.innerWidth < 768 ? 250 : 300;
    const fontSize = window.innerWidth < 768 ? 10 : 12;

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize }}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize }}
                axisLine={false}
                width={window.innerWidth < 768 ? 40 : 60}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelStyle={{ color: 'var(--foreground)', fontSize: '12px' }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]}
                strokeWidth={window.innerWidth < 768 ? 2 : 3}
                dot={{ fill: colors[0], strokeWidth: 2, r: window.innerWidth < 768 ? 3 : 4 }}
                activeDot={{ r: window.innerWidth < 768 ? 4 : 6, stroke: colors[0], strokeWidth: 2 }}
              />
              {config.showTarget && (
                <ReferenceLine 
                  y={config.data[0]?.target} 
                  stroke={COLORS.warning}
                  strokeDasharray="5 5"
                  label="الهدف"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize }} 
                axisLine={false} 
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize }} 
                axisLine={false}
                width={window.innerWidth < 768 ? 40 : 60}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize }} 
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize }} 
                axisLine={false}
                width={window.innerWidth < 768 ? 40 : 60}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={window.innerWidth >= 768 ? 
                  ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : 
                  false
                }
                outerRadius={window.innerWidth < 768 ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {config.data.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              {window.innerWidth >= 768 && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'combo':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize }} 
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize }} 
                axisLine={false}
                width={window.innerWidth < 768 ? 40 : 60}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
              {config.showPrevious && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke={colors[1]}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div>نوع الرسم البياني غير مدعوم</div>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-base md:text-lg font-semibold">التحليلات والرسوم البيانية</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            تحليل شامل للأداء والاتجاهات
          </p>
        </div>
        
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
          <Tabs value={period} onValueChange={onPeriodChange}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 h-8 md:h-10">
              {periodOptions.map((option, index) => (
                <TabsTrigger 
                  key={option.value} 
                  value={option.value}
                  className={`text-xs px-2 md:px-3 ${index >= 3 ? 'hidden md:flex' : ''}`}
                >
                  <span className="md:hidden">
                    {option.label === 'اليوم' ? 'يوم' : 
                     option.label === 'الأسبوع' ? 'أسبوع' : 
                     option.label === 'الشهر' ? 'شهر' : 
                     option.label === '3 أشهر' ? '3ش' : 'سنة'}
                  </span>
                  <span className="hidden md:inline">{option.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="w-full md:w-auto">
              <RefreshCw className="h-4 w-4 md:mr-0 ml-2 md:ml-0" />
              <span className="md:hidden">تحديث</span>
            </Button>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {charts.map((config, index) => (
          <motion.div
            key={config.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex flex-col space-y-1 md:flex-row md:items-center md:gap-2 md:space-y-0">
                      <span className="text-sm md:text-base truncate">{config.title}</span>
                      {config.growth !== undefined && (
                        <Badge 
                          variant={config.status === 'up' ? 'default' : 
                                  config.status === 'down' ? 'destructive' : 'secondary'}
                          className="text-xs w-fit"
                        >
                          <TrendingUp className="h-3 w-3 ml-1" />
                          {config.growth > 0 ? '+' : ''}{config.growth}%
                        </Badge>
                      )}
                    </CardTitle>
                    {config.description && (
                      <CardDescription className="text-xs md:text-sm line-clamp-2">
                        {config.description}
                      </CardDescription>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onExport && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onExport(config.id)}
                        className="h-8 w-8 p-0 md:h-9 md:w-9"
                      >
                        <Download className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:h-9 md:w-9">
                      <Filter className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
                
                {config.dateRange && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" />
                    {config.dateRange}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {renderChart(config)}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {charts.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">لا توجد بيانات للعرض</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ابدأ بإضافة بعض البيانات لرؤية الرسوم البيانية هنا
              </p>
              {onRefresh && (
                <Button variant="outline" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث البيانات
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}