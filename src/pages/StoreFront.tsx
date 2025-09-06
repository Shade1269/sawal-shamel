import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Star, Store, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import { Input } from "@/components/ui/input";
import { CheckoutFlow } from "@/components/CheckoutFlow";

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
  variants?: ProductVariant[];
  commission_amount?: number; // Add commission amount
  final_price?: number; // Add final price (base + commission)
}

interface ProductVariant {
  id: string;
  variant_type: string;
  variant_value: string;
  stock: number;
  price_modifier: number;
}

interface Shop {
  id: string;
  display_name: string;
  bio: string;
  logo_url: string;
  slug: string;
  owner_id: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string }; // e.g., { size: "M", color: "Red" }
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { [variantType: string]: string } }>({});
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Debug logging
  console.log('StoreFrontبدء تشغيل  - slug:', slug);

  // Fetch shop data
  const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ["shop", slug],
    queryFn: async () => {
      console.log('جاري البحث عن المتجر بالـ slug:', slug);
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      console.log('نتيجة البحث عن المتجر:', { data, error });
      if (error) throw error;
      return data as Shop | null;
    },
  });

  // Fetch products for this shop
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["shop-products", shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      
      const { data, error } = await supabase
        .from("product_library")
        .select(`
          product_id,
          commission_amount,
          products (
            *,
            product_variants (*)
          )
        `)
        .eq("shop_id", shop.id)
        .eq("is_visible", true);

      if (error) throw error;
      return data.map(item => ({
        ...item.products,
        variants: item.products.product_variants || [],
        commission_amount: item.commission_amount || 0,
        final_price: (item.products.price_sar || 0) + (item.commission_amount || 0)
      })).filter(Boolean) as Product[];
    },
    enabled: !!shop?.id,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  const addToCart = (product: Product) => {
    // Check if product has variants and if they are selected
    if (product.variants && product.variants.length > 0) {
      const productVariants = selectedVariants[product.id] || {};
      const variantTypes = [...new Set(product.variants.map(v => v.variant_type))];
      
      // Check if all required variant types are selected
      const missingVariants = variantTypes.filter(type => !productVariants[type]);
      if (missingVariants.length > 0) {
        toast({
          title: "اختيار مطلوب",
          description: `يجب اختيار: ${missingVariants.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
    }

    const quantity = productQuantities[product.id] || 1;
    
    setCart(prev => {
      const productVariants = selectedVariants[product.id] || {};
      const existingItemIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        JSON.stringify(item.selectedVariants) === JSON.stringify(productVariants)
      );
      
      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }
      
      return [...prev, { 
        product, 
        quantity, 
        selectedVariants: Object.keys(productVariants).length > 0 ? productVariants : undefined 
      }];
    });
    
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${quantity} من ${product.title} إلى سلة التسوق`,
    });
  };

  const updateSelectedVariant = (productId: string, variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantType]: value
      }
    }));
};

  const buyNow = (product: Product) => {
    // تحقق من اختيار المتغيرات إن وجدت
    if (product.variants && product.variants.length > 0) {
      const productVariants = selectedVariants[product.id] || {};
      const variantTypes = [...new Set(product.variants.map(v => v.variant_type))];
      const missing = variantTypes.filter(type => !productVariants[type]);
      if (missing.length > 0) {
        toast({
          title: "اختيار مطلوب",
          description: `يجب اختيار: ${missing.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
    }

    const quantity = productQuantities[product.id] || 1;
    const productVariants = selectedVariants[product.id] || {};

    // إنشاء سلة فورية بالمنتج المختار فقط
    setCart([
      {
        product,
        quantity,
        selectedVariants: Object.keys(productVariants).length > 0 ? productVariants : undefined,
      },
    ]);
    setShowCheckout(true);
    setShowCart(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + ((item.product.final_price || item.product.price_sar) * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutStart = () => {
    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات إلى السلة أولاً",
        variant: "destructive"
      });
      return;
    }
    
    // Check if products are still available
    const unavailableProducts = cart.filter(item => item.product.stock < item.quantity);
    if (unavailableProducts.length > 0) {
      toast({
        title: "منتجات غير متوفرة",
        description: "بعض المنتجات في السلة لم تعد متوفرة بالكمية المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setShowCheckout(true);
    setShowCart(false);
  };

  const handleCheckoutComplete = (orderNum: string) => {
    setOrderNumber(orderNum);
    setOrderCompleted(true);
    setCart([]);
    setShowCheckout(false);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
    setShowCart(true);
  };

  console.log('حالة المتجر:', { shop, shopLoading, shopError });

  if (shopLoading) {
    console.log('جاري تحميل المتجر...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (shopError || (!shopLoading && !shop)) {
    console.log('خطأ في المتجر أو غير موجود:', { shopError, shop });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Store className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">المتجر غير موجود</h1>
            <p className="text-muted-foreground mb-4">
              لم يتم العثور على متجر بالاسم "{slug}"
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentTheme = (shop as any)?.theme || 'classic';
  const pageBg = currentTheme === 'minimal' 
    ? 'bg-background'
    : 'bg-gradient-to-br from-background via-background to-secondary/5';
  const headerBg = currentTheme === 'modern'
    ? 'bg-gradient-to-r from-primary/20 to-secondary/20'
    : 'bg-card/80';

  return (
    <div className={`min-h-screen ${pageBg}`} dir="rtl">
      {/* Header */}
      <header className={`${headerBg} backdrop-blur-sm border-b sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={shop.logo_url} alt={shop.display_name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Store className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{shop.display_name}</h1>
                <p className="text-muted-foreground mt-1">{shop.bio || "مرحباً بكم في متجرنا"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>متاح الآن</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowCart(!showCart)}
              className="relative bg-background/50 backdrop-blur-sm hover:bg-background/80 border-primary/20"
            >
              <ShoppingCart className="h-4 w-4 ml-2" />
              السلة
              {cartItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs font-bold">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-bold">منتجاتنا</h2>
            </div>
            
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
                    <div className="relative overflow-hidden">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <ProductImageCarousel 
                          images={product.image_urls} 
                          productTitle={product.title} 
                        />
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-lg">
                          <Store className="h-16 w-16 text-primary/60" />
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm rounded-lg">
                          <Badge variant="destructive" className="text-lg px-4 py-2">نفدت الكمية</Badge>
                        </div>
                      )}
                      {product.stock > 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-green-500/90 text-white">متوفر</Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{product.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                      </div>
                      
                           <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <div className="text-right">
                             <span className="text-2xl font-bold text-primary">
                               {(product.final_price || product.price_sar).toFixed(2)}
                             </span>
                             <span className="text-sm text-muted-foreground mr-1">ر.س</span>
                           </div>
                           {product.category && (
                             <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                           )}
                         </div>
                        
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-1 text-muted-foreground">
                            <span>المتوفر: {product.stock}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-muted-foreground mr-1">(4.9)</span>
                          </div>
                        </div>
                        
                        {/* Product Variants Selection */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="space-y-3 border-t pt-4">
                            {[...new Set(product.variants.map(v => v.variant_type))].map(variantType => {
                              const variantOptions = product.variants!.filter(v => v.variant_type === variantType);
                              const selectedValue = selectedVariants[product.id]?.[variantType];
                              
                              return (
                                <div key={variantType} className="space-y-2">
                                  <label className="text-sm font-medium">
                                    {variantType === 'size' ? 'المقاس' : 
                                     variantType === 'color' ? 'اللون' : 
                                     variantType === 'style' ? 'النمط' :
                                     variantType === 'material' ? 'المادة' : variantType}:
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {variantOptions.map(variant => (
                                      <Button
                                        key={variant.id}
                                        type="button"
                                        size="sm"
                                        variant={selectedValue === variant.variant_value ? "default" : "outline"}
                                        onClick={() => updateSelectedVariant(product.id, variantType, variant.variant_value)}
                                        disabled={variant.stock === 0}
                                        className={`
                                          ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                          ${selectedValue === variant.variant_value ? 'ring-2 ring-primary' : ''}
                                        `}
                                      >
                                        {variant.variant_value}
                                        {variant.stock === 0 && <span className="mr-1 text-xs">(نفد)</span>}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Quantity Selector */}
                        <div className="space-y-3 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">الكمية:</label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const currentQty = productQuantities[product.id] || 1;
                                  if (currentQty > 1) {
                                    setProductQuantities(prev => ({
                                      ...prev,
                                      [product.id]: currentQty - 1
                                    }));
                                  }
                                }}
                                disabled={product.stock === 0}
                                className="h-8 w-8 p-0"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={productQuantities[product.id] || 1}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  const maxValue = Math.min(value, product.stock);
                                  setProductQuantities(prev => ({
                                    ...prev,
                                    [product.id]: Math.max(1, maxValue)
                                  }));
                                }}
                                className="w-16 h-8 text-center"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const currentQty = productQuantities[product.id] || 1;
                                  if (currentQty < product.stock) {
                                    setProductQuantities(prev => ({
                                      ...prev,
                                      [product.id]: currentQty + 1
                                    }));
                                  }
                                }}
                                disabled={product.stock === 0 || (productQuantities[product.id] || 1) >= product.stock}
                                className="h-8 w-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            onClick={() => buyNow(product)}
                            disabled={product.stock === 0}
                            className="w-full"
                          >
                            شراء مباشر
                          </Button>
                          <Button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            variant="outline"
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 ml-2" />
                            أضف للسلة
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Store className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute top-2 right-1/2 transform translate-x-1/2 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">متجر جديد قيد الإعداد</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    نحن نعمل على إضافة منتجات رائعة لهذا المتجر. تابعونا قريباً لرؤية آخر العروض والمنتجات المميزة.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-primary/70">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      💡 هذا المتجر ينتمي إلى: <span className="font-semibold text-foreground">{shop.display_name}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    سلة التسوق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      السلة فارغة
                    </p>
                  ) : (
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                         <div key={`${item.product.id}-${index}`} className="flex items-center gap-3 pb-3 border-b">
                           <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                             {item.product.image_urls?.[0] ? (
                               <img
                                 src={item.product.image_urls[0]}
                                 alt={item.product.title}
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center">
                                 <Store className="h-4 w-4 text-muted-foreground" />
                               </div>
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium truncate">{item.product.title}</p>
                             {item.selectedVariants && (
                               <div className="flex flex-wrap gap-1 mt-1">
                                 {Object.entries(item.selectedVariants).map(([type, value]) => (
                                   <Badge key={type} variant="outline" className="text-xs px-1 py-0">
                                     {type === 'size' ? 'المقاس' : 
                                      type === 'color' ? 'اللون' : type}: {value}
                                   </Badge>
                                 ))}
                               </div>
                             )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.quantity} × {(item.product.final_price || item.product.price_sar).toFixed(2)} ر.س
                              </p>
                           </div>
                         </div>
                       ))}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">المجموع:</span>
                          <span className="text-lg font-bold text-primary">
                            {cartTotal.toFixed(2)} ر.س
                          </span>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          size="lg" 
                          onClick={handleCheckoutStart}
                          disabled={cart.length === 0}
                        >
                          إتمام الطلب ({cartItemsCount} منتج)
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Flow */}
      {showCheckout && !orderCompleted && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <CheckoutFlow
              cart={cart}
              shopId={shop.id}
              onBack={handleBackToCart}
              onComplete={handleCheckoutComplete}
            />
          </div>
        </div>
      )}

      {/* Order Completed Modal */}
      {orderCompleted && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <CheckoutFlow
                cart={[]}
                shopId={shop?.id || ''}
                onBack={() => {}}
                onComplete={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreFront;