import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface WalletBalance {
  id: string;
  affiliate_profile_id: string;
  available_balance_sar: number;
  pending_balance_sar: number;
  lifetime_earnings_sar: number;
  total_withdrawn_sar: number;
  minimum_withdrawal_sar: number;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  affiliate_profile_id: string;
  transaction_type: 'COMMISSION' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'REFUND';
  amount_sar: number;
  balance_after_sar: number;
  reference_id: string | null;
  reference_type: 'commission' | 'withdrawal' | 'order' | 'manual' | null;
  description: string | null;
  metadata: any;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('affiliate_profile_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no wallet exists, create one
      if (!data) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallet_balances')
          .insert({
            affiliate_profile_id: profile.id,
            available_balance_sar: 0,
            pending_balance_sar: 0,
            lifetime_earnings_sar: 0,
            total_withdrawn_sar: 0,
            minimum_withdrawal_sar: 100
          })
          .select()
          .single();

        if (createError) throw createError;
        return newWallet as WalletBalance;
      }

      return data as WalletBalance;
    },
    enabled: !!user
  });

  // Fetch wallet transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('affiliate_profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!user
  });

  const refreshWallet = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet-balance', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] });
  };

  return {
    balance,
    transactions: transactions || [],
    isLoading: balanceLoading || transactionsLoading,
    error: balanceError,
    refreshWallet,
    canWithdraw: balance ? balance.available_balance_sar >= balance.minimum_withdrawal_sar : false
  };
};
