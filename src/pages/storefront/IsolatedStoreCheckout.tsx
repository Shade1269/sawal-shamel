import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
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
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { storeOrderService } from '@/services/storeOrderService';
import { toast } from 'sonner';

interface StoreContextType {
  store: {
    id: string;
    store_name: string;
    store_slug: string;
    shop_id: string;
  };
}

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  district: string;
  street: string;
  building: string;
  apartment: string;
  postalCode: string;
}

export const IsolatedStoreCheckout: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store } = useOutletContext<StoreContextType>();
  const { cart, loading: cartLoading, clearCart } = useIsolatedStoreCart(store?.id || '');

  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: '',
    district: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    // Validate required fields
    if (!formData.customerName || !formData.customerPhone || !formData.city || !formData.street) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await storeOrderService.createOrderFromCart(
        cart.id,
        store.shop_id,
        store.id,
        {
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          shippingAddress: {
            city: formData.city,
            district: formData.district,
            street: formData.street,
            building: formData.building,
            apartment: formData.apartment,
            postalCode: formData.postalCode
          }
        }
      );

      if (result.success) {
        toast.success('تم إنشاء الطلب بنجاح!');
        await clearCart();
        navigate(`/store/${storeSlug}/orders?highlight=${result.orderId}`);
      } else {
        toast.error(result.error || 'خطأ في إنشاء الطلب');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('خطأ في إتمام الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">جاري تحميل السلة...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${storeSlug}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمتجر
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">السلة فارغة</p>
        </div>
      </div>
    );
  }

  const shipping = 25;
  const total = cart.total + shipping;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${storeSlug}/cart`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للسلة
        </Button>
        <h1 className="text-2xl font-bold">إتمام الطلب</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">الاسم الكامل *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">رقم الجوال *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="05xxxxxxxx"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>عنوان الشحن</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="الرياض"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">الحي</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="النسيم"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street">الشارع *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="شارع الملك فهد"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">رقم المبنى</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">رقم الشقة</Label>
                  <Input
                    id="apartment"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                    placeholder="45"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">الرمز البريدي</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate">
                      {item.product_title} × {item.quantity}
                    </span>
                    <span>{item.total_price_sar} ر.س</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{cart.total} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الشحن</span>
                  <span>{shipping} ر.س</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>المجموع الكلي</span>
                  <span>{total} ر.س</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4" />
                  <span>الدفع عند الاستلام</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ادفع نقداً عند وصول الطلب
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري إنشاء الطلب...
                  </>
                ) : (
                  'تأكيد الطلب'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                بالضغط على "تأكيد الطلب" أنت توافق على الشروط والأحكام
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};