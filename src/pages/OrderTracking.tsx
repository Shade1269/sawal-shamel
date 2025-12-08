import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  UnifiedCard, 
  UnifiedCardContent, 
  UnifiedCardDescription, 
  UnifiedCardHeader, 
  UnifiedCardTitle,
  UnifiedButton,
  UnifiedBadge
} from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_sar: number;
  customer_name: string | null;
  customer_phone: string | null;
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
      // البحث في order_hub أولاً
      const { data: hubOrder, error: hubError } = await supabase
        .from('order_hub')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .maybeSingle();

      if (hubError) throw hubError;

      if (!hubOrder) {
        toast.error('لم يتم العثور على الطلب');
        return;
      }

      // جلب التفاصيل الإضافية من المصدر الأصلي
      let additionalData: any = {};
      if (hubOrder.source === 'ecommerce' && hubOrder.source_order_id) {
        const { data: ecomOrder } = await supabase
          .from('ecommerce_orders')
          .select('tracking_number, shipping_address, shipped_at, delivered_at')
          .eq('id', hubOrder.source_order_id)
          .maybeSingle();
        
        if (ecomOrder) {
          additionalData = ecomOrder;
        }
      }

      setOrder({
        id: hubOrder.id,
        order_number: hubOrder.order_number ?? '',
        customer_name: hubOrder.customer_name ?? '',
        customer_phone: hubOrder.customer_phone ?? '',
        status: hubOrder.status ?? 'PENDING',
        payment_status: hubOrder.payment_status || 'PENDING',
        total_sar: hubOrder.total_amount_sar ?? 0,
        created_at: hubOrder.created_at,
        tracking_number: additionalData.tracking_number || null,
        shipping_address: additionalData.shipping_address || {},
        shipped_at: additionalData.shipped_at || null,
        delivered_at: additionalData.delivered_at || null,
      });

      // Fetch order status history من order_hub
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', hubOrder.id)
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
      CONFIRMED: { label: 'مؤكد', variant: 'info' },
      PREPARING: { label: 'قيد التحضير', variant: 'info' },
      SHIPPED: { label: 'تم الشحن', variant: 'info' },
      DELIVERED: { label: 'تم التسليم', variant: 'success' },
      CANCELLED: { label: 'ملغى', variant: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <UnifiedBadge variant={config.variant}>{config.label}</UnifiedBadge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'في الانتظار', variant: 'secondary' },
      PAID: { label: 'مدفوع', variant: 'success' },
      FAILED: { label: 'فشل', variant: 'error' },
      REFUNDED: { label: 'مسترد', variant: 'outline' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <UnifiedBadge variant={config.variant}>{config.label}</UnifiedBadge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'CONFIRMED':
      case 'PREPARING':
        return <Package className="h-5 w-5 text-info" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-accent" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedCard variant="glass" padding="none" className="max-w-4xl mx-auto">
        <UnifiedCardHeader className="p-6">
          <UnifiedCardTitle className="text-2xl font-bold text-center">تتبع الطلب</UnifiedCardTitle>
          <UnifiedCardDescription className="text-center">
            تتبع حالة طلبك ومعرفة موعد وصوله
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent className="space-y-6 p-6">
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
            <UnifiedButton 
              onClick={handleSearch} 
              disabled={loading}
              className="sm:mt-6"
              leftIcon={<Search className="h-4 w-4" />}
            >
              {loading ? 'جاري البحث...' : 'بحث'}
            </UnifiedButton>
          </div>

          {order && (
            <>
              <Separator />
              
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UnifiedCard variant="flat" padding="none">
                  <UnifiedCardHeader className="p-4">
                    <UnifiedCardTitle className="text-lg">معلومات الطلب</UnifiedCardTitle>
                  </UnifiedCardHeader>
                  <UnifiedCardContent className="space-y-4 p-4">
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
                  </UnifiedCardContent>
                </UnifiedCard>

                <UnifiedCard variant="flat" padding="none">
                  <UnifiedCardHeader className="p-4">
                    <UnifiedCardTitle className="text-lg">معلومات الشحن</UnifiedCardTitle>
                  </UnifiedCardHeader>
                  <UnifiedCardContent className="space-y-4 p-4">
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
                  </UnifiedCardContent>
                </UnifiedCard>
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
                <UnifiedButton onClick={() => navigate('/')} variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  العودة للمتجر
                </UnifiedButton>
              </div>
            </>
          )}
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default OrderTracking;