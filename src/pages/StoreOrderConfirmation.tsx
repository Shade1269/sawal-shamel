import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock,
  Home,
  Phone,
  Mail,
  MapPin,
  Package,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: any;
  total_sar: number;
  status: string;
  payment_status: string;
  created_at: string;
  affiliate_store_id: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  product_image_url?: string | null;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
}

interface Store {
  store_name: string;
  store_slug: string;
  profiles?: {
    full_name: string;
    phone?: string;
  };
}

const StoreOrderConfirmation = () => {
  const { storeSlug, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && storeSlug) {
      fetchOrderData();
    }
  }, [orderId, storeSlug]);

  const fetchOrderData = async () => {
    try {
      // جلب بيانات الطلب
      const { data: orderData, error: orderError } = await supabase
        .from('ecommerce_orders')
        .select(`
          *,
          ecommerce_order_items (
            id,
            product_title,
            product_image_url,
            quantity,
            unit_price_sar,
            total_price_sar
          )
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      
      if (!orderData) {
        toast.error('لم يتم العثور على الطلب');
        return;
      }

      const { ecommerce_order_items, ...rest } = orderData as any;
      setOrder(rest as Order);
      setOrderItems((ecommerce_order_items as OrderItem[]) || []);

      // جلب بيانات المتجر
      const { data: storeData, error: storeError } = await supabase
        .from('affiliate_stores')
        .select(`
          store_name,
          store_slug,
          profiles (
            full_name,
            phone
          )
        `)
        .eq('id', orderData.affiliate_store_id)
        .maybeSingle();

      if (storeError) throw storeError;
      setStore(storeData);

    } catch (error) {
      console.error('Error fetching order data:', error);
      toast.error('خطأ في تحميل بيانات الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل تأكيد الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الطلب غير موجود</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على الطلب المطلوب</p>
            <Button onClick={() => navigate(`/store/${storeSlug}`)}>
              العودة للمتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* رسالة نجاح الطلب */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              تم تأكيد طلبك بنجاح!
            </h1>
            <p className="text-green-700 mb-4">
              رقم الطلب: <span className="font-mono font-bold">{order.order_number || `#${order.id.slice(-8)}`}</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* معلومات المتجر */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              تم الطلب من متجر {store.store_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {store.profiles?.full_name && `المالك: ${store.profiles.full_name}`}
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate(`/store/${storeSlug}`)}
              >
                <ShoppingBag className="h-4 w-4 ml-2" />
                زيارة المتجر
              </Button>
              {store.profiles?.phone && (
                <Button variant="outline" asChild>
                  <a href={`tel:${store.profiles.phone}`}>
                    <Phone className="h-4 w-4 ml-2" />
                    اتصال
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل الطلب */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                {item.product_image_url && (
                  <img 
                    src={item.product_image_url} 
                    alt={item.product_title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.product_title}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-muted-foreground">
                      الكمية: {item.quantity} × {item.unit_price_sar} ريال
                    </div>
                    <div className="font-semibold">{item.total_price_sar} ريال</div>
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>المجموع الإجمالي</span>
              <span className="text-primary">{order.total_sar} ريال</span>
            </div>
          </CardContent>
        </Card>

        {/* معلومات العميل والشحن */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              معلومات العميل والشحن
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">رقم الهاتف</Label>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              
              {order.customer_email && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</Label>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                عنوان الشحن
              </Label>
              <div className="bg-muted p-3 rounded-lg">
                <p>{order.shipping_address.street}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.region}</p>
                {order.shipping_address.postal_code && (
                  <p>الرمز البريدي: {order.shipping_address.postal_code}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                الدفع عند الاستلام
              </Badge>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• سيتم التواصل معك لتأكيد الطلب وتحديد موعد التسليم</p>
                <p>• الدفع نقداً عند استلام الطلب</p>
                <p>• يمكنك الاتصال بالمتجر للاستفسار عن حالة الطلب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate(`/store/${storeSlug}`)} className="w-full">
            <ShoppingBag className="h-4 w-4 ml-2" />
            متابعة التسوق
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Home className="h-4 w-4 ml-2" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

// مكون Label بسيط
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ 
  className = '', 
  ...props 
}) => (
  <label className={`text-sm font-medium ${className}`} {...props} />
);

export default StoreOrderConfirmation;