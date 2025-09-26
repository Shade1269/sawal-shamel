import { supabase } from '@/integrations/supabase/client';

export interface UnifiedOrder {
  id: string;
  order_number: string;
  shop_id: string;
  affiliate_store_id?: string | null;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: any;
  status: string;
  subtotal_sar: number;
  tax_sar: number;
  shipping_sar: number;
  total_sar: number;
  payment_method: string;
  payment_status: string;
  affiliate_commission_sar?: number | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number | null;
  commission_rate: number | null;
  commission_sar: number | null;
  created_at: string;
}

export interface UnifiedOrderWithItems extends UnifiedOrder {
  items: UnifiedOrderItem[];
}

export class UnifiedOrdersService {
  static async getOrdersWithItems(params: {
    shop_id?: string;
    affiliate_store_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<UnifiedOrderWithItems[]> {
    let query = supabase
      .from('ecommerce_orders')
      .select(`
        id,
        order_number,
        shop_id,
        affiliate_store_id,
        user_id,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        status,
        subtotal_sar,
        tax_sar,
        shipping_sar,
        total_sar,
        payment_method,
        payment_status,
        affiliate_commission_sar,
        created_at,
        updated_at,
        ecommerce_order_items (
          id,
          order_id,
          product_id,
          product_title,
          quantity,
          unit_price_sar,
          total_price_sar,
          commission_rate,
          commission_sar,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (params.shop_id) {
      query = query.eq('shop_id', params.shop_id);
    }

    if (params.affiliate_store_id) {
      query = query.eq('affiliate_store_id', params.affiliate_store_id);
    }

    if (typeof params.offset === 'number' && params.limit) {
      query = query.range(params.offset, params.offset + params.limit - 1);
    } else if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ecommerce orders:', error);
      throw error;
    }

    return (data || []).map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      shop_id: order.shop_id,
      affiliate_store_id: order.affiliate_store_id,
      user_id: order.user_id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      shipping_address: order.shipping_address,
      status: order.status,
      subtotal_sar: order.subtotal_sar,
      tax_sar: order.tax_sar,
      shipping_sar: order.shipping_sar,
      total_sar: order.total_sar,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      affiliate_commission_sar: order.affiliate_commission_sar,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: (order.ecommerce_order_items || []) as UnifiedOrderItem[],
    }));
  }

  static async getOrders(params: {
    shop_id?: string;
    affiliate_store_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<UnifiedOrder[]> {
    let query = supabase
      .from('ecommerce_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.shop_id) {
      query = query.eq('shop_id', params.shop_id);
    }

    if (params.affiliate_store_id) {
      query = query.eq('affiliate_store_id', params.affiliate_store_id);
    }

    if (typeof params.offset === 'number' && params.limit) {
      query = query.range(params.offset, params.offset + params.limit - 1);
    } else if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ecommerce orders list:', error);
      throw error;
    }

    return (data || []) as UnifiedOrder[];
  }

  static async updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
    const { error } = await supabase
      .from('ecommerce_orders')
      .update({ status: newStatus as any })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating ecommerce order status:', error);
      throw error;
    }

    return true;
  }

  static async createOrder(orderData: {
    shop_id: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: any;
    subtotal_sar: number;
    tax_sar?: number;
    shipping_sar?: number;
    total_sar: number;
    payment_method: string;
    affiliate_store_id?: string;
    affiliate_commission_sar?: number;
    customer_email?: string | null;
    payment_status?: string;
    status?: string;
    order_number: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .insert({
        order_number: orderData.order_number,
        shipping_address: orderData.shipping_address,
        subtotal_sar: orderData.subtotal_sar,
        tax_sar: orderData.tax_sar || 0,
        shipping_sar: orderData.shipping_sar || 0,
        total_sar: orderData.total_sar,
        payment_method: orderData.payment_method as any,
        payment_status: orderData.payment_status || 'PENDING',
        status: orderData.status || 'PENDING',
        affiliate_commission_sar: orderData.affiliate_commission_sar || null,
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating ecommerce order:', error);
      throw error;
    }

    return data.id;
  }

  static async createOrderItems(orderId: string, items: {
    product_id: string;
    product_title: string;
    quantity: number;
    unit_price_sar: number;
    total_price_sar?: number;
    commission_rate?: number;
    commission_sar?: number;
  }[]): Promise<void> {
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      product_title: item.product_title,
      quantity: item.quantity,
      unit_price_sar: item.unit_price_sar,
      total_price_sar: item.total_price_sar ?? item.unit_price_sar * item.quantity,
      commission_rate: item.commission_rate ?? null,
      commission_sar: item.commission_sar ?? null,
    }));

    const { error } = await supabase
      .from('ecommerce_order_items')
      .insert(orderItems);

    if (error) {
      console.error('Error creating ecommerce order items:', error);
      throw error;
    }
  }

  static async getOrdersStats(shopId?: string, affiliateStoreId?: string) {
    let query = supabase
      .from('ecommerce_orders')
      .select('total_sar, status, created_at');

    if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    if (affiliateStoreId) {
      query = query.eq('affiliate_store_id', affiliateStoreId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching ecommerce order stats:', error);
      throw error;
    }

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_sar || 0), 0) || 0;
    const confirmedOrders = orders?.filter(order =>
      ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
    ).length || 0;
    const pendingOrders = orders?.filter(order => order.status === 'PENDING').length || 0;

    return {
      totalOrders,
      totalRevenue,
      confirmedOrders,
      pendingOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }
}
