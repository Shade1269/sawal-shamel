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
import { useAdminOrderReturns } from '@/hooks/useOrderReturns';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
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
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const pendingReturns = returns.filter(r => r.return_status === 'PENDING');
  const approvedReturns = returns.filter(r => r.return_status === 'APPROVED');
  const completedReturns = returns.filter(r => r.return_status === 'COMPLETED');
  const rejectedReturns = returns.filter(r => r.return_status === 'REJECTED');

  return (
    <div className="container mx-auto py-8 space-y-6">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              قيد الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
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
              <CheckCircle className="h-4 w-4 text-blue-500" />
              مكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
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
          <Card>
            <CardHeader>
              <CardTitle>الطلبات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs */}
        {[
          { value: 'approved', data: approvedReturns, title: 'الموافق عليها' },
          { value: 'completed', data: completedReturns, title: 'المكتملة' },
          { value: 'rejected', data: rejectedReturns, title: 'المرفوضة' }
        ].map(({ value, data, title }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
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
            <Button variant="outline" onClick={() => setSelectedReturn(null)}>
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
        <Badge variant={statusColors[returnItem.return_status]}>
          {statusLabels[returnItem.return_status as keyof typeof statusLabels]}
        </Badge>
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
          <Button
            onClick={() => onProcess(returnItem, 'APPROVED')}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            موافقة
          </Button>
          <Button
            onClick={() => onProcess(returnItem, 'REJECTED')}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            رفض
          </Button>
        </div>
      )}

      {onProcess && returnItem.return_status === 'APPROVED' && (
        <Button
          onClick={() => onProcess(returnItem, 'COMPLETED')}
          variant="default"
          size="sm"
          className="w-full"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          تأكيد إتمام الإرجاع
        </Button>
      )}
    </div>
  );
}
