import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminWithdrawalStats {
  totalPending: number;
  totalApproved: number;
  totalCompleted: number;
  totalRejected: number;
  pendingAmount: number;
  completedAmount: number;
}

interface ProcessWithdrawalData {
  withdrawalId: string;
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED';
  adminNotes?: string;
}

export const useAdminWithdrawals = () => {
  const queryClient = useQueryClient();

  // Fetch all withdrawal requests
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          affiliate:affiliate_profile_id(
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Calculate statistics
  const stats: AdminWithdrawalStats = {
    totalPending: withdrawals?.filter(w => w.status === 'PENDING').length || 0,
    totalApproved: withdrawals?.filter(w => w.status === 'APPROVED').length || 0,
    totalCompleted: withdrawals?.filter(w => w.status === 'COMPLETED').length || 0,
    totalRejected: withdrawals?.filter(w => w.status === 'REJECTED').length || 0,
    pendingAmount: withdrawals?.filter(w => w.status === 'PENDING')
      .reduce((sum, w) => sum + Number(w.amount_sar), 0) || 0,
    completedAmount: withdrawals?.filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + Number(w.amount_sar), 0) || 0,
  };

  // Process withdrawal request mutation
  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, status, adminNotes }: ProcessWithdrawalData) => {
      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_withdrawal_id: withdrawalId,
        p_status: status,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('تم تحديث حالة الطلب بنجاح');
    },
    onError: (error: any) => {
      toast.error('فشل تحديث الطلب', {
        description: error.message
      });
    }
  });

  return {
    withdrawals: withdrawals || [],
    stats,
    isLoading,
    processWithdrawal: processWithdrawalMutation.mutate,
    isProcessing: processWithdrawalMutation.isPending
  };
};
