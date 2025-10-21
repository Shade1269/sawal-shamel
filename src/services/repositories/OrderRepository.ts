import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type OrderHub = Database['public']['Tables']['order_hub']['Row'];
type OrderHubInsert = Database['public']['Tables']['order_hub']['Insert'];

export interface UnifiedOrder {
  id: string;
  orderNumber: string;
  source: 'ecommerce' | 'simple' | 'manual';
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  affiliateStoreId: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export class OrderRepository {
  /**
   * Get unified orders for a specific store
   */
  static async getStoreOrders(storeId: string, limit = 50): Promise<UnifiedOrder[]> {
    const { data, error } = await supabase
      .rpc('get_unified_store_orders', {
        p_store_id: storeId,
        p_limit: limit
      });

    if (error) throw error;
    return data.map(this.mapToUnifiedOrder);
  }

  /**
   * Get unified order statistics
   */
  static async getOrderStats(storeId: string) {
    const { data, error } = await supabase
      .rpc('get_unified_order_stats', {
        p_store_id: storeId
      });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * Get a single order by ID from order_hub
   */
  static async getOrderById(orderId: string): Promise<OrderHub | null> {
    const { data, error } = await supabase
      .from('order_hub')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Check order synchronization quality
   */
  static async checkSyncQuality() {
    const { data, error } = await supabase
      .rpc('check_order_hub_sync_quality');

    if (error) throw error;
    return data;
  }

  /**
   * Create a new order in order_hub
   */
  static async createOrder(order: OrderHubInsert): Promise<OrderHub> {
    const { data, error } = await supabase
      .from('order_hub')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string, 
    status: string, 
    paymentStatus?: string
  ): Promise<OrderHub> {
    const updates: Partial<OrderHub> = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from('order_hub')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Map database row to UnifiedOrder
   */
  private static mapToUnifiedOrder(row: any): UnifiedOrder {
    return {
      id: row.order_id,
      orderNumber: row.order_number,
      source: row.source,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      totalAmount: parseFloat(row.total_amount_sar),
      status: row.status,
      paymentStatus: row.payment_status,
      affiliateStoreId: row.affiliate_store_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: row.items || []
    };
  }
}
