import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  EnhancedButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Package, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { Link } from 'react-router-dom';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
  products: {
    title: string;
    image_urls?: string[];
  };
}

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
}

interface CustomerData {
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
}

const StorefrontCheckout = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [store, setStore] = useState<StoreData | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);

        // جلب بيانات المتجر
        const { data: storeData, error: storeError } = await supabasePublic
          .from('affiliate_stores')
          .select('id, store_name, store_slug')
          .eq('store_slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!storeData) {
          toast({
            title: "المتجر غير موجود",
            description: "لم يتم العثور على المتجر المطلوب",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setStore(storeData);

        // جلب السلة من الجلسة المحلية
        const sessionData = localStorage.getItem(`ea_session_${slug}`);
        if (!sessionData) {
          toast({
            title: "السلة فارغة",
            description: "لا توجد منتجات في السلة",
            variant: "destructive"
          });
          navigate(`/${slug}`);
          return;
        }

        const session = JSON.parse(sessionData);
        
        // البحث عن السلة المرتبطة بهذه الجلسة والمتجر
        const { data: cart } = await supabasePublic
          .from('shopping_carts')
          .select('id')
          .eq('session_id', session.sessionId)
          .eq('affiliate_store_id', storeData.id)
          .maybeSingle();

        if (!cart) {
          toast({
            title: "السلة فارغة",
            description: "لا توجد منتجات في السلة",
            variant: "destructive"
          });
          navigate(`/${slug}`);
          return;
        }

        // جلب عناصر السلة
        const { data: items, error: itemsError } = await supabasePublic
          .from('cart_items')
          .select(`
            id,
            product_id,
            quantity,
            unit_price_sar,
            total_price_sar,
            products (
              title,
              image_urls
            )
          `)
          .eq('cart_id', cart.id);

        if (itemsError) throw itemsError;
        
        if (!items || items.length === 0) {
          toast({
            title: "السلة فارغة",
            description: "لا توجد منتجات في السلة",
            variant: "destructive"
          });
          navigate(`/${slug}`);
          return;
        }

        setCartItems(items);

      } catch (error: any) {
        console.error('Error fetching checkout data:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: error.message || "حدث خطأ في تحميل بيانات الطلب",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCheckoutData();
    }
  }, [slug, navigate, toast]);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price_sar, 0);
    const shipping = 0; // مجاني مؤقتاً
    const total = subtotal + shipping;
    
    return { subtotal, shipping, total };
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!store || cartItems.length === 0) return;
    
    // التحقق من البيانات المطلوبة
    if (!customerData.full_name || !customerData.phone || !customerData.address || !customerData.city) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { subtotal, shipping, total } = calculateTotals();
      
      // إنشاء الطلب
      const { data: order, error: orderError } = await supabasePublic
        .from('ecommerce_orders')
        .insert({
          shop_id: store.id, // مؤقتاً نستخدم نفس معرف المتجر
          affiliate_store_id: store.id,
          customer_name: customerData.full_name,
          customer_phone: customerData.phone,
          customer_email: customerData.email || null,
          shipping_address: {
            address: customerData.address,
            city: customerData.city,
            phone: customerData.phone
          },
          subtotal_sar: subtotal,
          shipping_sar: shipping,
          total_sar: total,
          payment_method: 'CASH_ON_DELIVERY' as any,
          payment_status: 'PENDING',
          status: 'PENDING',
          notes: customerData.notes || null,
          order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      // إنشاء عناصر الطلب
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_title: item.products.title,
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        total_price_sar: item.total_price_sar
      }));

      const { error: itemsError } = await supabasePublic
        .from('ecommerce_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // حذف السلة
      const sessionData = localStorage.getItem(`ea_session_${slug}`);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        const { data: cart } = await supabasePublic
          .from('shopping_carts')
          .select('id')
          .eq('session_id', session.sessionId)
          .eq('affiliate_store_id', store.id)
          .maybeSingle();

        if (cart) {
          await supabasePublic
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);
            
          await supabasePublic
            .from('shopping_carts')
            .delete()
            .eq('id', cart.id);
        }
      }

      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: `رقم طلبك: ${order.order_number || order.id}`,
      });

      // الانتقال لصفحة التأكيد أو طلباتي
      navigate(`/${slug}`);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "خطأ في إنشاء الطلب",
        description: error.message || "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل صفحة الدفع...</p>
          </div>
        </div>
      </div>
    );
  }

  const { subtotal, shipping, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/${slug}`}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للمتجر
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">إتمام الطلب</h1>
              <p className="text-sm text-muted-foreground">{store?.store_name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* نموذج بيانات العميل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                بيانات التوصيل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">الاسم الكامل *</Label>
                    <Input
                      id="full_name"
                      value={customerData.full_name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الجوال *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">العنوان التفصيلي *</Label>
                    <Input
                      id="address"
                      value={customerData.address}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">المدينة *</Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={customerData.notes}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="أي تعليمات خاصة للتوصيل..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? 'جاري إنشاء الطلب...' : `تأكيد الطلب - ${total} ر.س`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ملخص الطلب */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                ملخص الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.products.image_urls && item.products.image_urls.length > 0 ? (
                      <img
                        src={item.products.image_urls[0]}
                        alt={item.products.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.products.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      الكمية: {item.quantity} × {item.unit_price_sar} ر.س
                    </p>
                    <p className="font-semibold text-sm">{item.total_price_sar} ر.س</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>رسوم التوصيل:</span>
                  <span>{shipping === 0 ? 'مجاني' : `${shipping} ر.س`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>المجموع الكلي:</span>
                  <span>{total} ر.س</span>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💳 طريقة الدفع: الدفع عند الاستلام (COD)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StorefrontCheckout;