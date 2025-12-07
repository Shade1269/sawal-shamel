import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  EnhancedCard,
  EnhancedCardContent,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/index";
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { CheckCircle, ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  shipping_address: any;
  subtotal_sar: number;
  total_sar: number;
  tax_sar: number;
  shipping_sar: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  product_image_url?: string | null;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number | null;
}

const OrderConfirmation = () => {
  const { slug, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      // جلب الطلب من order_hub أولاً
      const { data: hubOrder, error: hubError } = await supabase
        .from("order_hub")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (hubError) throw hubError;
      if (!hubOrder) {
        setOrder(null);
        setOrderItems([]);
        return;
      }

      // جلب تفاصيل الطلب من المصدر الأصلي
      if (hubOrder.source === 'ecommerce' && hubOrder.source_order_id) {
        const { data: ecomOrder, error: ecomError } = await supabase
          .from("ecommerce_orders")
          .select(`
            payment_method,
            payment_status,
            shipping_address,
            subtotal_sar,
            tax_sar,
            shipping_sar,
            ecommerce_order_items (
              id,
              product_title,
              product_image_url,
              quantity,
              unit_price_sar,
              total_price_sar
            )
          `)
          .eq("id", hubOrder.source_order_id)
          .maybeSingle();

        if (!ecomError && ecomOrder) {
          const { ecommerce_order_items, ...ecomRest } = ecomOrder as any;
          
          setOrder({
            id: hubOrder.id,
            order_number: hubOrder.order_number,
            customer_name: hubOrder.customer_name,
            customer_phone: hubOrder.customer_phone,
            status: hubOrder.status,
            total_sar: hubOrder.total_amount_sar,
            created_at: hubOrder.created_at,
            ...ecomRest,
          } as Order);
          
          setOrderItems((ecommerce_order_items as OrderItem[]) || []);
        }
      } else {
        // طلب من مصدر آخر، استخدم بيانات order_hub فقط
        setOrder({
          id: hubOrder.id,
          order_number: hubOrder.order_number,
          customer_name: hubOrder.customer_name,
          customer_phone: hubOrder.customer_phone,
          status: hubOrder.status,
          total_sar: hubOrder.total_amount_sar,
          created_at: hubOrder.created_at,
          payment_method: 'CASH_ON_DELIVERY',
          payment_status: hubOrder.payment_status || 'PENDING',
          shipping_address: {},
          subtotal_sar: hubOrder.total_amount_sar,
          tax_sar: 0,
          shipping_sar: 0,
        } as Order);
        
        setOrderItems([]);
      }

    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodText = (method: string) => {
    const normalized = method?.toUpperCase();
    switch (normalized) {
      case "ONLINE":
        return "الدفع الإلكتروني";
      case "CASH_ON_DELIVERY":
      case "COD":
        return "الدفع عند الاستلام";
      default:
        return method;
    }
  };

  const getShippingMethodText = (method: string) => {
    if (!method) return 'غير محدد';
    switch (method) {
      case "standard":
        return "التوصيل العادي";
      case "express":
        return "التوصيل السريع";
      case "pickup":
        return "الاستلام من المتجر";
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">في الانتظار</Badge>;
      case "CONFIRMED":
        return <Badge variant="default">مؤكد</Badge>;
      case "SHIPPED":
        return <Badge variant="outline">تم الشحن</Badge>;
      case "DELIVERED":
        return <Badge variant="default">تم التوصيل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleBackToStore = () => {
    navigate(`/store/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">الطلب غير موجود</h2>
            <Button onClick={handleBackToStore}>
              العودة للمتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToStore}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للمتجر
            </Button>
            <h1 className="text-2xl font-bold">تأكيد الطلب</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <EnhancedCard variant="success" className="mb-8">
          <EnhancedCardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-success">
              تم إنشاء طلبك بنجاح!
            </h2>
            <p className="text-muted-foreground mb-4">
              شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد التفاصيل.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-semibold">رقم الطلب: {order.order_number || order.id}</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>منتجات الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product_title}</h3>
                      <p className="text-muted-foreground">
                        الكمية: {item.quantity}
                      </p>
                    </div>
                    <div className="text-primary font-bold">
                      {(item.total_price_sar ?? item.unit_price_sar * item.quantity).toFixed(2)} ريال
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">الاسم:</span> {order.customer_name}
                  </div>
                  <div>
                    <span className="font-medium">الهاتف:</span> {order.customer_phone}
                  </div>
                  {order.shipping_address?.email && (
                    <div>
                      <span className="font-medium">البريد الإلكتروني:</span> {order.shipping_address.email}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">المدينة:</span> {order.shipping_address?.city}
                  </div>
                </div>
                <div>
                  <span className="font-medium">العنوان:</span> {order.shipping_address?.address}
                </div>
                {order.shipping_address?.notes && (
                  <div>
                    <span className="font-medium">ملاحظات:</span> {order.shipping_address.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{order.subtotal_sar.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>{order.tax_sar.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم الشحن:</span>
                    <span>{order.shipping_sar.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>المجموع الكلي:</span>
                    <span className="text-primary">{order.total_sar.toFixed(2)} ريال</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">حالة الطلب:</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div>
                    <span className="font-medium">طريقة الدفع:</span> {getPaymentMethodText(order.payment_method)}
                  </div>
                  <div>
                    <span className="font-medium">طريقة الشحن:</span> {getShippingMethodText(order.shipping_address?.shipping_method)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleBackToStore}
                >
                  متابعة التسوق
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;