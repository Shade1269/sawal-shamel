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

      // Step 1: Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from('order_hub')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return [];

      // Step 2: Batch fetch all affiliate store names
      const affiliateStoreIds = [...new Set(orders
        .map(o => o.affiliate_store_id)
        .filter(Boolean))] as string[];

      const storeNamesMap = new Map<string, string>();
      if (affiliateStoreIds.length > 0) {
        const { data: stores } = await supabase
          .from('affiliate_stores')
          .select('id, store_name')
          .in('id', affiliateStoreIds);

        stores?.forEach(store => {
          storeNamesMap.set(store.id, store.store_name || '');
        });
      }

      // Step 3: Batch fetch all order items
      const simpleOrderIds = orders
        .filter(o => o.source === 'simple')
        .map(o => o.source_order_id)
        .filter(Boolean);

      const ecommerceOrderIds = orders
        .filter(o => o.source === 'ecommerce')
        .map(o => o.source_order_id)
        .filter(Boolean);

      const [simpleItemsResult, ecommerceItemsResult] = await Promise.all([
        simpleOrderIds.length > 0
          ? supabase
              .from('simple_order_items')
              .select('order_id, product_id, product_title, quantity, unit_price_sar')
              .in('order_id', simpleOrderIds)
          : Promise.resolve({ data: [] }),
        ecommerceOrderIds.length > 0
          ? supabase
              .from('ecommerce_order_items')
              .select('order_id, product_id, quantity, unit_price_sar')
              .in('order_id', ecommerceOrderIds)
          : Promise.resolve({ data: [] })
      ]);

      const simpleItems = simpleItemsResult.data || [];
      const ecommerceItems = ecommerceItemsResult.data || [];

      // Step 4: Batch fetch all products to check merchant ownership
      const allProductIds = [
        ...simpleItems.map(i => i.product_id).filter(Boolean),
        ...ecommerceItems.map(i => i.product_id).filter(Boolean)
      ];
      const uniqueProductIds = [...new Set(allProductIds)] as string[];

      const productsMap = new Map<string, { id: string; title: string; merchant_id: string | null }>();
      if (uniqueProductIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, title, merchant_id')
          .in('id', uniqueProductIds);

        products?.forEach(product => {
          productsMap.set(product.id, product);
        });
      }

      // Step 5: Group order items by order_id
      const simpleItemsByOrder = new Map<string, typeof simpleItems>();
      simpleItems.forEach(item => {
        const orderId = item.order_id;
        if (!simpleItemsByOrder.has(orderId)) {
          simpleItemsByOrder.set(orderId, []);
        }
        simpleItemsByOrder.get(orderId)!.push(item);
      });

      const ecommerceItemsByOrder = new Map<string, typeof ecommerceItems>();
      ecommerceItems.forEach(item => {
        const orderId = item.order_id;
        if (!ecommerceItemsByOrder.has(orderId)) {
          ecommerceItemsByOrder.set(orderId, []);
        }
        ecommerceItemsByOrder.get(orderId)!.push(item);
      });

      // Step 6: Build merchant orders
      const merchantOrders: MerchantOrder[] = [];

      for (const order of orders) {
        let items: Array<{ product_title: string; quantity: number; unit_price: number }> = [];

        if (order.source === 'simple' && order.source_order_id) {
          const orderItems = simpleItemsByOrder.get(order.source_order_id) || [];
          const merchantItems = orderItems.filter(item => {
            if (!item.product_id) return false;
            const product = productsMap.get(item.product_id);
            return product?.merchant_id === merchantId;
          });

          if (merchantItems.length > 0) {
            items = merchantItems.map(item => ({
              product_title: item.product_title || 'منتج',
              quantity: item.quantity,
              unit_price: item.unit_price_sar || 0
            }));
          }
        } else if (order.source === 'ecommerce' && order.source_order_id) {
          const orderItems = ecommerceItemsByOrder.get(order.source_order_id) || [];
          const merchantItems = orderItems.filter(item => {
            if (!item.product_id) return false;
            const product = productsMap.get(item.product_id);
            return product?.merchant_id === merchantId;
          });

          if (merchantItems.length > 0) {
            items = merchantItems.map(item => {
              const product = productsMap.get(item.product_id);
              return {
                product_title: product?.title || 'منتج',
                quantity: item.quantity,
                unit_price: item.unit_price_sar || 0
              };
            });
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
            affiliate_store_name: order.affiliate_store_id
              ? storeNamesMap.get(order.affiliate_store_id)
              : undefined,
            items
          });
        }
      }

      return merchantOrders;
    },
    enabled: !!merchantId
  });
}
