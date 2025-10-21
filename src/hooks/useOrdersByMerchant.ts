import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MerchantOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  affiliate_store_name?: string;
  items: Array<{
    product_title: string;
    quantity: number;
    unit_price: number;
  }>;
}

export function useOrdersByMerchant(merchantId?: string) {
  return useQuery({
    queryKey: ['merchant-orders', merchantId],
    queryFn: async () => {
      if (!merchantId) return [];

      // جلب الطلبات من order_hub
      const { data: orders, error: ordersError } = await supabase
        .from('order_hub')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // فلترة الطلبات التي تحتوي على منتجات هذا التاجر
      const merchantOrders: MerchantOrder[] = [];

      for (const order of orders || []) {
        // البحث في simple_order_items أو ecommerce_order_items
        let items: any[] = [];
        let affiliateStoreName = '';
        
        // جلب اسم متجر المسوقة إذا وجد
        if (order.affiliate_store_id) {
          const { data: storeData } = await supabase
            .from('affiliate_stores')
            .select('store_name')
            .eq('id', order.affiliate_store_id)
            .single();
          affiliateStoreName = storeData?.store_name || '';
        }
        
        if (order.source === 'simple') {
          const { data: simpleItems } = await supabase
            .from('simple_order_items')
            .select('product_id, product_title, quantity, unit_price_sar')
            .eq('order_id', order.source_order_id);
          
          // التحقق من منتجات التاجر
          if (simpleItems && simpleItems.length > 0) {
            const productIds = simpleItems.map(item => item.product_id).filter(Boolean);
            const { data: products } = await supabase
              .from('products')
              .select('id, merchant_id')
              .in('id', productIds);
            
            const hasMerchantProduct = products?.some(p => p.merchant_id === merchantId);
            
            if (hasMerchantProduct) {
              items = simpleItems.map(item => ({
                product_title: item.product_title,
                quantity: item.quantity,
                unit_price: item.unit_price_sar
              }));
            }
          }
        } else if (order.source === 'ecommerce') {
          const { data: ecommerceItems } = await supabase
            .from('ecommerce_order_items')
            .select('product_id, quantity, unit_price_sar')
            .eq('order_id', order.source_order_id);
          
          if (ecommerceItems && ecommerceItems.length > 0) {
            const productIds = ecommerceItems.map(item => item.product_id);
            const { data: products } = await supabase
              .from('products')
              .select('id, title, merchant_id')
              .in('id', productIds);
            
            const merchantProducts = products?.filter(p => p.merchant_id === merchantId) || [];
            
            if (merchantProducts.length > 0) {
              items = ecommerceItems
                .map(item => {
                  const product = products?.find(p => p.id === item.product_id);
                  if (product && product.merchant_id === merchantId) {
                    return {
                      product_title: product.title,
                      quantity: item.quantity,
                      unit_price: item.unit_price_sar
                    };
                  }
                  return null;
                })
                .filter(Boolean) as any[];
            }
          }
        }

        if (items.length > 0) {
          merchantOrders.push({
            id: order.id,
            order_number: order.order_number || order.id.substring(0, 8),
            customer_name: order.customer_name || 'عميل',
            customer_phone: order.customer_phone || '',
            total_amount: order.total_amount_sar || 0,
            status: order.status || 'pending',
            payment_status: order.payment_status || 'pending',
            created_at: order.created_at,
            affiliate_store_name: affiliateStoreName,
            items
          });
        }
      }

      return merchantOrders;
    },
    enabled: !!merchantId
  });
}
