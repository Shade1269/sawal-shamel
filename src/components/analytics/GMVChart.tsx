import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, DollarSign } from 'lucide-react';

interface GMVData {
  date: string;
  total_orders: number;
  gmv: number;
  completed_gmv: number;
  avg_order_value: number;
}

export function GMVChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['gmv-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmv_analytics')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as GMVData[];
    }
  });

  const totalGMV = data?.reduce((sum, item) => sum + Number(item.gmv), 0) || 0;
  const avgOrderValue = data?.reduce((sum, item) => sum + Number(item.avg_order_value), 0) / (data?.length || 1) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            تحليل GMV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map(item => ({
    date: format(new Date(item.date), 'MM/dd'),
    'إجمالي المبيعات': Number(item.gmv),
    'المبيعات المكتملة': Number(item.completed_gmv),
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            تحليل GMV - آخر 90 يوم
          </span>
          <div className="flex gap-4 text-sm font-normal">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">الإجمالي:</span>
              <span className="font-semibold">{totalGMV.toFixed(2)} ر.س</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">متوسط الطلب:</span>
              <span className="font-semibold">{avgOrderValue.toFixed(2)} ر.س</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="إجمالي المبيعات" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="المبيعات المكتملة" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}