import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface WithdrawalRequest {
  id: string;
  affiliate_profile_id: string;
  amount_sar: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  payment_method: 'BANK_TRANSFER' | 'WALLET' | 'CASH';
  bank_details: any;
  notes: string | null;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateWithdrawalData {
  amount_sar: number;
  payment_method: 'BANK_TRANSFER' | 'WALLET' | 'CASH';
  bank_details?: {
    bank_name?: string;
    account_holder?: string;
    iban?: string;
    account_number?: string;
  };
  notes?: string;
}

export const useWithdrawals = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Fetch withdrawal requests
  const { data: withdrawals, isLoading, error } = useQuery({
    queryKey: ['withdrawal-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First, get the profile ID from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData?.id) return [];

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('affiliate_profile_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!user
  });

  // Create withdrawal request mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: CreateWithdrawalData) => {
      if (!user) throw new Error('User not authenticated');

      // First, get the profile ID from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData?.id) throw new Error('Profile not found');

      const { data: withdrawal, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          affiliate_profile_id: profileData.id,
          amount_sar: data.amount_sar,
          payment_method: data.payment_method,
          bank_details: data.bank_details || null,
          notes: data.notes || null
        })
        .select()
        .single();

      if (error) throw error;
      return withdrawal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', user?.id] });
      toast.success('تم إرسال طلب السحب بنجاح', {
        description: 'سيتم مراجعة طلبك في أقرب وقت'
      });
    },
    onError: (error: any) => {
      toast.error('فشل إرسال طلب السحب', {
        description: error.message || 'حدث خطأ أثناء إرسال الطلب'
      });
    }
  });

  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'PENDING') || [];
  const completedWithdrawals = withdrawals?.filter(w => w.status === 'COMPLETED') || [];
  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount_sar), 0);
  const totalCompleted = completedWithdrawals.reduce((sum, w) => sum + Number(w.amount_sar), 0);

  return {
    withdrawals: withdrawals || [],
    pendingWithdrawals,
    completedWithdrawals,
    totalPending,
    totalCompleted,
    isLoading,
    error,
    createWithdrawal: createWithdrawalMutation.mutate,
    isCreating: createWithdrawalMutation.isPending
  };
};
