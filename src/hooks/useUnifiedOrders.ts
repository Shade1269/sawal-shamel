import { useState, useEffect } from 'react';
import { UnifiedOrdersService, UnifiedOrderWithItems, UnifiedOrder } from '@/lib/unifiedOrdersService';

export interface UseUnifiedOrdersParams {
  shopId?: string;
  affiliateStoreId?: string;
  limit?: number;
  offset?: number;
  autoRefresh?: boolean;
}

export const useUnifiedOrders = (params: UseUnifiedOrdersParams = {}) => {
  const [orders, setOrders] = useState<UnifiedOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await UnifiedOrdersService.getOrdersWithItems(params);
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
  }, [params.shopId, params.affiliateStoreId, params.limit, params.offset]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (params.autoRefresh) {
      const interval = setInterval(() => {
        fetchOrders();
      }, 30000); // كل 30 ثانية

      return () => clearInterval(interval);
    }
  }, [params.autoRefresh]);

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
        const statsData = await UnifiedOrdersService.getOrdersStats(shopId, affiliateStoreId);
        setStats(statsData);
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