import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardContent } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
  commissions: number;
}

interface SalesChartProps {
  data?: SalesDataPoint[];
  isLoading?: boolean;
}

// Sample data for demo
const generateSampleData = (): SalesDataPoint[] => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days.map((day) => ({
    date: day,
    sales: Math.floor(Math.random() * 5000) + 1000,
    orders: Math.floor(Math.random() * 50) + 10,
    commissions: Math.floor(Math.random() * 500) + 100,
  }));
};

type ChartType = 'area' | 'bar';
type TimeRange = 'week' | 'month' | 'year';

export function SalesChart({ data, isLoading = false }: SalesChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  const chartData = data || generateSampleData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
                {entry.value.toLocaleString('ar-SA')} {entry.name === 'الطلبات' ? '' : 'ر.س'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <UnifiedCard variant="glass">
        <UnifiedCardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="h-[300px] bg-muted/50 animate-pulse rounded-lg" />
        </UnifiedCardContent>
      </UnifiedCard>
    );
  }

  return (
    <UnifiedCard variant="glass" className="overflow-hidden">
      <UnifiedCardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <UnifiedCardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            تحليل المبيعات
          </UnifiedCardTitle>
          
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "text-xs px-3 h-7",
                    timeRange === range && "bg-background shadow-sm"
                  )}
                >
                  {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
                </Button>
              ))}
            </div>
            
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('area')}
                className={cn(
                  "h-7 w-7 p-0",
                  chartType === 'area' && "bg-background shadow-sm"
                )}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('bar')}
                className={cn(
                  "h-7 w-7 p-0",
                  chartType === 'bar' && "bg-background shadow-sm"
                )}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </UnifiedCardHeader>
      
      <UnifiedCardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commissionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="المبيعات"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="commissions"
                  name="العمولات"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fill="url(#commissionsGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
                <Bar 
                  dataKey="sales" 
                  name="المبيعات" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="commissions" 
                  name="العمولات" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {chartData.reduce((acc, item) => acc + item.sales, 0).toLocaleString('ar-SA')}
            </p>
            <p className="text-sm text-muted-foreground">إجمالي المبيعات (ر.س)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {chartData.reduce((acc, item) => acc + item.orders, 0).toLocaleString('ar-SA')}
            </p>
            <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-chart-2">
              {chartData.reduce((acc, item) => acc + item.commissions, 0).toLocaleString('ar-SA')}
            </p>
            <p className="text-sm text-muted-foreground">إجمالي العمولات (ر.س)</p>
          </div>
        </div>
      </UnifiedCardContent>
    </UnifiedCard>
  );
}
