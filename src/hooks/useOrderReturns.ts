import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface OrderReturn {
  id: string;
  order_id: string;
  customer_id: string | null;
  affiliate_id: string | null;
  return_reason: string;
  return_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  returned_items: any;
  refund_amount_sar: number | null;
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  source_table: string;
}

interface CreateReturnData {
  order_id: string;
  return_reason: string;
  returned_items: any;
  refund_amount_sar: number;
}

interface ProcessReturnData {
  returnId: string;
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED';
  adminNotes?: string;
}

export const useOrderReturns = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Fetch returns for customer
  const { data: returns, isLoading } = useQuery({
    queryKey: ['order-returns', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('order_returns')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderReturn[];
    },
    enabled: !!user
  });

  // Create return request
  const createReturnMutation = useMutation({
    mutationFn: async (data: CreateReturnData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: returnRequest, error } = await supabase
        .from('order_returns')
        .insert({
          order_id: data.order_id,
          customer_id: user.id,
          return_reason: data.return_reason,
          returned_items: data.returned_items,
          refund_amount_sar: data.refund_amount_sar,
          return_status: 'PENDING',
          source_table: 'customer_orders'
        })
        .select()
        .single();

      if (error) throw error;
      return returnRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-returns', user?.id] });
      toast.success('تم إرسال طلب الإرجاع بنجاح', {
        description: 'سيتم مراجعة طلبك في أقرب وقت'
      });
    },
    onError: (error: any) => {
      toast.error('فشل إرسال طلب الإرجاع', {
        description: error.message
      });
    }
  });

  return {
    returns: returns || [],
    isLoading,
    createReturn: createReturnMutation.mutate,
    isCreating: createReturnMutation.isPending
  };
};

// Admin hook
export const useAdminOrderReturns = () => {
  const queryClient = useQueryClient();

  // Fetch all returns
  const { data: returns, isLoading } = useQuery({
    queryKey: ['admin-order-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Process return
  const processReturnMutation = useMutation({
    mutationFn: async ({ returnId, status, adminNotes }: ProcessReturnData) => {
      const updateData: any = {
        return_status: status,
        notes: adminNotes || null,
        processed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('order_returns')
        .update(updateData)
        .eq('id', returnId)
        .select()
        .single();

      if (error) throw error;

      // If approved, trigger commission adjustment
      if (status === 'APPROVED') {
        const returnData = returns?.find(r => r.id === returnId);
        if (returnData?.affiliate_id && returnData?.refund_amount_sar) {
          // Record refund transaction
          await supabase.rpc('record_wallet_transaction', {
            p_affiliate_id: returnData.affiliate_id,
            p_transaction_type: 'REFUND',
            p_amount_sar: -Math.abs(Number(returnData.refund_amount_sar)),
            p_reference_id: returnId,
            p_reference_type: 'order_return',
            p_description: `استرجاع عمولة - إرجاع طلب`
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-returns'] });
      toast.success('تم تحديث حالة الإرجاع بنجاح');
    },
    onError: (error: any) => {
      toast.error('فشل تحديث الإرجاع', {
        description: error.message
      });
    }
  });

  const stats = {
    totalPending: returns?.filter(r => r.return_status === 'PENDING').length || 0,
    totalApproved: returns?.filter(r => r.return_status === 'APPROVED').length || 0,
    totalRejected: returns?.filter(r => r.return_status === 'REJECTED').length || 0,
    totalCompleted: returns?.filter(r => r.return_status === 'COMPLETED').length || 0,
  };

  return {
    returns: returns || [],
    stats,
    isLoading,
    processReturn: processReturnMutation.mutate,
    isProcessing: processReturnMutation.isPending
  };
};
