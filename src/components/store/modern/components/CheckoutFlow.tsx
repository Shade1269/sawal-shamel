import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
  variants?: ProductVariant[];
  commission_amount?: number;
  final_price?: number;
  rating?: number;
  reviews_count?: number;
  discount_percentage?: number;
}

interface ProductVariant {
  id: string;
  variant_type: string;
  variant_value: string;
  stock: number;
  price_modifier: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string };
}

interface AffiliateStore {
  id: string;
  store_name: string;
  bio: string;
  store_slug: string;
  logo_url?: string;
  theme: string;
  total_sales: number;
  total_orders: number;
  profile_id: string;
  is_active: boolean;
}

interface CheckoutFlowProps {
  cart: CartItem[];
  store: AffiliateStore;
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 'info', title: 'بياناتك', description: 'معلومات التوصيل والتواصل' },
  { id: 'payment', title: 'الدفع', description: 'اختر طريقة الدفع المناسبة' },
  { id: 'review', title: 'مراجعة', description: 'تأكيد تفاصيل طلبك' },
];

export const CheckoutFlow = ({ cart, store, total, onClose, onSuccess }: CheckoutFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });

  // Payment Information
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const paymentOptions = [
    {
      id: 'cod',
      title: 'الدفع عند التوصيل',
      description: 'ادفع نقداً عند استلام طلبك',
      icon: <Building2 className="h-5 w-5" />,
      fee: 0
    },
    {
      id: 'tabby',
      title: 'تابي - اشتر الآن وادفع لاحقاً',
      description: 'قسّط مشترياتك على 4 دفعات بدون فوائد',
      icon: <CreditCard className="h-5 w-5" />,
      fee: 0
    },
    {
      id: 'tamara',
      title: 'تمارا - تقسيط فوري',
      description: 'قسّط طلبك بدون رسوم إضافية',
      icon: <CreditCard className="h-5 w-5" />,
      fee: 0
    },
    {
      id: 'card',
      title: 'بطاقة ائتمان/خصم',
      description: 'فيزا، ماستركارد، مدى',
      icon: <CreditCard className="h-5 w-5" />,
      fee: 0
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get shop_id from first product
      const firstProductId = cart[0].product.id;
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('shop_id')
        .eq('id', firstProductId)
        .maybeSingle();
      
      if (productError) {
        console.error('Error fetching product:', productError);
        throw new Error('لا يمكن جلب معلومات المنتج');
      }
      
      if (!productData?.shop_id) {
        throw new Error('معرف المتجر غير موجود');
      }
      
      // Calculate totals
      const subtotal = cart.reduce((sum, item) => 
        sum + (item.product.final_price || item.product.price_sar) * item.quantity, 0
      );
      const shipping = total > 200 ? 0 : 25;
      const tax = 0;
      const finalTotal = subtotal + shipping + tax;
      
      // Create order
      const orderId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

      const orderData: any = {
        id: orderId,
        shop_id: productData.shop_id,
        affiliate_store_id: store.id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        shipping_address: {
          city: customerInfo.city,
          address: customerInfo.address,
          notes: customerInfo.notes
        },
        status: 'PENDING',
        subtotal_sar: subtotal,
        tax_sar: tax,
        shipping_sar: shipping,
        discount_sar: 0,
        total_sar: finalTotal,
        shipping_method: 'STANDARD',
        payment_method: paymentMethod === 'cod' ? 'CASH_ON_DELIVERY' : 'CREDIT_CARD',
        payment_status: paymentMethod === 'cod' ? 'PENDING' : 'AWAITING_PAYMENT',
        affiliate_commission_sar: subtotal * 0.1,
        order_number: orderNumber
      };
      
      console.log('إنشاء طلب بالبيانات:', orderData);
      
      const { error: orderError } = await supabase
        .from('ecommerce_orders')
        .insert(orderData);
      
      if (orderError) {
        console.error('خطأ في إنشاء الطلب:', orderError);
        throw orderError;
      }
      
      console.log('✅ تم إنشاء الطلب:', { id: orderId, order_number: orderNumber });
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        product_title: item.product.title,
        quantity: item.quantity,
        unit_price_sar: item.product.final_price || item.product.price_sar,
        commission_rate: 10,
        commission_sar: ((item.product.final_price || item.product.price_sar) * item.quantity * 0.1)
      }));
      
      console.log('إضافة عناصر الطلب:', orderItems);
      
      const { error: itemsError } = await supabase
        .from('ecommerce_order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('خطأ في إضافة عناصر الطلب:', itemsError);
        throw itemsError;
      }
      
      console.log('✅ تم إنشاء الطلب بنجاح!');
      
      setIsProcessing(false);
      onSuccess();
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء الطلب:', error);
      console.error('تفاصيل الخطأ:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      setIsProcessing(false);
      const errorMessage = error?.message || 'حدث خطأ غير متوقع';
      alert(`خطأ: ${errorMessage}\n\nيرجى المحاولة مرة أخرى.`);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return customerInfo.name && customerInfo.phone && customerInfo.address && customerInfo.city;
      case 1:
        return paymentMethod && agreeToTerms;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">إتمام الطلب</h2>
              <p className="text-muted-foreground">متجر {store.store_name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        index <= currentStep
                          ? 'bg-primary border-primary text-white'
                          : 'border-muted text-muted-foreground'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {index !== steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Step 1: Customer Information */}
                  {currentStep === 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>معلومات التواصل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">الاسم الكامل *</Label>
                            <Input
                              id="name"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="اسمك الكامل"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">رقم الجوال *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="05xxxxxxxx"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="example@email.com"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>عنوان التوصيل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">المدينة *</Label>
                            <Input
                              id="city"
                              value={customerInfo.city}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="الرياض"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="address">العنوان التفصيلي *</Label>
                            <Textarea
                              id="address"
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="اكتب عنوانك بالتفصيل (الحي، الشارع، رقم البناية)"
                              rows={3}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                            <Textarea
                              id="notes"
                              value={customerInfo.notes}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="أي ملاحظات خاصة للتوصيل"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>طريقة الدفع</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                            <div className="grid gap-4">
                              {paymentOptions.map((option) => (
                                <Label
                                  key={option.id}
                                  htmlFor={option.id}
                                  className="flex items-center space-x-3 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                                >
                                  <RadioGroupItem value={option.id} id={option.id} />
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="text-primary">{option.icon}</div>
                                    <div className="flex-1">
                                      <div className="font-medium">{option.title}</div>
                                      <div className="text-sm text-muted-foreground">{option.description}</div>
                                    </div>
                                    {option.fee > 0 && (
                                      <Badge variant="outline">+{option.fee} ر.س</Badge>
                                    )}
                                  </div>
                                </Label>
                              ))}
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>

                      {/* Terms and Conditions */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <Checkbox
                              id="terms"
                              checked={agreeToTerms}
                              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                              required
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                أوافق على الشروط والأحكام
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                بتأكيد الطلب، أنت توافق على{' '}
                                <button className="underline hover:no-underline text-primary">
                                  شروط الخدمة
                                </button>
                                {' '}و{' '}
                                <button className="underline hover:no-underline text-primary">
                                  سياسة الخصوصية
                                </button>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 3: Order Review */}
                  {currentStep === 2 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Order Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle>ملخص الطلب</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {cart.map((item, index) => (
                            <div key={index} className="flex gap-3 p-3 border rounded-lg">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/20 shrink-0">
                                {item.product.image_urls?.[0] && (
                                  <img
                                    src={item.product.image_urls[0]}
                                    alt={item.product.title}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2">{item.product.title}</h4>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm text-muted-foreground">الكمية: {item.quantity}</span>
                                  <span className="font-medium">
                                    {((item.product.final_price || item.product.price_sar) * item.quantity).toFixed(2)} ر.س
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Separator />
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>المجموع الفرعي:</span>
                              <span>{(total - (total > 200 ? 0 : 25)).toFixed(2)} ر.س</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الشحن:</span>
                              <span>{total > 200 ? 'مجاني' : '25 ر.س'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>الإجمالي:</span>
                              <span className="text-primary">{total.toFixed(2)} ر.س</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer & Payment Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle>تفاصيل الطلب</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm mb-1">معلومات العميل</h4>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>الاسم: {customerInfo.name}</p>
                                <p>الجوال: {customerInfo.phone}</p>
                                {customerInfo.email && <p>البريد: {customerInfo.email}</p>}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium text-sm mb-1">عنوان التوصيل</h4>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>المدينة: {customerInfo.city}</p>
                                <p>العنوان: {customerInfo.address}</p>
                                {customerInfo.notes && <p>ملاحظات: {customerInfo.notes}</p>}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium text-sm mb-1">طريقة الدفع</h4>
                              <div className="text-sm text-muted-foreground">
                                {paymentOptions.find(p => p.id === paymentMethod)?.title}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/20">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              السابق
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isProcessing}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      تأكيد الطلب ({total.toFixed(2)} ر.س)
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};