import { supabase } from '@/integrations/supabase/client';

/**
 * Unified Orders Service
 * طبقة موحدة لإدارة الطلبات من جميع الجداول (orders, ecommerce_orders, simple_orders)
 */

export interface UnifiedOrder {
  source_table: string;
  id: string;
  order_number?: string;
  shop_id?: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: any;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: string;
  affiliate_store_id?: string;
  affiliate_commission_sar: number;
  created_at: string;
  updated_at: string;
}

export interface UnifiedOrderItem {
  source_table: string;
  id: string;
  order_id: string;
  product_id: string;
  merchant_id?: string;
  product_title: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
  commission_rate: number;
  commission_sar: number;
  created_at: string;
}

export interface UnifiedOrderWithItems extends UnifiedOrder {
  items: UnifiedOrderItem[];
}

export class UnifiedOrdersService {
  /**
   * جلب الطلبات الموحدة مع العناصر
   */
  static async getOrdersWithItems(params: {
    shop_id?: string;
    affiliate_store_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<UnifiedOrderWithItems[]> {
    try {
      const { data, error } = await supabase.rpc('get_unified_orders_with_items', {
        p_shop_id: params.shop_id || null,
        p_affiliate_store_id: params.affiliate_store_id || null,
        p_limit: params.limit || 50,
        p_offset: params.offset || 0
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        source_table: row.source_table,
        id: row.order_id,
        order_number: row.order_number,
        customer_name: row.customer_name,
        customer_phone: row.customer_phone,
        status: row.status,
        total: row.total,
        created_at: row.created_at,
        items: Array.isArray(row.items) ? row.items : [],
        // Add default values for other fields
        shop_id: params.shop_id,
        user_id: '',
        customer_email: '',
        shipping_address: {},
        subtotal: row.total || 0,
        tax: 0,
        shipping: 0,
        payment_method: '',
        payment_status: 'PENDING',
        affiliate_store_id: params.affiliate_store_id,
        affiliate_commission_sar: 0,
        updated_at: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching unified orders:', error);
      throw error;
    }
  }

  /**
   * جلب الطلبات من View الموحد
   */
  static async getOrders(params: {
    shop_id?: string;
    affiliate_store_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<UnifiedOrder[]> {
    try {
      let query = supabase
        .from('v_orders_unified')
        .select('*')
        .order('created_at', { ascending: false });

      if (params.shop_id) {
        query = query.eq('shop_id', params.shop_id);
      }

      if (params.affiliate_store_id) {
        query = query.eq('affiliate_store_id', params.affiliate_store_id);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unified orders:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة الطلب عبر كل الجداول
   */
  static async updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_unified_order_status', {
        p_order_id: orderId,
        p_new_status: newStatus
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * إنشاء طلب جديد في الجدول الأساسي (orders)
   */
  static async createOrder(orderData: {
    shop_id: string;
    customer_name: string;
    customer_phone: string;
    customer_profile_id?: string;
    shipping_address: any;
    subtotal_sar: number;
    tax_sar?: number;
    shipping_sar?: number;
    total_sar: number;
    payment_method: string;
    affiliate_store_id?: string;
    affiliate_commission_sar?: number;
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          shop_id: orderData.shop_id,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_profile_id: orderData.customer_profile_id,
          shipping_address: orderData.shipping_address,
          subtotal_sar: orderData.subtotal_sar,
          vat_sar: orderData.tax_sar || 0,
          shipping_sar: orderData.shipping_sar || 0,
          total_sar: orderData.total_sar,
          payment_method: orderData.payment_method,
          affiliate_store_id: orderData.affiliate_store_id,
          affiliate_commission_sar: orderData.affiliate_commission_sar || 0,
          status: 'PENDING'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * إضافة عناصر الطلب
   */
  static async createOrderItems(orderId: string, items: {
    product_id: string;
    merchant_id: string;
    title_snapshot: string;
    quantity: number;
    unit_price_sar: number;
    line_total_sar: number;
    commission_rate?: number;
  }[]): Promise<void> {
    try {
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        merchant_id: item.merchant_id,
        title_snapshot: item.title_snapshot,
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        line_total_sar: item.line_total_sar,
        commission_rate: item.commission_rate || 0
      }));

      const { error } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating order items:', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات الطلبات لمتجر معين
   */
  static async getOrdersStats(shopId?: string, affiliateStoreId?: string) {
    try {
      let query = supabase.from('v_orders_unified').select('*');

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      if (affiliateStoreId) {
        query = query.eq('affiliate_store_id', affiliateStoreId);
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const confirmedOrders = orders?.filter(order => 
        ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
      ).length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'PENDING').length || 0;

      return {
        totalOrders,
        totalRevenue,
        confirmedOrders,
        pendingOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      };
    } catch (error) {
      console.error('Error fetching orders stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        confirmedOrders: 0,
        pendingOrders: 0,
        averageOrderValue: 0
      };
    }
  }
}