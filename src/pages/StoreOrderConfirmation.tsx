import { useState, useEffect } from 'react';
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
  ShoppingBag,
  FileText,
  Truck,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ZATCAInvoice } from '@/components/store/ZATCAInvoice';

interface Order {
  id: string;
  order_number: string;
  tracking_number?: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: any;
  subtotal_sar: number;
  shipping_sar: number;
  tax_sar: number;
  total_sar: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  affiliate_store_id: string;
  zoho_invoice_number?: string | null;
  zoho_invoice_url?: string | null;
  zoho_sync_status?: string | null;
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
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    if (orderId && storeSlug) {
      fetchOrderData();
    }
  }, [orderId, storeSlug]);

  const fetchOrderData = async () => {
    if (!orderId || !storeSlug) return;
    
    try {
      // جلب بيانات الطلب من order_hub - البحث باستخدام source_order_id أولاً
      let hubOrder = null;
      
      // محاولة البحث بـ source_order_id و source='ecommerce'
      const { data: orderBySource, error: sourceError } = await supabase
        .from('order_hub')
        .select('*')
        .eq('source', 'ecommerce')
        .eq('source_order_id', orderId)
        .maybeSingle();

      if (sourceError) throw sourceError;
      hubOrder = orderBySource;

      // إذا لم يُعثر عليه، جرب البحث بـ id مباشرة (للتوافق مع الحالات القديمة)
      if (!hubOrder) {
        const { data: orderById, error: idError } = await supabase
          .from('order_hub')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (idError) throw idError;
        hubOrder = orderById;
      }
      
      if (!hubOrder) {
        toast.error('لم يتم العثور على الطلب');
        return;
      }

      // جلب تفاصيل الطلب من المصدر الأصلي
      let orderItems: OrderItem[] = [];
      let additionalData: any = {};

      if (hubOrder.source === 'ecommerce' && hubOrder.source_order_id) {
        const { data: ecomOrder, error: ecomError } = await supabase
          .from('ecommerce_orders')
          .select(`
            tracking_number,
            shipping_address,
            subtotal_sar,
            shipping_sar,
            tax_sar,
            payment_method,
            ecommerce_order_items (
              id,
              product_title,
              product_image_url,
              quantity,
              unit_price_sar,
              total_price_sar
            )
          `)
          .eq('id', hubOrder.source_order_id)
          .maybeSingle();

        if (!ecomError && ecomOrder) {
          const { ecommerce_order_items, ...rest } = ecomOrder as any;
          orderItems = ecommerce_order_items || [];
          additionalData = rest;
        }
      }

      setOrder({
        id: hubOrder.id,
        order_number: hubOrder.order_number,
        customer_name: hubOrder.customer_name,
        customer_email: hubOrder.customer_email,
        customer_phone: hubOrder.customer_phone,
        status: hubOrder.status,
        payment_status: hubOrder.payment_status || 'PENDING',
        total_sar: hubOrder.total_amount_sar,
        created_at: hubOrder.created_at,
        affiliate_store_id: hubOrder.affiliate_store_id || '',
        subtotal_sar: additionalData.subtotal_sar || hubOrder.total_amount_sar,
        shipping_sar: additionalData.shipping_sar || 0,
        tax_sar: additionalData.tax_sar || 0,
        payment_method: additionalData.payment_method || 'CASH_ON_DELIVERY',
        tracking_number: additionalData.tracking_number || null,
        shipping_address: additionalData.shipping_address || {},
        zoho_invoice_number: hubOrder.zoho_invoice_number || null,
        zoho_invoice_url: hubOrder.zoho_invoice_url || null,
        zoho_sync_status: hubOrder.zoho_sync_status || null,
      } as Order);

      setOrderItems(orderItems);

      // جلب بيانات المتجر
      if (hubOrder.affiliate_store_id) {
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
          .eq('id', hubOrder.affiliate_store_id)
          .maybeSingle();

        if (storeError) throw storeError;
        setStore(storeData as Store);
      }

    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error('حدث خطأ في تحميل بيانات الطلب');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'order' | 'tracking') => {
    navigator.clipboard.writeText(text);
    if (type === 'order') {
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    } else {
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
    toast.success('تم النسخ بنجاح');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الطلب غير موجود</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم العثور على الطلب المطلوب
            </p>
            <Button onClick={() => navigate(`/${storeSlug}`)}>
              العودة للمتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-warning/20 text-warning',
      CONFIRMED: 'bg-info/20 text-info',
      PROCESSING: 'bg-accent/20 text-accent',
      SHIPPED: 'bg-primary/20 text-primary',
      DELIVERED: 'bg-success/20 text-success',
      CANCELLED: 'bg-destructive/20 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'قيد المعالجة',
      CONFIRMED: 'مؤكد',
      PROCESSING: 'قيد التحضير',
      SHIPPED: 'تم الشحن',
      DELIVERED: 'تم التسليم',
      CANCELLED: 'ملغي'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH_ON_DELIVERY: 'الدفع عند الاستلام',
      CREDIT_CARD: 'بطاقة ائتمان',
      MADA: 'مدى',
      TABBY: 'تابي',
      TAMARA: 'تمارا'
    };
    return labels[method] || method;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden when printing */}
      <header className="border-b bg-card print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{store.store_name}</h1>
              <p className="text-sm text-muted-foreground">تأكيد الطلب</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
                <FileText className="h-4 w-4 mr-2" />
                طباعة الفاتورة
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/${storeSlug}`)}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                العودة للمتجر
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Message */}
        <Card className="mb-6 border-success/20 bg-success/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-success mb-1">
                  تم إنشاء طلبك بنجاح!
                </h2>
                <p className="text-success/80">
                  شكراً لك، سنتواصل معك قريباً لتأكيد الطلب
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Numbers */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                رقم الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{order.order_number}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(order.order_number, 'order')}
                >
                  {copiedOrder ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  رقم التتبع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{order.tracking_number}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(order.tracking_number!, 'tracking')}
                  >
                    {copiedTracking ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ZATCA Invoice */}
        <div className="mb-6">
          <ZATCAInvoice
            invoiceNumber={order.zoho_invoice_number || order.order_number}
            invoiceDate={order.created_at}
            orderNumber={order.order_number}
            seller={{
              name: store?.store_name || 'المتجر',
              vatNumber: '300000000000003',
              address: 'المملكة العربية السعودية',
              phone: store?.profiles?.phone,
            }}
            buyer={{
              name: order.customer_name,
              phone: order.customer_phone,
              address: order.shipping_address?.city ? 
                `${order.shipping_address.street || ''}, ${order.shipping_address.city}` : undefined,
            }}
            items={orderItems.map(item => ({
              name: item.product_title,
              quantity: item.quantity,
              unit_price: item.unit_price_sar,
              total: item.total_price_sar,
              vat_amount: item.total_price_sar * 0.15,
            }))}
            subtotal={order.subtotal_sar}
            vatAmount={order.tax_sar}
            shippingCost={order.shipping_sar}
            discount={0}
            total={order.total_sar}
            paymentMethod={order.payment_method}
          />
        </div>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>حالة الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{getStatusLabel(order.status)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Order Items - Invoice */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تفاصيل الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.product_image_url ? (
                      <img
                        src={item.product_image_url}
                        alt={item.product_title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_title}</h4>
                    <p className="text-sm text-muted-foreground">
                      الكمية: {item.quantity} × {item.unit_price_sar} ر.س
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{item.total_price_sar} ر.س</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي:</span>
                  <span>{order.subtotal_sar} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>رسوم التوصيل:</span>
                  <span>{order.shipping_sar} ر.س</span>
                </div>
                {order.tax_sar > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>الضريبة:</span>
                    <span>{order.tax_sar} ر.س</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{order.total_sar} ر.س</span>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  طريقة الدفع: {getPaymentMethodLabel(order.payment_method)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Shipping Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span dir="ltr">{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">عنوان الشحن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="text-sm leading-relaxed">
                  {order.shipping_address?.street && <p>{order.shipping_address.street}</p>}
                  {order.shipping_address?.district && <p>{order.shipping_address.district}</p>}
                  {order.shipping_address?.city && <p>{order.shipping_address.city}</p>}
                  {order.shipping_address?.building && <p>رقم المبنى: {order.shipping_address.building}</p>}
                  {order.shipping_address?.apartment && <p>رقم الشقة: {order.shipping_address.apartment}</p>}
                  {order.shipping_address?.postalCode && <p>الرمز البريدي: {order.shipping_address.postalCode}</p>}
                  {order.shipping_address?.shipping_provider && (
                    <p className="mt-2 font-medium">شركة الشحن: {order.shipping_address.shipping_provider}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps - Hidden when printing */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>سيتم مراجعة طلبك والتواصل معك خلال 24 ساعة</li>
              <li>يمكنك استخدام رقم التتبع لمتابعة حالة الشحنة</li>
              <li>سيتم تحديد موعد التسليم المناسب</li>
              <li>تأكد من توفر المبلغ عند الاستلام (الدفع عند الاستلام)</li>
            </ol>
          </CardContent>
        </Card>

        {/* Print-only footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>{store.store_name}</p>
          {store.profiles?.phone && <p>للاستفسار: {store.profiles.phone}</p>}
          <p className="mt-2">شكراً لتعاملكم معنا</p>
        </div>
      </div>
    </div>
  );
};

export default StoreOrderConfirmation;