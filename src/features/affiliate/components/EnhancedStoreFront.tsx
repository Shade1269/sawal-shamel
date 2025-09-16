import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Star, 
  Store, 
  Heart,
  Share2,
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
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';

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
  const { isAuthenticated, customer } = useCustomerAuthContext();
  
  // States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { [variantType: string]: string } }>({});
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // جلب بيانات المتجر
  const { data: affiliateStore, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ["affiliate-store", storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      
      const { data, error } = await supabase
        .from("affiliate_stores")
        .select("*")
        .eq("store_slug", storeSlug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as AffiliateStore | null;
    },
    enabled: !!storeSlug,
  });

  // جلب المنتجات
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["affiliate-store-products", affiliateStore?.id],
    queryFn: async () => {
      if (!affiliateStore?.id) return [];
      
      const { data: affiliateProducts, error } = await supabase
        .from("affiliate_products")
        .select(`
          product_id,
          commission_rate,
          is_visible,
          products (
            id,
            title,
            description,
            price_sar,
            image_urls,
            stock,
            category,
            is_active
          )
        `)
        .eq("affiliate_store_id", affiliateStore.id)
        .eq("is_visible", true);

      if (error) throw error;

      return affiliateProducts
        .filter(item => item.products && item.products.is_active)
        .map(item => ({
          ...item.products,
          commission_amount: (item.products.price_sar * (item.commission_rate / 100)),
          final_price: item.products.price_sar
        })) as Product[];
    },
    enabled: !!affiliateStore?.id,
  });

  // حساب المجموع
  const cartTotal = cart.reduce((total, item) => 
    total + (item.product.final_price || item.product.price_sar) * item.quantity, 0
  );

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // الفئات المتاحة
  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  // فلترة المنتجات
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // وظائف السلة
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }

    toast({
      title: "تم إضافة المنتج للسلة",
      description: `تم إضافة ${product.title} إلى سلة التسوق`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast({
      title: "تم حذف المنتج",
      description: "تم حذف المنتج من السلة",
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate(`/store/${storeSlug}/auth`);
      return;
    }
    navigate(`/store/${storeSlug}/checkout`);
  };

  // Loading states
  if (storeLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (storeError || !affiliateStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">المتجر غير متاح</h3>
          <p className="text-muted-foreground mb-6">
            عذراً، لا يمكن الوصول إلى هذا المتجر في الوقت الحالي
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary/10 to-primary/20 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Store Identity */}
            <div className="flex items-center gap-3">
              {affiliateStore?.logo_url && (
                <img
                  src={affiliateStore.logo_url}
                  alt={`شعار متجر ${affiliateStore.store_name}`}
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{affiliateStore?.store_name}</h1>
                {affiliateStore?.bio && (
                  <p className="text-sm text-muted-foreground">{affiliateStore.bio}</p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <Sheet open={showCart} onOpenChange={setShowCart}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    السلة
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -left-2 min-w-[20px] h-5">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      سلة التسوق ({cart.reduce((sum, item) => sum + item.quantity, 0)} منتج)
                    </SheetTitle>
                  </SheetHeader>
                  {/* Cart content will be rendered below */}
                </SheetContent>
              </Sheet>

              {/* Customer Authentication */}
              <Button 
                variant="outline" 
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/customer/profile');
                  } else {
                    navigate('/customer/auth');
                  }
                }}
              >
                {isAuthenticated ? 'حسابي' : 'تسجيل دخول'}
              </Button>

              {/* My Orders */}
              <Button 
                variant="outline"
                onClick={() => navigate('/customer/orders')}
              >
                طلباتي
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          >
            الكل
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
              <div className="relative aspect-square overflow-hidden">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const newWishlist = wishlist.includes(product.id)
                          ? wishlist.filter(id => id !== product.id)
                          : [...wishlist, product.id];
                        setWishlist(newWishlist);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Discount Badge */}
                {product.discount_percentage && (
                  <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                    <Percent className="h-3 w-3 ml-1" />
                    {product.discount_percentage}%
                  </Badge>
                )}

                {/* Stock Status */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      نفد المخزون
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg line-clamp-2 text-foreground mb-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Rating & Reviews */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= (product.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews_count || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">
                      {(product.final_price || product.price_sar).toFixed(2)} ر.س
                    </span>
                    {product.discount_percentage && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.price_sar.toFixed(2)} ر.س
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    أضف للسلة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== "all"
              ? "لم نجد منتجات تطابق البحث"
              : "لا توجد منتجات في هذا المتجر حالياً"}
          </p>
        </div>
      )}

      {/* Shopping Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
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
                      <Package className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedProduct.title}</h2>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="text-3xl font-bold text-primary">
                    {(selectedProduct.final_price || selectedProduct.price_sar).toFixed(2)} ر.س
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    أضف للسلة
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default EnhancedStoreFront;