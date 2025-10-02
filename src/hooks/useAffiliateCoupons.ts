import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AffiliateCoupon {
  id: string;
  affiliate_store_id: string;
  coupon_name: string;
  coupon_code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  usage_limit_per_customer: number;
  usage_count: number;
  is_active: boolean;
  target_type: 'store' | 'product' | 'category';
  target_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponData {
  affiliate_store_id: string;
  coupon_name: string;
  coupon_code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  target_type?: 'store' | 'product' | 'category';
  target_id?: string;
  is_active?: boolean;
}

export const useAffiliateCoupons = (storeId?: string) => {
  const queryClient = useQueryClient();

  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ['affiliate-coupons', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from('affiliate_coupons')
        .select('*')
        .eq('affiliate_store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AffiliateCoupon[];
    },
    enabled: !!storeId,
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
      const { data, error } = await supabase
        .from('affiliate_coupons')
        .insert(couponData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-coupons', storeId] });
      toast.success('تم إنشاء الكوبون بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الكوبون');
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateCouponData> }) => {
      const { data, error } = await supabase
        .from('affiliate_coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-coupons', storeId] });
      toast.success('تم تحديث الكوبون بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الكوبون');
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('affiliate_coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-coupons', storeId] });
      toast.success('تم حذف الكوبون بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف الكوبون');
    },
  });

  // Get coupon usage statistics
  const { data: usageStats } = useQuery({
    queryKey: ['coupon-usage-stats', storeId],
    queryFn: async () => {
      if (!storeId || !coupons) return null;

      const couponIds = coupons.map(c => c.id);
      
      const { data, error } = await supabase
        .from('affiliate_coupon_usage')
        .select('coupon_id, discount_applied')
        .in('coupon_id', couponIds);

      if (error) throw error;

      const totalUsage = data.length;
      const totalSavings = data.reduce((sum, usage) => sum + Number(usage.discount_applied), 0);

      return { totalUsage, totalSavings };
    },
    enabled: !!storeId && !!coupons && coupons.length > 0,
  });

  return {
    coupons: coupons || [],
    isLoading,
    error,
    usageStats,
    createCoupon: createCouponMutation.mutate,
    updateCoupon: updateCouponMutation.mutate,
    deleteCoupon: deleteCouponMutation.mutate,
    isCreating: createCouponMutation.isPending,
    isUpdating: updateCouponMutation.isPending,
    isDeleting: deleteCouponMutation.isPending,
  };
};
