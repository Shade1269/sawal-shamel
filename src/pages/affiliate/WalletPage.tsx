import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletCard } from '@/components/wallet/WalletCard';
import { WithdrawalRequestForm } from '@/components/wallet/WithdrawalRequestForm';
import { useWallet } from '@/hooks/useWallet';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const transactionTypeIcons = {
  COMMISSION: TrendingUp,
  WITHDRAWAL: ArrowDownToLine,
  ADJUSTMENT: ArrowUpFromLine,
  REFUND: XCircle,
};

const transactionTypeLabels = {
  COMMISSION: 'عمولة',
  WITHDRAWAL: 'سحب',
  ADJUSTMENT: 'تعديل',
  REFUND: 'استرجاع',
};

const transactionTypeColors = {
  COMMISSION: 'text-green-600',
  WITHDRAWAL: 'text-red-600',
  ADJUSTMENT: 'text-blue-600',
  REFUND: 'text-orange-600',
};

const withdrawalStatusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  COMPLETED: CheckCircle,
};

const withdrawalStatusLabels = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض',
  COMPLETED: 'مكتمل',
};

const withdrawalStatusColors: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "default",
  APPROVED: "secondary",
  REJECTED: "destructive",
  COMPLETED: "default",
};

export default function WalletPage() {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const { balance, transactions, isLoading: walletLoading } = useWallet();
  const { withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();

  if (walletLoading || withdrawalsLoading) {
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          محفظتي
        </h1>
        <p className="text-muted-foreground">
          إدارة رصيدك وطلبات السحب والمعاملات المالية
        </p>
      </div>

      {/* Wallet Card */}
      <WalletCard onWithdrawClick={() => setShowWithdrawalForm(true)} />

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">
            المعاملات ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            طلبات السحب ({withdrawals.length})
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد معاملات</h3>
                  <p className="text-muted-foreground">
                    سيظهر هنا سجل جميع معاملاتك المالية
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const Icon = transactionTypeIcons[transaction.transaction_type];
                    const isPositive = transaction.transaction_type === 'COMMISSION' || 
                                      transaction.transaction_type === 'ADJUSTMENT';
                    
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full bg-accent ${transactionTypeColors[transaction.transaction_type]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {transactionTypeLabels[transaction.transaction_type]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description || 'معاملة مالية'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : '-'}{Math.abs(Number(transaction.amount_sar)).toFixed(2)} ر.س
                          </p>
                          <p className="text-xs text-muted-foreground">
                            الرصيد: {Number(transaction.balance_after_sar).toFixed(2)} ر.س
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>طلبات السحب</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowDownToLine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات سحب</h3>
                  <p className="text-muted-foreground mb-4">
                    لم تقم بأي طلبات سحب بعد
                  </p>
                  {balance && balance.available_balance_sar >= balance.minimum_withdrawal_sar && (
                    <Button onClick={() => setShowWithdrawalForm(true)}>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      طلب سحب جديد
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => {
                    const StatusIcon = withdrawalStatusIcons[withdrawal.status];
                    
                    return (
                      <div
                        key={withdrawal.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-lg">
                                {Number(withdrawal.amount_sar).toFixed(2)} ر.س
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(withdrawal.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                              </p>
                            </div>
                          </div>
                          <Badge variant={withdrawalStatusColors[withdrawal.status]}>
                            {withdrawalStatusLabels[withdrawal.status]}
                          </Badge>
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">
                            <span className="font-medium">طريقة الدفع:</span>{' '}
                            {withdrawal.payment_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 
                             withdrawal.payment_method === 'WALLET' ? 'محفظة إلكترونية' : 'نقداً'}
                          </p>
                          
                          {withdrawal.bank_details && typeof withdrawal.bank_details === 'object' && (
                            <>
                              {withdrawal.bank_details.bank_name && (
                                <p className="text-muted-foreground">
                                  <span className="font-medium">البنك:</span> {withdrawal.bank_details.bank_name}
                                </p>
                              )}
                              {withdrawal.bank_details.iban && (
                                <p className="text-muted-foreground">
                                  <span className="font-medium">IBAN:</span> {withdrawal.bank_details.iban}
                                </p>
                              )}
                            </>
                          )}

                          {withdrawal.notes && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">ملاحظاتك:</span> {withdrawal.notes}
                            </p>
                          )}
                          
                          {withdrawal.admin_notes && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">ملاحظة الإدارة:</span> {withdrawal.admin_notes}
                            </p>
                          )}

                          {withdrawal.processed_at && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">تاريخ المعالجة:</span>{' '}
                              {format(new Date(withdrawal.processed_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Form Dialog */}
      <WithdrawalRequestForm
        open={showWithdrawalForm}
        onOpenChange={setShowWithdrawalForm}
      />
    </div>
  );
}
