import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp, Database } from 'lucide-react';

export function ConsolidationMonitoringDashboard() {
  // Order Hub Metrics - استعلامات مباشرة
  const { data: orderMetrics } = useQuery({
    queryKey: ['order-hub-metrics'],
    queryFn: async () => {
      const [total, ecommerce, simple, manual] = await Promise.all([
        supabase.from('order_hub').select('id', { count: 'exact', head: true }),
        supabase.from('order_hub').select('id', { count: 'exact', head: true }).eq('source', 'ecommerce'),
        supabase.from('order_hub').select('id', { count: 'exact', head: true }).eq('source', 'simple'),
        supabase.from('order_hub').select('id', { count: 'exact', head: true }).eq('source', 'manual'),
      ]);
      return {
        total_orders: total.count || 0,
        ecommerce_orders: ecommerce.count || 0,
        simple_orders: simple.count || 0,
        manual_orders: manual.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  // Data Quality Checks
  const { data: qualityChecks } = useQuery({
    queryKey: ['data-quality-checks'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_data_quality');
      if (error) throw error;
      return data as Array<{ check_name: string; status: string; details: any }>;
    },
    refetchInterval: 60000,
  });

  // Legacy Tables Status
  const { data: legacyStatus } = useQuery({
    queryKey: ['legacy-tables-status'],
    queryFn: async () => {
      const results = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('simple_orders').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('store_pages').select('id', { count: 'exact', head: true }),
      ]);
      return {
        orders: results[0].count || 0,
        simple_orders: results[1].count || 0,
        user_profiles: results[2].count || 0,
        store_pages: results[3].count || 0,
      };
    },
    refetchInterval: 60000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">لوحة مراقبة التوحيد</h2>
        <Badge variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          تحديث مباشر
        </Badge>
      </div>

      {/* Order Hub Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            {getStatusIcon('success')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderMetrics?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">في order_hub</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-commerce</CardTitle>
            {getStatusIcon('success')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderMetrics?.ecommerce_orders || 0}</div>
            <p className="text-xs text-muted-foreground">من ecommerce_orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simple</CardTitle>
            {getStatusIcon('success')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderMetrics?.simple_orders || 0}</div>
            <p className="text-xs text-muted-foreground">من simple_orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual</CardTitle>
            {getStatusIcon('success')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderMetrics?.manual_orders || 0}</div>
            <p className="text-xs text-muted-foreground">يدوي</p>
          </CardContent>
        </Card>
      </div>

      {/* Legacy Tables Status */}
      <Card>
        <CardHeader>
          <CardTitle>حالة الجداول القديمة (للقراءة فقط)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">orders (legacy)</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{legacyStatus?.orders || 0} سجل</Badge>
                <Badge variant="destructive">مُجمّد</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">simple_orders (legacy)</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{legacyStatus?.simple_orders || 0} سجل</Badge>
                <Badge variant="destructive">مُجمّد</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">user_profiles (legacy)</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{legacyStatus?.user_profiles || 0} سجل</Badge>
                <Badge variant="destructive">مُجمّد</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">store_pages (legacy)</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{legacyStatus?.store_pages || 0} سجل</Badge>
                <Badge variant="destructive">مُجمّد</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle>فحوص جودة البيانات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityChecks?.map((check: any, index: number) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span className="text-sm font-medium">{check.check_name}</span>
                </div>
                <Badge variant={check.status === 'info' ? 'outline' : 'destructive'}>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
