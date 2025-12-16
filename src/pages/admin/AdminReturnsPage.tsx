import { useState } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
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
import { useAdminOrderReturns } from '@/hooks/useOrderReturns';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
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
void statusColors; // Reserved for future use

export default function AdminReturnsPage() {
  const { returns, stats, isLoading, processReturn, isProcessing } = useAdminOrderReturns();
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingStatus, setProcessingStatus] = useState<'APPROVED' | 'REJECTED' | 'COMPLETED' | null>(null);

  const handleProcess = (status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    if (!selectedReturn) return;
    
    processReturn({
      returnId: selectedReturn.id,
      status,
      adminNotes
    });
    
    setSelectedReturn(null);
    setAdminNotes('');
    setProcessingStatus(null);
  };

  const openProcessDialog = (returnItem: any, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    setSelectedReturn(returnItem);
    setProcessingStatus(status);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  const pendingReturns = returns.filter(r => r.return_status === 'PENDING');
  const approvedReturns = returns.filter(r => r.return_status === 'APPROVED');
  const completedReturns = returns.filter(r => r.return_status === 'COMPLETED');
  const rejectedReturns = returns.filter(r => r.return_status === 'REJECTED');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Package className="h-8 w-8" />
          إدارة الإرجاعات
        </h1>
        <p className="text-muted-foreground">
          مراجعة ومعالجة طلبات إرجاع الطلبات
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              قيد الانتظار
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              موافق عليها
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalApproved}</div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              مكتملة
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-danger" />
              مرفوضة
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalRejected}</div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            قيد الانتظار ({pendingReturns.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            موافق عليها ({approvedReturns.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            مكتملة ({completedReturns.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            مرفوضة ({rejectedReturns.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <UnifiedCard variant="default" padding="md">
            <UnifiedCardHeader>
              <UnifiedCardTitle>الطلبات المعلقة</UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              {pendingReturns.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات معلقة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReturns.map((returnItem) => (
                    <ReturnCard
                      key={returnItem.id}
                      returnItem={returnItem}
                      onProcess={openProcessDialog}
                    />
                  ))}
                </div>
              )}
            </UnifiedCardContent>
          </UnifiedCard>
        </TabsContent>

        {/* Other tabs */}
        {[
          { value: 'approved', data: approvedReturns, title: 'الموافق عليها' },
          { value: 'completed', data: completedReturns, title: 'المكتملة' },
          { value: 'rejected', data: rejectedReturns, title: 'المرفوضة' }
        ].map(({ value, data, title }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <UnifiedCard variant="default" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>{title}</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                {data.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد طلبات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.map((returnItem) => (
                      <ReturnCard
                        key={returnItem.id}
                        returnItem={returnItem}
                        onProcess={value === 'approved' ? openProcessDialog : undefined}
                      />
                    ))}
                  </div>
                )}
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>
        ))}
      </Tabs>

      {/* Process Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processingStatus === 'APPROVED' && 'الموافقة على الإرجاع'}
              {processingStatus === 'REJECTED' && 'رفض الإرجاع'}
              {processingStatus === 'COMPLETED' && 'تأكيد إتمام الإرجاع'}
            </DialogTitle>
            <DialogDescription>
              {selectedReturn && (
                <>
                  مبلغ الاسترجاع: {Number(selectedReturn.refund_amount_sar || 0).toFixed(2)} ر.س
                  <br />
                  طلب رقم: {selectedReturn.order_id}
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
            <UnifiedButton variant="outline" onClick={() => setSelectedReturn(null)}>
              إلغاء
            </UnifiedButton>
            <UnifiedButton
              onClick={() => processingStatus && handleProcess(processingStatus)}
              disabled={isProcessing || (processingStatus === 'REJECTED' && !adminNotes)}
              variant={processingStatus === 'REJECTED' ? 'danger' : 'primary'}
              loading={isProcessing}
              loadingText="جاري المعالجة..."
            >
              {!isProcessing && 'تأكيد'}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Return Card Component
interface ReturnCardProps {
  returnItem: any;
  onProcess?: (returnItem: any, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => void;
}

function ReturnCard({ returnItem, onProcess }: ReturnCardProps) {
  const StatusIcon = statusIcons[returnItem.return_status as keyof typeof statusIcons];

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">
              طلب رقم: {returnItem.order_id.slice(0, 8)}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(returnItem.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
            </p>
          </div>
        </div>
        <UnifiedBadge variant={returnItem.return_status === 'PENDING' ? 'warning' : returnItem.return_status === 'REJECTED' ? 'error' : 'success'}>
          {statusLabels[returnItem.return_status as keyof typeof statusLabels]}
        </UnifiedBadge>
      </div>

      {/* Customer Info */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">العميل:</span>
          <span>{returnItem.customer_id || 'غير محدد'}</span>
        </div>
        {returnItem.affiliate_id && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">المسوقة:</span>
            <span>{returnItem.affiliate_id}</span>
          </div>
        )}
      </div>

      {/* Return Details */}
      <div className="text-sm space-y-1">
        <p className="text-muted-foreground">
          <span className="font-medium">سبب الإرجاع:</span> {returnItem.return_reason}
        </p>

        {returnItem.refund_amount_sar && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">مبلغ الاسترجاع:</span>
            <span className="font-bold text-primary">
              {Number(returnItem.refund_amount_sar).toFixed(2)} ر.س
            </span>
          </div>
        )}

        {returnItem.notes && (
          <p className="text-muted-foreground">
            <span className="font-medium">ملاحظات العميل:</span> {returnItem.notes}
          </p>
        )}

        {returnItem.processed_at && (
          <p className="text-muted-foreground">
            <span className="font-medium">تاريخ المعالجة:</span>{' '}
            {format(new Date(returnItem.processed_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {onProcess && returnItem.return_status === 'PENDING' && (
        <div className="flex gap-2">
          <UnifiedButton
            onClick={() => onProcess(returnItem, 'APPROVED')}
            variant="primary"
            size="sm"
            className="flex-1"
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            موافقة
          </UnifiedButton>
          <UnifiedButton
            onClick={() => onProcess(returnItem, 'REJECTED')}
            variant="danger"
            size="sm"
            className="flex-1"
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            رفض
          </UnifiedButton>
        </div>
      )}

      {onProcess && returnItem.return_status === 'APPROVED' && (
        <UnifiedButton
          onClick={() => onProcess(returnItem, 'COMPLETED')}
          variant="primary"
          size="sm"
          fullWidth
          leftIcon={<CheckCircle className="h-4 w-4" />}
        >
          تأكيد إتمام الإرجاع
        </UnifiedButton>
      )}
    </div>
  );
}
