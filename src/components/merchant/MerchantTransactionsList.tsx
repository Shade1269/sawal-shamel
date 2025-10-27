import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MerchantTransaction } from '@/hooks/useMerchantWallet';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface MerchantTransactionsListProps {
  transactions: MerchantTransaction[];
}

const getTransactionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'COMMISSION_PENDING': 'عمولة معلقة',
    'COMMISSION_CONFIRMED': 'عمولة مؤكدة',
    'WITHDRAWAL_PENDING': 'سحب معلق',
    'WITHDRAWAL_COMPLETED': 'سحب مكتمل',
    'WITHDRAWAL_REJECTED': 'سحب مرفوض',
    'REFUND': 'استرجاع',
    'ADJUSTMENT': 'تعديل'
  };
  return labels[type] || type;
};

const getTransactionBadgeVariant = (type: string) => {
  if (type.includes('CONFIRMED') || type.includes('COMPLETED')) return 'default';
  if (type.includes('PENDING')) return 'secondary';
  if (type.includes('REJECTED') || type === 'REFUND') return 'destructive';
  return 'outline';
};

export const MerchantTransactionsList = ({ transactions }: MerchantTransactionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل المعاملات</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            لا توجد معاملات بعد
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الرصيد بعد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const isCredit = transaction.transaction_type.includes('COMMISSION_CONFIRMED') || 
                                transaction.transaction_type === 'ADJUSTMENT';
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTransactionBadgeVariant(transaction.transaction_type)}>
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isCredit ? (
                          <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={isCredit ? 'text-green-600' : 'text-red-600'}>
                          {isCredit ? '+' : '-'}{Math.abs(transaction.amount_sar).toFixed(2)} ريال
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.balance_after_sar.toFixed(2)} ريال
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
