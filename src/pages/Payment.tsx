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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<any>(null);

  // Fetch shop data to get store settings
  const { data: storeSettings, isLoading: settingsLoading } = useStoreSettings(shop?.id);
  
  // Get enabled payment and shipping methods from store settings
  const paymentMethods = getEnabledPaymentMethods(storeSettings).map(method => ({
    ...method,
    icon: method.id === 'cod' ? <Banknote className="h-5 w-5" /> : 
          method.id === 'emkan' ? <ShoppingBag className="h-5 w-5" /> :
          <CreditCard className="h-5 w-5" />
  }));
  
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

      // Create order
      const orderData = {
        shop_id: shop.id,
        customer_name: customerInfo?.name,
        customer_phone: customerInfo?.phone,
        payment_method: selectedPayment,
        shipping_address: {
          address: customerInfo?.address,
          city: customerInfo?.city,
          email: customerInfo?.email || null,
          notes: customerInfo?.notes || null,
          shipping_method: selectedShipping
        },
        subtotal_sar: getSubtotal(),
        total_sar: getTotal(),
        vat_sar: 0,
        status: (selectedPayment === "cod" ? "CONFIRMED" : "PENDING") as Database["public"]["Enums"]["order_status"]
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items - need to get merchant_id from products
      const orderItems = [];
      for (const item of cartItems) {
        // Get product to find its merchant_id
        const { data: product } = await supabase
          .from("products")
          .select("merchant_id")
          .eq("id", item.id)
          .single();

        if (product) {
          orderItems.push({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price_sar: item.price,
            line_total_sar: item.price * item.quantity,
            merchant_id: product.merchant_id,
            title_snapshot: item.name
          });
        }
      }

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Handle Emkan payment if selected
      if (selectedPayment === "emkan") {
        try {
          console.log("Calling create-emkan-payment function...");
          const { data: emkanResponse, error: emkanError } = await supabase.functions.invoke(
            'create-emkan-payment',
            {
              body: {
                amount: getTotal(),
                currency: 'SAR',
                customerInfo: {
                  name: customerInfo?.name,
                  email: customerInfo?.email,
                  phone: customerInfo?.phone,
                  address: customerInfo?.address
                },
                orderInfo: {
                  orderId: order.id,
                  items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                  }))
                },
                redirectUrls: {
                  successUrl: `${window.location.origin}/store/${slug}/order-confirmation/${order.id}`,
                  cancelUrl: `${window.location.origin}/store/${slug}/payment`
                }
              }
            }
          );

          console.log("Emkan response:", emkanResponse);
          console.log("Emkan error:", emkanError);

          if (emkanError) {
            console.error("Emkan API call failed:", emkanError);
            throw emkanError;
          }

          const redirect = emkanResponse?.checkoutUrl || emkanResponse?.redirectUrl;
          if (redirect) {
            // Redirect to Emkan payment page
            window.location.href = redirect;
            return;
          } else {
            const msg = emkanResponse?.error || emkanResponse?.description || "فشل في إنشاء طلب الدفع";
            throw new Error(msg);
          }
        } catch (emkanError: any) {
          console.error("Emkan payment error:", emkanError);
          const message = emkanError?.message || emkanError?.error || "فشل في إنشاء طلب الدفع";
          toast.error(`خطأ في معالجة الطلب\n${message}`);
          return;
        }
      }

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