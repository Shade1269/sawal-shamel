import { supabase } from '@/integrations/supabase/client';
// Database types available from @/integrations/supabase/types

// Types available: PaymentMethod, PaymentStatus, OrderStatus from Database['public']['Enums']

interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    city: string;
    district: string;
    street: string;
    building?: string;
    apartment?: string;
    postalCode?: string;
  };
}

// Reserved order constants: PAYMENT_METHOD_COD, PAYMENT_STATUS_PENDING, ORDER_STATUS_PENDING, generateOrderNumber

export const storeOrderService = {
  async createOrderFromCart(
    cartId: string,
    shopId: string,
    affiliateStoreId: string,
    orderData: CreateOrderData,
    shippingInfo?: { providerId?: string; providerName?: string; costSar?: number },
    couponInfo?: { id: string; code: string; discountAmount: number }
  ) {
    try {
      let buyerSessionId: string | null = null;
      try {
        const raw = localStorage.getItem(`customer_session_${affiliateStoreId}`);
        if (raw) buyerSessionId = JSON.parse(raw)?.sessionId || null;
      } catch (_) {
        buyerSessionId = localStorage.getItem(`store_session_${affiliateStoreId}`);
      }

      const payload: any = {
        cart_id: cartId,
        shop_id: shopId,
        affiliate_store_id: affiliateStoreId,
        buyer_session_id: buyerSessionId,
        customer: {
          name: orderData.customerName,
          phone: orderData.customerPhone,
          email: orderData.customerEmail || null,
          address: {
            city: orderData.shippingAddress.city,
            district: orderData.shippingAddress.district || null,
            street: orderData.shippingAddress.street,
            building: orderData.shippingAddress.building || null,
            apartment: orderData.shippingAddress.apartment || null,
            postalCode: orderData.shippingAddress.postalCode || null,
          },
        },
      };

      if (shippingInfo) {
        payload.shipping = {
          provider_id: shippingInfo.providerId || null,
          provider_name: shippingInfo.providerName || null,
          cost_sar: shippingInfo.costSar ?? null,
        };
      }

      if (couponInfo) {
        payload.coupon = {
          id: couponInfo.id,
          code: couponInfo.code,
          discount_amount: couponInfo.discountAmount,
        };
      }

      const { data, error } = await supabase.functions.invoke('create-ecommerce-order', {
        body: payload,
      });

      if (error) {
        console.error('Edge function create-ecommerce-order error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'تعذر إنشاء الطلب');
      }

      // Best-effort customer snapshot (non-blocking)
      try {
        await this.updateStoreCustomerSimple(affiliateStoreId, orderData, undefined as unknown as number);
      } catch (error) {
        // Non-critical operation, log and continue
        console.warn('Failed to update store customer snapshot:', error);
      }

      return {
        success: true,
        orderId: data.order_id,
        orderNumber: data.order_number,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في إنشاء الطلب',
      };
    }
  },

  async updateStoreCustomerSimple(
    _storeId: string,
    _customerData: CreateOrderData,
    _orderTotal: number
  ) {
    // Customer order snapshot - يمكن تنفيذ التحديث هنا
  },

  async getStoreOrders(storeId: string, sessionId: string | null) {
    try {
      if (!sessionId) {
        return { success: true, orders: [] };
      }

      // جلب الطلبات من order_hub الموحد
      const { data: hubOrders, error: hubError } = await supabase
        .from('order_hub')
        .select('*')
        .eq('affiliate_store_id', storeId)
        .order('created_at', { ascending: false });

      if (hubError) throw hubError;

      // جلب تفاصيل كل طلب من المصدر الأصلي
      const formattedOrders = await Promise.all(
        (hubOrders || []).map(async (hubOrder) => {
          let items: any[] = [];

          // إذا كان المصدر ecommerce، جلب البيانات من ecommerce_order_items
          if (hubOrder.source === 'ecommerce' && hubOrder.source_order_id) {
            const { data: itemsData } = await supabase
              .from('ecommerce_order_items')
              .select('id, product_title, product_image_url, quantity, unit_price_sar, total_price_sar')
              .eq('order_id', hubOrder.source_order_id);
            items = itemsData || [];
          }
          // إذا كان المصدر simple، جلب البيانات من simple_order_items
          else if (hubOrder.source === 'simple' && hubOrder.source_order_id) {
            const { data: itemsData } = await supabase
              .from('simple_order_items')
              .select('id, product_title, product_image_url, quantity, unit_price_sar, total_price_sar')
              .eq('order_id', hubOrder.source_order_id);
            items = itemsData || [];
          }

          return {
            id: hubOrder.id,
            order_number: hubOrder.order_number,
            customer_name: hubOrder.customer_name,
            customer_phone: hubOrder.customer_phone,
            status: hubOrder.status,
            total_sar: hubOrder.total_amount_sar,
            created_at: hubOrder.created_at,
            items,
          };
        })
      );

      return {
        success: true,
        orders: formattedOrders,
      };
    } catch (error) {
      console.error('Error fetching store orders:', error);
      return {
        success: false,
        error: 'خطأ في جلب الطلبات',
        orders: [],
      };
    }
  },
};
