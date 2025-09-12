import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_sar: number;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  shipping_address: any;
}

interface OrderStatusHistory {
  id: string;
  new_status: string;
  created_at: string;
  notes: string | null;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');

  const fetchOrderByNumber = async (orderNumber: string) => {
    if (!orderNumber.trim()) {
      toast.error('يرجى إدخال رقم الطلب');
      return;
    }

    setLoading(true);
    try {
      const { data: orderData, error } = await supabase
        .from('ecommerce_orders')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!orderData) {
        toast.error('لم يتم العثور على الطلب');
        return;
      }

      setOrder(orderData);

      // Fetch order status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderData.id)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching order history:', historyError);
      } else {
        setStatusHistory(historyData || []);
      }

    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('حدث خطأ أثناء البحث عن الطلب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderByNumber(orderId);
    }
  }, [orderId]);

  const handleSearch = () => {
    fetchOrderByNumber(searchOrderNumber);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'في الانتظار', variant: 'secondary' },
      CONFIRMED: { label: 'مؤكد', variant: 'default' },
      PREPARING: { label: 'قيد التحضير', variant: 'default' },
      SHIPPED: { label: 'تم الشحن', variant: 'default' },
      DELIVERED: { label: 'تم التسليم', variant: 'default' },
      CANCELLED: { label: 'ملغى', variant: 'destructive' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'في الانتظار', variant: 'secondary' },
      PAID: { label: 'مدفوع', variant: 'default' },
      FAILED: { label: 'فشل', variant: 'destructive' },
      REFUNDED: { label: 'مسترد', variant: 'outline' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'CONFIRMED':
      case 'PREPARING':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">تتبع الطلب</CardTitle>
          <CardDescription className="text-center">
            تتبع حالة طلبك ومعرفة موعد وصوله
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="orderNumber">رقم الطلب</Label>
              <Input
                id="orderNumber"
                type="text"
                placeholder="أدخل رقم الطلب"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="sm:mt-6"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'جاري البحث...' : 'بحث'}
            </Button>
          </div>

          {order && (
            <>
              <Separator />
              
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">رقم الطلب</Label>
                      <p className="font-semibold">{order.order_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">تاريخ الطلب</Label>
                      <p>{new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">المبلغ الإجمالي</Label>
                      <p className="font-semibold">{order.total_sar} ريال</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    {order.tracking_number && (
                      <div>
                        <Label className="text-sm text-muted-foreground">رقم التتبع</Label>
                        <p className="font-mono bg-muted p-2 rounded">{order.tracking_number}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات الشحن</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">اسم العميل</Label>
                      <p>{order.customer_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">رقم الهاتف</Label>
                      <p className="font-mono">{order.customer_phone}</p>
                    </div>
                    {order.shipping_address && (
                      <div>
                        <Label className="text-sm text-muted-foreground">عنوان الشحن</Label>
                        <div className="bg-muted p-3 rounded text-sm">
                          <p>{order.shipping_address.street}</p>
                          <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Status Timeline */}
              {statusHistory.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">تاريخ الطلب</h3>
                                    <div className="space-y-4">
                                      {statusHistory.map((history, index) => (
                                        <div key={history.id} className="flex items-start gap-4">
                                          <div className="flex flex-col items-center">
                                            {getStatusIcon(history.new_status)}
                                            {index < statusHistory.length - 1 && (
                                              <div className="w-px h-8 bg-border mt-2"></div>
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              {getStatusBadge(history.new_status)}
                                              <span className="text-sm text-muted-foreground">
                                                {new Date(history.created_at).toLocaleString('ar-SA')}
                                              </span>
                                            </div>
                                            {history.notes && (
                                              <p className="text-sm text-muted-foreground">{history.notes}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="flex justify-center">
                <Button onClick={() => navigate('/')} variant="outline">
                  العودة للمتجر
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTracking;