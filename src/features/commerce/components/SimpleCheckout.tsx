import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Banknote, MapPin, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface SimpleCheckoutProps {
  cartItems: CartItem[];
  shopId?: string;
  onOrderComplete: (orderNumber: string) => void;
  onCancel: () => void;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

export const SimpleCheckout: React.FC<SimpleCheckoutProps> = ({
  cartItems,
  shopId,
  onOrderComplete,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = 15; // رسوم شحن ثابتة
  const total = subtotal + shippingCost;

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
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
    if (!customerInfo.address.trim()) {
      toast.error('يرجى إدخال العنوان');
      return false;
    }
    if (!customerInfo.city.trim()) {
      toast.error('يرجى إدخال المدينة');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        user_id: null,
        session_id: `session_${Date.now()}`,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone,
        shipping_address: {
          address: customerInfo.address,
          city: customerInfo.city,
          notes: customerInfo.notes || null
        },
        total_amount_sar: total,
        payment_status: 'PENDING',
        payment_method: 'COD',
        order_status: 'CONFIRMED'
      };

      const { data: order, error: orderError } = await supabase
        .from('simple_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // إنشاء عناصر الطلب
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_title: item.name,
        product_image_url: item.image || null,
        quantity: item.quantity,
        unit_price_sar: item.price,
        total_price_sar: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('simple_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const generatedOrderNumber = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
      setOrderNumber(generatedOrderNumber);
      setOrderCompleted(true);

      toast.success('تم إنشاء الطلب بنجاح!');
      
      // التوجه لصفحة تأكيد الطلب
      setTimeout(() => {
        window.location.href = `/order-confirmation-simple/${order.id}`;
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (orderCompleted) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-green-100 rounded-full p-4 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-green-800 mb-2">
            تم إنشاء طلبك بنجاح!
          </h3>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6 w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">رقم الطلب</span>
            </div>
            <p className="text-lg font-mono font-bold text-primary">
              {orderNumber}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">الدفع عند الاستلام</span>
            </div>
            <p className="text-sm text-blue-700">
              سيتم تحصيل المبلغ عند وصول الطلب: <strong>{total} ريال</strong>
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            شكراً لك! سنتواصل معك خلال 24 ساعة لتأكيد الطلب وموعد التوصيل.
          </p>
          
          <Button onClick={onCancel} className="w-full">
            العودة للمتجر
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">إتمام الطلب</h2>
        <p className="text-muted-foreground">أدخل بياناتك لإتمام الطلب بالدفع عند الاستلام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نموذج بيانات العميل */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                بيانات العميل
              </CardTitle>
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
                <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                عنوان التوصيل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">العنوان التفصيلي *</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="رقم المبنى، اسم الشارع، الحي"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="city">المدينة *</Label>
                <Input
                  id="city"
                  value={customerInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="الرياض، جدة، الدمام..."
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="معلومات إضافية للتوصيل (اختياري)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* طريقة الدفع */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                طريقة الدفع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Banknote className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-medium">الدفع عند الاستلام</h4>
                    <p className="text-sm text-muted-foreground">
                      ادفع نقداً أو بالبطاقة عند وصول الطلب إليك
                    </p>
                  </div>
                  <Badge variant="secondary" className="mr-auto">مُفعّل</Badge>
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
              {/* عناصر الطلب */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.price} ريال × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">{(item.price * item.quantity)} ريال</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* المجاميع */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم الشحن:</span>
                  <span>{shippingCost} ريال</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{total} ريال</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 text-center">
                  <strong>الدفع عند الاستلام:</strong><br />
                  ستدفع {total} ريال عند وصول الطلب
                </p>
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
                بتأكيد الطلب، فإنك توافق على استلام المنتجات ودفع المبلغ عند التسليم
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleCheckout;