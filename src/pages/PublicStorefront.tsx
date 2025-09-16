import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { usePublicStorefront } from '@/hooks/usePublicStorefront';
import { CustomerOTPModal } from '@/components/storefront/CustomerOTPModal';
import { CustomerSessionHeader } from '@/components/storefront/CustomerSessionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoreThemeProvider } from '@/components/store/ThemeProvider';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Store, 
  Package, 
  CheckCircle, 
  User, 
  Shield,
  Star, 
  Heart,
  Share2,
  Search,
  X,
  ArrowRight,
  Eye,
  ThumbsUp,
  Zap,
  Gift,
  Percent,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";

function PublicStorefront() {
  console.log('🚀 ENHANCED PublicStorefront LOADING 🚀');
  
  const { store_slug } = useParams();
  const navigate = useNavigate();
  
  const {
    store,
    products,
    storeLoading,
    productsLoading,
    storeError,
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
    customerSession,
    setCustomerVerified,
    isCustomerAuthenticated,
    getCustomerInfo,
    sessionManager
  } = usePublicStorefront({ storeSlug: store_slug || '' });

  // Enhanced State Management
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // NEW ENHANCED SEARCH AND FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(true); // Show by default
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Enhanced product processing with demo data
  const enhancedProducts = products?.map(product => ({
    ...product,
    rating: Math.random() * 2 + 3,
    reviews_count: Math.floor(Math.random() * 100) + 5,
    discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
    final_price: product.products?.price_sar || 0,
    image_urls: product.products?.image_urls || [],
    title: product.products?.title || '',
    description: product.products?.description || '',
    stock: Math.floor(Math.random() * 50) + 1,
    category: 'عام',
    id: product.products?.id || product.product_id
  })) || [];

  // Categories for filtering
  const categories = Array.from(new Set(enhancedProducts.map(p => p.category)));

  // Enhanced filtering and sorting
  const filteredProducts = enhancedProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const price = product.final_price || 0;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    const priceA = a.final_price || 0;
    const priceB = b.final_price || 0;
    
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
      default:
        return 0;
    }
  });

  // Helper functions
  const toggleWishlist = (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    
    toast.success(wishlist.includes(productId) ? "تم الحذف من المفضلة" : "تم الإضافة للمفضلة");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSortBy("newest");
  };

  const handleCustomerLogout = () => {
    sessionManager.clearSession();
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const handleCheckoutStart = () => {
    if (cart.length === 0) {
      toast.error("السلة فارغة، يرجى إضافة منتجات أولاً");
      return;
    }
    setShowCheckout(true);
    setShowCart(false);
  };

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      console.log('Creating order with data:', orderData);
      
      // Insert order using public client
      const { data: order, error: orderError } = await supabasePublic
        .from('orders')
        .insert({
          shop_id: store.id,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email || null,
          shipping_address: {
            address: customerData.address,
            phone: customerData.phone,
            name: customerData.name
          },
          subtotal_sar: totalAmount,
          tax_sar: 0,
          shipping_sar: 0,
          total_sar: totalAmount,
          payment_method: 'COD',
          affiliate_store_id: store.id,
          affiliate_commission_sar: totalAmount * 0.1,
          status: 'PENDING'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        merchant_id: store.id,
        title_snapshot: item.title,
        quantity: item.quantity,
        unit_price_sar: item.price,
        line_total_sar: item.price * item.quantity,
        commission_rate: 10
      }));

      const { error: itemsError } = await supabasePublic
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order.id;
    },
    onSuccess: (orderId) => {
      toast.success("تم إنشاء الطلب بنجاح", {
        description: `رقم الطلب: ${orderId}`
      });
      clearCart();
      setShowCheckout(false);
      setCustomerData({ name: '', phone: '', email: '', address: '' });
    },
    onError: (error) => {
      toast.error("خطأ في إنشاء الطلب");
      console.error('Order creation error:', error);
    }
  });

  // Loading states
  if (storeLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">جاري تحميل المتجر</h3>
            <p className="text-muted-foreground">الرجاء الانتظار...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">المتجر غير متاح</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            عذراً، لا يمكن الوصول إلى هذا المتجر في الوقت الحالي.
          </p>
          <Button onClick={() => navigate('/')} className="px-8">
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  console.log('🎉 ENHANCED VERSION RENDERING!', { 
    showFilters, 
    searchQuery, 
    filteredProductsCount: filteredProducts.length 
  });

  return (
    <StoreThemeProvider storeId={store?.id}>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      {/* ENHANCED Store Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b-2 border-primary/10 shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            {/* Enhanced Store Identity */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center shadow-xl border-2 border-primary/20">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  {store?.store_name || 'المتجر'}
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">{store?.bio || "مرحباً بكم في متجرنا المميز"}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    متاح الآن
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Package className="h-3 w-3 mr-1" />
                    {enhancedProducts?.length || 0} منتج
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Enhanced Cart Button */}
              <Sheet open={showCart} onOpenChange={setShowCart}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="relative group hover:shadow-xl transition-all duration-300 border-2">
                    <ShoppingCart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    السلة
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -left-2 min-w-[24px] h-6 animate-bounce bg-red-500 hover:bg-red-600">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="text-right text-xl">🛒 سلة التسوق ({totalItems} منتج)</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto py-6">
                      {cart.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">السلة فارغة</h3>
                          <p className="text-muted-foreground">ابدأ التسوق لإضافة منتجات رائعة!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <motion.div 
                              key={item.product_id}
                              layout
                              className="flex items-center gap-4 p-4 border-2 rounded-2xl bg-card/50"
                            >
                              <img 
                                src={item.image_url || '/placeholder.svg'} 
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-xl"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-primary font-bold text-lg">{item.price} ر.س</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {cart.length > 0 && (
                      <div className="border-t pt-6 space-y-4">
                        <div className="flex justify-between text-xl font-bold">
                          <span>الإجمالي:</span>
                          <span className="text-primary">{totalAmount.toFixed(2)} ر.س</span>
                        </div>
                        <Button 
                          className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:shadow-xl" 
                          size="lg"
                          onClick={handleCheckoutStart}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          إتمام الطلب الآن
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Customer Session */}
              <CustomerSessionHeader
                isAuthenticated={isCustomerAuthenticated()}
                customerInfo={getCustomerInfo()}
                onLoginClick={() => setShowOTPModal(true)}
                onLogout={handleCustomerLogout}
                storeSlug={store_slug || ''}
              />

              {/* My Orders Button */}
              <Button 
                variant="outline"
                onClick={() => navigate(`/s/${store_slug}/my-orders`)}
                className="hover:shadow-lg transition-all"
              >
                <Clock className="h-4 w-4 mr-2" />
                طلباتي
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ENHANCED Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ✨ NEW ENHANCED Search and Filter Section ✨ */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-xl p-8 rounded-3xl border-2 border-primary/10 shadow-2xl"
        >
          <div className="space-y-6">
            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                <Input
                  placeholder="🔍 ابحث عن المنتجات المفضلة لديك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-14 pl-4 h-16 text-lg border-2 focus:border-primary/50 rounded-2xl bg-background/80 backdrop-blur-sm shadow-inner text-center font-medium"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Enhanced Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:shadow-lg transition-all duration-300 px-6"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  فلاتر متقدمة
                  {showFilters ? <span className="mr-2">▲</span> : <span className="mr-2">▼</span>}
                </Button>
                
                {(searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    مسح جميع الفلاتر
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  🎯 {filteredProducts?.length || 0} منتج متاح
                </Badge>
                <span className="text-muted-foreground">
                  من أصل {enhancedProducts?.length || 0} منتج
                </span>
              </div>
            </div>

            {/* ✨ Enhanced Advanced Filters Panel ✨ */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-background/60 backdrop-blur-sm rounded-2xl border-2 border-primary/20 mt-4">
                    {/* Category Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Package className="h-4 w-4" />
                        التصنيف
                      </Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full h-12 border-2 hover:border-primary/40 transition-colors">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🌟 جميع التصنيفات</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              📦 {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <TrendingUp className="h-4 w-4" />
                        ترتيب حسب
                      </Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full h-12 border-2 hover:border-primary/40 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">🆕 الأحدث</SelectItem>
                          <SelectItem value="price-low">💰 السعر: من الأقل للأعلى</SelectItem>
                          <SelectItem value="price-high">💎 السعر: من الأعلى للأقل</SelectItem>
                          <SelectItem value="name">🔤 الاسم أبجدياً</SelectItem>
                          <SelectItem value="rating">⭐ الأعلى تقييماً</SelectItem>
                          <SelectItem value="discount">🔥 الأعلى خصماً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Percent className="h-4 w-4" />
                        نطاق السعر: {priceRange[0]} - {priceRange[1]} ريال
                      </Label>
                      <div className="px-3 py-4">
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          max={1000}
                          min={0}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>0 ريال</span>
                          <span>1000+ ريال</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ✨ ENHANCED Products Section ✨ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                ✨ منتجات المتجر المميزة
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">اكتشف أجمل المنتجات وأفضل العروض</p>
            </div>
            
            {totalItems > 0 && (
              <Button 
                onClick={() => setShowCart(true)}
                className="relative shadow-2xl hover:shadow-3xl transition-all duration-300 px-8 py-3 bg-gradient-to-r from-primary to-primary/80"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                عرض السلة ({totalItems})
                <Badge className="absolute -top-2 -right-2 min-w-[24px] h-6 animate-pulse bg-green-500">
                  {totalItems}
                </Badge>
              </Button>
            )}
          </div>

          {/* Enhanced Products Grid */}
          {productsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">جاري تحميل المنتجات...</h3>
              <p className="text-muted-foreground">الرجاء الانتظار قليلاً</p>
            </div>
          ) : !enhancedProducts || enhancedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">لا توجد منتجات بعد</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                لم يتم إضافة منتجات إلى هذا المتجر بعد. تابعونا للمزيد من المنتجات الرائعة قريباً!
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">لا توجد نتائج للبحث</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 text-lg">
                لم نتمكن من العثور على منتجات تطابق البحث والفلاتر المحددة.
              </p>
              <Button onClick={clearFilters} variant="outline" size="lg">
                <X className="h-4 w-4 mr-2" />
                مسح الفلاتر وإظهار جميع المنتجات
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 border-border/30 hover:border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-background via-background to-card/30 backdrop-blur-sm group-hover:shadow-primary/10">
                    {/* Enhanced Product Image */}
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted/10 to-muted/30 relative group/image">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <div className="relative overflow-hidden">
                          <img 
                            src={product.image_urls[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-500">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Package className="h-24 w-24 text-primary/60" />
                          </motion.div>
                        </div>
                      )}

                      {/* Enhanced Floating Action Buttons */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-10 w-10 p-0 bg-background/95 backdrop-blur-lg border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg"
                          onClick={() => toggleWishlist(product.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 transition-all ${
                              wishlist.includes(product.id) 
                                ? 'fill-red-500 text-red-500 scale-110' 
                                : 'hover:scale-110'
                            }`} 
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-10 w-10 p-0 bg-background/95 backdrop-blur-lg border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4 hover:scale-110 transition-transform" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-10 w-10 p-0 bg-background/95 backdrop-blur-lg border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg"
                        >
                          <Share2 className="h-4 w-4 hover:scale-110 transition-transform" />
                        </Button>
                      </div>

                      {/* Enhanced Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: -12 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                          >
                            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 text-sm font-bold shadow-lg border-0 animate-pulse">
                              <Percent className="h-3 w-3 mr-1" />
                              -{product.discount_percentage}%
                            </Badge>
                          </motion.div>
                        )}
                        
                        {product.stock <= 5 && product.stock > 0 && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 text-xs shadow-md border-0">
                            ⚡ {product.stock} متبقي
                          </Badge>
                        )}
                        
                        {product.stock === 0 && (
                          <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 text-xs shadow-md border-0">
                            نفد المخزون
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Product Title */}
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      
                      {/* Product Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Enhanced Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
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
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews_count}) تقييم
                        </span>
                      </div>

                      {/* Enhanced Price and Action */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xl font-bold text-primary px-3 py-1">
                              {(product.final_price || 0).toFixed(2)} ر.س
                            </Badge>
                            {product.discount_percentage > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                {((product.final_price || 0) * (1 + (product.discount_percentage || 0) / 100)).toFixed(2)} ر.س
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => addToCart(product.product_id)} 
                          size="sm"
                          disabled={product.stock === 0}
                          className="shadow-lg hover:shadow-xl transition-all group/btn px-6 py-2"
                        >
                          <Plus className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                          {product.stock === 0 ? 'نفد المخزون' : 'إضافة'}
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

      {/* Enhanced Product Quick View Modal */}
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

                <div className="space-y-3">
                  <Button
                    className="w-full h-12 text-lg"
                    onClick={() => {
                      addToCart(selectedProduct.product_id);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {selectedProduct.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toggleWishlist(selectedProduct.id)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      {wishlist.includes(selectedProduct.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    </Button>
                    
                    <Button variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      مشاركة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Customer OTP Modal */}
      <CustomerOTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        storeId={store?.id || ''}
        onVerified={(customerData) => {
          setCustomerVerified(customerData);
          setShowOTPModal(false);
          toast.success("تم تسجيل الدخول بنجاح");
        }}
      />

      {/* Checkout Modal */}
      {showCheckout && (
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-right">إتمام الطلب</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerData.name || !customerData.phone) {
                  toast.error("يرجى ملء جميع البيانات المطلوبة");
                  return;
                }
                createOrderMutation.mutate(customerData);
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الجوال *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    placeholder="05xxxxxxxx"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address">العنوان *</Label>
                  <Textarea
                    id="address"
                    value={customerData.address}
                    onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                    placeholder="أدخل عنوانك بالتفصيل"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>إجمالي الطلب:</span>
                  <span>{totalAmount.toFixed(2)} ر.س</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </StoreThemeProvider>
  );
}

export default PublicStorefront;