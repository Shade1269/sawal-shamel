import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OrderHub = Database['public']['Tables']['order_hub']['Row'];
type OrderHubInsert = Database['public']['Tables']['order_hub']['Insert'];

export interface UnifiedOrderFilters {
  source?: 'ecommerce' | 'simple' | 'manual';
  status?: string;
  paymentStatus?: string;
  storeId?: string;
  affiliateStoreId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export class UnifiedOrdersService {
  /**
   * Fetch unified orders from order_hub
   */
  static async fetchOrders(filters?: UnifiedOrderFilters) {
    let query = supabase
      .from('order_hub')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.source) query = query.eq('source', filters.source);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
      if (filters.storeId) query = query.eq('shop_id', filters.storeId);
      if (filters.affiliateStoreId) query = query.eq('affiliate_store_id', filters.affiliateStoreId);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
      if (filters.searchQuery) {
        query = query.or(`customer_name.ilike.%${filters.searchQuery}%,customer_phone.ilike.%${filters.searchQuery}%,order_number.ilike.%${filters.searchQuery}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as OrderHub[];
  }

  /**
   * Get single order by ID
   */
  static async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('order_hub')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as OrderHub;
  }

  /**
   * Get orders for specific store
   */
  static async getStoreOrders(storeId: string, affiliateStoreId?: string) {
    let query = supabase
      .from('order_hub')
      .select('*')
      .order('created_at', { ascending: false });

    if (affiliateStoreId) {
      query = query.eq('affiliate_store_id', affiliateStoreId);
    } else {
      query = query.eq('shop_id', storeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as OrderHub[];
  }

  /**
   * Get order statistics for a store
   */
  static async getStoreStats(storeId?: string, affiliateStoreId?: string) {
    let query = supabase
      .from('order_hub')
      .select('status, total_amount_sar, payment_status');

    if (affiliateStoreId) {
      query = query.eq('affiliate_store_id', affiliateStoreId);
    } else if (storeId) {
      query = query.eq('shop_id', storeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Stats fetch error:', error);
      return null;
    }

    // Calculate stats from data
    const totalOrders = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + (Number(order.total_amount_sar) || 0), 0);
    const confirmedOrders = data.filter(o => o.status === 'confirmed' || o.status === 'completed').length;
    const pendingOrders = data.filter(o => o.status === 'pending').length;
    
    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      confirmed_orders: confirmedOrders,
      pending_orders: pendingOrders,
      average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }

  /**
   * Get order with related data (returns, refunds, shipments)
   */
  static async getOrderWithRelations(orderId: string) {
    const [order, returns, refunds, shipments] = await Promise.all([
      this.getOrderById(orderId),
      this.getOrderReturns(orderId),
      this.getOrderRefunds(orderId),
      this.getOrderShipments(orderId),
    ]);

    return {
      order,
      returns,
      refunds,
      shipments,
    };
  }

  /**
   * Get returns for an order
   */
  static async getOrderReturns(orderId: string) {
    const { data, error } = await supabase
      .from('product_returns')
      .select('*')
      .eq('order_hub_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get refunds for an order
   */
  static async getOrderRefunds(orderId: string) {
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('order_hub_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get shipments for an order
   */
  static async getOrderShipments(orderId: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_hub_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('order_hub')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const { data, error } = await supabase
      .from('order_hub')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get monthly sales data
   */
  static async getMonthlySales(storeId?: string, affiliateStoreId?: string, months: number = 6) {
    let query = supabase
      .from('order_hub')
      .select('created_at, total_amount_sar')
      .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (affiliateStoreId) {
      query = query.eq('affiliate_store_id', affiliateStoreId);
    } else if (storeId) {
      query = query.eq('shop_id', storeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Group by month
    const monthlyData = data.reduce((acc: any, order) => {
      const month = new Date(order.created_at).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = 0;
      acc[month] += Number(order.total_amount_sar);
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total,
    }));
  }
}
