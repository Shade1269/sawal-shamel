import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Star, 
  Store, 
  Heart,
  Share2,
  Phone,
  MapPin,
  Clock,
  Truck,
  Shield,
  Filter,
  Search,
  Plus,
  Minus,
  X,
  ArrowRight,
  CheckCircle,
  Eye,
  ThumbsUp,
  Zap,
  Gift,
  Percent,
  Package
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductImageCarousel } from "@/features/commerce/components/ProductImageCarousel";
import { CheckoutFlow } from "@/features/commerce/components/CheckoutFlow";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomerAuth } from '@/hooks/useUnifiedAuth';

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

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string };
}

const EnhancedStoreFront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, customer } = useCustomerAuth();
  
  // States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { [variantType: string]: string } }>({});
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Fetch affiliate store data
  const { data: affiliateStore, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ["affiliate-store", storeSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_stores")
        .select("*")
        .eq("store_slug", storeSlug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as AffiliateStore | null;
    },
  });

  // Fetch products for this affiliate store
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["affiliate-store-products", affiliateStore?.id],
    queryFn: async () => {
      if (!affiliateStore?.id) return [];
      
      const { data, error } = await supabase
        .from("affiliate_products")
        .select(`
          *,
          products (
            *,
            product_variants (*)
          )
        `)
        .eq("affiliate_store_id", affiliateStore.id)
        .eq("is_visible", true);

      if (error) throw error;
      
      return data.map(item => ({
        ...item.products,
        variants: item.products.product_variants || [],
        commission_amount: item.commission_rate || 0,
        final_price: (item.products.price_sar || 0) + (item.commission_rate || 0),
        rating: 4.8,
        reviews_count: Math.floor(Math.random() * 100) + 10,
        discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0
      })).filter(Boolean) as Product[];
    },
    enabled: !!affiliateStore?.id,
  });

  // Get unique categories
  const categories = products ? [...new Set(products.map(p => p.category).filter(Boolean))] : [];

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Cart functions
  const addToCart = (product: Product, quantity = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity, selectedVariants: selectedVariants[product.id] }]);
    }
    
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${product.title} إلى السلة`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.final_price || item.product.price_sar) * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // التحقق من المصادقة عند الدفع
  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      // حفظ السلة في localStorage قبل التحويل للمصادقة
      localStorage.setItem('pending_cart', JSON.stringify(cart));
      // التحويل لصفحة المصادقة مع العودة للمتجر
      navigate(`/store/${storeSlug}/auth?returnUrl=/store/${storeSlug}`);
      return;
    }
    
    // إذا كان مسجل دخول، فتح الـ checkout مباشرة
    setShowCart(false);
    setShowCheckout(true);
  };

  // استرداد السلة المحفوظة عند العودة من المصادقة
  useEffect(() => {
    if (isAuthenticated) {
      const pendingCart = localStorage.getItem('pending_cart');
      if (pendingCart) {
        try {
          const savedCart = JSON.parse(pendingCart);
          setCart(savedCart);
          localStorage.removeItem('pending_cart');
          // فتح الـ checkout مباشرة إذا كان هناك سلة محفوظة
          if (savedCart.length > 0) {
            setShowCheckout(true);
          }
        } catch (error) {
          console.error('خطأ في استرداد السلة:', error);
          localStorage.removeItem('pending_cart');
        }
      }
    }
  }, [isAuthenticated]);

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (storeError || !affiliateStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <Store className="h-16 w-16 text-muted-foreground mx-auto" />
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-destructive">المتجر غير موجود</h1>
            <p className="text-muted-foreground">
              تعذر العثور على هذا المتجر أو أنه غير نشط. تأكد من صحة الرابط أو تواصل مع دعم المتجر.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
              <Button onClick={() => navigate('/dashboard')}>الذهاب للوحة التحكم</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5" dir="rtl">
      {/* Enhanced Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={affiliateStore.logo_url} alt={affiliateStore.store_name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Store className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">{affiliateStore.store_name}</h1>
                <p className="text-sm text-muted-foreground">{affiliateStore.bio}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 ml-1" />
                    متجر معتمد
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>متاح الآن</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* معلومات العميل المسجل دخول */}
              {isAuthenticated && customer && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-800 rounded-full text-sm border border-green-200">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{customer.full_name}</span>
                </div>
              )}
              
              <Sheet open={showCart} onOpenChange={setShowCart}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    السلة
                    {cartItemsCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>سلة التسوق ({cartItemsCount} منتج)</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">السلة فارغة</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <img 
                                src={item.product.image_urls?.[0]} 
                                alt={item.product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{item.product.title}</h4>
                                <p className="text-primary font-bold text-sm">
                                  {(item.product.final_price || item.product.price_sar).toFixed(2)} ر.س
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.product.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-bold">المجموع:</span>
                            <span className="text-xl font-bold text-primary">{cartTotal.toFixed(2)} ر.س</span>
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={handleCheckoutClick}
                          >
                            <ArrowRight className="h-4 w-4 ml-2" />
                            إتمام الطلب
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في المنتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="whitespace-nowrap"
            >
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
                    <div className="relative overflow-hidden">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={product.image_urls[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <Store className="h-16 w-16 text-primary/60" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <Badge className="bg-red-500 text-white">
                            <Percent className="h-3 w-3 ml-1" />
                            {product.discount_percentage}%
                          </Badge>
                        )}
                        {product.stock > 0 && (
                          <Badge className="bg-green-500 text-white">متوفر</Badge>
                        )}
                      </div>

                      {/* Wishlist & Quick View */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleWishlist(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Heart 
                            className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedProduct(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                          <Badge variant="destructive" className="text-lg px-4 py-2">نفدت الكمية</Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-base mb-1 line-clamp-2">{product.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < Math.floor(product.rating || 4.8) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary">
                              {(product.final_price || product.price_sar).toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground mr-1">ر.س</span>
                            {product.discount_percentage && product.discount_percentage > 0 && (
                              <div className="text-xs text-muted-foreground line-through">
                                {(product.price_sar * (1 + product.discount_percentage / 100)).toFixed(2)} ر.س
                              </div>
                            )}
                          </div>
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button 
                          className="w-full" 
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          إضافة للسلة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground">جرب البحث بكلمات أخرى أو اختر فئة مختلفة</p>
          </div>
        )}
      </div>

      {/* Product Quick View Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="aspect-square">
                  {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 ? (
                    <ProductImageCarousel 
                      images={selectedProduct.image_urls} 
                      productTitle={selectedProduct.title} 
                    />
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Store className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedProduct.title}</h2>
                    <p className="text-muted-foreground mb-4">{selectedProduct.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating || 4.8) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({selectedProduct.reviews_count} تقييم)</span>
                    </div>

                    <div className="text-3xl font-bold text-primary mb-4">
                      {(selectedProduct.final_price || selectedProduct.price_sar).toFixed(2)} ر.س
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <Badge variant="secondary">
                        <Package className="h-4 w-4 ml-1" />
                        متوفر: {selectedProduct.stock}
                      </Badge>
                      {selectedProduct.category && (
                        <Badge variant="outline">{selectedProduct.category}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={selectedProduct.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 ml-2" />
                      إضافة للسلة
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => toggleWishlist(selectedProduct.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">إتمام الطلب</h2>
            <p className="text-muted-foreground mb-6">
              سيتم تطوير نظام الدفع قريباً. المجموع: {cartTotal.toFixed(2)} ر.س
            </p>
            <div className="flex gap-3">
              <Button 
                className="flex-1"
                onClick={() => {
                  setOrderNumber(`ORD-${Date.now()}`);
                  setOrderCompleted(true);
                  setCart([]);
                  setShowCheckout(false);
                }}
              >
                تأكيد الطلب
              </Button>
              <Button variant="outline" onClick={() => setShowCheckout(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Completed */}
      {orderCompleted && (
        <Dialog open={orderCompleted} onOpenChange={setOrderCompleted}>
          <DialogContent>
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">تم إنشاء الطلب بنجاح!</h2>
              <p className="text-muted-foreground mb-4">
                رقم الطلب: <span className="font-mono font-bold">{orderNumber}</span>
              </p>
              <Button onClick={() => setOrderCompleted(false)}>
                حسناً
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedStoreFront;