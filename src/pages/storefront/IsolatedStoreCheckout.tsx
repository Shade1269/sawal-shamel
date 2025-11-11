import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { storeOrderService } from '@/services/storeOrderService';
import { toast } from 'sonner';
import { LuxuryCardV2, LuxuryCardHeader, LuxuryCardTitle, LuxuryCardContent } from '@/components/luxury/LuxuryCardV2';
import { motion } from 'framer-motion';
import { useStorefrontOtp } from '@/hooks/useStorefrontOtp';
import { useShippingManagement } from '@/hooks/useShippingManagement';
import { GeideaPayment } from '@/components/payment/GeideaPayment';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  // التحقق من تسجيل دخول العميل
  useEffect(() => {
    if (!sessionId && !cartLoading) {
      toast.info('يجب تسجيل الدخول أولاً لإتمام الطلب');
      // توجيه العميل لصفحة التسجيل مع حفظ مسار العودة
      const returnUrl = encodeURIComponent(`/${storeSlug}/checkout`);
      navigate(`/${storeSlug}/auth?returnUrl=${returnUrl}`, { replace: true });
    }
  }, [sessionId, cartLoading, storeSlug, navigate]);

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
        }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-slate-400">جاري تحميل...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <LuxuryCardV2 variant="glass" hover="none" className="max-w-md mx-auto">
          <CardContent className="text-center py-16">
            <h3 className="text-2xl font-bold mb-3 text-white">السلة فارغة</h3>
            <p className="text-slate-400 mb-6">
              لا يمكن إتمام الطلب مع سلة فارغة
            </p>
            <Button 
              onClick={() => navigate(`/${storeSlug}`)}
              className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 shadow-lg shadow-red-600/25"
            >
              تسوق الآن
            </Button>
          </CardContent>
        </LuxuryCardV2>
      </div>
    );
  }

  const shipping = selectedShipping?.cost ?? 25;
  const total = cart.total + shipping;

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/${storeSlug}/cart`)}
          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للسلة
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-danger bg-clip-text text-transparent">
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
            <LuxuryCardV2 variant="glass" hover="lift" className="border-red-600/20">
              <LuxuryCardHeader className="border-b border-red-600/15">
                <LuxuryCardTitle className="text-xl">معلومات العميل</LuxuryCardTitle>
              </LuxuryCardHeader>
              <LuxuryCardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-slate-300">الاسم الكامل *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      required
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-slate-300">رقم الجوال *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="05xxxxxxxx"
                      required
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail" className="text-slate-300">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="example@email.com"
                    className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </LuxuryCardContent>
            </LuxuryCardV2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LuxuryCardV2 variant="glass" hover="lift" className="border-red-600/20">
              <LuxuryCardHeader className="border-b border-red-600/15">
                <LuxuryCardTitle className="text-xl">عنوان الشحن</LuxuryCardTitle>
              </LuxuryCardHeader>
              <LuxuryCardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-300">المدينة *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="الرياض"
                      required
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-slate-300">الحي</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="النسيم"
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-slate-300">الشارع *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="شارع الملك فهد"
                    required
                    className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building" className="text-slate-300">رقم المبنى</Label>
                    <Input
                      id="building"
                      value={formData.building}
                      onChange={(e) => handleInputChange('building', e.target.value)}
                      placeholder="123"
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment" className="text-slate-300">رقم الشقة</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      placeholder="45"
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-slate-300">الرمز البريدي</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="12345"
                      className="bg-slate-900/95 border-2 border-slate-700/50 focus:border-red-600/50 focus:ring-2 focus:ring-red-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </LuxuryCardContent>
            </LuxuryCardV2>
          </motion.div>

          {/* خيارات الشحن */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LuxuryCardV2 variant="glass" hover="lift" className="border-red-600/20">
              <LuxuryCardHeader className="border-b border-red-600/15">
                <LuxuryCardTitle className="text-xl">طريقة الشحن</LuxuryCardTitle>
              </LuxuryCardHeader>
              <LuxuryCardContent className="space-y-4 pt-6">
                {calculatingShipping ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <span className="mr-3 text-slate-400">جاري حساب تكلفة الشحن...</span>
                  </div>
                ) : !formData.city ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">يرجى إدخال المدينة أولاً لعرض خيارات الشحن</p>
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">لا توجد خيارات شحن متاحة لهذه المدينة</p>
                    <p className="text-xs text-slate-500 mt-2">يرجى الاتصال بالدعم للمساعدة</p>
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
                            ? 'border-red-600 bg-red-950/20'
                            : 'border-slate-700/50 bg-slate-900/50 hover:border-red-600/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedShipping?.providerId === option.providerId
                                ? 'border-red-600 bg-red-600'
                                : 'border-slate-600'
                            }`}>
                              {selectedShipping?.providerId === option.providerId && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{option.providerName}</p>
                              <p className="text-xs text-slate-400">التوصيل خلال {option.estimatedDeliveryDays}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-red-400">{option.totalCost.toFixed(0)} ر.س</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </LuxuryCardContent>
            </LuxuryCardV2>
          </motion.div>

          {/* خيارات الدفع */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LuxuryCardV2 variant="glass" hover="lift" className="border-red-600/20">
              <LuxuryCardHeader className="border-b border-red-600/15">
                <LuxuryCardTitle className="text-xl">طريقة الدفع</LuxuryCardTitle>
              </LuxuryCardHeader>
              <LuxuryCardContent className="space-y-4 pt-6">
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cod' | 'geidea')}>
                  {/* الدفع عند الاستلام */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-red-600 bg-red-950/20'
                        : 'border-slate-700/50 bg-slate-900/50 hover:border-red-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="cod" id="cod" className="border-red-600" />
                        <div>
                          <Label htmlFor="cod" className="font-semibold text-white cursor-pointer">
                            الدفع عند الاستلام
                          </Label>
                          <p className="text-xs text-slate-400">ادفع نقداً عند وصول الطلب</p>
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-red-400" />
                    </div>
                  </div>

                  {/* الدفع الإلكتروني عبر Geidea */}
                  <div
                    onClick={() => setPaymentMethod('geidea')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'geidea'
                        ? 'border-red-600 bg-red-950/20'
                        : 'border-slate-700/50 bg-slate-900/50 hover:border-red-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="geidea" id="geidea" className="border-red-600" />
                        <div>
                          <Label htmlFor="geidea" className="font-semibold text-white cursor-pointer">
                            الدفع الإلكتروني
                          </Label>
                          <p className="text-xs text-slate-400">بطاقة ائتمان / مدى / Apple Pay</p>
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-red-400" />
                    </div>
                  </div>
                </RadioGroup>
              </LuxuryCardContent>
            </LuxuryCardV2>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LuxuryCardV2 
              variant="glow" 
              hover="lift" 
              className="sticky top-4"
            >
              <CardHeader className="border-b border-red-600/15">
                <CardTitle className="text-2xl bg-gradient-danger bg-clip-text text-transparent">
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/30 scrollbar-track-slate-800">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-red-600/10 last:border-0">
                      <span className="flex-1 truncate text-slate-300">
                        {item.product_title} × {item.quantity}
                      </span>
                      <span className="font-semibold text-white">{item.total_price_sar.toFixed(0)} ر.س</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

                <div className="space-y-3">
                  <div className="flex justify-between text-base text-slate-300">
                    <span>المجموع الفرعي</span>
                    <span className="font-semibold text-white">{cart.total.toFixed(0)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-base text-slate-300">
                    <span>الشحن</span>
                    <span className="font-semibold text-white">{shipping} ر.س</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xl font-bold text-white">المجموع الكلي</span>
                    <span className="text-3xl font-bold bg-gradient-danger bg-clip-text text-transparent">
                      {total.toFixed(0)} ر.س
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-red-600/10">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-red-400" />
                    <span className="font-semibold text-white">
                      {paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'الدفع الإلكتروني'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {paymentMethod === 'cod' 
                      ? 'ادفع نقداً عند وصول الطلب' 
                      : 'سيتم توجيهك لصفحة الدفع بعد تأكيد الطلب'}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 border border-red-500/20 transition-all duration-500 group"
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

                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  بالضغط على "تأكيد الطلب" أنت توافق على الشروط والأحكام
                </p>
              </CardContent>
            </LuxuryCardV2>
          </motion.div>
        </div>
      </form>

      {/* نافذة الدفع عبر Geidea */}
      {showGeideaPayment && createdOrderId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-red-600/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-red-600/20 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold text-white">إتمام الدفع</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGeideaPayment(false)}
                className="text-slate-400 hover:text-white"
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
  );
};
