import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WithdrawalRequest {
  id: string;
  affiliate_profile_id: string;
  amount_sar: number;
  status: string;
  payment_method: string;
  bank_details: any;
  notes: string | null;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  COMPLETED: CheckCircle,
};

const statusColors: Record<string, "default" | "secondary" | "error"> = {
  PENDING: "default",
  APPROVED: "secondary",
  REJECTED: "error",
  COMPLETED: "default",
};

const statusLabels: Record<string, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
  COMPLETED: "مكتمل",
};

export const WithdrawalManagement = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const { data: withdrawalRequests, isLoading } = useQuery({
    queryKey: ['admin-withdrawal-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase.rpc('process_withdrawal_request', {
        p_withdrawal_id: id,
        p_status: status,
        p_admin_notes: notes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawal-requests'] });
      toast.success('تم التحديث', {
        description: 'تم تحديث حالة الطلب بنجاح',
      });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error('خطأ', {
        description: error.message || 'حدث خطأ أثناء تحديث الطلب',
      });
    },
  });

  const pendingRequests = withdrawalRequests?.filter(r => r.status === 'PENDING') || [];
  const approvedRequests = withdrawalRequests?.filter(r => r.status === 'APPROVED') || [];
  const completedRequests = withdrawalRequests?.filter(r => r.status === 'COMPLETED') || [];
  const rejectedRequests = withdrawalRequests?.filter(r => r.status === 'REJECTED') || [];

  const totalPending = pendingRequests.reduce((sum, r) => sum + Number(r.amount_sar), 0);
  const totalApproved = approvedRequests.reduce((sum, r) => sum + Number(r.amount_sar), 0);
  const totalCompleted = completedRequests.reduce((sum, r) => sum + Number(r.amount_sar), 0);

  const handleReview = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;

    const newStatus = reviewAction === 'approve' ? 'APPROVED' : 'REJECTED';

    processWithdrawalMutation.mutate({
      id: selectedRequest.id,
      status: newStatus,
      notes: adminNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل طلبات السحب...</p>
      </div>
    );
  }

  const renderWithdrawalCard = (request: WithdrawalRequest) => {
    const StatusIcon = statusIcons[request.status];

    return (
      <div key={request.id} className="p-4 border rounded-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-lg">{request.amount_sar.toFixed(2)} ر.س</p>
              <p className="text-sm text-muted-foreground">
                مسوقة - {request.affiliate_profile_id.substring(0, 8)}
              </p>
            </div>
          </div>
          <Badge variant={statusColors[request.status]}>
            {statusLabels[request.status]}
          </Badge>
        </div>

        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">
            <span className="font-medium">تاريخ الطلب:</span>{' '}
            {format(new Date(request.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">طريقة الدفع:</span>{' '}
            {request.payment_method === 'BANK_TRANSFER' ? 'تحويل بنكي' :
             request.payment_method === 'WALLET' ? 'محفظة' : 'نقداً'}
          </p>

          {request.bank_details && typeof request.bank_details === 'object' && (
            <>
              {request.bank_details.bank_name && (
                <p className="text-muted-foreground">
                  <span className="font-medium">البنك:</span> {request.bank_details.bank_name}
                </p>
              )}
              {request.bank_details.account_holder && (
                <p className="text-muted-foreground">
                  <span className="font-medium">اسم الحساب:</span> {request.bank_details.account_holder}
                </p>
              )}
              {request.bank_details.iban && (
                <p className="text-muted-foreground">
                  <span className="font-medium">IBAN:</span> {request.bank_details.iban}
                </p>
              )}
            </>
          )}

          {request.notes && (
            <p className="text-muted-foreground">
              <span className="font-medium">ملاحظات المستخدم:</span> {request.notes}
            </p>
          )}

          {request.admin_notes && (
            <p className="text-muted-foreground">
              <span className="font-medium">ملاحظات الإدارة:</span> {request.admin_notes}
            </p>
          )}

          {request.processed_at && (
            <p className="text-muted-foreground">
              <span className="font-medium">تاريخ المعالجة:</span>{' '}
              {format(new Date(request.processed_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
            </p>
          )}
        </div>

        {request.status === 'PENDING' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleReview(request, 'approve')}
              size="sm"
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              موافقة
            </Button>
            <Button
              onClick={() => handleReview(request, 'reject')}
              variant="danger"
              size="sm"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              رفض
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          إدارة طلبات السحب
        </h2>
        <p className="text-muted-foreground">
          مراجعة والموافقة على طلبات السحب من المسوقات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {totalPending.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">{pendingRequests.length} طلب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موافق عليها</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {totalApproved.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">{approvedRequests.length} طلب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <DollarSign className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {totalCompleted.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">{completedRequests.length} طلب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withdrawalRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">جميع الطلبات</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">قيد المراجعة ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="approved">موافق عليها ({approvedRequests.length})</TabsTrigger>
              <TabsTrigger value="completed">مكتملة ({completedRequests.length})</TabsTrigger>
              <TabsTrigger value="rejected">مرفوضة ({rejectedRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات معلقة</h3>
                  <p className="text-muted-foreground">جميع الطلبات تمت مراجعتها</p>
                </div>
              ) : (
                pendingRequests.map(renderWithdrawalCard)
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات موافق عليها</h3>
                </div>
              ) : (
                approvedRequests.map(renderWithdrawalCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات مكتملة</h3>
                </div>
              ) : (
                completedRequests.map(renderWithdrawalCard)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejectedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات مرفوضة</h3>
                </div>
              ) : (
                rejectedRequests.map(renderWithdrawalCard)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'الموافقة على' : 'رفض'} طلب السحب
            </DialogTitle>
            <DialogDescription>
              المبلغ: {selectedRequest?.amount_sar.toFixed(2)} ر.س
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_notes">ملاحظات - اختياري</Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="أضف ملاحظات للمستخدم..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={processWithdrawalMutation.isPending}
              variant={reviewAction === 'reject' ? 'danger' : 'primary'}
            >
              {processWithdrawalMutation.isPending ? 'جاري التحديث...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
