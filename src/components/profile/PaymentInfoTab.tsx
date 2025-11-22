import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedCard } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedInput } from '@/components/design-system';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CreditCard, Smartphone, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentInfo {
  id: string;
  profile_id: string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  iban: string | null;
  stc_pay_number: string | null;
  wallet_number: string | null;
  preferred_payment_method: string;
}

export const PaymentInfoTab: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [preferredMethod, setPreferredMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [stcPayNumber, setStcPayNumber] = useState('');
  const [walletNumber, setWalletNumber] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: paymentInfo, isLoading } = useQuery({
    queryKey: ['payment-info', profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      const { data, error } = await supabase
        .from('affiliate_payment_info')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (error) throw error;
      return data as PaymentInfo | null;
    },
    enabled: !!profile
  });

  React.useEffect(() => {
    if (paymentInfo) {
      setPreferredMethod(paymentInfo.preferred_payment_method || 'bank_transfer');
      setBankName(paymentInfo.bank_name || '');
      setAccountName(paymentInfo.bank_account_name || '');
      setAccountNumber(paymentInfo.bank_account_number || '');
      setIban(paymentInfo.iban || '');
      setStcPayNumber(paymentInfo.stc_pay_number || '');
      setWalletNumber(paymentInfo.wallet_number || '');
    }
  }, [paymentInfo]);

  const savePaymentInfoMutation = useMutation({
    mutationFn: async (data: Partial<PaymentInfo>) => {
      if (!profile) throw new Error('Profile not found');
      
      const payload = {
        profile_id: profile.id,
        ...data
      };

      if (paymentInfo) {
        const { error } = await supabase
          .from('affiliate_payment_info')
          .update(payload)
          .eq('profile_id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('affiliate_payment_info')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-info'] });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ بيانات السحب بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error saving payment info:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    savePaymentInfoMutation.mutate({
      preferred_payment_method: preferredMethod,
      bank_name: bankName,
      bank_account_name: accountName,
      bank_account_number: accountNumber,
      iban: iban,
      stc_pay_number: stcPayNumber,
      wallet_number: walletNumber,
    });
  };

  if (isLoading) {
    return (
      <UnifiedCard variant="glass" padding="lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </UnifiedCard>
    );
  }

  return (
    <UnifiedCard variant="glass" padding="lg" className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-2">
          بيانات السحب
        </h2>
        <p className="text-sm text-muted-foreground">
          قم بحفظ بيانات السحب الخاصة بك لاستخدامها تلقائياً عند طلب سحب الأموال
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          سيتم استخدام هذه البيانات تلقائياً عند طلب سحب جديد. يمكنك تعديلها في أي وقت.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="preferred_method">طريقة الدفع المفضلة</Label>
          <Select value={preferredMethod} onValueChange={setPreferredMethod}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  تحويل بنكي
                </span>
              </SelectItem>
              <SelectItem value="stc_pay">
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  STC Pay
                </span>
              </SelectItem>
              <SelectItem value="wallet">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  محفظة إلكترونية
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {preferredMethod === 'bank_transfer' && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              بيانات التحويل البنكي
            </h3>
            
            <div>
              <Label htmlFor="bank_name">اسم البنك</Label>
              <UnifiedInput
                id="bank_name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="مثال: البنك الأهلي السعودي"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="account_name">اسم صاحب الحساب</Label>
              <UnifiedInput
                id="account_name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="الاسم كما يظهر في الحساب البنكي"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="account_number">رقم الحساب</Label>
              <UnifiedInput
                id="account_number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="أدخل رقم الحساب البنكي"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
              <UnifiedInput
                id="iban"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="SA0000000000000000000000"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {preferredMethod === 'stc_pay' && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              بيانات STC Pay
            </h3>
            
            <div>
              <Label htmlFor="stc_pay_number">رقم الهاتف المسجل في STC Pay</Label>
              <UnifiedInput
                id="stc_pay_number"
                value={stcPayNumber}
                onChange={(e) => setStcPayNumber(e.target.value)}
                placeholder="05xxxxxxxx"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {preferredMethod === 'wallet' && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              بيانات المحفظة الإلكترونية
            </h3>
            
            <div>
              <Label htmlFor="wallet_number">رقم الهاتف المسجل في المحفظة</Label>
              <UnifiedInput
                id="wallet_number"
                value={walletNumber}
                onChange={(e) => setWalletNumber(e.target.value)}
                placeholder="05xxxxxxxx"
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <UnifiedButton 
          onClick={handleSave}
          disabled={savePaymentInfoMutation.isPending}
          variant="primary"
          leftIcon={<Save className="h-4 w-4" />}
        >
          {savePaymentInfoMutation.isPending ? 'جاري الحفظ...' : 'حفظ البيانات'}
        </UnifiedButton>
      </div>
    </UnifiedCard>
  );
};
