import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    district: string;
    postal_code: string;
    country: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { profile } = useFastAuth();
  const { cart, loading: cartLoading, getCartTotals, clearCart } = useShoppingCart();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      postal_code: '',
      country: 'Saudi Arabia'
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<string>('STANDARD');
  const [notes, setNotes] = useState<string>('');

  const { subtotal } = getCartTotals;
  const shippingCost = shippingMethod === 'EXPRESS' ? 25 : 15;
  const taxRate = 0.15; // 15% VAT
  const taxAmount = (subtotal + shippingCost) * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  // الدفع عند الاستلام فقط حاليا
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'CASH_ON_DELIVERY',
      name: 'الدفع عند الاستلام',
      description: 'ادفع نقداً عند وصول الطلب إليك',
      icon: '💵'
    }
  ];

  // Load user info if available
  useEffect(() => {
    if (profile) {
      setCustomerInfo(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: profile.email || ''
      }));
    }
  }, [profile]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart?.items.length)) {
      toast.error('العربة فارغة');
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const handleInputChange = (field: keyof CustomerInfo | string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '') as keyof CustomerInfo['address'];
      setCustomerInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!customerInfo.name.trim()) {
      toast.error('يرجى إدخال الاسم');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return false;
    }
    if (!customerInfo.address.street.trim()) {
      toast.error('يرجى إدخال العنوان');
      return false;
    }
    if (!customerInfo.address.city.trim()) {
      toast.error('يرجى إدخال المدينة');
      return false;
    }
    if (!paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm() || !cart?.items.length) return;

    setLoading(true);
    try {
      // إنشاء طلب مع الدفع عند الاستلام
      const orderData = {
        user_id: profile?.id || null,
        session_id: `session_${Date.now()}`,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone,
        shipping_address: {
          street: customerInfo.address.street,
          city: customerInfo.address.city,
          district: customerInfo.address.district,
          postal_code: customerInfo.address.postal_code,
          country: customerInfo.address.country
        },
        total_amount_sar: total,
        payment_status: 'PENDING',
        payment_method: 'COD',
        order_status: 'CONFIRMED' // مؤكد مع الدفع عند الاستلام
      };

      const { data: order, error: orderError } = await supabase
        .from('simple_orders')
        .insert(orderData)
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      // إنشاء عناصر الطلب
      const orderItems = cart.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_title: item.product_title,
        product_image_url: item.product_image_url,
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        total_price_sar: item.total_price_sar
      }));

      const { error: itemsError } = await supabase
        .from('simple_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // لا حاجة لسجل حالة الطلب في النظام المبسط حاليا

      // Clear cart
      await clearCart();

      toast.success('تم إنشاء الطلب بنجاح!');
      navigate(`/order-confirmation/${order.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/cart')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للعربة
        </Button>
        <div>
          <h1 className="text-3xl font-bold">إتمام الطلب</h1>
          <p className="text-muted-foreground">إكمال بيانات الطلب والدفع</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات العميل
              </CardTitle>
              <CardDescription>
                أدخل بياناتك الشخصية لإتمام الطلب
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                عنوان الشحن
              </CardTitle>
              <CardDescription>
                العنوان الذي سيتم شحن الطلب إليه
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">العنوان *</Label>
                <Input
                  id="street"
                  value={customerInfo.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="رقم المبنى، اسم الشارع"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة *</Label>
                  <Input
                    id="city"
                    value={customerInfo.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="الرياض"
                  />
                </div>
                <div>
                  <Label htmlFor="district">الحي</Label>
                  <Input
                    id="district"
                    value={customerInfo.address.district}
                    onChange={(e) => handleInputChange('address.district', e.target.value)}
                    placeholder="اسم الحي"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="postal_code">الرمز البريدي</Label>
                <Input
                  id="postal_code"
                  value={customerInfo.address.postal_code}
                  onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                  placeholder="12345"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                طريقة الشحن
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div
                  className={`p-4 border rounded-lg cursor-pointer ${shippingMethod === 'STANDARD' ? 'border-primary bg-primary/10' : ''}`}
                  onClick={() => setShippingMethod('STANDARD')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">شحن عادي</h4>
                      <p className="text-sm text-muted-foreground">3-5 أيام عمل</p>
                    </div>
                    <span className="font-semibold">15 ريال</span>
                  </div>
                </div>
                <div
                  className={`p-4 border rounded-lg cursor-pointer ${shippingMethod === 'EXPRESS' ? 'border-primary bg-primary/10' : ''}`}
                  onClick={() => setShippingMethod('EXPRESS')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">شحن سريع</h4>
                      <p className="text-sm text-muted-foreground">1-2 أيام عمل</p>
                    </div>
                    <span className="font-semibold">25 ريال</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                طريقة الدفع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === method.id ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات الطلب</CardTitle>
              <CardDescription>ملاحظات إضافية للطلب (اختيارية)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات خاصة بالطلب..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium truncate">{item.product_title}</p>
                      <p className="text-muted-foreground">
                        {item.unit_price_sar} ريال × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">{item.total_price_sar} ريال</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن:</span>
                  <span>{shippingCost} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{taxAmount.toFixed(2)} ريال</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>المجموع الكلي:</span>
                  <span>{total.toFixed(2)} ريال</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                بالضغط على "تأكيد الطلب" فإنك توافق على شروط وأحكام الخدمة
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;