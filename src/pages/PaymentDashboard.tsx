import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  DollarSign,
  Receipt,
  RefreshCw,
  Search,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  Calendar,
  ArrowDownRight,
  Banknote,
  Smartphone,
  CreditCardIcon,
  Building,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BackButton } from '@/components/ui/back-button';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  refundAmount: number;
  avgTransactionValue: number;
  gatewayFees: number;
}

interface Transaction {
  id: string;
  transaction_id: string;
  amount_sar: number;
  gateway_fee_sar: number | null;
  payment_status: string;
  gateway_name: string | null;
  created_at: string;
  order_id: string;
  customer_name?: string;
  net_amount_sar?: number;
}

interface PaymentGateway {
  id: string;
  gateway_name: string;
  display_name: string;
  is_enabled: boolean;
  fixed_fee_sar: number;
  percentage_fee: number;
  total_transactions: number;
  total_revenue: number;
}

const PaymentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    refundAmount: 0,
    avgTransactionValue: 0,
    gatewayFees: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGateway, setSelectedGateway] = useState('all');
  
  // بيانات المخططات البيانية
  const [chartData] = useState([
    { name: 'يناير', revenue: 45000, transactions: 120 },
    { name: 'فبراير', revenue: 52000, transactions: 145 },
    { name: 'مارس', revenue: 48000, transactions: 130 },
    { name: 'أبريل', revenue: 61000, transactions: 168 },
    { name: 'مايو', revenue: 55000, transactions: 152 },
    { name: 'يونيو', revenue: 67000, transactions: 185 }
  ]);

  const gatewayDistribution = [
    { name: 'مدى', value: 35, color: 'hsl(var(--success))' },
    { name: 'فيزا', value: 28, color: 'hsl(var(--info))' },
    { name: 'ماستركارد', value: 20, color: 'hsl(var(--destructive))' },
    { name: 'STC Pay', value: 12, color: 'hsl(var(--premium))' },
    { name: 'أخرى', value: 5, color: 'hsl(var(--muted-foreground))' }
  ];

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      // جلب المعاملات من order_hub
      const { data: transactionsData } = await supabase
        .from('ecommerce_payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsData) {
        // جلب اسماء العملاء من order_hub
        const transactionsWithCustomers = await Promise.all(
          transactionsData.map(async (transaction) => {
            const { data: hubOrder } = await supabase
              .from('order_hub')
              .select('customer_name, source, source_order_id')
              .eq('source', 'ecommerce')
              .eq('source_order_id', transaction.order_id)
              .maybeSingle();

            return {
              ...transaction,
              customer_name: hubOrder?.customer_name || null,
              net_amount_sar: transaction.amount_sar - (transaction.gateway_fee_sar || 0),
            };
          })
        );

        setTransactions(transactionsWithCustomers);

        // حساب الإحصائيات
        const totalRevenue = transactionsWithCustomers
          .filter(t => t.payment_status === 'COMPLETED')
          .reduce((sum, t) => sum + (t.net_amount_sar || 0), 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlyRevenue = transactionsWithCustomers
          .filter(t => t.payment_status === 'COMPLETED' && new Date(t.created_at) >= thisMonth)
          .reduce((sum, t) => sum + (t.net_amount_sar || 0), 0);

        const gatewayFees = transactionsWithCustomers
          .reduce((sum, t) => sum + (t.gateway_fee_sar || 0), 0);

        setStats({
          totalRevenue,
          monthlyRevenue,
          pendingPayments: transactionsWithCustomers.filter(t => t.payment_status === 'PENDING').length,
          completedPayments: transactionsWithCustomers.filter(t => t.payment_status === 'COMPLETED').length,
          failedPayments: transactionsWithCustomers.filter(t => t.payment_status === 'FAILED').length,
          refundAmount: 0, // سيتم جلبها من جدول المرتجعات
          avgTransactionValue: totalRevenue / Math.max(transactionsWithCustomers.length, 1),
          gatewayFees
        });
      }

      // جلب بيانات بوابات الدفع
      const { data: gatewaysData } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });

      if (gatewaysData) {
        setGateways(gatewaysData as any);
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات المدفوعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-success/10 text-success dark:bg-success/20 dark:text-success';
      case 'PENDING':
        return 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning';
      case 'FAILED':
        return 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive';
      default:
        return 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground';
    }
  };

  const formatGatewayLabel = (gatewayName: string) => {
    switch (gatewayName.toLowerCase()) {
      case 'cash on delivery':
        return 'الدفع عند الاستلام';
      case 'stcpay':
        return 'STC Pay';
      case 'mada':
        return 'مدى';
      default:
        return gatewayName;
    }
  };

  const getGatewayIcon = (gatewayName: string) => {
    switch (gatewayName.toLowerCase()) {
      case 'mada':
      case 'مدى':
        return <Banknote className="h-4 w-4" />;
      case 'stcpay':
        return <Smartphone className="h-4 w-4" />;
      case 'visa':
      case 'mastercard':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'cash on delivery':
        return <Banknote className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const gatewayOptions = useMemo(() => {
    const optionMap = new Map<string, string>();

    gateways.forEach((gateway) => {
      if (gateway.gateway_name) {
        optionMap.set(gateway.gateway_name, gateway.display_name || formatGatewayLabel(gateway.gateway_name));
      }
    });

    transactions.forEach((transaction) => {
      if (transaction.gateway_name && !optionMap.has(transaction.gateway_name)) {
        optionMap.set(transaction.gateway_name, formatGatewayLabel(transaction.gateway_name));
      }
    });

    return Array.from(optionMap.entries()).map(([value, label]) => ({ value, label }));
  }, [gateways, transactions]);

  const filteredTransactions = transactions.filter(transaction => {
    const customerName = transaction.customer_name?.toLowerCase() || '';
    const matchesSearch = transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || transaction.payment_status === selectedStatus;
    const matchesGateway = selectedGateway === 'all' ||
                          (transaction.gateway_name || '').toLowerCase() === selectedGateway.toLowerCase();

    return matchesSearch && matchesStatus && matchesGateway;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات المدفوعات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              لوحة إدارة المدفوعات
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة شاملة للمدفوعات والفواتير الضريبية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            <Receipt className="h-4 w-4 ml-2" />
            الفواتير
          </Button>
          <Button variant="outline" onClick={() => navigate('/refunds')}>
            <RefreshCw className="h-4 w-4 ml-2" />
            المرتجعات
          </Button>
          <Button onClick={() => navigate('/payment-gateways')}>
            <Settings className="h-4 w-4 ml-2" />
            إعدادات البوابات
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-success">
                  {stats.totalRevenue.toLocaleString()} ر.س
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  +12.5% من الشهر الماضي
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">هذا الشهر</p>
                <p className="text-2xl font-bold text-info">
                  {stats.monthlyRevenue.toLocaleString()} ر.س
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  +8.2% من المتوقع
                </p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معاملات مكتملة</p>
                <p className="text-2xl font-bold text-success">{stats.completedPayments}</p>
                <p className="text-xs text-muted-foreground">
                  من {stats.completedPayments + stats.pendingPayments + stats.failedPayments} معاملة
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">رسوم البوابات</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.gatewayFees.toLocaleString()} ر.س
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 ml-1" />
                  {((stats.gatewayFees / Math.max(stats.totalRevenue, 1)) * 100).toFixed(1)}% من الإيرادات
                </p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المخططات البيانية والتحليلات */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>تطور الإيرادات الشهرية</CardTitle>
            <CardDescription>مقارنة الإيرادات وعدد المعاملات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="الإيرادات (ر.س)"
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="hsl(var(--info))" 
                  strokeWidth={2}
                  name="عدد المعاملات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع البوابات</CardTitle>
            <CardDescription>نسبة استخدام بوابات الدفع</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gatewayDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gatewayDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {gatewayDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المعاملات */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>سجل المعاملات</CardTitle>
              <CardDescription>جميع معاملات الدفع الحديثة</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في المعاملات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-64"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">جميع الحالات</option>
                <option value="PAID">مدفوعة</option>
                <option value="PENDING">معلقة</option>
                <option value="FAILED">فاشلة</option>
              </select>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">جميع البوابات</option>
                {gatewayOptions.map((gateway) => (
                  <option key={gateway.value} value={gateway.value}>
                    {gateway.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم المعاملة</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">المبلغ</th>
                  <th className="text-right p-3 font-medium">الرسوم</th>
                  <th className="text-right p-3 font-medium">الصافي</th>
                  <th className="text-right p-3 font-medium">البوابة</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">التاريخ</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-mono text-sm">{transaction.transaction_id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {transaction.customer_name || 'غير محدد'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-success">
                        {transaction.amount_sar.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-destructive">
                        -{(transaction.gateway_fee_sar || 0).toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {transaction.net_amount_sar.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getGatewayIcon(transaction.gateway_name || '')}
                        <span className="text-sm">
                          {transaction.gateway_name ? formatGatewayLabel(transaction.gateway_name) : 'غير محدد'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(transaction.payment_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.payment_status)}
                          <span>
                            {transaction.payment_status === 'PAID' ? 'مدفوعة' :
                             transaction.payment_status === 'PENDING' ? 'معلقة' :
                             transaction.payment_status === 'FAILED' ? 'فاشلة' : transaction.payment_status}
                          </span>
                        </div>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleTimeString('ar-SA')}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">لا توجد معاملات مطابقة للبحث</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDashboard;
