import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderRepository } from '@/services/repositories';
import { toast } from 'sonner';

export function useOrderRepository(storeId?: string) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', storeId],
    queryFn: () => storeId ? OrderRepository.getStoreOrders(storeId) : Promise.resolve([]),
    enabled: !!storeId,
  });

  const statsQuery = useQuery({
    queryKey: ['order-stats', storeId],
    queryFn: () => storeId ? OrderRepository.getOrderStats(storeId) : Promise.resolve(null),
    enabled: !!storeId,
  });

  const syncQualityQuery = useQuery({
    queryKey: ['order-sync-quality'],
    queryFn: () => OrderRepository.checkSyncQuality(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, paymentStatus }: { 
      orderId: string; 
      status: string; 
      paymentStatus?: string;
    }) => OrderRepository.updateOrderStatus(orderId, status, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast.success('تم تحديث حالة الطلب بنجاح');
    },
    onError: (error) => {
      toast.error('فشل تحديث حالة الطلب');
      console.error('Order status update error:', error);
    },
  });

  return {
    orders: ordersQuery.data || [],
    stats: statsQuery.data,
    syncQuality: syncQualityQuery.data,
    isLoading: ordersQuery.isLoading || statsQuery.isLoading,
    isError: ordersQuery.isError || statsQuery.isError,
    error: ordersQuery.error || statsQuery.error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    refetch: () => {
      ordersQuery.refetch();
      statsQuery.refetch();
    },
  };
}
