import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileDown, TrendingUp, TrendingDown, BarChart3, ArrowUpDown } from 'lucide-react';

interface MovementReport {
  id: string;
  movement_number: string;
  movement_type: string;
  quantity: number;
  created_at: string;
  reference_type: string | null;
  notes: string | null;
}

interface InventoryReportsProps {
  refreshTrigger?: number;
}

export function InventoryReports({ refreshTrigger }: InventoryReportsProps) {
  const [movements, setMovements] = useState<MovementReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'movements' | 'stock_levels' | 'alerts'>('movements');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');

  const loadMovements = async () => {
    setLoading(true);
    try {
      // حساب تاريخ البداية بناءً على المدى المحدد
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [dateRange, refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(value);
  };

  const getMovementIcon = (type: string) => {
    return type === 'IN' ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const getMovementBadge = (type: string) => {
    return type === 'IN' ? (
      <Badge variant="outline" className="text-success border-success">
        دخول
      </Badge>
    ) : (
      <Badge variant="outline" className="text-destructive border-destructive">
        خروج
      </Badge>
    );
  };

  const getDateRangeText = (range: string) => {
    const ranges = {
      today: 'اليوم',
      week: 'آخر أسبوع',
      month: 'آخر شهر',
      quarter: 'آخر 3 شهور'
    };
    return ranges[range as keyof typeof ranges] || range;
  };

  const totalIn = movements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0);
  const netMovement = totalIn - totalOut;

  const exportToCSV = () => {
    const headers = ['رقم الحركة', 'النوع', 'الكمية', 'التاريخ', 'المرجع', 'الملاحظات'];
    const csvContent = [
      headers.join(','),
      ...movements.map(movement => [
        movement.movement_number,
        movement.movement_type === 'IN' ? 'دخول' : 'خروج',
        movement.quantity,
        formatDate(movement.created_at),
        movement.reference_type || 'غير محدد',
        movement.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_حركات_المخزون_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            تقارير المخزون
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            تصدير CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* خيارات التقرير */}
        <div className="flex flex-wrap gap-4">
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="نوع التقرير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movements">حركات المخزون</SelectItem>
              <SelectItem value="stock_levels">مستويات المخزون</SelectItem>
              <SelectItem value="alerts">التنبيهات</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="quarter">آخر 3 شهور</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ملخص الحركات */}
        {reportType === 'movements' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الدخول</p>
                      <p className="text-2xl font-bold text-success">{formatNumber(totalIn)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الخروج</p>
                      <p className="text-2xl font-bold text-destructive">{formatNumber(totalOut)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-info" />
                    <div>
                      <p className="text-sm text-muted-foreground">صافي الحركة</p>
                      <p className={`text-2xl font-bold ${netMovement >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {netMovement >= 0 ? '+' : ''}{formatNumber(netMovement)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* جدول الحركات */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                تفاصيل الحركات - {getDateRangeText(dateRange)} ({movements.length} حركة)
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الحركة</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead>المرجع</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          جاري تحميل البيانات...
                        </TableCell>
                      </TableRow>
                    ) : movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          لا توجد حركات في الفترة المحددة
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-mono text-sm">
                            {movement.movement_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMovementIcon(movement.movement_type)}
                              {getMovementBadge(movement.movement_type)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {formatNumber(movement.quantity)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {movement.reference_type === 'ORDER' 
                              ? 'طلب عميل'
                              : movement.reference_type === 'MANUAL_ADD'
                              ? 'إضافة يدوية'
                              : movement.reference_type === 'RETURN'
                              ? 'استرجاع'
                              : movement.reference_type || 'غير محدد'
                            }
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(movement.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {movement.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* تقارير أخرى */}
        {reportType === 'stock_levels' && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>تقرير مستويات المخزون قيد التطوير</p>
          </div>
        )}

        {reportType === 'alerts' && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>تقرير التنبيهات قيد التطوير</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}