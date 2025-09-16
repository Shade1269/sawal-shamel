import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  total_sar: number;
  created_at: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  items: Array<{
    id: string;
    product_title: string;
    quantity: number;
    unit_price_sar: number;
  }>;
}

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}

const OrderTrackingPage = () => {
  const { store_slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderNumber, setOrderNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

  const trackOrder = async () => {
    if (!orderNumber.trim() || !customerPhone.trim()) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال رقم الطلب ورقم الجوال",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // البحث عن الطلب
      const { data: orderData, error } = await supabasePublic
        .from('ecommerce_orders')
        .select(`
          id,
          order_number,
          status,
          customer_name,
          customer_phone,
          total_sar,
          created_at,
          tracking_number,
          estimated_delivery_date
        `)
        .eq('order_number', orderNumber)
        .eq('customer_phone', customerPhone)
        .maybeSingle();

      if (error) throw error;

      if (!orderData) {
        toast({
          title: "الطلب غير موجود",
          description: "لم يتم العثور على طلب بهذه البيانات",
          variant: "destructive"
        });
        return;
      }

      // جلب عناصر الطلب
      const { data: itemsData } = await supabasePublic
        .from('ecommerce_order_items')
        .select('id, product_title, quantity, unit_price_sar')
        .eq('order_id', orderData.id);

      setOrder({
        ...orderData,
        items: itemsData || []
      });

      // إضافة أحداث التتبع التجريبية
      const mockEvents: TrackingEvent[] = [
        {
          date: orderData.created_at,
          status: 'تم استلام الطلب',
          description: 'تم تأكيد طلبكم وبدأت معالجته',
          location: 'المتجر'
        },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'قيد التحضير',
          description: 'جاري تحضير طلبكم للشحن',
          location: 'المستودع'
        },
        {
          date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: 'تم الشحن',
          description: 'تم شحن طلبكم وسيصل قريباً',
          location: 'مركز الشحن'
        }
      ];

      setTrackingEvents(mockEvents);

    } catch (error: any) {
      console.error('Error tracking order:', error);
      toast({
        title: "خطأ في البحث",
        description: "تعذر العثور على الطلب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'تم استلام الطلب':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'قيد التحضير':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'تم الشحن':
        return <Truck className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/s/${store_slug}`)}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للمتجر
            </Button>
            
            <div>
              <h1 className="text-xl font-bold">تتبع الطلب</h1>
            </div>
          </div>
        </div>
      </header>

      {/* محتوى الصفحة */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>البحث عن طلبك</CardTitle>
            <CardDescription>
              أدخل رقم الطلب ورقم الجوال للاستعلام عن حالة الطلب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-number">رقم الطلب</Label>
              <Input
                id="order-number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="مثال: ORD-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">رقم الجوال</Label>
              <Input
                id="customer-phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="مثال: 0501234567"
                type="tel"
              />
            </div>

            <Button
              onClick={trackOrder}
              disabled={loading}
              className="w-full"
            >
              {loading ? "جاري البحث..." : "تتبع الطلب"}
            </Button>
          </CardContent>
        </Card>

        {/* نتائج التتبع */}
        {order && (
          <div className="space-y-6 mt-8">
            {/* معلومات الطلب */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>طلب رقم {order.order_number}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <CardDescription>
                  تم الطلب في {new Date(order.created_at).toLocaleDateString('ar')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">اسم العميل:</span>
                    <div className="font-medium">{order.customer_name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المجموع:</span>
                    <div className="font-medium text-primary">{order.total_sar} ر.س</div>
                  </div>
                </div>

                {order.tracking_number && (
                  <div>
                    <span className="text-muted-foreground">رقم التتبع:</span>
                    <div className="font-medium">{order.tracking_number}</div>
                  </div>
                )}

                <Separator />

                {/* عناصر الطلب */}
                <div>
                  <h4 className="font-medium mb-3">المنتجات ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{item.product_title}</span>
                          <div className="text-xs text-muted-foreground">
                            الكمية: {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {(item.unit_price_sar * item.quantity).toFixed(2)} ر.س
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* مراحل التتبع */}
            <Card>
              <CardHeader>
                <CardTitle>مراحل التتبع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{event.status}</div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {event.description}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(event.date).toLocaleDateString('ar')}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTrackingPage;