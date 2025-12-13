import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, subDays } from 'date-fns';

interface DashboardData {
  recentProducts: any[];
  recentOrders: any[];
  walletBalance: {
    available: number;
    pending: number;
    lifetime: number;
  };
  salesChart: {
    date: string;
    amount: number;
    orders: number;
  }[];
  comparison: {
    currentMonth: number;
    lastMonth: number;
    percentChange: number;
  };
}

export const useMerchantDashboardData = (merchantId: string | null) => {
  return useQuery({
    queryKey: ['merchant-dashboard-data', merchantId],
    queryFn: async (): Promise<DashboardData> => {
      if (!merchantId) throw new Error('No merchant ID');

      // آخر 5 منتجات
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, title, approval_status, created_at, price_sar, image_urls')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(5);

      // آخر 5 طلبات
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('id, order_id, line_total_sar, quantity, created_at, title_snapshot')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(10);

      // تجميع الطلبات الفريدة
      const uniqueOrders = new Map();
      (orderItems || []).forEach((item: any) => {
        if (!uniqueOrders.has(item.order_id)) {
          uniqueOrders.set(item.order_id, {
            order_id: item.order_id,
            total: item.line_total_sar,
            created_at: item.created_at,
            items: [item.title_snapshot || 'منتج']
          });
        } else {
          const existing = uniqueOrders.get(item.order_id);
          existing.total += item.line_total_sar;
          existing.items.push(item.title_snapshot || 'منتج');
        }
      });
      const recentOrders = Array.from(uniqueOrders.values()).slice(0, 5);

      // رصيد المحفظة
      const { data: { user } } = await supabase.auth.getUser();

      let walletBalance = { available: 0, pending: 0, lifetime: 0 };
      
      if (user) {
        const { data: wallet } = await supabase
          .from('merchant_wallet_balances')
          .select('available_balance_sar, pending_balance_sar, lifetime_earnings_sar')
          .eq('merchant_id', merchantId)
          .maybeSingle();

        if (wallet) {
          walletBalance = {
            available: wallet.available_balance_sar || 0,
            pending: wallet.pending_balance_sar || 0,
            lifetime: wallet.lifetime_earnings_sar || 0
          };
        }
      }

      // بيانات الرسم البياني (آخر 7 أيام)
      const salesChart: { date: string; amount: number; orders: number }[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const { data: dayOrders } = await supabase
          .from('order_items')
          .select('line_total_sar, order_id')
          .eq('merchant_id', merchantId)
          .gte('created_at', dayStart)
          .lte('created_at', dayEnd);

        const uniqueOrderIds = new Set(dayOrders?.map(o => o.order_id) || []);
        const dayTotal = dayOrders?.reduce((sum, o) => sum + (Number(o.line_total_sar) || 0), 0) || 0;

        salesChart.push({
          date: format(subDays(today, i), 'MM/dd'),
          amount: dayTotal,
          orders: uniqueOrderIds.size
        });
      }

      // مقارنة الشهر الحالي بالسابق
      const currentMonthStart = startOfMonth(today).toISOString();
      const currentMonthEnd = endOfMonth(today).toISOString();
      const lastMonthStart = startOfMonth(subMonths(today, 1)).toISOString();
      const lastMonthEnd = endOfMonth(subMonths(today, 1)).toISOString();

      const { data: currentMonthOrders } = await supabase
        .from('order_items')
        .select('line_total_sar')
        .eq('merchant_id', merchantId)
        .gte('created_at', currentMonthStart)
        .lte('created_at', currentMonthEnd);

      const { data: lastMonthOrders } = await supabase
        .from('order_items')
        .select('line_total_sar')
        .eq('merchant_id', merchantId)
        .gte('created_at', lastMonthStart)
        .lte('created_at', lastMonthEnd);

      const currentMonth = currentMonthOrders?.reduce((sum, o) => sum + (Number(o.line_total_sar) || 0), 0) || 0;
      const lastMonth = lastMonthOrders?.reduce((sum, o) => sum + (Number(o.line_total_sar) || 0), 0) || 0;
      const percentChange = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

      return {
        recentProducts: recentProducts || [],
        recentOrders,
        walletBalance,
        salesChart,
        comparison: {
          currentMonth,
          lastMonth,
          percentChange
        }
      };
    },
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};
