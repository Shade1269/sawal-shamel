import { useState, useEffect } from 'react';
import { UnifiedOrdersService } from '@/services/UnifiedOrdersService';
import { supabase } from '@/integrations/supabase/client';

export interface AffiliateOrdersStats {
  totalOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  confirmedCommissions: number;
  averageOrderValue: number;
}

export const useAffiliateOrders = (affiliateStoreId?: string) => {
  const [stats, setStats] = useState<AffiliateOrdersStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    confirmedCommissions: 0,
    averageOrderValue: 0
  });
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!affiliateStoreId) {
      setLoading(false);
      return;
    }

    const fetchAffiliateData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب الطلبات المرتبطة بالمسوق
        const ordersData = await UnifiedOrdersService.fetchOrders({
          affiliateStoreId: affiliateStoreId,
        });

        setOrders(ordersData);

        // حساب الإحصائيات
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount_sar || 0), 0);

        // جلب العمولات من جدول commissions
        const { data: commissions, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('affiliate_id', affiliateStoreId);

        if (commissionsError) {
          console.error('Error fetching commissions:', commissionsError);
        }

        const pendingCommissions = commissions?.filter(c => c.status === 'PENDING')
          ?.reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;
        
        const confirmedCommissions = commissions?.filter(c => c.status === 'CONFIRMED')
          ?.reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;

        setStats({
          totalOrders,
          totalRevenue,
          totalCommissions: pendingCommissions + confirmedCommissions,
          pendingCommissions,
          confirmedCommissions,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        });

      } catch (err: any) {
        console.error('Error fetching affiliate data:', err);
        setError(err.message || 'خطأ في جلب بيانات المسوق');
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, [affiliateStoreId]);

  return {
    stats,
    orders,
    loading,
    error,
    refresh: () => {
      if (affiliateStoreId) {
        setLoading(true);
        // Re-trigger the useEffect by calling the same logic
        const fetchData = async () => {
          try {
            setLoading(true);
            setError(null);

            const ordersData = await UnifiedOrdersService.fetchOrders({
              affiliateStoreId: affiliateStoreId,
            });

            setOrders(ordersData);

            const totalOrders = ordersData.length;
            const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount_sar || 0), 0);
            
            const { data: commissions } = await supabase
              .from('commissions')
              .select('*')
              .eq('affiliate_id', affiliateStoreId);

            const pendingCommissions = commissions?.filter(c => c.status === 'PENDING')
              ?.reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;
            
            const confirmedCommissions = commissions?.filter(c => c.status === 'CONFIRMED')
              ?.reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;

            setStats({
              totalOrders,
              totalRevenue,
              totalCommissions: pendingCommissions + confirmedCommissions,
              pendingCommissions,
              confirmedCommissions,
              averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            });
          } catch (err: any) {
            setError(err.message || 'خطأ في جلب البيانات');
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }
    }
  };
};