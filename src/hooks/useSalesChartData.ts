import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, subMonths, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
  commissions: number;
}

export type TimeRange = 'week' | 'month' | 'year';

const getDateRange = (range: TimeRange) => {
  const now = new Date();
  switch (range) {
    case 'week':
      return { start: subDays(now, 6), end: now };
    case 'month':
      return { start: subDays(now, 29), end: now };
    case 'year':
      return { start: subMonths(now, 11), end: now };
    default:
      return { start: subDays(now, 6), end: now };
  }
};

export const useSalesChartData = (affiliateStoreId?: string, timeRange: TimeRange = 'week') => {
  return useQuery({
    queryKey: ['sales-chart-data', affiliateStoreId, timeRange],
    queryFn: async (): Promise<SalesDataPoint[]> => {
      if (!affiliateStoreId) return [];

      const { start, end } = getDateRange(timeRange);

      // جلب الطلبات في الفترة المحددة
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_sar, created_at, status, affiliate_commission_sar')
        .eq('affiliate_store_id', affiliateStoreId)
        .gte('created_at', startOfDay(start).toISOString())
        .lte('created_at', endOfDay(end).toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) {
        console.error('Error fetching orders for chart:', ordersError);
        throw ordersError;
      }

      // جلب العمولات في الفترة المحددة
      const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('amount_sar, created_at')
        .eq('affiliate_id', affiliateStoreId)
        .gte('created_at', startOfDay(start).toISOString())
        .lte('created_at', endOfDay(end).toISOString());

      if (commissionsError) {
        console.error('Error fetching commissions for chart:', commissionsError);
      }

      // تجميع البيانات حسب الفترة الزمنية
      let intervals: Date[];
      let formatPattern: string;

      if (timeRange === 'week') {
        intervals = eachDayOfInterval({ start, end });
        formatPattern = 'EEEE'; // اسم اليوم
      } else if (timeRange === 'month') {
        intervals = eachDayOfInterval({ start, end });
        formatPattern = 'dd MMM'; // اليوم والشهر
      } else {
        intervals = eachMonthOfInterval({ start, end });
        formatPattern = 'MMM yyyy'; // الشهر والسنة
      }

      const chartData: SalesDataPoint[] = intervals.map((date) => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        // حساب المبيعات والطلبات لهذا اليوم
        const dayOrders = orders?.filter((order) => {
          const orderDate = new Date(order.created_at);
          return orderDate >= dayStart && orderDate <= dayEnd;
        }) || [];

        const daySales = dayOrders.reduce((sum, order) => sum + Number(order.total_sar || 0), 0);

        // حساب العمولات لهذا اليوم
        const dayCommissions = commissions?.filter((commission) => {
          const commissionDate = new Date(commission.created_at);
          return commissionDate >= dayStart && commissionDate <= dayEnd;
        }) || [];

        const dayCommissionsTotal = dayCommissions.reduce((sum, c) => sum + Number(c.amount_sar || 0), 0);

        return {
          date: format(date, formatPattern, { locale: ar }),
          sales: Math.round(daySales),
          orders: dayOrders.length,
          commissions: Math.round(dayCommissionsTotal),
        };
      });

      return chartData;
    },
    enabled: !!affiliateStoreId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchOnWindowFocus: false,
  });
};
