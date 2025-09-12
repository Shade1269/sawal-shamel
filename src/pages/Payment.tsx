import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Banknote, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useStoreSettings, getEnabledPaymentMethods, getEnabledShippingMethods } from "@/hooks/useStoreSettings";
import { safeJsonParse } from "@/lib/utils";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const Payment = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user: firebaseUser } = useFirebaseAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<any>(null);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!firebaseUser) {
      navigate(`/store/${slug}/auth?returnUrl=${encodeURIComponent(`/store/${slug}/payment`)}`);
      return;
    }
  }, [firebaseUser, navigate, slug]);

  // Fetch shop data to get store settings
  const { data: storeSettings, isLoading: settingsLoading } = useStoreSettings(shop?.id);
  
  // استخدام الدفع عند الاستلام فقط حاليا
  const paymentMethods = [
    {
      id: 'cod',
      name: 'الدفع عند الاستلام',
      description: 'ادفع نقداً عند وصول الطلب إليك',
      icon: <Banknote className="h-5 w-5" />
    }
  ];
  
  const shippingMethods = getEnabledShippingMethods(storeSettings);

  useEffect(() => {
    const fetchShopAndLoadData = async () => {
      // Fetch shop data first
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      setShop(shopData);

      // Load cart from localStorage (safe)
      const savedCart = localStorage.getItem(`cart_${slug}`);
      const parsedCart = safeJsonParse<CartItem[] | null>(savedCart, null);
      if (parsedCart) {
        setCartItems(parsedCart);
      } else {
        navigate(`/store/${slug}`);
        return;
      }

      // Load customer info (safe)
      const savedCustomerInfo = localStorage.getItem(`customer_info_${slug}`);
      const parsedInfo = safeJsonParse<CustomerInfo | null>(savedCustomerInfo, null);
      if (parsedInfo) {
        setCustomerInfo(parsedInfo);
      } else {
        navigate(`/store/${slug}/shipping`);
        return;
      }

      // Load shipping method
      const savedShipping = localStorage.getItem(`shipping_method_${slug}`);
      if (savedShipping) {
        setSelectedShipping(savedShipping);
      } else {
        navigate(`/store/${slug}/shipping`);
        return;
      }
    };

    fetchShopAndLoadData();
  }, [slug, navigate]);

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const method = shippingMethods.find(m => m.id === selectedShipping);
    return method ? method.price : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  const handleCompleteOrder = async () => {
    if (!selectedPayment) {
      toast.error("يرجى اختيار طريقة الدفع");
      return;
    }

    setLoading(true);

    try {
      if (!shop) {
        throw new Error("المتجر غير موجود");
      }

      // إنشاء طلب مع الدفع عند الاستلام
      const orderData = {
        user_id: null, // يمكن ربطه بالمستخدم لاحقا
        session_id: `session_${Date.now()}`,
        customer_name: customerInfo?.name,
        customer_email: customerInfo?.email || null,
        customer_phone: customerInfo?.phone,
        shipping_address: {
          address: customerInfo?.address,
          city: customerInfo?.city,
          email: customerInfo?.email || null,
          notes: customerInfo?.notes || null,
          shipping_method: selectedShipping
        },
        total_amount_sar: getTotal(),
        payment_status: 'PENDING',
        payment_method: 'COD',
        order_status: 'CONFIRMED' // الطلب مؤكد مع الدفع عند الاستلام
      };

      const { data: order, error: orderError } = await supabase
        .from("simple_orders")
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
        .from("simple_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and saved data
      localStorage.removeItem(`cart_${slug}`);
      localStorage.removeItem(`customer_info_${slug}`);
      localStorage.removeItem(`shipping_method_${slug}`);

      // Navigate to order confirmation
      navigate(`/store/${slug}/order-confirmation/${order.id}`);

    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToShipping = () => {
    navigate(`/store/${slug}/shipping`);
  };

  if (!customerInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToShipping}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للشحن
            </Button>
            <h1 className="text-2xl font-bold">الدفع</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">جاري تحميل خيارات الدفع...</p>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            {method.icon}
                            <div>
                              <div className="font-semibold">{method.name}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد وسائل دفع متاحة حالياً</p>
                    <p className="text-sm text-muted-foreground mt-2">يرجى التواصل مع المتجر</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{getSubtotal().toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن:</span>
                    <span>{getShippingCost() === 0 ? "مجاني" : `${getShippingCost().toFixed(2)} ريال`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>المجموع الكلي:</span>
                    <span className="text-primary">{getTotal().toFixed(2)} ريال</span>
                  </div>
                </div>

                {/* Customer Info Summary */}
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold">معلومات العميل:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">الاسم:</span> {customerInfo.name}</p>
                    <p><span className="font-medium">الهاتف:</span> {customerInfo.phone}</p>
                    <p><span className="font-medium">العنوان:</span> {customerInfo.address}, {customerInfo.city}</p>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCompleteOrder}
                  disabled={loading}
                >
                  {loading ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;