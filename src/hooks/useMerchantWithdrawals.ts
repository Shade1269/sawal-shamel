import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MerchantWithdrawalRequest {
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
}

export interface CreateMerchantWithdrawalData {
  amount_sar: number;
  payment_method: 'bank_transfer' | 'stc_pay' | 'wallet';
  bank_details?: any;
}

export const useMerchantWithdrawals = () => {
  const queryClient = useQueryClient();

  // Fetch withdrawal requests
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['merchant-withdrawals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Get merchant ID from merchants table
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!merchant) return [];

      const { data, error } = await supabase
        .from('merchant_withdrawal_requests')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as MerchantWithdrawalRequest[];
    }
  });

  // Create withdrawal request
  const createWithdrawal = useMutation({
    mutationFn: async (withdrawalData: CreateMerchantWithdrawalData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Get merchant ID from merchants table
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!merchant) throw new Error('Merchant not found');

      const { data, error } = await supabase
        .from('merchant_withdrawal_requests')
        .insert({
          merchant_id: merchant.id,
          ...withdrawalData,
          status: 'PENDING'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-wallet-balance'] });
      toast.success('تم إرسال طلب السحب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إنشاء طلب السحب');
    }
  });

  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'PENDING') || [];
  const completedWithdrawals = withdrawals?.filter(w => w.status === 'COMPLETED') || [];
  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount_sar, 0);
  const totalCompleted = completedWithdrawals.reduce((sum, w) => sum + w.amount_sar, 0);

  return {
    withdrawals: withdrawals || [],
    pendingWithdrawals,
    completedWithdrawals,
    totalPending,
    totalCompleted,
    isLoading,
    createWithdrawal: createWithdrawal.mutate,
    isCreating: createWithdrawal.isPending
  };
};
