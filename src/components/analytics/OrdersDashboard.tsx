import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp } from 'lucide-react';

interface OrdersData {
  status: string;
  order_count: number;
  total_value: number;
  avg_value: number;
}

const statusLabels: Record<string, string> = {
  'PENDING': 'قيد الانتظار',
  'CONFIRMED': 'مؤكد',
  'PROCESSING': 'قيد المعالجة',
  'SHIPPED': 'تم الشحن',
  'DELIVERED': 'تم التسليم',
  'CANCELLED': 'ملغي',
  'RETURNED': 'مرتجع'
};

export function OrdersDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders_dashboard')
        .select('*');
      
      if (error) throw error;
      return data as OrdersData[];
    }
  });

  const totalOrders = data?.reduce((sum, item) => sum + Number(item.order_count), 0) || 0;
  const totalValue = data?.reduce((sum, item) => sum + Number(item.total_value), 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            لوحة الطلبات
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
    status: statusLabels[item.status] || item.status,
    'عدد الطلبات': Number(item.order_count),
    'القيمة الإجمالية': Number(item.total_value),
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            لوحة الطلبات - آخر 30 يوم
          </span>
          <div className="flex gap-4 text-sm font-normal">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">إجمالي الطلبات:</span>
              <span className="font-semibold">{totalOrders}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">القيمة:</span>
              <span className="font-semibold">{totalValue.toFixed(2)} ر.س</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="status" 
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
            <Bar 
              dataKey="عدد الطلبات" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}