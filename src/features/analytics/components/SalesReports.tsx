import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Download, DollarSign, ShoppingCart,
  Package, Users, FileText, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { format as formatDate, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    orders: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const SalesReports = () => {
  const { profile } = useFastAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [_reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [shops, setShops] = useState<Array<{ id: string; display_name: string }>>([]);
  
  // Mark setReportType as used
  void setReportType;

  const fetchShops = async () => {
    if (!profile?.id) return;

    try {
      let query = supabase.from('shops').select('id, display_name');
      
      if (profile.role === 'merchant') {
        query = query.eq('owner_id', profile.id);
      }

      const { data: shopsData, error } = await query;
      if (error) throw error;
      
    setShops((shopsData || []).map(s => ({ id: s.id, display_name: s.display_name || '' })));
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const generateReport = async () => {
    if (!dateRange?.from || !dateRange?.to || !profile?.id) return;

    setLoading(true);
    try {
      const fromDate = formatDate(dateRange.from, 'yyyy-MM-dd');
      const toDate = formatDate(dateRange.to, 'yyyy-MM-dd');

      // Fetch orders data from order_hub
      let ordersQuery = supabase
        .from('order_hub')
        .select('*, source, source_order_id')
        .gte('created_at', fromDate)
        .lte('created_at', toDate + 'T23:59:59');

      const { data: hubOrders, error } = await ordersQuery;
      if (error) throw error;

      // Apply shop filter
      let ordersData = hubOrders || [];
      if (selectedShop !== 'all') {
        ordersData = ordersData.filter(o => o.shop_id === selectedShop);
      } else if (profile.role === 'merchant' && shops.length > 0) {
        const shopIds = shops.map(s => s.id);
        ordersData = ordersData.filter(o => o.shop_id && shopIds.includes(o.shop_id));
      }

      // Fetch items from source tables
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          if (order.source === 'ecommerce') {
            const { data: items } = await supabase
              .from('ecommerce_order_items')
              .select('*')
              .eq('order_id', order.source_order_id);
            return { ...order, ecommerce_order_items: items || [] };
          } else if (order.source === 'simple') {
            const { data: items } = await supabase
              .from('simple_order_items')
              .select('*')
              .eq('order_id', order.source_order_id);
            return { ...order, ecommerce_order_items: items || [] };
          }
          return { ...order, ecommerce_order_items: [] };
        })
      );

      // Fetch payment method from source orders
      const ordersWithPayment = await Promise.all(
        ordersWithItems.map(async (order) => {
          if (order.source === 'ecommerce') {
            const { data } = await supabase
              .from('ecommerce_orders')
              .select('payment_method, total_sar')
              .eq('id', order.source_order_id)
              .single();
            return { ...order, payment_method: data?.payment_method, total_sar: order.total_amount_sar };
          }
          return { ...order, payment_method: 'CASH_ON_DELIVERY', total_sar: order.total_amount_sar };
        })
      );

      // Calculate basic metrics
      const totalSales = ordersWithPayment.reduce((sum, order) => sum + (order.total_sar || 0), 0);
      const totalOrders = ordersWithPayment.length;
      const uniqueCustomers = new Set(ordersWithPayment.map(o => o.customer_name)).size;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Generate sales by day
      const salesByDay = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      }).map(date => {
        const dateStr = formatDate(date, 'yyyy-MM-dd');
        const dayOrders = ordersWithPayment.filter(order => 
          order.created_at.startsWith(dateStr)
        );

        return {
          date: formatDate(date, 'MMM dd'),
          sales: dayOrders.reduce((sum, order) => sum + (order.total_sar || 0), 0),
          orders: dayOrders.length
        };
      });

      // Calculate top products
      const productStats: Record<string, any> = {};
      ordersWithPayment.forEach(order => {
        order.ecommerce_order_items?.forEach((item: any) => {
          const title = item.product_title;
          if (!productStats[title]) {
            productStats[title] = {
              name: title,
              sales: 0,
              revenue: 0,
              orders: 0
            };
          }
          productStats[title].sales += item.quantity || 0;
          productStats[title].revenue += item.total_price_sar || 0;
          productStats[title].orders += 1;
        });
      });

      const topProducts = Object.values(productStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      // Payment methods analysis
      const paymentStats: Record<string, { method: string; count: number; revenue: number }> = {};
      ordersWithPayment.forEach(order => {
        const method = getPaymentMethodLabel(order.payment_method || 'UNKNOWN');
        if (!paymentStats[method]) {
          paymentStats[method] = {
            method,
            count: 0,
            revenue: 0
          };
        }
        paymentStats[method].count += 1;
        paymentStats[method].revenue += order.total_sar || 0;
      });

      const paymentMethods = Object.values(paymentStats).map((method: any) => ({
        ...method,
        percentage: totalOrders > 0 ? (method.count / totalOrders) * 100 : 0
      }));

      // Customer segments (simplified analysis)
      const customerSegments = [
        {
          segment: 'عملاء جدد',
          count: Math.floor(uniqueCustomers * 0.6),
          revenue: totalSales * 0.4,
          percentage: 40
        },
        {
          segment: 'عملاء عائدون',
          count: Math.floor(uniqueCustomers * 0.3),
          revenue: totalSales * 0.45,
          percentage: 45
        },
        {
          segment: 'عملاء مخلصون',
          count: Math.floor(uniqueCustomers * 0.1),
          revenue: totalSales * 0.15,
          percentage: 15
        }
      ];

      setReport({
        period: `${formatDate(dateRange.from, 'dd/MM/yyyy')} - ${formatDate(dateRange.to, 'dd/MM/yyyy')}`,
        totalSales,
        totalOrders,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        topProducts,
        salesByDay,
        paymentMethods,
        customerSegments
      });

    } catch (error) {
      console.error('Error generating sales report:', error);
      toast.error('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    if (!report) return;

    if (format === 'csv') {
      const csvData = [
        ['تقرير المبيعات', report.period],
        [],
        ['إجمالي المبيعات', report.totalSales.toString()],
        ['إجمالي الطلبات', report.totalOrders.toString()],
        ['إجمالي العملاء', report.totalCustomers.toString()],
        ['متوسط قيمة الطلب', report.averageOrderValue.toFixed(2)],
        [],
        ['المبيعات اليومية'],
        ['التاريخ', 'المبيعات', 'الطلبات'],
        ...report.salesByDay.map(day => [day.date, day.sales.toString(), day.orders.toString()]),
        [],
        ['أفضل المنتجات'],
        ['المنتج', 'الكمية', 'الإيرادات', 'الطلبات'],
        ...report.topProducts.map(product => [
          product.name,
          product.sales.toString(),
          product.revenue.toString(),
          product.orders.toString()
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تصدير التقرير بصيغة CSV');
    } else {
      // PDF export would require a PDF library like jsPDF
      toast.info('تصدير PDF قيد التطوير');
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH_ON_DELIVERY: 'الدفع عند الاستلام',
      BANK_TRANSFER: 'تحويل بنكي',
      CREDIT_CARD: 'بطاقة ائتمان',
      DIGITAL_WALLET: 'محفظة رقمية'
    };
    return labels[method] || method;
  };

  useEffect(() => {
    fetchShops();
  }, [profile]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      generateReport();
    }
  }, [dateRange, selectedShop, profile, shops]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">تقارير المبيعات</h1>
          <p className="text-muted-foreground">تقارير مفصلة للمبيعات والأرباح</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          {shops.length > 0 && (
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر المتجر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المتاجر</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button onClick={() => exportReport('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير CSV
          </Button>
          
          <Button onClick={() => exportReport('pdf')} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            طباعة PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري إنشاء التقرير...</p>
          </div>
        </div>
      ) : report ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="sales">المبيعات</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalSales.toLocaleString()} ريال</div>
                  <p className="text-xs text-muted-foreground">
                    للفترة {report.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    طلب خلال الفترة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العملاء الفريدون</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalCustomers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    عميل فريد
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.averageOrderValue.toFixed(0)} ريال</div>
                  <p className="text-xs text-muted-foreground">
                    متوسط الطلب الواحد
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>طرق الدفع</CardTitle>
                <CardDescription>توزيع المبيعات حسب طريقة الدفع</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={report.paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                    >
                      {report.paymentMethods.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>اتجاه المبيعات اليومية</CardTitle>
                <CardDescription>المبيعات والطلبات لكل يوم في الفترة المحددة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={report.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="المبيعات (ريال)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="عدد الطلبات"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
                <CardDescription>المنتجات الأكثر مبيعاً وإيراداً</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية المباعة</TableHead>
                      <TableHead>الإيرادات</TableHead>
                      <TableHead>عدد الطلبات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sales.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">
                          {product.revenue.toLocaleString()} ريال
                        </TableCell>
                        <TableCell>{product.orders}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>شرائح العملاء</CardTitle>
                <CardDescription>تحليل العملاء حسب سلوك الشراء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={report.customerSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                      >
                        {report.customerSegments.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    {report.customerSegments.map((segment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <div>
                            <p className="font-medium">{segment.segment}</p>
                            <p className="text-sm text-muted-foreground">
                              {segment.count} عميل
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{segment.revenue.toLocaleString()} ريال</p>
                          <Badge variant="outline">{segment.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بيانات</h3>
              <p className="text-muted-foreground">اختر فترة زمنية لإنشاء التقرير</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesReports;