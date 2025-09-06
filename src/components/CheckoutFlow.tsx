import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Truck, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Package } from "lucide-react";

interface CartItem {
  product: {
    id: string;
    title: string;
    price_sar: number;
    final_price?: number;
    image_urls?: string[];
  };
  quantity: number;
  selectedVariants?: { [key: string]: string };
}

interface ShippingCompany {
  name: string;
  price: number;
}

interface PaymentProvider {
  name: string;
}

interface CheckoutFlowProps {
  cart: CartItem[];
  shopId: string;
  onBack: () => void;
  onComplete: (orderNumber: string) => void;
}

type CheckoutStep = 'shipping' | 'payment' | 'confirmation' | 'success';

export const CheckoutFlow = ({ cart, shopId, onBack, onComplete }: CheckoutFlowProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [selectedShipping, setSelectedShipping] = useState<ShippingCompany | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    area: ''
  });

  // Load shipping companies and payment providers from store settings
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);

  useEffect(() => {
    loadStoreSettings();
  }, [shopId]);

  const loadStoreSettings = async () => {
    try {
      // First get the admin settings for all available options with prices
      const savedShippings = localStorage.getItem('admin_shipping_companies');
      const adminShippingCompanies = savedShippings ? JSON.parse(savedShippings) : [];
      
      // Then get the store-specific enabled settings
      const { data: storeSettings, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('shop_id', shopId)
        .maybeSingle(); // Use maybeSingle to avoid 406 error

      if (!error && storeSettings) {
        const enabledPayments = Array.isArray(storeSettings.payment_providers) 
          ? storeSettings.payment_providers.filter((p: any) => p.enabled)
          : [];
        
        const enabledShippings = Array.isArray(storeSettings.shipping_companies) 
          ? storeSettings.shipping_companies.filter((s: any) => s.enabled)
          : [];

        // Match enabled shippings with admin prices
        const shippingsWithPrices = enabledShippings.map((enabledShipping: any) => {
          const adminCompany = adminShippingCompanies.find((admin: any) => admin.name === enabledShipping.name);
          return {
            name: enabledShipping.name,
            price: adminCompany ? (isNaN(Number(adminCompany.price)) ? 15 : Number(adminCompany.price)) : 15
          };
        });

        setPaymentProviders(enabledPayments.map((p: any) => ({ name: p.name })));
        setShippingCompanies(shippingsWithPrices);
      } else {
        // Fallback if no store settings found
        setShippingCompanies([
          { name: 'سبل', price: 15 },
          { name: 'سمسا', price: 20 }
        ]);
        setPaymentProviders([
          { name: 'فيزا' },
          { name: 'ماستركارد' }
        ]);
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
      // Fallback on error
      setShippingCompanies([
        { name: 'سبل', price: 15 },
        { name: 'سمسا', price: 20 }
      ]);
      setPaymentProviders([
        { name: 'فيزا' },
        { name: 'ماستركارد' }
      ]);
    }
  };

  useEffect(() => {
    if (currentStep === 'payment' && !selectedPayment && paymentProviders.length > 0) {
      setSelectedPayment(paymentProviders[0].name);
    }
  }, [currentStep, selectedPayment, paymentProviders]);

  const subtotal = cart.reduce((sum, item) => sum + ((item.product.final_price || item.product.price_sar) * item.quantity), 0);
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  const handleShippingNext = () => {
    if (!selectedShipping) {
      toast({
        title: "اختيار مطلوب",
        description: "يرجى اختيار شركة الشحن",
        variant: "destructive"
      });
      return;
    }
    if (paymentProviders.length === 0) {
      toast({
        title: "لا توجد وسائل دفع",
        description: "يرجى تفعيل وسيلة دفع واحدة على الأقل من إعدادات المتجر",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentNext = () => {
    if (!selectedPayment) {
      toast({
        title: "اختيار مطلوب",
        description: "يرجى اختيار وسيلة الدفع",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleConfirmOrder = () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    // Show processing message
    toast({
      title: "جاري معالجة الطلب",
      description: "يرجى الانتظار..."
    });
    
    // Simulate payment processing
    setTimeout(() => {
      setCurrentStep('success');
      toast({
        title: "تم تأكيد الطلب بنجاح!",
        description: `رقم الطلب: ${orderNumber}`,
      });
      onComplete(orderNumber);
    }, 2000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-4">
        {[
          { key: 'shipping', icon: Truck, label: 'الشحن' },
          { key: 'payment', icon: CreditCard, label: 'الدفع' },
          { key: 'confirmation', icon: Package, label: 'التأكيد' },
          { key: 'success', icon: CheckCircle, label: 'مكتمل' }
        ].map((step, index) => (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${currentStep === step.key ? 'bg-primary text-primary-foreground' :
                ['shipping', 'payment', 'confirmation', 'success'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
                'bg-muted text-muted-foreground'}
            `}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className={`text-sm ${currentStep === step.key ? 'font-semibold' : ''}`}>
              {step.label}
            </span>
            {index < 3 && <ArrowLeft className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>
    </div>
  );

  if (currentStep === 'shipping') {
    return (
      <div className="space-y-6" dir="rtl">
        {renderStepIndicator()}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              اختيار شركة الشحن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedShipping?.name || ''} onValueChange={(value) => {
              const company = shippingCompanies.find(c => c.name === value);
              setSelectedShipping(company || null);
            }}>
              <div className="space-y-4">
                {shippingCompanies.map((company) => (
                  <div key={company.name} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={company.name} id={company.name} />
                    <Label htmlFor={company.name} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">التسليم خلال 2-3 أيام عمل</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">{company.price} ر.س</p>
                          <p className="text-xs text-muted-foreground">شامل الضريبة</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {selectedShipping && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span>تكلفة الشحن:</span>
                  <span className="font-bold text-primary">{selectedShipping.price} ر.س</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="font-semibold">المجموع الجديد:</span>
                  <span className="font-bold text-lg text-primary">{total.toFixed(2)} ر.س</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={onBack} className="flex-1">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للسلة
              </Button>
              <Button onClick={handleShippingNext} className="flex-1">
                التالي: الدفع
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'payment') {
    return (
      <div className="space-y-6" dir="rtl">
        {renderStepIndicator()}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              اختيار وسيلة الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              <div className="space-y-4">
                {paymentProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={provider.name} id={provider.name} />
                    <Label htmlFor={provider.name} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <p className="font-medium">{provider.name}</p>
                        </div>
                        <Badge variant="secondary">آمن</Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">ملخص الطلب</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المنتجات:</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن ({selectedShipping?.name}):</span>
                  <span>{shippingCost.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{total.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('shipping')} className="flex-1">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للشحن
              </Button>
              <Button onClick={handlePaymentNext} className="flex-1">
                التالي: التأكيد
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="space-y-6" dir="rtl">
        {renderStepIndicator()}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              تأكيد الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <div>
              <h4 className="font-medium mb-4">بيانات العميل</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05xxxxxxxx"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">العنوان المفصل *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="رقم المبنى، اسم الشارع، رقم الشقة"
                  />
                </div>
                <div>
                  <Label htmlFor="city">المدينة *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="الرياض، جدة، الدمام..."
                  />
                </div>
                <div>
                  <Label htmlFor="area">المنطقة</Label>
                  <Input
                    id="area"
                    value={customerInfo.area}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="اسم الحي"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">ملخص الطلب</h4>
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      {item.product.image_urls?.[0] ? (
                        <img
                          src={item.product.image_urls[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {(item.product.final_price || item.product.price_sar).toFixed(2)} ر.س
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">
                        {((item.product.final_price || item.product.price_sar) * item.quantity).toFixed(2)} ر.س
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-primary/5 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المنتجات:</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الشحن ({selectedShipping?.name}):</span>
                  <span>{shippingCost.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{total.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>وسيلة الدفع:</span>
                  <span>{selectedPayment}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep('payment')} className="flex-1">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للدفع
              </Button>
              <Button onClick={handleConfirmOrder} className="flex-1">
                تأكيد الطلب والدفع
                <CheckCircle className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="text-center space-y-6" dir="rtl">
        <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">تم تأكيد طلبك بنجاح!</h2>
          <p className="text-muted-foreground">شكراً لك على ثقتك بنا</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">رقم الطلب</p>
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-2xl font-bold text-primary tracking-wider">
                    ORD-{Date.now().toString().slice(-6)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">احتفظ بهذا الرقم للمتابعة</p>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المبلغ المدفوع:</span>
                  <span className="font-bold">{total.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>وسيلة الدفع:</span>
                  <span>{selectedPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span>شركة الشحن:</span>
                  <span>{selectedShipping?.name}</span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">📞 سيتم التواصل معك قريباً</p>
                <p className="text-muted-foreground">
                  سيقوم فريق خدمة العملاء بالتواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد موعد التسليم
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => window.location.reload()} variant="outline">
          العودة للمتجر
        </Button>
      </div>
    );
  }

  return null;
};