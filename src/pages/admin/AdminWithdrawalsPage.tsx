import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowDownToLine,
  Phone,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  COMPLETED: CheckCircle,
};

const statusLabels = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض',
  COMPLETED: 'مكتمل',
};

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "default",
  APPROVED: "secondary",
  REJECTED: "destructive",
  COMPLETED: "default",
};

export default function AdminWithdrawalsPage() {
  const { withdrawals, stats, isLoading, processWithdrawal, isProcessing } = useAdminWithdrawals();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingStatus, setProcessingStatus] = useState<'APPROVED' | 'REJECTED' | 'COMPLETED' | null>(null);

  const handleProcess = (status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    if (!selectedWithdrawal) return;
    
    processWithdrawal({
      withdrawalId: selectedWithdrawal.id,
      status,
      adminNotes
    });
    
    setSelectedWithdrawal(null);
    setAdminNotes('');
    setProcessingStatus(null);
  };

  const openProcessDialog = (withdrawal: any, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    setSelectedWithdrawal(withdrawal);
    setProcessingStatus(status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');
  const approvedWithdrawals = withdrawals.filter(w => w.status === 'APPROVED');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'COMPLETED');
  const rejectedWithdrawals = withdrawals.filter(w => w.status === 'REJECTED');

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          إدارة السحوبات
        </h1>
        <p className="text-muted-foreground">
          مراجعة ومعالجة طلبات السحب من المسوقات
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              قيد الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingAmount.toFixed(2)} ر.س
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              موافق عليها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApproved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              مكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedAmount.toFixed(2)} ر.س
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              مرفوضة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            قيد الانتظار ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            موافق عليها ({approvedWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            مكتملة ({completedWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            مرفوضة ({rejectedWithdrawals.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الطلبات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWithdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات معلقة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map((withdrawal) => (
                    <WithdrawalCard
                      key={withdrawal.id}
                      withdrawal={withdrawal}
                      onProcess={openProcessDialog}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs similar structure */}
        {[
          { value: 'approved', data: approvedWithdrawals, title: 'الموافق عليها' },
          { value: 'completed', data: completedWithdrawals, title: 'المكتملة' },
          { value: 'rejected', data: rejectedWithdrawals, title: 'المرفوضة' }
        ].map(({ value, data, title }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowDownToLine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد طلبات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.map((withdrawal) => (
                      <WithdrawalCard
                        key={withdrawal.id}
                        withdrawal={withdrawal}
                        onProcess={value === 'approved' ? openProcessDialog : undefined}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Process Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processingStatus === 'APPROVED' && 'الموافقة على الطلب'}
              {processingStatus === 'REJECTED' && 'رفض الطلب'}
              {processingStatus === 'COMPLETED' && 'تأكيد إتمام التحويل'}
            </DialogTitle>
            <DialogDescription>
              {selectedWithdrawal && (
                <>
                  المبلغ: {Number(selectedWithdrawal.amount_sar).toFixed(2)} ر.س
                  <br />
                  المسوقة: {selectedWithdrawal.affiliate?.full_name || 'غير محدد'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                ملاحظات الإدارة {processingStatus === 'REJECTED' && '(مطلوب)'}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>
              إلغاء
            </Button>
            <Button
              onClick={() => processingStatus && handleProcess(processingStatus)}
              disabled={isProcessing || (processingStatus === 'REJECTED' && !adminNotes)}
              variant={processingStatus === 'REJECTED' ? 'destructive' : 'default'}
            >
              {isProcessing ? 'جاري المعالجة...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Withdrawal Card Component
interface WithdrawalCardProps {
  withdrawal: any;
  onProcess?: (withdrawal: any, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => void;
}

function WithdrawalCard({ withdrawal, onProcess }: WithdrawalCardProps) {
  const StatusIcon = statusIcons[withdrawal.status as keyof typeof statusIcons];

  return (
    <div className="p-4 border rounded-lg space-y-4">
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
        <Badge variant={statusColors[withdrawal.status]}>
          {statusLabels[withdrawal.status as keyof typeof statusLabels]}
        </Badge>
      </div>

      {/* Affiliate Info */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">المسوقة:</span>
          <span>{withdrawal.affiliate?.full_name || 'غير محدد'}</span>
        </div>
        {withdrawal.affiliate?.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">الهاتف:</span>
            <span>{withdrawal.affiliate.phone}</span>
          </div>
        )}
      </div>

      {/* Payment Details */}
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
            {withdrawal.bank_details.account_number && (
              <p className="text-muted-foreground">
                <span className="font-medium">رقم الحساب:</span> {withdrawal.bank_details.account_number}
              </p>
            )}
          </>
        )}

        {withdrawal.notes && (
          <p className="text-muted-foreground">
            <span className="font-medium">ملاحظات المسوقة:</span> {withdrawal.notes}
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

      {/* Action Buttons */}
      {onProcess && withdrawal.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button
            onClick={() => onProcess(withdrawal, 'APPROVED')}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            موافقة
          </Button>
          <Button
            onClick={() => onProcess(withdrawal, 'REJECTED')}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            رفض
          </Button>
        </div>
      )}

      {onProcess && withdrawal.status === 'APPROVED' && (
        <Button
          onClick={() => onProcess(withdrawal, 'COMPLETED')}
          variant="default"
          size="sm"
          className="w-full"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          تأكيد إتمام التحويل
        </Button>
      )}
    </div>
  );
}
