import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingBag, MapPin, Phone, Mail, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSimpleCart } from '@/features/commerce';

interface AffiliateStore {
  id: string;
  store_name: string;
  store_slug: string;
  profiles?: {
    full_name: string;
  };
}

const StoreCheckout = () => {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [store, setStore] = useState<AffiliateStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { cartItems, getTotalPrice, clearCart } = useSimpleCart(storeSlug || 'default');

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      region: '',
      postal_code: ''
    }
  });

  useEffect(() => {
    if (storeSlug) {
      fetchStoreData();
    }
  }, [storeSlug]);

  const fetchStoreData = async () => {
    try {
      const { data: storeData, error } = await supabase
        .from('affiliate_stores')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('store_slug', storeSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setStore(storeData);
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('خطأ في تحميل بيانات المتجر');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || cartItems.length === 0) return;

    setSubmitting(true);
    
    try {
      // استخدام Edge Function الموحد
      const { data, error } = await supabase.functions.invoke('create-ecommerce-order', {
        body: {
          shop_id: store.id,
          affiliate_store_id: store.id,
          buyer_session_id: storeSlug || null,
          customer_name: customerData.name,
          customer_email: customerData.email || null,
          customer_phone: customerData.phone,
          shipping_address: customerData.address,
          subtotal_sar: getTotalPrice(),
          shipping_sar: 0,
          tax_sar: 0,
          total_sar: getTotalPrice(),
          payment_method: 'CASH_ON_DELIVERY',
          notes: null,
          order_items: cartItems.map(item => ({
            product_id: item.id,
            product_title: item.name,
            product_image_url: item.image,
            quantity: item.quantity,
            unit_price_sar: item.price,
            total_price_sar: item.price * item.quantity
          }))
        }
      });

      if (error) throw error;
      if (!data?.order) throw new Error("missing order response");

      const order = data.order;

      // مسح السلة
      clearCart();

      // الانتقال لصفحة التأكيد
      navigate(`/${storeSlug}/order-confirmation/${order.id}`);

      toast.success('تم إرسال طلبك بنجاح!');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('حدث خطأ في إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل صفحة الدفع...</p>
        </div>
      </div>
    );
  }

  if (!store || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">السلة فارغة</h3>
            <p className="text-muted-foreground mb-4">لا توجد منتجات في السلة</p>
            <Button onClick={() => navigate(`/${storeSlug}`)}>
              العودة للمتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* العودة للمتجر */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/${storeSlug}`)}
          className="mb-6"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للمتجر
        </Button>

        {/* عنوان الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">إتمام الطلب</h1>
          <p className="text-muted-foreground">متجر {store.store_name}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* نموذج بيانات العميل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* البيانات الشخصية */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="966xxxxxxxxx"
                      type="tel"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@email.com"
                      type="email"
                    />
                  </div>
                </div>

                <Separator />

                {/* عنوان الشحن */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    عنوان الشحن
                  </h3>

                  <div>
                    <Label htmlFor="street">الشارع والرقم *</Label>
                    <Input
                      id="street"
                      value={customerData.address.street}
                      onChange={(e) => setCustomerData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      placeholder="اسم الشارع ورقم المنزل"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        value={customerData.address.city}
                        onChange={(e) => setCustomerData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        placeholder="المدينة"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="region">المنطقة *</Label>
                      <Input
                        id="region"
                        value={customerData.address.region}
                        onChange={(e) => setCustomerData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, region: e.target.value }
                        }))}
                        placeholder="المنطقة"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postal_code">الرمز البريدي</Label>
                    <Input
                      id="postal_code"
                      value={customerData.address.postal_code}
                      onChange={(e) => setCustomerData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, postal_code: e.target.value }
                      }))}
                      placeholder="12345"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'جاري الإرسال...' : `تأكيد الطلب - ${getTotalPrice()} ريال`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ملخص الطلب */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                ملخص الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                  <Badge variant="secondary">الكمية: {item.quantity}</Badge>
                      <span className="font-semibold">{item.price * item.quantity} ريال</span>
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{getTotalPrice()} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span>مجاني</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span>{getTotalPrice()} ريال</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">طريقة الدفع</h4>
                <Badge variant="outline">الدفع عند الاستلام</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreCheckout;