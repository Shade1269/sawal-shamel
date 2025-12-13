import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MerchantWalletBalance {
  id: string;
  merchant_id: string;
  available_balance_sar: number;
  pending_balance_sar: number;
  lifetime_earnings_sar: number;
  total_withdrawn_sar: number;
  minimum_withdrawal_sar: number;
  created_at: string;
  updated_at: string;
}

export interface MerchantTransaction {
  id: string;
  merchant_id: string;
  transaction_type: 'COMMISSION_PENDING' | 'COMMISSION_CONFIRMED' | 'WITHDRAWAL_PENDING' | 'WITHDRAWAL_COMPLETED' | 'WITHDRAWAL_REJECTED' | 'REFUND' | 'ADJUSTMENT';
  amount_sar: number;
  balance_after_sar: number;
  reference_id?: string;
  reference_type?: string;
  description?: string;
  created_at: string;
}

export const useMerchantWallet = () => {
  const queryClient = useQueryClient();

  // Fetch merchant wallet balance
  const { data: balance, isLoading: isLoadingBalance, error: balanceError } = useQuery({
    queryKey: ['merchant-wallet-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get profile ID first
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

      // Get or create wallet using merchant.id
      let { data: wallet, error } = await supabase
        .from('merchant_wallet_balances')
        .select('*')
        .eq('merchant_id', merchant.id)
        .maybeSingle();

      // If wallet doesn't exist, create it
      if (!wallet) {
        const { data: newWallet, error: createError } = await supabase
          .from('merchant_wallet_balances')
          .insert({
            merchant_id: merchant.id,
            available_balance_sar: 0,
            pending_balance_sar: 0,
            lifetime_earnings_sar: 0,
            total_withdrawn_sar: 0,
            minimum_withdrawal_sar: 100
          })
          .select()
          .single();

        if (createError) throw createError;
        wallet = newWallet;
      } else if (error) {
        throw error;
      }

      return wallet as MerchantWalletBalance;
    }
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['merchant-transactions'],
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
        .from('merchant_transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as MerchantTransaction[];
    }
  });

  const refreshWallet = () => {
    queryClient.invalidateQueries({ queryKey: ['merchant-wallet-balance'] });
    queryClient.invalidateQueries({ queryKey: ['merchant-transactions'] });
  };

  const canWithdraw = balance 
    ? balance.available_balance_sar >= balance.minimum_withdrawal_sar 
    : false;

  return {
    balance,
    transactions: transactions || [],
    isLoading: isLoadingBalance || isLoadingTransactions,
    error: balanceError,
    canWithdraw,
    refreshWallet
  };
};
