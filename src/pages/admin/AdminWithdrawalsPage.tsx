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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_type: 'affiliate' | 'merchant';
  amount_sar: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method: string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  iban: string | null;
  phone_number: string | null;
  notes: string | null;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  };
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

export default function AdminWithdrawalsPage() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
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
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
  });

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

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          admin_notes: notes,
          processed_at: new Date().toISOString(),
          processed_by: profile?.id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawal-requests'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح.",
      });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      console.error('Error updating withdrawal request:', error);
    }
  });

  const pendingRequests = withdrawalRequests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = withdrawalRequests?.filter(r => r.status === 'approved') || [];
  const completedRequests = withdrawalRequests?.filter(r => r.status === 'completed') || [];
  const rejectedRequests = withdrawalRequests?.filter(r => r.status === 'rejected') || [];

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

    const newStatus = reviewAction === 'approve' ? 'approved' : 'rejected';
    
    updateWithdrawalMutation.mutate({
      id: selectedRequest.id,
      status: newStatus,
      notes: adminNotes
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل طلبات السحب...</p>
        </div>
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
                {request.profiles?.full_name || request.profiles?.email || 'مستخدم'}
              </p>
              <p className="text-xs text-muted-foreground">
                {request.user_type === 'affiliate' ? 'مسوقة' : 'تاجر'}
              </p>
            </div>
          </div>
          <Badge variant={statusColors[request.status]}>
            {statusLabels[request.status]}
          </Badge>
        </div>

        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">
            <span className="font-medium">تاريخ الطلب:</span> {format(new Date(request.requested_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">طريقة الدفع:</span> {
              request.payment_method === 'bank_transfer' ? 'تحويل بنكي' : 
              request.payment_method === 'stc_pay' ? 'STC Pay' : 'محفظة'
            }
          </p>
          
          {request.payment_method === 'bank_transfer' && (
            <>
              {request.bank_name && (
                <p className="text-muted-foreground">
                  <span className="font-medium">البنك:</span> {request.bank_name}
                </p>
              )}
              {request.bank_account_name && (
                <p className="text-muted-foreground">
                  <span className="font-medium">اسم الحساب:</span> {request.bank_account_name}
                </p>
              )}
              {request.bank_account_number && (
                <p className="text-muted-foreground">
                  <span className="font-medium">رقم الحساب:</span> {request.bank_account_number}
                </p>
              )}
              {request.iban && (
                <p className="text-muted-foreground">
                  <span className="font-medium">IBAN:</span> {request.iban}
                </p>
              )}
            </>
          )}
          
          {(request.payment_method === 'stc_pay' || request.payment_method === 'wallet') && request.phone_number && (
            <p className="text-muted-foreground">
              <span className="font-medium">رقم الهاتف:</span> {request.phone_number}
            </p>
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
              <span className="font-medium">تاريخ المعالجة:</span> {format(new Date(request.processed_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
            </p>
          )}
        </div>

        {request.status === 'pending' && (
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
              variant="destructive"
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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          إدارة طلبات السحب
        </h1>
        <p className="text-muted-foreground">
          مراجعة والموافقة على طلبات السحب من المسوقات والتجار
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalPending.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {pendingRequests.length} طلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موافق عليها</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalApproved.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {approvedRequests.length} طلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCompleted.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {completedRequests.length} طلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withdrawalRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              جميع الطلبات
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                قيد المراجعة ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                موافق عليها ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                مكتملة ({completedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                مرفوضة ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات معلقة</h3>
                  <p className="text-muted-foreground">
                    جميع الطلبات تمت مراجعتها
                  </p>
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
              disabled={updateWithdrawalMutation.isPending}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {updateWithdrawalMutation.isPending ? 'جاري التحديث...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
