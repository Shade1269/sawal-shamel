import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Download,
  Settings,
  Maximize2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, Area, AreaChart } from 'recharts';

const chartVariants = cva(
  "w-full transition-all duration-500 ease-persian",
  {
    variants: {
      variant: {
        default: "bg-card border border-border rounded-lg",
        glass: "glass-effect backdrop-blur-sm border border-border/30 rounded-lg",
        luxury: "luxury-effect text-white rounded-lg shadow-luxury",
        persian: "persian-effect text-white rounded-lg shadow-persian",
        minimal: "bg-transparent"
      },
      size: {
        sm: "h-48",
        md: "h-64", 
        lg: "h-80",
        xl: "h-96",
        full: "h-full"
      },
      animation: {
        none: "",
        slide: "animate-slide-up",
        fade: "animate-fade-in",
        scale: "animate-scale-in",
        persian: "animate-persian-float"
      }
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
      animation: "fade"
    }
  }
);

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  metadata?: Record<string, any>;
}

export interface EnhancedChartProps 
  extends VariantProps<typeof chartVariants> {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie' | 'area';
  title?: string;
  description?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  interactive?: boolean;
  loading?: boolean;
  error?: string;
  refreshable?: boolean;
  downloadable?: boolean;
  filterable?: boolean;
  maximizable?: boolean;
  onRefresh?: () => void;
  onDownload?: () => void;
  onFilter?: () => void;
  onMaximize?: () => void;
  className?: string;
}

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  type = 'line',
  title,
  description,
  variant,
  size,
  animation,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'],
  interactive = true,
  loading = false,
  error,
  refreshable = false,
  downloadable = false,
  filterable = false,
  maximizable = false,
  onRefresh,
  onDownload,
  onFilter,
  onMaximize,
  className
}) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [hoveredData, setHoveredData] = useState<ChartDataPoint | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}م`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}ك`;
    return value.toLocaleString('ar');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-3 rounded-lg border border-border/30 shadow-luxury">
          <p className="font-medium mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {`${entry.name}: ${formatValue(entry.value)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="text-destructive">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">خطأ في تحميل البيانات</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            {refreshable && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد بيانات للعرض</p>
          </div>
        </div>
      );
    }

    const chartProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatValue}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={isAnimated ? 1500 : 0}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatValue}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              <Bar
                dataKey="value"
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={isAnimated ? 1000 : 0}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatValue}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={isAnimated ? 1500 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%" 
                outerRadius={80}
                fill={colors[0]}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationDuration={isAnimated ? 1000 : 0}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line': return LineChart;
      case 'bar': return BarChart3;
      case 'pie': return PieChart;
      case 'area': return TrendingUp;
      default: return BarChart3;
    }
  };

  const ChartIcon = getChartIcon();

  return (
    <div 
      ref={chartRef}
      className={cn(chartVariants({ variant, size, animation }), className)}
    >
      <Card className="h-full border-0 bg-transparent shadow-none">
        {(title || description || interactive) && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <ChartIcon className="h-5 w-5 text-primary" />
                  {title && (
                    <CardTitle className="text-base font-semibold">
                      {title}
                    </CardTitle>
                  )}
                </div>
                {hoveredData && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {hoveredData.name}: {formatValue(hoveredData.value)}
                  </Badge>
                )}
              </div>

              {interactive && (
                <div className="flex items-center gap-1">
                  {filterable && (
                    <Button variant="ghost" size="sm" onClick={onFilter}>
                      <Filter className="h-4 w-4" />
                    </Button>
                  )}
                  {refreshable && (
                    <Button variant="ghost" size="sm" onClick={onRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  {downloadable && (
                    <Button variant="ghost" size="sm" onClick={onDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {maximizable && (
                    <Button variant="ghost" size="sm" onClick={onMaximize}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </CardHeader>
        )}

        <CardContent className="h-full pb-2">
          <div className="h-full w-full">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      {showLegend && data.length > 1 && type === 'pie' && (
        <div className="flex flex-wrap gap-2 mt-4 px-4 pb-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { EnhancedChart, chartVariants };