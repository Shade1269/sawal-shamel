import { supabase } from '@/integrations/supabase/client';

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

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productTitle: string;
  productImageUrl?: string;
}

export const storeOrderService = {
  async createOrderFromCart(
    cartId: string, 
    storeId: string, 
    orderData: CreateOrderData
  ) {
    try {
      // Get cart items
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

      // Calculate total
      const subtotal = cartItems.reduce((sum, item) => sum + item.total_price_sar, 0);
      const shipping = 25; // Default shipping
      const total = subtotal + shipping;

      // Get session ID for tracking
      const sessionId = localStorage.getItem(`store_session_${storeId}`);

      // Create simple order first (simpler structure)
      const { data: order, error: orderError } = await supabase
        .from('simple_orders')
        .insert({
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_email: orderData.customerEmail,
          shipping_address: orderData.shippingAddress,
          total_amount_sar: total,
          affiliate_store_id: storeId,
          session_id: sessionId,
          order_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_title: (item.products as any)?.title || 'منتج',
        product_image_url: (item.products as any)?.image_urls?.[0],
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        total_price_sar: item.total_price_sar
      }));

      const { error: itemsError } = await supabase
        .from('simple_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      // Update store customer tracking (simplified)
      await this.updateStoreCustomerSimple(storeId, orderData, total);

      return {
        success: true,
        orderId: order.id,
        orderNumber: `ORD-${order.id.slice(-8)}`
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في إنشاء الطلب'
      };
    }
  },

  async updateStoreCustomerSimple(
    storeId: string, 
    customerData: CreateOrderData, 
    orderTotal: number
  ) {
    try {
      // This is a simplified version - we'll track customers in a simple way
      // For now, we'll just log the customer interaction
      console.log('Customer order:', {
        storeId,
        phone: customerData.customerPhone,
        name: customerData.customerName,
        total: orderTotal
      });
    } catch (error) {
      console.error('Error updating store customer:', error);
    }
  },

  async getStoreOrders(storeId: string, sessionId: string) {
    try {
      const { data: orders, error } = await supabase
        .from('simple_orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          order_status,
          total_amount_sar,
          created_at,
          simple_order_items (
            id,
            product_title,
            product_image_url,
            quantity,
            unit_price_sar,
            total_price_sar
          )
        `)
        .eq('affiliate_store_id', storeId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        orders: orders || []
      };
    } catch (error) {
      console.error('Error fetching store orders:', error);
      return {
        success: false,
        error: 'خطأ في جلب الطلبات',
        orders: []
      };
    }
  }
};