import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

interface PerformanceData {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

export function PerformanceOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['performance-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_overview')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as PerformanceData;
    }
  });

  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: data?.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-primary'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${(data?.total_revenue || 0).toFixed(2)} ر.س`,
      icon: DollarSign,
      color: 'text-chart-2'
    },
    {
      title: 'متوسط قيمة الطلب',
      value: `${(data?.avg_order_value || 0).toFixed(2)} ر.س`,
      icon: TrendingUp,
      color: 'text-chart-3'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 flex items-center">
                  <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                آخر 30 يوم
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}