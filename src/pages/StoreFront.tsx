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

  // Fetch shop data
  const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ["shop", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

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

  if (shopLoading) {
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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={shop.logo_url} alt={shop.display_name} />
                <AvatarFallback>
                  <Store className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">{shop.display_name}</h1>
                <p className="text-sm text-muted-foreground">{shop.bio}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowCart(!showCart)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 ml-2" />
              السلة
              {cartItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
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
            <h2 className="text-2xl font-bold mb-6">المنتجات</h2>
            
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
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">نفذ المخزون</Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">
                          {product.price_sar} ر.س
                        </span>
                        {product.category && (
                          <Badge variant="secondary">{product.category}</Badge>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full"
                      >
                        <ShoppingCart className="h-4 w-4 ml-2" />
                        أضف للسلة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
                <p className="text-muted-foreground">لم يتم إضافة أي منتجات لهذا المتجر بعد</p>
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