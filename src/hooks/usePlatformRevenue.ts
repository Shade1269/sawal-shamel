import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformRevenueRecord {
  id: string;
  order_id: string;
  order_item_id?: string;
  merchant_id: string;
  affiliate_id?: string;
  merchant_base_price_sar: number;
  platform_share_sar: number;
  affiliate_commission_sar?: number;
  final_sale_price_sar: number;
  status: 'PENDING' | 'CONFIRMED' | 'REFUNDED';
  created_at: string;
  confirmed_at?: string;
  merchant?: {
    id: string;
    full_name: string;
  };
  affiliate?: {
    id: string;
    full_name: string;
  };
}

export const usePlatformRevenue = () => {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ['platform-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_revenue')
        .select(`
          *,
          merchant:profiles!platform_revenue_merchant_id_fkey(
            id,
            full_name
          ),
          affiliate:profiles!platform_revenue_affiliate_id_fkey(
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlatformRevenueRecord[];
    }
  });

  const totalRevenue = revenue?.reduce((sum, r) => 
    r.status === 'CONFIRMED' ? sum + r.platform_share_sar : sum, 0
  ) || 0;

  const pendingRevenue = revenue?.reduce((sum, r) => 
    r.status === 'PENDING' ? sum + r.platform_share_sar : sum, 0
  ) || 0;

  const confirmedRevenue = revenue?.filter(r => r.status === 'CONFIRMED') || [];
  const pendingRevenueRecords = revenue?.filter(r => r.status === 'PENDING') || [];

  return {
    revenue: revenue || [],
    confirmedRevenue,
    pendingRevenueRecords,
    totalRevenue,
    pendingRevenue,
    isLoading
  };
};
