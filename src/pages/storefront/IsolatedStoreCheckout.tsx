import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle, CreditCard, Tag, X } from 'lucide-react';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { storeOrderService } from '@/services/storeOrderService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useStorefrontOtp } from '@/hooks/useStorefrontOtp';
import { useShippingManagement } from '@/hooks/useShippingManagement';
import { GeideaPayment } from '@/components/payment/GeideaPayment';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StoreThemeProvider } from '@/components/store/StoreThemeProvider';
import { StorefrontSession } from '@/utils/storefrontSession';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
  const { cart, loading: cartLoading, clearCart } = useIsolatedStoreCart(store?.id || '', storeSlug);
  const { sessionId } = useStorefrontOtp({ storeSlug: storeSlug || '', storeId: store?.id });
  const { calculateShippingCost, loading: shippingLoading } = useShippingManagement();

  // التحقق من تسجيل دخول العميل باستخدام StorefrontSession
  useEffect(() => {
    if (!storeSlug || !store?.id) return;
    
    const storefrontSession = new StorefrontSession(storeSlug);
    const sessionData = storefrontSession.getSession();
    
    // فحص صلاحية الجلسة
    const isValidSession = sessionData && 
                          sessionData.isVerified && 
                          sessionData.expiresAt > Date.now();
    
    if (!isValidSession && !cartLoading) {
      toast.info('يجب تسجيل الدخول أولاً لإتمام الطلب');
      // توجيه العميل لصفحة التسجيل مع حفظ مسار العودة
      const returnUrl = encodeURIComponent(`/${storeSlug}/checkout`);
      navigate(`/${storeSlug}/auth?returnUrl=${returnUrl}`, { replace: true });
    }
  }, [storeSlug, store?.id, cartLoading, navigate]);

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
  const [shippingOptions, setShippingOptions] = useState<Array<{
    providerId: string;
    providerName: string;
    serviceType: string;
    totalCost: number;
    estimatedDeliveryDays: string;
  }>>([]);
  const [selectedShipping, setSelectedShipping] = useState<{
    providerId: string;
    providerName: string;
    cost: number;
  } | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'geidea'>('cod');
  const [showGeideaPayment, setShowGeideaPayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // حساب تكلفة الشحن عند إدخال المدينة
  useEffect(() => {
    const calculateShipping = async () => {
      if (!formData.city || !cart?.items?.length) return;
      
      setCalculatingShipping(true);
      
      // حساب الوزن الإجمالي (افتراضياً 1 كجم لكل منتج)
      const totalWeight = cart.items.reduce((sum, item) => sum + (item.quantity * 1), 0);
      
      const result = await calculateShippingCost(formData.city, totalWeight, 'standard', false);
      
      if (result.success && result.costs) {
        setShippingOptions(result.costs);
        // اختيار أول خيار افتراضياً
        if (result.costs.length > 0) {
          setSelectedShipping({
            providerId: result.costs[0].providerId,
            providerName: result.costs[0].providerName,
            cost: result.costs[0].totalCost
          });
        }
      } else {
        toast.error(result.error || 'لم يتم العثور على خيارات شحن متاحة');
        setShippingOptions([]);
        setSelectedShipping(null);
      }
      
      setCalculatingShipping(false);
    };
    
    // تأخير بسيط لتجنب الكثير من الطلبات
    const timer = setTimeout(calculateShipping, 500);
    return () => clearTimeout(timer);
  }, [formData.city, cart?.items, calculateShippingCost]);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // حساب قيمة الخصم
  const calculateDiscount = () => {
    if (!appliedCoupon || !cart) return 0;

    let discount = 0;
    const subtotal = cart.total;

    if (appliedCoupon.discount_type === 'percentage') {
      discount = (subtotal * appliedCoupon.discount_value) / 100;
      // تطبيق الحد الأقصى للخصم إذا كان موجوداً
      if (appliedCoupon.maximum_discount_amount && discount > appliedCoupon.maximum_discount_amount) {
        discount = appliedCoupon.maximum_discount_amount;
      }
    } else {
      // fixed amount
      discount = appliedCoupon.discount_value;
    }

    return Math.min(discount, subtotal); // لا يتجاوز الخصم قيمة المنتجات
  };

  // التحقق من صحة الكوبون
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('الرجاء إدخال كود الكوبون');
      return;
    }

    if (!cart || !store?.id) return;

    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from('affiliate_coupons')
        .select('*')
        .eq('coupon_code', couponCode.toUpperCase())
        .eq('affiliate_store_id', store.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast.error('الكوبون المدخل غير موجود أو غير نشط');
        return;
      }

      // التحقق من صلاحية التاريخ
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        toast.error('هذا الكوبون لم يبدأ بعد');
        return;
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        toast.error('انتهت صلاحية هذا الكوبون');
        return;
      }

      // التحقق من الحد الأدنى للطلب
      if (coupon.minimum_order_amount && cart.total < coupon.minimum_order_amount) {
        toast.error(`يجب أن يكون مجموع الطلب ${coupon.minimum_order_amount} ريال على الأقل`);
        return;
      }

      // التحقق من حد الاستخدام
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        toast.error('تم استخدام هذا الكوبون بالكامل');
        return;
      }

      // تطبيق الكوبون
      setAppliedCoupon(coupon);
      toast.success(
        `تم تطبيق خصم ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} ريال`}`
      );
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('حدث خطأ أثناء التحقق من الكوبون');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('تم إزالة الكوبون من الطلب');
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
        },
        {
          providerId: selectedShipping?.providerId,
          providerName: selectedShipping?.providerName,
          costSar: selectedShipping?.cost
        },
        appliedCoupon ? {
          id: appliedCoupon.id,
          code: appliedCoupon.coupon_code,
          discountAmount: discountAmount
        } : undefined
      );

      if (result.success) {
        toast.success('تم إنشاء الطلب بنجاح!');
        
        // إذا اختار الدفع عبر Geidea، افتح نافذة الدفع
        if (paymentMethod === 'geidea') {
          setCreatedOrderId(result.orderId);
          setShowGeideaPayment(true);
        } else {
          // إذا اختار الدفع عند الاستلام، انتقل مباشرة لصفحة التأكيد
          await clearCart();
          navigate(`/${storeSlug}/order/${result.orderId}/confirmation`);
        }
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

  const handleGeideaSuccess = async (paymentData: any) => {
    console.log('Geidea payment successful:', paymentData);
    await clearCart();
    navigate(`/${storeSlug}/order/${createdOrderId}/confirmation`);
  };

  const handleGeideaError = (error: string) => {
    console.error('Geidea payment error:', error);
    toast.error('فشل الدفع: ' + error);
    setShowGeideaPayment(false);
  };

  const handleGeideaCancel = () => {
    toast.info('تم إلغاء عملية الدفع');
    setShowGeideaPayment(false);
  };

  if (cartLoading) {
    return (
      <StoreThemeProvider storeId={store?.id}>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل...</p>
          </div>
        </div>
      </StoreThemeProvider>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <StoreThemeProvider storeId={store?.id}>
        <div className="space-y-6 p-6 min-h-screen bg-background">
          <Card className="max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="text-center py-16">
              <h3 className="text-2xl font-bold mb-3 text-foreground">السلة فارغة</h3>
              <p className="text-muted-foreground mb-6">
                لا يمكن إتمام الطلب مع سلة فارغة
              </p>
              <Button 
                onClick={() => navigate(`/${storeSlug}`)}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                تسوق الآن
              </Button>
            </CardContent>
          </Card>
        </div>
      </StoreThemeProvider>
    );
  }

  const shipping = selectedShipping?.cost ?? 25;
  const discountAmount = calculateDiscount();
  const total = Math.max(0, cart.total - discountAmount + shipping);

  return (
    <StoreThemeProvider storeId={store?.id}>
      <div className="space-y-6 min-h-screen bg-background p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/${storeSlug}/cart`)}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للسلة
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            إتمام الطلب
          </h1>
        </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl text-foreground">معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-foreground">الاسم الكامل *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-foreground">رقم الجوال *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="05xxxxxxxx"
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail" className="text-foreground">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="example@email.com"
                    className="bg-background border-border"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl text-foreground">عنوان الشحن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">المدينة *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="الرياض"
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-foreground">الحي</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="النسيم"
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-foreground">الشارع *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="شارع الملك فهد"
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building" className="text-foreground">رقم المبنى</Label>
                    <Input
                      id="building"
                      value={formData.building}
                      onChange={(e) => handleInputChange('building', e.target.value)}
                      placeholder="123"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment" className="text-foreground">رقم الشقة</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      placeholder="45"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-foreground">الرمز البريدي</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="12345"
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* خيارات الشحن */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl text-foreground">طريقة الشحن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {calculatingShipping ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="mr-3 text-muted-foreground">جاري حساب تكلفة الشحن...</span>
                  </div>
                ) : !formData.city ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">يرجى إدخال المدينة أولاً لعرض خيارات الشحن</p>
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد خيارات شحن متاحة لهذه المدينة</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">يرجى الاتصال بالدعم للمساعدة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <div
                        key={`${option.providerId}-${option.serviceType}`}
                        onClick={() => setSelectedShipping({
                          providerId: option.providerId,
                          providerName: option.providerName,
                          cost: option.totalCost
                        })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedShipping?.providerId === option.providerId
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedShipping?.providerId === option.providerId
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}>
                              {selectedShipping?.providerId === option.providerId && (
                                <CheckCircle className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{option.providerName}</p>
                              <p className="text-xs text-muted-foreground">التوصيل خلال {option.estimatedDeliveryDays}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-primary">{option.totalCost.toFixed(0)} ر.س</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* خيارات الدفع */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl text-foreground">طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cod' | 'geidea')}>
                  {/* الدفع عند الاستلام */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="cod" id="cod" className="border-primary" />
                        <div>
                          <Label htmlFor="cod" className="font-semibold text-foreground cursor-pointer">
                            الدفع عند الاستلام
                          </Label>
                          <p className="text-xs text-muted-foreground">ادفع نقداً عند وصول الطلب</p>
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* الدفع الإلكتروني عبر Geidea */}
                  <div
                    onClick={() => setPaymentMethod('geidea')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'geidea'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="geidea" id="geidea" className="border-primary" />
                        <div>
                          <Label htmlFor="geidea" className="font-semibold text-foreground cursor-pointer">
                            الدفع الإلكتروني
                          </Label>
                          <p className="text-xs text-muted-foreground">بطاقة ائتمان / مدى / Apple Pay</p>
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="sticky top-4 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-2xl text-foreground">
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                      <span className="flex-1 truncate text-muted-foreground">
                        {item.product_title} × {item.quantity}
                      </span>
                      <span className="font-semibold text-foreground">{item.total_price_sar.toFixed(0)} ر.س</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border" />

                {/* حقل الكوبون */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    كود الخصم
                  </Label>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          {appliedCoupon.coupon_code}
                        </Badge>
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                          {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}% خصم`
                            : `${appliedCoupon.discount_value} ر.س خصم`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeCoupon}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="أدخل كود الخصم"
                        className="flex-1 bg-background border-border uppercase"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            validateCoupon();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={validateCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-primary text-primary-foreground hover:opacity-90"
                      >
                        {couponLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'تطبيق'
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-3">
                  <div className="flex justify-between text-base text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span className="font-semibold text-foreground">{cart.total.toFixed(0)} ر.س</span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-base text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        الخصم ({appliedCoupon.coupon_code})
                      </span>
                      <span className="font-semibold">- {discountAmount.toFixed(0)} ر.س</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base text-muted-foreground">
                    <span>الشحن</span>
                    <span className="font-semibold text-foreground">{shipping} ر.س</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xl font-bold text-foreground">المجموع الكلي</span>
                    <span className="text-3xl font-bold text-primary">
                      {total.toFixed(0)} ر.س
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'الدفع الإلكتروني'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {paymentMethod === 'cod' 
                      ? 'ادفع نقداً عند وصول الطلب' 
                      : 'سيتم توجيهك لصفحة الدفع بعد تأكيد الطلب'}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      جاري إنشاء الطلب...
                    </>
                  ) : (
                    <>
                      تأكيد الطلب
                      <CheckCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  بالضغط على "تأكيد الطلب" أنت توافق على الشروط والأحكام
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </form>

      {/* نافذة الدفع عبر Geidea */}
        {showGeideaPayment && createdOrderId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
                <h2 className="text-2xl font-bold text-foreground">إتمام الدفع</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGeideaPayment(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  إلغاء
                </Button>
              </div>
              <div className="p-6">
                <GeideaPayment
                  amount={total}
                  orderId={createdOrderId}
                  customerName={formData.customerName}
                  customerEmail={formData.customerEmail}
                  customerPhone={formData.customerPhone}
                  onSuccess={handleGeideaSuccess}
                  onError={handleGeideaError}
                  onCancel={handleGeideaCancel}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreThemeProvider>
  );
};
