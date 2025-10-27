import { usePlatformRevenue } from '@/hooks/usePlatformRevenue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DollarSign, TrendingUp, Clock, Loader2 } from 'lucide-react';

export default function AdminPlatformRevenuePage() {
  const { 
    revenue, 
    confirmedRevenue, 
    pendingRevenueRecords, 
    totalRevenue, 
    pendingRevenue, 
    isLoading 
  } = usePlatformRevenue();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'PENDING': 'secondary',
      'CONFIRMED': 'default',
      'REFUNDED': 'destructive'
    };
    const labels: Record<string, string> = {
      'PENDING': 'معلق',
      'CONFIRMED': 'مؤكد',
      'REFUNDED': 'مسترجع'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const RevenueTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>التاريخ</TableHead>
          <TableHead>رقم الطلب</TableHead>
          <TableHead>التاجر</TableHead>
          <TableHead>المسوق</TableHead>
          <TableHead className="text-right">سعر التاجر</TableHead>
          <TableHead className="text-right">نصيب المنصة</TableHead>
          <TableHead className="text-right">عمولة المسوق</TableHead>
          <TableHead className="text-right">السعر النهائي</TableHead>
          <TableHead>الحالة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="text-sm">
              {format(new Date(record.created_at), 'dd MMM yyyy', { locale: ar })}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {record.order_id.slice(0, 8)}
            </TableCell>
            <TableCell>
              {record.merchant?.full_name || 'غير محدد'}
            </TableCell>
            <TableCell>
              {record.affiliate?.full_name || 'غير محدد'}
            </TableCell>
            <TableCell className="text-right">
              {record.merchant_base_price_sar.toFixed(2)} ريال
            </TableCell>
            <TableCell className="text-right font-medium text-green-600">
              {record.platform_share_sar.toFixed(2)} ريال
            </TableCell>
            <TableCell className="text-right">
              {record.affiliate_commission_sar?.toFixed(2) || '0.00'} ريال
            </TableCell>
            <TableCell className="text-right font-medium">
              {record.final_sale_price_sar.toFixed(2)} ريال
            </TableCell>
            <TableCell>
              {getStatusBadge(record.status)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">أرباح المنصة</h1>
        <p className="text-muted-foreground">تقرير شامل بإيرادات المنصة من المبيعات</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرباح المؤكدة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toFixed(2)} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              من {confirmedRevenue.length} معاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأرباح المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingRevenue.toFixed(2)} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              من {pendingRevenueRecords.length} معاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعاملات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenue.length}
            </div>
            <p className="text-xs text-muted-foreground">
              معاملة مالية
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الإيرادات</CardTitle>
          <CardDescription>
            تفاصيل جميع المعاملات المالية للمنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                الكل ({revenue.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                مؤكد ({confirmedRevenue.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                معلق ({pendingRevenueRecords.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {revenue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد معاملات بعد
                </p>
              ) : (
                <RevenueTable data={revenue} />
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-4">
              {confirmedRevenue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد معاملات مؤكدة
                </p>
              ) : (
                <RevenueTable data={confirmedRevenue} />
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              {pendingRevenueRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد معاملات معلقة
                </p>
              ) : (
                <RevenueTable data={pendingRevenueRecords} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
