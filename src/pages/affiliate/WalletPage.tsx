import { useState } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle, UnifiedButton, UnifiedBadge } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletCard } from '@/components/wallet/WalletCard';
import { WalletStats } from '@/components/wallet/WalletStats';
import { WithdrawalRequestForm } from '@/components/wallet/WithdrawalRequestForm';
import { useWallet } from '@/hooks/useWallet';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { exportToExcel } from '@/utils/exportToExcel';
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

const transactionTypeIcons: Record<string, typeof TrendingUp> = {
  COMMISSION: TrendingUp,
  WITHDRAWAL: ArrowDownToLine,
  ADJUSTMENT: ArrowUpFromLine,
  REFUND: XCircle,
};

const transactionTypeLabels: Record<string, string> = {
  COMMISSION: 'عمولة',
  WITHDRAWAL: 'سحب',
  ADJUSTMENT: 'تعديل',
  REFUND: 'استرجاع',
};

const transactionTypeColors: Record<string, string> = {
  COMMISSION: 'text-success',
  WITHDRAWAL: 'text-destructive',
  ADJUSTMENT: 'text-info',
  REFUND: 'text-warning',
};

const withdrawalStatusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  COMPLETED: CheckCircle,
};

const withdrawalStatusLabels: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض',
  COMPLETED: 'مكتمل',
};

const withdrawalStatusColors: Record<string, "default" | "secondary" | "error" | "success"> = {
  PENDING: "default",
  APPROVED: "success",
  REJECTED: "error",
  COMPLETED: "success",
};

export default function WalletPage() {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const { balance, transactions, isLoading: walletLoading } = useWallet();
  const { withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();

  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      toast.error('لا توجد معاملات للتصدير');
      return;
    }

    const data = {
      headers: ['التاريخ', 'النوع', 'الوصف', 'المبلغ', 'الرصيد بعد المعاملة'],
      rows: transactions.map(t => [
        format(new Date(t.created_at), 'dd/MM/yyyy HH:mm'),
        transactionTypeLabels[t.transaction_type],
        t.description || '-',
        `${Number(t.amount_sar).toFixed(2)} ر.س`,
        `${Number(t.balance_after_sar).toFixed(2)} ر.س`
      ]),
      filename: `transactions-${format(new Date(), 'yyyy-MM-dd')}`
    };

    exportToExcel(data);
    toast.success('تم تصدير المعاملات بنجاح');
  };

  const handleExportWithdrawals = () => {
    if (withdrawals.length === 0) {
      toast.error('لا توجد طلبات سحب للتصدير');
      return;
    }

    const data = {
      headers: ['التاريخ', 'المبلغ', 'الحالة', 'طريقة الدفع', 'تاريخ المعالجة'],
      rows: withdrawals.map(w => [
        format(new Date(w.created_at), 'dd/MM/yyyy HH:mm'),
        `${Number(w.amount_sar).toFixed(2)} ر.س`,
        withdrawalStatusLabels[w.status],
        w.payment_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 
        w.payment_method === 'WALLET' ? 'محفظة إلكترونية' : 'نقداً',
        w.processed_at ? format(new Date(w.processed_at), 'dd/MM/yyyy HH:mm') : '-'
      ]),
      filename: `withdrawals-${format(new Date(), 'yyyy-MM-dd')}`
    };

    exportToExcel(data);
    toast.success('تم تصدير طلبات السحب بنجاح');
  };

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

      {/* Stats */}
      <WalletStats />

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
          <UnifiedCard>
            <UnifiedCardHeader className="flex flex-row items-center justify-between">
              <UnifiedCardTitle>سجل المعاملات</UnifiedCardTitle>
              {transactions.length > 0 && (
                <UnifiedButton 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportTransactions}
                >
                  <Download className="h-4 w-4 ml-2" />
                  تصدير Excel
                </UnifiedButton>
              )}
            </UnifiedCardHeader>
            <UnifiedCardContent>
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
                    const Icon = transactionTypeIcons[transaction.transaction_type] || TrendingUp;
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
                          <p className={`font-bold text-lg ${isPositive ? 'text-success' : 'text-destructive'}`}>
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
          </UnifiedCardContent>
        </UnifiedCard>
      </TabsContent>

      {/* Withdrawals Tab */}
      <TabsContent value="withdrawals" className="space-y-4">
        <UnifiedCard>
          <UnifiedCardHeader className="flex flex-row items-center justify-between">
            <UnifiedCardTitle>طلبات السحب</UnifiedCardTitle>
            {withdrawals.length > 0 && (
              <UnifiedButton 
                variant="outline" 
                size="sm"
                onClick={handleExportWithdrawals}
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير Excel
              </UnifiedButton>
            )}
          </UnifiedCardHeader>
          <UnifiedCardContent>
              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowDownToLine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات سحب</h3>
                  <p className="text-muted-foreground mb-4">
                  لم تقم بأي طلبات سحب بعد
                </p>
                {balance && balance.available_balance_sar >= balance.minimum_withdrawal_sar && (
                  <UnifiedButton variant="primary" onClick={() => setShowWithdrawalForm(true)}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    طلب سحب جديد
                  </UnifiedButton>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => {
                    const StatusIcon = withdrawalStatusIcons[withdrawal.status] || Clock;
                    
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
                        <UnifiedBadge variant={withdrawalStatusColors[withdrawal.status]}>
                          {withdrawalStatusLabels[withdrawal.status]}
                        </UnifiedBadge>
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
            </UnifiedCardContent>
          </UnifiedCard>
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
