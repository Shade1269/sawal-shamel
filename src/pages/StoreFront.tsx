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

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
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
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

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
          products (*)
        `)
        .eq("shop_id", shop.id);

      if (error) throw error;
      return data.map(item => item.products).filter(Boolean) as Product[];
    },
    enabled: !!shop?.id,
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${product.title} إلى سلة التسوق`,
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price_sar * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
                    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted relative overflow-hidden">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Store className="h-16 w-16 text-primary/60" />
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
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
                            <span className="text-2xl font-bold text-primary">{product.price_sar}</span>
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
                        
                        <Button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5"
                        >
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          أضف للسلة
                        </Button>
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
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3 pb-3 border-b">
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
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {item.product.price_sar} ر.س
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
                        
                        <Button className="w-full" size="lg">
                          إتمام الطلب
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
    </div>
  );
};

export default StoreFront;