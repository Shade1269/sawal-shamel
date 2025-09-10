import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettings, getEnabledShippingMethods } from "@/hooks/useStoreSettings";
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

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  description: string;
}

const Shipping = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user: firebaseUser } = useFirebaseAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: ""
  });
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [shop, setShop] = useState<any>(null);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!firebaseUser) {
      // إعادة توجيه إلى صفحة تسجيل الدخول مع رابط العودة
      navigate(`/store/${slug}/auth?returnUrl=${encodeURIComponent(`/store/${slug}/shipping`)}`);
      return;
    }
  }, [firebaseUser, navigate, slug]);

  // Fetch shop data to get store settings
  const { data: storeSettings, isLoading: settingsLoading } = useStoreSettings(shop?.id);
  
  // Get enabled shipping methods from store settings
  const shippingMethods = getEnabledShippingMethods(storeSettings);

  useEffect(() => {
    // فقط إذا كان المستخدم مسجل دخول
    if (!firebaseUser) return;
    
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
      const parsedCart = safeJsonParse<CartItem[]>(savedCart, []);
      if (parsedCart.length > 0) {
        setCartItems(parsedCart);
      } else {
        // If no cart, redirect to store
        navigate(`/store/${slug}`);
        return;
      }

      // Load saved customer info (safe)
      const savedCustomerInfo = localStorage.getItem(`customer_info_${slug}`);
      const parsedInfo = safeJsonParse<CustomerInfo | null>(savedCustomerInfo, null);
      if (parsedInfo) {
        setCustomerInfo(parsedInfo);
      }

      // Load saved shipping method
      const savedShipping = localStorage.getItem(`shipping_method_${slug}`);
      if (savedShipping) {
        setSelectedShipping(savedShipping);
      }
    };

    fetchShopAndLoadData();
  }, [slug, navigate, firebaseUser]);

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    const updatedInfo = { ...customerInfo, [field]: value };
    setCustomerInfo(updatedInfo);
    localStorage.setItem(`customer_info_${slug}`, JSON.stringify(updatedInfo));
  };

  const handleShippingChange = (shippingId: string) => {
    setSelectedShipping(shippingId);
    localStorage.setItem(`shipping_method_${slug}`, shippingId);
  };

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

  const handleContinueToPayment = () => {
    // Validate required fields
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (!selectedShipping) {
      toast.error("يرجى اختيار طريقة الشحن");
      return;
    }

    navigate(`/store/${slug}/payment`);
  };

  const handleBackToCart = () => {
    navigate(`/store/${slug}/cart`);
  };

  // رسالة تحميل أثناء التحقق من تسجيل الدخول
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToCart}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للسلة
            </Button>
            <h1 className="text-2xl font-bold">معلومات الشحن</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleCustomerInfoChange("name", e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
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
                    onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address">العنوان *</Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleCustomerInfoChange("address", e.target.value)}
                    placeholder="أدخل عنوانك الكامل"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="city">المدينة *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => handleCustomerInfoChange("city", e.target.value)}
                    placeholder="أدخل اسم المدينة"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => handleCustomerInfoChange("notes", e.target.value)}
                    placeholder="أي ملاحظات خاصة بالطلب"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>طريقة الشحن</CardTitle>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">جاري تحميل خيارات الشحن...</p>
                  </div>
                ) : shippingMethods.length > 0 ? (
                  <RadioGroup value={selectedShipping} onValueChange={handleShippingChange}>
                    {shippingMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{method.name}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                            </div>
                            <div className="font-bold text-primary">
                              {method.price === 0 ? "مجاني" : `${method.price} ريال`}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد خيارات شحن متاحة حالياً</p>
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
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContinueToPayment}
                >
                  متابعة للدفع
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;