import { useState } from 'react';
import { useAdminMerchantWithdrawals } from '@/hooks/useAdminMerchantWithdrawals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export const AdminMerchantWithdrawals = () => {
  const { withdrawals, pendingWithdrawals, approvedWithdrawals, processWithdrawal, isProcessing } = useAdminMerchantWithdrawals();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleAction = (withdrawal: any, actionType: 'APPROVED' | 'REJECTED') => {
    setSelectedWithdrawal(withdrawal);
    setAction(actionType);
    setAdminNotes('');
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (!selectedWithdrawal || !action) return;
    
    processWithdrawal({
      withdrawalId: selectedWithdrawal.id,
      status: action,
      adminNotes: adminNotes || undefined
    });
    
    setShowDialog(false);
    setSelectedWithdrawal(null);
    setAction(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
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

  const WithdrawalTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>التاجر</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>طريقة الدفع</TableHead>
          <TableHead>تاريخ الطلب</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((withdrawal) => (
          <TableRow key={withdrawal.id}>
            <TableCell>
              <div>
                <p className="font-medium">{withdrawal.merchant?.full_name}</p>
                {withdrawal.merchant?.email && (
                  <p className="text-sm text-muted-foreground">{withdrawal.merchant.email}</p>
                )}
                {withdrawal.merchant?.phone && (
                  <p className="text-sm text-muted-foreground">{withdrawal.merchant.phone}</p>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {withdrawal.amount_sar.toFixed(2)} ريال
            </TableCell>
            <TableCell>
              {getStatusBadge(withdrawal.status)}
            </TableCell>
            <TableCell>
              {withdrawal.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
               withdrawal.payment_method === 'stc_pay' ? 'STC Pay' : 'محفظة'}
            </TableCell>
            <TableCell>
              {format(new Date(withdrawal.requested_at), 'dd MMM yyyy, HH:mm', { locale: ar })}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {withdrawal.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAction(withdrawal, 'APPROVED')}
                      disabled={isProcessing}
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      موافقة
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(withdrawal, 'REJECTED')}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 ml-1" />
                      رفض
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setShowDialog(true);
                    setAction(null);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>طلبات سحب التجار</CardTitle>
          <CardDescription>
            إدارة ومراجعة طلبات السحب من التجار
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                قيد المراجعة ({pendingWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                تمت الموافقة ({approvedWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                الكل ({withdrawals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {pendingWithdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد طلبات قيد المراجعة
                </p>
              ) : (
                <WithdrawalTable data={pendingWithdrawals} />
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              {approvedWithdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد طلبات تمت الموافقة عليها
                </p>
              ) : (
                <WithdrawalTable data={approvedWithdrawals} />
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              {withdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد طلبات سحب
                </p>
              ) : (
                <WithdrawalTable data={withdrawals} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {action === 'APPROVED' ? 'الموافقة على طلب السحب' :
               action === 'REJECTED' ? 'رفض طلب السحب' :
               'تفاصيل طلب السحب'}
            </DialogTitle>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>التاجر</Label>
                  <p className="text-sm">{selectedWithdrawal.merchant?.full_name}</p>
                </div>
                <div>
                  <Label>المبلغ</Label>
                  <p className="text-sm font-medium">{selectedWithdrawal.amount_sar.toFixed(2)} ريال</p>
                </div>
                <div>
                  <Label>طريقة الدفع</Label>
                  <p className="text-sm">
                    {selectedWithdrawal.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                     selectedWithdrawal.payment_method === 'stc_pay' ? 'STC Pay' : 'محفظة'}
                  </p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
              </div>

              {selectedWithdrawal.bank_details && (
                <div className="p-4 border rounded-lg space-y-2">
                  <Label>تفاصيل الحساب البنكي</Label>
                  {selectedWithdrawal.bank_details.bank_name && (
                    <p className="text-sm">البنك: {selectedWithdrawal.bank_details.bank_name}</p>
                  )}
                  {selectedWithdrawal.bank_details.account_holder_name && (
                    <p className="text-sm">صاحب الحساب: {selectedWithdrawal.bank_details.account_holder_name}</p>
                  )}
                  {selectedWithdrawal.bank_details.iban && (
                    <p className="text-sm">الآيبان: {selectedWithdrawal.bank_details.iban}</p>
                  )}
                  {selectedWithdrawal.bank_details.account_number && (
                    <p className="text-sm">رقم الحساب: {selectedWithdrawal.bank_details.account_number}</p>
                  )}
                  {selectedWithdrawal.bank_details.stc_pay_number && (
                    <p className="text-sm">رقم STC Pay: {selectedWithdrawal.bank_details.stc_pay_number}</p>
                  )}
                </div>
              )}

              {action && (
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">ملاحظات الإدارة {action === 'REJECTED' && '(مطلوبة)'}</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="أضف ملاحظات..."
                    rows={3}
                  />
                </div>
              )}

              {selectedWithdrawal.admin_notes && (
                <div className="space-y-2">
                  <Label>ملاحظات الإدارة السابقة</Label>
                  <p className="text-sm p-3 bg-muted rounded">{selectedWithdrawal.admin_notes}</p>
                </div>
              )}
            </div>
          )}

          {action && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button
                variant={action === 'APPROVED' ? 'default' : 'destructive'}
                onClick={handleConfirm}
                disabled={isProcessing || (action === 'REJECTED' && !adminNotes)}
              >
                {action === 'APPROVED' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
