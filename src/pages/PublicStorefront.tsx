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
  console.log('PublicStorefront component loaded!');
  const { store_slug } = useParams<{ store_slug: string }>();
  const navigate = useNavigate();
  const {
    store,
    products,
    cart,
    storeLoading,
    productsLoading,
    storeError,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Enhanced product processing
  const enhancedProducts = products?.map(product => ({
    ...product,
    rating: Math.random() * 2 + 3,
    reviews_count: Math.floor(Math.random() * 100) + 5,
    discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
    final_price: product.products?.price_sar || 0,
    image_urls: product.products?.image_urls || [],
    title: product.products?.title || '',
    description: product.products?.description || '',
    category: 'عام', // Default category since it's not in the query
    stock: 100, // Default stock since it's not in the query
    id: product.products?.id || product.product_id
  })) || [];

  // Categories (simplified since we don't have real categories)
  const categories = ['عام', 'إلكترونيات', 'ملابس', 'منزل', 'رياضة'];

  // Enhanced filtering and sorting
  const filteredProducts = enhancedProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const price = product.final_price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    const priceA = a.final_price;
    const priceB = b.final_price;
    
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

  // Enhanced cart functions
  const toggleWishlist = (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    
    toast.success(
      wishlist.includes(productId) ? "تم الحذف من المفضلة" : "تم الإضافة للمفضلة"
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSortBy("newest");
  };

  // Handle customer verification from OTP modal
  const handleCustomerVerified = (verifiedCustomer: {
    phone: string;
    name?: string;
    email?: string;
    sessionId: string;
  }) => {
    setCustomerVerified(verifiedCustomer);
    setCustomerData(prev => ({
      ...prev,
      phone: verifiedCustomer.phone,
      name: verifiedCustomer.name || prev.name,
      email: verifiedCustomer.email || prev.email
    }));
    setShowOTPModal(false);
    toast.success('تم تسجيل الدخول بنجاح!');
  };

  // Handle customer logout
  const handleCustomerLogout = () => {
    sessionManager.clearSession();
    setCustomerData({ name: '', phone: '', email: '', address: '' });
    clearCart();
    toast.success('تم تسجيل الخروج بنجاح');
    // Reset component state instead of full page reload
    setShowCheckout(false);
    setShowOTPModal(false);
  };
  // Handle checkout initiation
  const handleCheckoutStart = () => {
    if (!isCustomerAuthenticated()) {
      setShowOTPModal(true);
      return;
    }
    setShowCheckout(true);
  };

  // Create order using public client
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!store || cart.length === 0) return;

      // Insert order using public client
      const { data: orderData, error: orderError } = await supabasePublic
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
        order_id: orderData.id,
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

      return orderData.id;
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
      toast.error("خطأ في إنشاء الطلب", {
        description: "حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى"
      });
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
            قد يكون المتجر مؤقتاً غير متاح أو تم نقله.
          </p>
          <Button onClick={() => navigate('/')} className="px-8">
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Store Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Store Identity */}
            <div className="flex items-center gap-4">
              {store?.logo_url && (
                <div className="relative">
                  <img
                    src={store.logo_url}
                    alt={`شعار متجر ${store.store_name}`}
                    className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-primary/10"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {store?.store_name}
                </h1>
                {store?.bio && (
                  <p className="text-sm text-muted-foreground max-w-md truncate">
                    {store.bio}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {store.total_orders || 0} طلب
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {enhancedProducts?.length || 0} منتج
                  </span>
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
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -left-2 min-w-[20px] h-5 animate-pulse">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="text-right">سلة التسوق ({totalItems} عنصر)</SheetTitle>
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
                            <div key={item.product_id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <img 
                                src={item.image_url} 
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <p className="text-primary font-bold">{item.price} ر.س</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
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
                          <span>{totalAmount.toFixed(2)} ر.س</span>
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
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">منتجات المتجر</h2>
              <p className="text-muted-foreground mt-1">اكتشف أفضل المنتجات المتاحة</p>
            </div>
            {totalItems > 0 && (
              <Button 
                onClick={() => setShowCart(true)}
                className="relative shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                عرض السلة ({totalItems})
                <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 animate-pulse bg-green-500">
                  {totalItems}
                </Badge>
              </Button>
            )}
          </div>

          {/* Products Grid */}
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
                      <img
                        src={product.image_urls?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      
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
                              i < Math.floor(product.rating) 
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
                              {product.final_price} ر.س
                            </Badge>
                            {product.discount_percentage > 0 && (
                              <span className="text-xs text-muted-foreground line-through">
                                {(product.final_price * (1 + product.discount_percentage / 100)).toFixed(2)} ر.س
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
                        i < Math.floor(selectedProduct.rating) 
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
                    {selectedProduct.final_price} ر.س
                  </Badge>
                  {selectedProduct.discount_percentage > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500">-{selectedProduct.discount_percentage}%</Badge>
                      <span className="text-muted-foreground line-through">
                        {(selectedProduct.final_price * (1 + selectedProduct.discount_percentage / 100)).toFixed(2)} ر.س
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

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-xl font-bold">إتمام الطلب</h2>
              </div>
              
              <div className="space-y-6">
                {/* Cart Items */}
                <div>
                  <h3 className="font-semibold mb-3">عناصر السلة</h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex items-center gap-3 p-3 border rounded">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.price} ر.س</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span>{totalAmount.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Customer Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold">معلومات العميل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Textarea
                      id="address"
                      value={customerData.address}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      rows={3}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    إغلاق
                  </Button>
                  <Button 
                    onClick={() => createOrderMutation.mutate()}
                    disabled={!customerData.name || !customerData.phone || !customerData.address || createOrderMutation.isPending}
                    className="flex-1"
                  >
                    {createOrderMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    تأكيد الطلب
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PublicStorefront;