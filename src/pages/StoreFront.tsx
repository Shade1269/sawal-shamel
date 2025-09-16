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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Star, 
  Store, 
  CheckCircle,
  Heart,
  Share2,
  Search,
  Plus,
  Minus,
  X,
  Eye,
  Package,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Percent
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductImageCarousel } from "@/features/commerce/components/ProductImageCarousel";
import { CheckoutFlow } from "@/features/commerce/components/CheckoutFlow";
import { motion, AnimatePresence } from "framer-motion";

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
  selectedVariants?: { [key: string]: string };
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Enhanced State Management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { [variantType: string]: string } }>({});
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});

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
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Fetch store settings for checkout
  const { data: storeSettings } = useQuery({
    queryKey: ["store-settings", shop?.id],
    queryFn: async () => {
      if (!shop?.id) return null;
      
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("shop_id", shop.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching store settings:', error);
        return { payment_providers: [], shipping_companies: [] };
      }
      
      return data || { payment_providers: [], shipping_companies: [] };
    },
    enabled: !!shop?.id,
  });

  // Enhanced product processing with demo enhancements
  const enhancedProducts = (products || []).map(product => ({
    ...product,
    rating: Math.random() * 2 + 3,
    reviews_count: Math.floor(Math.random() * 100) + 5,
    discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0
  }));

  // Categories
  const categories = Array.from(new Set(enhancedProducts.map(p => p.category || 'عام')));

  // Enhanced filtering and sorting
  const filteredProducts = enhancedProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || (product.category || 'عام') === selectedCategory;
    const price = product.final_price || product.price_sar;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    const priceA = a.final_price || a.price_sar;
    const priceB = b.final_price || b.price_sar;
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'discount':
        return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      case 'newest':
      default:
        return Math.random() - 0.5;
    }
  });

  // Enhanced utility functions
  const toggleWishlist = (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    
    toast({
      title: wishlist.includes(productId) ? "تم الحذف من المفضلة" : "تم الإضافة للمفضلة",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSortBy("newest");
  };

  const addToCart = (product: Product) => {
    const cartKey = `cart_${slug}`;
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.title,
        price: product.price_sar,
        quantity: 1,
        image: product.image_urls?.[0]
      });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    
    // Convert to CartItem format for state
    const cartItems = existingCart.map((item: any) => ({
      product: {
        ...product,
        id: item.id,
        title: item.name,
        price_sar: item.price
      },
      quantity: item.quantity
    }));
    
    setCart(cartItems);
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${product.title} إلى سلة التسوق`,
    });
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
    
    setShowCheckout(true);
    setShowCart(false);
    setOrderCompleted(false);
  };

  const handleCheckoutComplete = (orderNum: string) => {
    setOrderNumber(orderNum);
    setOrderCompleted(true);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
    setShowCart(true);
    setOrderCompleted(false);
  };

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
            <Button onClick={() => navigate('/')} className="gap-2">
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      {/* Enhanced Store Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Store Identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {shop.display_name}
                </h1>
                <p className="text-muted-foreground mt-1">{shop.bio || "مرحباً بكم في متجرنا"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>متاح الآن</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {enhancedProducts?.length || 0} منتج
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <Sheet open={showCart} onOpenChange={setShowCart}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative group hover:shadow-lg transition-all">
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    السلة
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-2 -left-2 min-w-[20px] h-5 animate-pulse">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="text-right">سلة التسوق ({cartItemsCount} عنصر)</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto py-4">
                      {cart.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">السلة فارغة</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <img 
                                src={item.product.image_urls?.[0] || '/placeholder.svg'} 
                                alt={item.product.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.product.title}</h4>
                                <p className="text-primary font-bold">{item.product.final_price || item.product.price_sar} ر.س</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    const newQuantity = item.quantity - 1;
                                    if (newQuantity <= 0) {
                                      setCart(cart.filter(cartItem => cartItem.product.id !== item.product.id));
                                    } else {
                                      setCart(cart.map(cartItem => 
                                        cartItem.product.id === item.product.id 
                                          ? { ...cartItem, quantity: newQuantity }
                                          : cartItem
                                      ));
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setCart(cart.map(cartItem => 
                                      cartItem.product.id === item.product.id 
                                        ? { ...cartItem, quantity: item.quantity + 1 }
                                        : cartItem
                                    ));
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {cart.length > 0 && (
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>الإجمالي:</span>
                          <span>{cartTotal.toFixed(2)} ر.س</span>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleCheckoutStart}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          إتمام الطلب
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Enhanced Search and Filter Section */}
        <section className="bg-gradient-to-r from-card to-card/50 p-6 rounded-2xl border shadow-lg">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="ابحث عن المنتجات المفضلة لديك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-14 text-lg border-2 focus:border-primary/50 rounded-xl bg-background/50"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:shadow-md transition-all"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  فلترة متقدمة
                  {showFilters && <span className="mr-2">↑</span>}
                </Button>
                
                {(searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    مسح الفلاتر
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} من {enhancedProducts?.length || 0} منتج
                </span>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-background/50 rounded-xl border">
                    {/* Category Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        الفئة
                      </Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الفئات</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        نطاق السعر: {priceRange[0]} - {priceRange[1]} ر.س
                      </Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(value: [number, number]) => setPriceRange(value)}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 ر.س</span>
                        <span>1000 ر.س</span>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        ترتيب حسب
                      </Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر الترتيب" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">الأحدث</SelectItem>
                          <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                          <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
                          <SelectItem value="name">الاسم أ-ي</SelectItem>
                          <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                          <SelectItem value="discount">الأعلى خصماً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Enhanced Products Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">منتجات المتجر</h2>
              <p className="text-muted-foreground mt-1">اكتشف أفضل المنتجات المتاحة</p>
            </div>
            {cartItemsCount > 0 && (
              <Button 
                onClick={() => setShowCart(true)}
                className="relative shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                عرض السلة ({cartItemsCount})
                <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 animate-pulse bg-green-500">
                  {cartItemsCount}
                </Badge>
              </Button>
            )}
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
            </div>
          ) : !enhancedProducts || enhancedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">لا توجد منتجات</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                لم يتم إضافة أي منتجات إلى هذا المتجر بعد. تابعونا للمزيد من المنتجات قريباً!
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">لا توجد نتائج</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                لم نتمكن من العثور على منتجات تطابق البحث والفلاتر المحددة.
              </p>
              <Button onClick={clearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                مسح الفلاتر
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
                    {/* Product Image */}
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 relative">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <ProductImageCarousel 
                          images={product.image_urls} 
                          productTitle={product.title} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-16 w-16 text-primary/60" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discount_percentage > 0 && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white animate-pulse">
                          -{product.discount_percentage}%
                        </Badge>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute top-3 left-3 space-y-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 backdrop-blur hover:bg-background"
                          onClick={() => toggleWishlist(product.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 backdrop-blur hover:bg-background"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 backdrop-blur hover:bg-background"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Stock Indicator */}
                      {product.stock <= 5 && (
                        <Badge className="absolute bottom-3 right-3 bg-orange-500 text-white">
                          {product.stock > 0 ? `${product.stock} متبقي` : 'نفد المخزون'}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Product Title */}
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      
                      {/* Product Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 0) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground mr-1">
                          ({product.reviews_count})
                        </span>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-lg font-bold text-primary">
                              {(product.final_price || product.price_sar).toFixed(2)} ر.س
                            </Badge>
                            {product.discount_percentage > 0 && (
                              <span className="text-xs text-muted-foreground line-through">
                                {((product.final_price || product.price_sar) * (1 + product.discount_percentage / 100)).toFixed(2)} ر.س
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => addToCart(product)} 
                          size="sm"
                          disabled={product.stock === 0}
                          className="shadow-lg hover:shadow-xl transition-all group"
                        >
                          <Plus className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                          إضافة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right text-2xl">{selectedProduct.title}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-xl">
                  <img
                    src={selectedProduct.image_urls?.[0] || '/placeholder.svg'}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedProduct.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(selectedProduct.rating || 0) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    ({selectedProduct.reviews_count} تقييم)
                  </span>
                </div>

                <div className="space-y-2">
                  <Badge variant="secondary" className="text-2xl font-bold text-primary p-3">
                    {(selectedProduct.final_price || selectedProduct.price_sar).toFixed(2)} ر.س
                  </Badge>
                  {selectedProduct.discount_percentage > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500">-{selectedProduct.discount_percentage}%</Badge>
                      <span className="text-muted-foreground line-through">
                        {((selectedProduct.final_price || selectedProduct.price_sar) * (1 + selectedProduct.discount_percentage / 100)).toFixed(2)} ر.س
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }} 
                  size="lg"
                  className="w-full"
                  disabled={selectedProduct.stock === 0}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {selectedProduct.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Checkout Flow */}
      {showCheckout && cart.length > 0 && shop && (
        <CheckoutFlow
          cart={cart}
          onOrderComplete={handleCheckoutComplete}
          onCancel={handleBackToCart}
          shopId={shop.id}
          storeSettings={storeSettings}
        />
      )}

      {/* Order Completed */}
      {orderCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">تم إنشاء الطلب بنجاح!</h2>
              <p className="text-muted-foreground mb-4">رقم الطلب: {orderNumber}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setOrderCompleted(false);
                    navigate('/');
                  }}
                  className="w-full"
                >
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StoreFront;