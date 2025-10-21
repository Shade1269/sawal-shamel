import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign, 
  TrendingUp,
  Send,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WithdrawalRequest {
  id: string;
  amount_sar: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method: string;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle,
};

const statusColors = {
  pending: "default",
  approved: "secondary",
  rejected: "destructive",
  completed: "default",
} as const;

const statusLabels = {
  pending: "قيد المراجعة",
  approved: "موافق عليه",
  rejected: "مرفوض",
  completed: "مكتمل",
};

export default function AffiliateWalletPage() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkMode();
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');

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

  const { data: commissions } = useQuery({
    queryKey: ['affiliate-commissions', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile
  });

  const { data: withdrawalRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['withdrawal-requests', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!profile
  });

  const { data: minWithdrawalSetting } = useQuery({
    queryKey: ['platform-settings', 'minimum_withdrawal_amount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'minimum_withdrawal_amount')
        .single();

      if (error) throw error;
      return data?.setting_value as { amount: number };
    }
  });

  // Load saved payment info
  const { data: savedPaymentInfo } = useQuery({
    queryKey: ['payment-info', profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      const { data, error } = await supabase
        .from('affiliate_payment_info')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile
  });

  // Auto-fill form when opening withdrawal dialog
  React.useEffect(() => {
    if (showWithdrawalDialog && savedPaymentInfo) {
      setPaymentMethod(savedPaymentInfo.preferred_payment_method || 'bank_transfer');
      setBankName(savedPaymentInfo.bank_name || '');
      setAccountName(savedPaymentInfo.bank_account_name || '');
      setAccountNumber(savedPaymentInfo.bank_account_number || '');
      setIban(savedPaymentInfo.iban || '');
      if (savedPaymentInfo.stc_pay_number) {
        setPhoneNumber(savedPaymentInfo.stc_pay_number);
      } else if (savedPaymentInfo.wallet_number) {
        setPhoneNumber(savedPaymentInfo.wallet_number);
      }
    }
  }, [showWithdrawalDialog, savedPaymentInfo]);

  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert(withdrawalData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب السحب بنجاح. سيتم مراجعته من قبل الإدارة.",
      });
      setShowWithdrawalDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      console.error('Error creating withdrawal request:', error);
    }
  });

  const availableBalance = commissions?.filter(c => c.status === 'CONFIRMED').reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;
  const pendingBalance = commissions?.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;
  const paidBalance = commissions?.filter(c => c.status === 'PAID').reduce((sum, c) => sum + Number(c.amount_sar), 0) || 0;
  const minWithdrawal = minWithdrawalSetting?.amount || 100;

  const resetForm = () => {
    setWithdrawalAmount('');
    setNotes('');
  };

  const handleWithdrawalRequest = () => {
    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح.",
        variant: "destructive",
      });
      return;
    }

    if (amount < minWithdrawal) {
      toast({
        title: "خطأ",
        description: `الحد الأدنى للسحب هو ${minWithdrawal} ر.س`,
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "خطأ",
        description: "المبلغ المطلوب أكبر من رصيدك المتاح.",
        variant: "destructive",
      });
      return;
    }

    const withdrawalData: any = {
      user_id: profile?.id,
      user_type: 'affiliate',
      amount_sar: amount,
      payment_method: paymentMethod,
      notes,
    };

    if (paymentMethod === 'bank_transfer') {
      if (!bankName || !accountName || !accountNumber) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال جميع بيانات الحساب البنكي.",
          variant: "destructive",
        });
        return;
      }
      withdrawalData.bank_name = bankName;
      withdrawalData.bank_account_name = accountName;
      withdrawalData.bank_account_number = accountNumber;
      withdrawalData.iban = iban;
    } else if (paymentMethod === 'stc_pay' || paymentMethod === 'wallet') {
      if (!phoneNumber) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال رقم الهاتف.",
          variant: "destructive",
        });
        return;
      }
      withdrawalData.phone_number = phoneNumber;
    }

    createWithdrawalMutation.mutate(withdrawalData);
  };

  if (loadingRequests) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المحفظة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 flex items-center gap-2 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>
          <Wallet className="h-8 w-8" />
          محفظتي
        </h1>
        <p className={`transition-colors duration-500 ${
          isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
        }`}>
          إدارة رصيدك وطلبات السحب
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>الرصيد المتاح</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableBalance.toFixed(2)} ر.س</div>
            <p className={`text-xs mt-1 transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              جاهز للسحب
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>رصيد معلق</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingBalance.toFixed(2)} ر.س</div>
            <p className={`text-xs mt-1 transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              في انتظار التأكيد
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>إجمالي المدفوعات</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidBalance.toFixed(2)} ر.س</div>
            <p className={`text-xs mt-1 transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              تم الدفع
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Button 
          onClick={() => setShowWithdrawalDialog(true)}
          disabled={availableBalance < minWithdrawal}
          size="lg"
          className="w-full md:w-auto"
        >
          <Send className="h-4 w-4 mr-2" />
          طلب سحب
        </Button>
        {availableBalance < minWithdrawal && (
          <p className={`text-sm mt-2 transition-colors duration-500 ${
            isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
          }`}>
            الحد الأدنى للسحب: {minWithdrawal} ر.س
          </p>
        )}
      </div>

      <Card className={`mb-8 transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white border-slate-200'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            <History className="h-5 w-5" />
            طلبات السحب
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!withdrawalRequests || withdrawalRequests.length === 0 ? (
            <div className="text-center py-12">
              <Send className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>لا توجد طلبات سحب</h3>
              <p className={`transition-colors duration-500 ${
                isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
              }`}>
                لم تقم بأي طلبات سحب بعد
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawalRequests.map((request) => {
                const StatusIcon = statusIcons[request.status];
                
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {request.amount_sar.toFixed(2)} ر.س
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.requested_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          طريقة الدفع: {request.payment_method === 'bank_transfer' ? 'تحويل بنكي' : request.payment_method === 'stc_pay' ? 'STC Pay' : 'محفظة'}
                        </p>
                        {request.admin_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ملاحظة الإدارة: {request.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>طلب سحب</DialogTitle>
            <DialogDescription>
              الرصيد المتاح: {availableBalance.toFixed(2)} ر.س | الحد الأدنى: {minWithdrawal} ر.س
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">المبلغ (ر.س)</Label>
              <Input
                id="amount"
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder={`الحد الأدنى: ${minWithdrawal}`}
                min={minWithdrawal}
                max={availableBalance}
              />
            </div>

            <div>
              <Label htmlFor="payment_method">طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="stc_pay">STC Pay</SelectItem>
                  <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <>
                <div>
                  <Label htmlFor="bank_name">اسم البنك</Label>
                  <Input
                    id="bank_name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="مثال: البنك الأهلي السعودي"
                  />
                </div>
                <div>
                  <Label htmlFor="account_name">اسم صاحب الحساب</Label>
                  <Input
                    id="account_name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">رقم الحساب</Label>
                  <Input
                    id="account_number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="iban">رقم الآيبان (IBAN) - اختياري</Label>
                  <Input
                    id="iban"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="SA..."
                  />
                </div>
              </>
            )}

            {(paymentMethod === 'stc_pay' || paymentMethod === 'wallet') && (
              <div>
                <Label htmlFor="phone_number">رقم الهاتف</Label>
                <Input
                  id="phone_number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="05xxxxxxxx"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">ملاحظات - اختياري</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleWithdrawalRequest}
              disabled={createWithdrawalMutation.isPending}
            >
              {createWithdrawalMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
