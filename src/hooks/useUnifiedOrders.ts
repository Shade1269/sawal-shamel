import { useState, useEffect } from 'react';
import { UnifiedOrdersService, UnifiedOrderFilters } from '@/services/UnifiedOrdersService';
import type { Database } from '@/integrations/supabase/types';

type OrderHub = Database['public']['Tables']['order_hub']['Row'];

export const useUnifiedOrders = (filters?: UnifiedOrderFilters) => {
  const [orders, setOrders] = useState<OrderHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await UnifiedOrdersService.fetchOrders(filters);
      setOrders(ordersData);
    } catch (err: any) {
      console.error('Error fetching unified orders:', err);
      setError(err.message || 'خطأ في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const success = await UnifiedOrdersService.updateOrderStatus(orderId, newStatus);
      if (success) {
        // تحديث الطلب محلياً
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'خطأ في تحديث حالة الطلب');
      return false;
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [filters?.storeId, filters?.affiliateStoreId, filters?.source, filters?.status]);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refreshOrders,
    fetchOrders
  };
};

export const useUnifiedOrdersStats = (shopId?: string, affiliateStoreId?: string) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    confirmedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await UnifiedOrdersService.getStoreStats(shopId, affiliateStoreId);
        if (statsData) {
          setStats({
            totalOrders: statsData.total_orders,
            totalRevenue: statsData.total_revenue,
            confirmedOrders: statsData.confirmed_orders,
            pendingOrders: statsData.pending_orders,
            averageOrderValue: statsData.average_order_value
          });
        }
      } catch (error) {
        console.error('Error fetching orders stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shopId, affiliateStoreId]);

  return { stats, loading };
};