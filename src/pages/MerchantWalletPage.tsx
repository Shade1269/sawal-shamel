import { useMerchantWallet } from '@/hooks/useMerchantWallet';
import { useMerchantWithdrawals } from '@/hooks/useMerchantWithdrawals';
import { MerchantWalletCard } from '@/components/merchant/MerchantWalletCard';
import { MerchantWithdrawalForm } from '@/components/merchant/MerchantWithdrawalForm';
import { MerchantTransactionsList } from '@/components/merchant/MerchantTransactionsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export default function MerchantWalletPage() {
  const { balance, transactions, isLoading: isLoadingWallet, canWithdraw } = useMerchantWallet();
  const { 
    withdrawals, 
    pendingWithdrawals, 
    totalPending,
    createWithdrawal, 
    isCreating 
  } = useMerchantWithdrawals();

  if (isLoadingWallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
            <CardDescription>لم نتمكن من تحميل بيانات المحفظة</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getWithdrawalStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PENDING': 'secondary',
      'APPROVED': 'default',
      'COMPLETED': 'default',
      'REJECTED': 'destructive'
    };
    const labels: Record<string, string> = {
      'PENDING': 'قيد المراجعة',
      'APPROVED': 'تمت الموافقة',
      'COMPLETED': 'مكتمل',
      'REJECTED': 'مرفوض'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">محفظتي المالية</h1>
        <p className="text-muted-foreground">إدارة أرباحك وطلبات السحب</p>
      </div>

      <MerchantWalletCard balance={balance} />

      <Tabs defaultValue="withdraw" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdraw">طلب سحب</TabsTrigger>
          <TabsTrigger value="history">سجل السحوبات</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw" className="space-y-4">
          {canWithdraw ? (
            <MerchantWithdrawalForm
              availableBalance={balance.available_balance_sar}
              minimumWithdrawal={balance.minimum_withdrawal_sar}
              onSubmit={createWithdrawal}
              isSubmitting={isCreating}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>لا يمكنك السحب حالياً</CardTitle>
                <CardDescription>
                  الحد الأدنى للسحب هو {balance.minimum_withdrawal_sar} ريال.
                  رصيدك الحالي: {balance.available_balance_sar.toFixed(2)} ريال
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {pendingWithdrawals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>طلبات سحب معلقة</CardTitle>
                <CardDescription>
                  لديك {pendingWithdrawals.length} طلب سحب قيد المراجعة بمبلغ إجمالي {totalPending.toFixed(2)} ريال
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل طلبات السحب</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد طلبات سحب بعد
                </p>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{withdrawal.amount_sar.toFixed(2)} ريال</p>
                          {getWithdrawalStatusBadge(withdrawal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(withdrawal.requested_at), 'dd MMM yyyy, HH:mm', { locale: ar })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          طريقة الدفع: {withdrawal.payment_method === 'bank_transfer' ? 'تحويل بنكي' : 
                                        withdrawal.payment_method === 'stc_pay' ? 'STC Pay' : 'محفظة'}
                        </p>
                        {withdrawal.admin_notes && (
                          <p className="text-sm text-muted-foreground">
                            ملاحظات الإدارة: {withdrawal.admin_notes}
                          </p>
                        )}
                      </div>
                      {withdrawal.processed_at && (
                        <p className="text-sm text-muted-foreground">
                          تمت المعالجة: {format(new Date(withdrawal.processed_at), 'dd MMM yyyy', { locale: ar })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <MerchantTransactionsList transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
