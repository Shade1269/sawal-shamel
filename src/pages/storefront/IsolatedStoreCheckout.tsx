import React, { useState } from 'react';
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
              onClick={() => navigate(`/store/${storeSlug}`)}
              className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 shadow-lg shadow-red-600/25"
            >
              تسوق الآن
            </Button>
          </CardContent>
        </LuxuryCardV2>
      </div>
    );
  }

  const shipping = 25;
  const total = cart.total + shipping;

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/store/${storeSlug}/cart`)}
          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للسلة
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
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
                <CardTitle className="text-2xl bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
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
                    <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                      {total.toFixed(0)} ر.س
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-red-600/10">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-red-400" />
                    <span className="font-semibold text-white">الدفع عند الاستلام</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ادفع نقداً عند وصول الطلب
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
    </div>
  );
};
