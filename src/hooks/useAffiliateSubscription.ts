import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface AffiliateSubscription {
  id: string;
  profile_id: string;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  subscription_amount: number;
  start_date: string | null;
  end_date: string | null;
  payment_transaction_id: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export const useAffiliateSubscription = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['affiliate-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('affiliate_subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AffiliateSubscription | null;
    },
    enabled: !!user
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ transactionId, paymentMethod }: { transactionId: string; paymentMethod: string }) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Subscription for 1 month

      const { data, error } = await supabase
        .from('affiliate_subscriptions')
        .insert({
          profile_id: profile.id,
          status: 'active',
          subscription_amount: 1.00,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          payment_transaction_id: transactionId,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-subscription'] });
      toast({
        title: "تم تفعيل الاشتراك",
        description: "تم تفعيل اشتراكك في المنصة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تفعيل الاشتراك",
        description: error.message || "حدث خطأ أثناء تفعيل الاشتراك",
        variant: "destructive",
      });
    }
  });

  return {
    subscription,
    isLoading,
    error,
    createSubscription: createSubscriptionMutation.mutate,
    isCreating: createSubscriptionMutation.isPending,
  };
};
