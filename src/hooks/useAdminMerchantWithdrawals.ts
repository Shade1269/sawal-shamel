import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminMerchantWithdrawal {
  id: string;
  merchant_id: string;
  amount_sar: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  payment_method: 'bank_transfer' | 'stc_pay' | 'wallet';
  bank_details?: any;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  merchant?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
}

export const useAdminMerchantWithdrawals = () => {
  const queryClient = useQueryClient();

  // Fetch all withdrawal requests
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin-merchant-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_withdrawal_requests')
        .select(`
          *,
          merchant:profiles!merchant_withdrawal_requests_merchant_id_fkey(
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as AdminMerchantWithdrawal[];
    }
  });

  // Process withdrawal (approve/reject)
  const processWithdrawal = useMutation({
    mutationFn: async ({ 
      withdrawalId, 
      status, 
      adminNotes 
    }: { 
      withdrawalId: string; 
      status: 'APPROVED' | 'COMPLETED' | 'REJECTED'; 
      adminNotes?: string 
    }) => {
      const { data, error } = await supabase.rpc('process_merchant_withdrawal', {
        p_withdrawal_id: withdrawalId,
        p_status: status,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-merchant-withdrawals'] });
      toast.success('تم معالجة طلب السحب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل معالجة طلب السحب');
    }
  });

  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'PENDING') || [];
  const approvedWithdrawals = withdrawals?.filter(w => w.status === 'APPROVED' || w.status === 'COMPLETED') || [];
  const rejectedWithdrawals = withdrawals?.filter(w => w.status === 'REJECTED') || [];

  return {
    withdrawals: withdrawals || [],
    pendingWithdrawals,
    approvedWithdrawals,
    rejectedWithdrawals,
    isLoading,
    processWithdrawal: processWithdrawal.mutate,
    isProcessing: processWithdrawal.isPending
  };
};
