import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Copy,
  Share2,
  Home,
  Banknote,
  Receipt
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: any;
  total_amount_sar: number;
  payment_status: string;
  payment_method: string;
  order_status: string;
  created_at: string;
  items: Array<{
    id: string;
    product_title: string;
    product_image_url?: string;
    quantity: number;
    unit_price_sar: number;
    total_price_sar: number;
  }>;
}

const OrderConfirmationSimple = () => {
  const { orderId, slug } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // جلب تفاصيل الطلب
      const { data: orderData, error: orderError } = await supabase
        .from('simple_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // جلب عناصر الطلب
      const { data: itemsData, error: itemsError } = await supabase
        .from('simple_order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      setOrder({
        ...orderData,
        items: itemsData || []
      });

    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('خطأ في جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      toast.success('تم نسخ رقم الطلب');
    }
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تفاصيل الطلب',
        text: `رقم الطلب: ${order?.id}`,
        url: window.location.href
      });
    } else {
      copyOrderNumber();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELIVERED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'مؤكد';
      case 'PENDING': return 'في الانتظار';
      case 'PROCESSING': return 'قيد المعالجة';
      case 'SHIPPED': return 'تم الشحن';
      case 'DELIVERED': return 'تم التسليم';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'في الانتظار';
      case 'PAID': return 'مدفوع';
      case 'FAILED': return 'فشل';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الطلب غير موجود</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على الطلب المطلوب</p>
            <Button onClick={() => navigate('/')}>العودة للصفحة الرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(slug ? `/store/${slug}` : '/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              {slug ? 'العودة للمتجر' : 'العودة للرئيسية'}
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-semibold">تأكيد الطلب</h1>
              <p className="text-sm text-muted-foreground">تم إنشاء طلبك بنجاح</p>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* رسالة النجاح */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-green-800 mb-1">
                    تم إنشاء طلبك بنجاح!
                  </h2>
                  <p className="text-green-700">
                    سنتواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد موعد التوصيل
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* تفاصيل الطلب */}
            <div className="lg:col-span-2 space-y-6">
              {/* معلومات الطلب */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    معلومات الطلب
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyOrderNumber}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareOrder}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الطلب</p>
                      <p className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حالة الطلب</p>
                      <Badge className={getStatusColor(order.order_status)}>
                        {getStatusText(order.order_status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حالة الدفع</p>
                      <Badge className={getStatusColor(order.payment_status)}>
                        {getPaymentStatusText(order.payment_status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* عناصر الطلب */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    عناصر الطلب ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        {item.product_image_url && (
                          <img
                            src={item.product_image_url}
                            alt={item.product_title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.unit_price_sar} ريال × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.total_price_sar} ريال</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* معلومات التوصيل */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">اسم المستلم</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customer_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">العنوان</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{order.shipping_address.address}</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_address.city}</p>
                        {order.shipping_address.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>ملاحظات:</strong> {order.shipping_address.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ملخص الطلب */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* المجاميع */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{(order.total_amount_sar - 15)} ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رسوم الشحن:</span>
                      <span>15 ريال</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>المجموع الكلي:</span>
                      <span className="text-primary">{order.total_amount_sar} ريال</span>
                    </div>
                  </div>

                  <Separator />

                  {/* طريقة الدفع */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-800">الدفع عند الاستلام</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      ستدفع <strong>{order.total_amount_sar} ريال</strong> عند وصول الطلب
                    </p>
                  </div>

                  {/* الخطوات التالية */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">الخطوات التالية:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>سنتواصل معك خلال 24 ساعة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <span>تأكيد الطلب وموعد التوصيل</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <span>شحن وتوصيل الطلب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <span>الدفع عند الاستلام</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate(slug ? `/store/${slug}` : '/')}
                    className="w-full"
                  >
                    متابعة التسوق
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationSimple;