import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export interface MerchantOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  status: string;
  subtotal_sar: number;
  tax_sar: number;
  shipping_sar: number;
  total_sar: number;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  items: MerchantOrderItem[];
}

export interface MerchantOrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_sku?: string;
  product_image_url?: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
  created_at: string;
}

export const useMerchantOrders = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: merchant } = useQuery({
    queryKey: ['merchant-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['merchant-orders', merchant?.id],
    queryFn: async () => {
      if (!merchant) return [];
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('ecommerce_order_items')
        .select(`
          order_id,
          id,
          product_id,
          product_title,
          product_sku,
          product_image_url,
          quantity,
          unit_price_sar,
          total_price_sar,
          created_at,
          products!inner(merchant_id)
        `)
        .eq('products.merchant_id', merchant.id);

      if (itemsError) throw itemsError;

      const orderIds = [...new Set(orderItems?.map(item => item.order_id) || [])];

      if (orderIds.length === 0) return [];

      const { data: ordersData, error: ordersError } = await supabase
        .from('ecommerce_orders')
        .select('*')
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      return ordersData.map(order => ({
        ...order,
        items: orderItems.filter(item => item.order_id === order.id).map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_title: item.product_title,
          product_sku: item.product_sku,
          product_image_url: item.product_image_url,
          quantity: item.quantity,
          unit_price_sar: item.unit_price_sar,
          total_price_sar: item.total_price_sar,
          created_at: item.created_at,
        }))
      })) as MerchantOrder[];
    },
    enabled: !!merchant
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
    }
  });

  return {
    orders,
    isLoading,
    merchant,
    updateOrderStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
};
