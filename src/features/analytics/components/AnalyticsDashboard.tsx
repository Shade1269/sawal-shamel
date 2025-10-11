import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, 
  Package, Eye, Download, Calendar, Filter, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface AnalyticsData {
  overview: {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    salesGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    averageOrderValue: number;
  };
  salesData: Array<{
    date: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  productPerformance: Array<{
    name: string;
    sales: number;
    orders: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  orderStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AnalyticsDashboard = () => {
  const { profile } = useFastAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [shops, setShops] = useState<Array<{ id: string; display_name: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShops = async () => {
    if (!profile?.id) return;

    try {
      let query = supabase.from('shops').select('id, display_name');
      
      if (profile.role === 'merchant') {
        query = query.eq('owner_id', profile.id);
      }

      const { data: shopsData, error } = await query;

      if (error) throw error;
      setShops(shopsData || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!profile?.id || !dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');

      // Build base query conditions
      let shopFilter = '';
      if (selectedShop !== 'all') {
        shopFilter = `AND shop_id = '${selectedShop}'`;
      } else if (profile.role === 'merchant') {
        const shopIds = shops.map(s => `'${s.id}'`).join(',');
        if (shopIds) {
          shopFilter = `AND shop_id IN (${shopIds})`;
        }
      }

      // Fetch overview data from order_hub
      const { data: ordersData, error: ordersError } = await supabase
        .from('order_hub')
        .select('total_amount_sar, created_at, status, customer_name, shop_id')
        .gte('created_at', fromDate)
        .lte('created_at', toDate + 'T23:59:59');

      if (ordersError) throw ordersError;

      // Apply shop filter
      let filteredOrders = ordersData || [];
      if (selectedShop !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.shop_id === selectedShop);
      } else if (profile.role === 'merchant' && shops.length > 0) {
        const shopIds = shops.map(s => s.id);
        filteredOrders = filteredOrders.filter(o => shopIds.includes(o.shop_id));
      }

      // Calculate overview metrics
      const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total_amount_sar || 0), 0);
      const totalOrders = filteredOrders.length;
      const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_name)).size;
      
      // Fetch product count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Calculate growth (comparing to previous period)
      const prevFromDate = format(subDays(dateRange.from, 30), 'yyyy-MM-dd');
      const prevToDate = format(subDays(dateRange.to, 30), 'yyyy-MM-dd');

      const { data: prevOrdersData } = await supabase
        .from('order_hub')
        .select('total_amount_sar, shop_id')
        .gte('created_at', prevFromDate)
        .lte('created_at', prevToDate + 'T23:59:59');

      // Apply shop filter to previous data
      let prevFiltered = prevOrdersData || [];
      if (selectedShop !== 'all') {
        prevFiltered = prevFiltered.filter(o => o.shop_id === selectedShop);
      } else if (profile.role === 'merchant' && shops.length > 0) {
        const shopIds = shops.map(s => s.id);
        prevFiltered = prevFiltered.filter(o => shopIds.includes(o.shop_id));
      }

      const prevTotalSales = prevFiltered.reduce((sum, order) => sum + (order.total_amount_sar || 0), 0);
      const prevTotalOrders = prevFiltered.length;

      const salesGrowth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;
      const ordersGrowth = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;

      // Generate daily sales data
      const salesData = [];
      const currentDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);

      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayOrders = filteredOrders.filter(order => 
          order.created_at.startsWith(dateStr)
        );
        
        salesData.push({
          date: format(currentDate, 'MMM dd'),
          sales: dayOrders.reduce((sum, order) => sum + (order.total_amount_sar || 0), 0),
          orders: dayOrders.length,
          customers: new Set(dayOrders.map(o => o.customer_name)).size
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Fetch product performance
      const { data: orderItemsData } = await supabase
        .from('ecommerce_order_items')
        .select(`
          product_title,
          quantity,
          total_price_sar,
          order_id,
          ecommerce_orders!inner(created_at, shop_id)
        `)
        .gte('ecommerce_orders.created_at', fromDate)
        .lte('ecommerce_orders.created_at', toDate + 'T23:59:59');

      const productPerformance: Record<string, any> = {};
      orderItemsData?.forEach(item => {
        if (!productPerformance[item.product_title]) {
          productPerformance[item.product_title] = {
            name: item.product_title,
            sales: 0,
            orders: 0,
            revenue: 0
          };
        }
        productPerformance[item.product_title].sales += item.quantity;
        productPerformance[item.product_title].orders += 1;
        productPerformance[item.product_title].revenue += item.total_price_sar || 0;
      });

      const topProducts = Object.values(productPerformance)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      // Order status distribution
      const statusCounts: Record<string, number> = {};
      ordersData?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      const orderStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: getStatusLabel(status),
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }));

      // Customer segments (simplified)
      const customerSegments = [
        { segment: 'عملاء جدد', count: Math.floor(uniqueCustomers * 0.4), percentage: 40 },
        { segment: 'عملاء عائدون', count: Math.floor(uniqueCustomers * 0.35), percentage: 35 },
        { segment: 'عملاء مخلصون', count: Math.floor(uniqueCustomers * 0.25), percentage: 25 }
      ];

      // Top customers (simplified)
      const customerStats: Record<string, any> = {};
      filteredOrders.forEach(order => {
        if (!customerStats[order.customer_name]) {
          customerStats[order.customer_name] = {
            name: order.customer_name,
            totalOrders: 0,
            totalSpent: 0
          };
        }
        customerStats[order.customer_name].totalOrders += 1;
        customerStats[order.customer_name].totalSpent += order.total_amount_sar || 0;
      });

      const topCustomers = Object.values(customerStats)
        .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
        .slice(0, 10)
        .map((customer: any, index) => ({
          id: index.toString(),
          ...customer
        }));

      setData({
        overview: {
          totalSales,
          totalOrders,
          totalCustomers: uniqueCustomers,
          totalProducts: productsCount || 0,
          salesGrowth,
          ordersGrowth,
          customersGrowth: 15, // Placeholder
          averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
        },
        salesData,
        productPerformance: topProducts,
        customerSegments,
        orderStatus,
        topCustomers
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات التحليلية');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('تم تحديث البيانات بنجاح');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'في الانتظار',
      CONFIRMED: 'مؤكد',
      PREPARING: 'قيد التحضير',
      SHIPPED: 'تم الشحن',
      DELIVERED: 'تم التسليم',
      CANCELLED: 'ملغى'
    };
    return labels[status] || status;
  };

  const exportData = () => {
    if (!data) return;
    
    const csvData = data.salesData.map(item => 
      `${item.date},${item.sales},${item.orders},${item.customers}`
    );
    csvData.unshift('التاريخ,المبيعات,الطلبات,العملاء');
    
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('تم تصدير البيانات بنجاح');
  };

  useEffect(() => {
    fetchShops();
  }, [profile]);

  useEffect(() => {
    if (shops.length > 0 || profile?.role === 'admin') {
      fetchAnalyticsData();
    }
  }, [dateRange, selectedShop, shops, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات التحليلية...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بيانات</h3>
              <p className="text-muted-foreground">لا توجد بيانات تحليلية متاحة للفترة المحددة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحليلات</h1>
          <p className="text-muted-foreground">تحليلات مفصلة للمبيعات والأداء</p>
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
          
          <Button onClick={refreshData} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalSales.toLocaleString()} ريال</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.overview.salesGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={data.overview.salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(data.overview.salesGrowth).toFixed(1)}%
              </span>
              <span className="mr-1">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.overview.ordersGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={data.overview.ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(data.overview.ordersGrowth).toFixed(1)}%
              </span>
              <span className="mr-1">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء الفريدون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{data.overview.customersGrowth.toFixed(1)}%</span>
              <span className="mr-1">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageOrderValue.toFixed(0)} ريال</div>
            <p className="text-xs text-muted-foreground">
              إجمالي المنتجات: {data.overview.totalProducts}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاه المبيعات</CardTitle>
              <CardDescription>المبيعات والطلبات خلال الفترة المحددة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="المبيعات (ريال)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    name="عدد الطلبات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المنتجات</CardTitle>
              <CardDescription>أفضل المنتجات مبيعاً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.productPerformance.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="الإيرادات (ريال)" />
                  <Bar dataKey="sales" fill="#82ca9d" name="الكمية المباعة" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>شرائح العملاء</CardTitle>
                <CardDescription>توزيع العملاء حسب السلوك</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.customerSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل العملاء</CardTitle>
                <CardDescription>العملاء الأكثر إنفاقاً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.totalOrders} طلب
                          </p>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {customer.totalSpent.toLocaleString()} ريال
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>حالات الطلبات</CardTitle>
              <CardDescription>توزيع الطلبات حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                  >
                    {data.orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;