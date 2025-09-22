import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];
type PaymentStatus = Database['public']['Enums']['payment_status'];
type OrderStatus = Database['public']['Enums']['order_status'];

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

const PAYMENT_METHOD_COD: PaymentMethod = 'CASH_ON_DELIVERY';
const PAYMENT_STATUS_PENDING: PaymentStatus = 'PENDING';
const ORDER_STATUS_PENDING: OrderStatus = 'PENDING';

const generateOrderNumber = () =>
  `EC-${Date.now()}-${Math.random().toString(36).slice(-6).toUpperCase()}`;

export const storeOrderService = {
  async createOrderFromCart(
    cartId: string,
    storeId: string,
    orderData: CreateOrderData
  ) {
    try {
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          unit_price_sar,
          total_price_sar,
          products!inner (
            id,
            title,
            image_urls
          )
        `)
        .eq('cart_id', cartId);

      if (cartError) throw cartError;
      if (!cartItems || cartItems.length === 0) {
        throw new Error('السلة فارغة');
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.total_price_sar, 0);
      const shipping = 25;
      const tax = 0;
      const total = subtotal + shipping + tax;

      const sessionId = localStorage.getItem(`store_session_${storeId}`);
      const orderNumber = generateOrderNumber();

      const { data: order, error: orderError } = await supabase
        .from('ecommerce_orders')
        .insert({
          shop_id: storeId,
          affiliate_store_id: storeId,
          buyer_session_id: sessionId,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_email: orderData.customerEmail || null,
          shipping_address: {
            ...orderData.shippingAddress,
            phone: orderData.customerPhone,
          },
          subtotal_sar: subtotal,
          shipping_sar: shipping,
          tax_sar: tax,
          total_sar: total,
          payment_method: PAYMENT_METHOD_COD,
          payment_status: PAYMENT_STATUS_PENDING,
          status: ORDER_STATUS_PENDING,
          order_number: orderNumber,
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_title: (item.products as any)?.title || 'منتج',
        product_image_url: (item.products as any)?.image_urls?.[0] || null,
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        total_price_sar: item.total_price_sar,
      }));

      const { error: itemsError } = await supabase
        .from('ecommerce_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase
        .from('ecommerce_payment_transactions')
        .insert({
          order_id: order.id,
          transaction_id: `COD-${order.id.slice(-6)}`,
          payment_method: PAYMENT_METHOD_COD,
          payment_status: PAYMENT_STATUS_PENDING,
          amount_sar: total,
          currency: 'SAR',
          gateway_name: 'Cash on Delivery',
        });

      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      await this.updateStoreCustomerSimple(storeId, orderData, total);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number || orderNumber,
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
    storeId: string,
    customerData: CreateOrderData,
    orderTotal: number
  ) {
    try {
      console.log('Customer order snapshot:', {
        storeId,
        phone: customerData.customerPhone,
        name: customerData.customerName,
        total: orderTotal,
      });
    } catch (error) {
      console.error('Error updating store customer snapshot:', error);
    }
  },

  async getStoreOrders(storeId: string, sessionId: string | null) {
    try {
      if (!sessionId) {
        return { success: true, orders: [] };
      }

      const { data: orders, error } = await supabase
        .from('ecommerce_orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          status,
          total_sar,
          created_at,
          ecommerce_order_items (
            id,
            product_title,
            product_image_url,
            quantity,
            unit_price_sar,
            total_price_sar
          )
        `)
        .eq('affiliate_store_id', storeId)
        .eq('buyer_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = (orders || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        status: order.status,
        total_sar: order.total_sar,
        created_at: order.created_at,
        items: order.ecommerce_order_items || [],
      }));

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
