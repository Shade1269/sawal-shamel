import { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface Commission {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'paid';
  date: string;
  payout_date?: string;
}

interface OrderCommissionManagementProps {
  storeId: string;
}

export const OrderCommissionManagement = (_props: OrderCommissionManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  // بيانات وهمية للطلبات
  const [orders] = useState<Order[]>([
    {
      id: '1',
      order_number: 'ORD-2024-001',
      customer_name: 'سارة أحمد',
      order_date: '2024-01-15',
      total_amount: 299,
      commission_rate: 15,
      commission_amount: 44.85,
      status: 'delivered',
      payment_status: 'paid',
      items: [
        { product_name: 'فستان أنيق للمناسبات', quantity: 1, price: 299 }
      ]
    },
    {
      id: '2',
      order_number: 'ORD-2024-002',
      customer_name: 'نور محمد',
      order_date: '2024-01-16',
      total_amount: 348,
      commission_rate: 12,
      commission_amount: 41.76,
      status: 'confirmed',
      payment_status: 'paid',
      items: [
        { product_name: 'حقيبة يد جلدية فاخرة', quantity: 1, price: 189 },
        { product_name: 'حذاء رياضي عصري', quantity: 1, price: 159 }
      ]
    },
    {
      id: '3',
      order_number: 'ORD-2024-003',
      customer_name: 'ليلى سالم',
      order_date: '2024-01-17',
      total_amount: 159,
      commission_rate: 10,
      commission_amount: 15.9,
      status: 'pending',
      payment_status: 'pending',
      items: [
        { product_name: 'حذاء رياضي عصري', quantity: 1, price: 159 }
      ]
    }
  ]);

  // بيانات وهمية للعمولات
  const [commissions] = useState<Commission[]>([
    {
      id: '1',
      order_id: '1',
      amount: 44.85,
      status: 'paid',
      date: '2024-01-15',
      payout_date: '2024-01-20'
    },
    {
      id: '2',
      order_id: '2',
      amount: 41.76,
      status: 'confirmed',
      date: '2024-01-16'
    },
    {
      id: '3',
      order_id: '3',
      amount: 15.9,
      status: 'pending',
      date: '2024-01-17'
    }
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'الكل' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'pending': 'في الانتظار',
      'confirmed': 'مؤكد',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي',
      'paid': 'مدفوع',
      'failed': 'فشل'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const handleViewOrder = (orderId: string) => {
    toast({
      title: "عرض الطلب",
      description: "سيتم فتح تفاصيل الطلب قريباً"
    });
  };

  const handleExportData = () => {
    toast({
      title: "تصدير البيانات",
      description: "سيتم تصدير البيانات قريباً"
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العمولات</p>
                <p className="text-2xl font-bold">{totalCommissions.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">العمولات المدفوعة</p>
                <p className="text-2xl font-bold">{paidCommissions.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">عمولات معلقة</p>
                <p className="text-2xl font-bold">{pendingCommissions.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="commissions">العمولات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  إدارة الطلبات
                </span>
                <Button onClick={handleExportData}>
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="الكل">كل الحالات</option>
                    <option value="pending">في الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-4 font-medium">رقم الطلب</th>
                        <th className="text-right p-4 font-medium">العميل</th>
                        <th className="text-right p-4 font-medium">التاريخ</th>
                        <th className="text-right p-4 font-medium">المبلغ</th>
                        <th className="text-right p-4 font-medium">العمولة</th>
                        <th className="text-right p-4 font-medium">حالة الطلب</th>
                        <th className="text-right p-4 font-medium">حالة الدفع</th>
                        <th className="text-right p-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="p-4">
                            <p className="font-medium">{order.order_number}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{order.customer_name}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{order.order_date}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{order.total_amount} ر.س</p>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.commission_amount} ر.س</p>
                              <p className="text-xs text-muted-foreground">({order.commission_rate}%)</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.payment_status)}
                              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {getStatusText(order.payment_status)}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                تفاصيل العمولات
              </CardTitle>
              <CardDescription>
                متابعة وإدارة العمولات المستحقة والمدفوعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-4 font-medium">رقم الطلب</th>
                        <th className="text-right p-4 font-medium">مبلغ العمولة</th>
                        <th className="text-right p-4 font-medium">التاريخ</th>
                        <th className="text-right p-4 font-medium">الحالة</th>
                        <th className="text-right p-4 font-medium">تاريخ الدفع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((commission) => {
                        const order = orders.find(o => o.id === commission.order_id);
                        return (
                          <tr key={commission.id} className="border-t">
                            <td className="p-4">
                              <p className="font-medium">{order?.order_number}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium">{commission.amount} ر.س</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">{commission.date}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(commission.status)}
                                <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                                  {getStatusText(commission.status)}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">
                                {commission.payout_date || '-'}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                تحليلات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold mb-4">أداء هذا الشهر</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>الطلبات:</span>
                      <span className="font-medium">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>العمولات:</span>
                      <span className="font-medium">{totalCommissions.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>متوسط العمولة:</span>
                      <span className="font-medium">{(totalCommissions / totalOrders).toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold mb-4">معدلات التحويل</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>معدل إتمام الطلبات:</span>
                      <span className="font-medium">
                        {((orders.filter(o => o.status === 'delivered').length / totalOrders) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل الدفع:</span>
                      <span className="font-medium">
                        {((orders.filter(o => o.payment_status === 'paid').length / totalOrders) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};