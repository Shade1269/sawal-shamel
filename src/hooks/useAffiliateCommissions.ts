import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface CommissionData {
  id: string;
  amount_sar: number;
  commission_rate: number;
  status: string;
  confirmed_at: string | null;
  created_at: string;
  order_id: string;
}

interface OrderTracking {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  unit_price_sar: number;
  commission_rate: number;
  commission_amount_sar: number;
  status: string;
  created_at: string;
  products?: {
    title: string;
    image_urls?: string[];
  };
}

export const useAffiliateCommissions = () => {
  const { user } = useSupabaseAuth();

  const { data: commissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['affiliate-commissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommissionData[];
    },
    enabled: !!user
  });

  const { data: orderTracking, isLoading: trackingLoading } = useQuery({
    queryKey: ['affiliate-order-tracking', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('order_tracking')
        .select(`
          *,
          products (
            title,
            image_urls
          )
        `)
        .eq('affiliate_profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderTracking[];
    },
    enabled: !!user
  });

  const totalCommissions = commissions?.reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;
  const pendingCommissions = commissions?.filter(c => c.status === 'PENDING').reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;
  const confirmedCommissions = commissions?.filter(c => c.status === 'CONFIRMED').reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;

  return {
    commissions: commissions || [],
    orderTracking: orderTracking || [],
    totalCommissions,
    pendingCommissions,
    confirmedCommissions,
    isLoading: commissionsLoading || trackingLoading
  };
};