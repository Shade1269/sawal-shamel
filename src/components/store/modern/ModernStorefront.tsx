import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StoreThemeProvider } from '@/components/store/StoreThemeProvider';
import { StoreHeader } from './components/StoreHeader';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { ShoppingCart } from './components/ShoppingCart';
import { SearchAndFilters } from './components/SearchAndFilters';
import { CheckoutFlow } from './components/CheckoutFlow';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { parseFeaturedCategories, type StoreSettings, type StoreCategory } from '@/hooks/useStoreSettings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface ModernStorefrontProps { storeSlug?: string }
const ModernStorefront: React.FC<ModernStorefrontProps> = ({ storeSlug: propStoreSlug }) => {
  const params = useParams<{ storeSlug?: string; slug?: string }>();
  const storeSlug = (propStoreSlug ?? params.storeSlug ?? params.slug ?? '') as string;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States للواجهة
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // جلب بيانات المتجر
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ["modern-store", storeSlug],
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

  // جلب المنتجات مع التحسينات
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["modern-store-products", store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      
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
        .eq("affiliate_store_id", store.id)
        .eq("is_visible", true);

      if (error) throw error;

      return affiliateProducts
        .filter(item => item.products && item.products.is_active)
        .map(item => ({
          ...item.products,
          commission_amount: (item.products.price_sar * (item.commission_rate / 100)),
          final_price: item.products.price_sar,
          rating: Math.random() * 2 + 3,
          reviews_count: Math.floor(Math.random() * 100) + 5,
          discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0
        })) as Product[];
    },
    enabled: !!store?.id,
  });

  // إعدادات الواجهة (الفئات المميزة)
  const { data: storeSettings } = useQuery<StoreSettings | null>({
    queryKey: ["modern-store-settings", store?.id],
    queryFn: async () => {
      if (!store?.id) return null;
      const { data, error } = await supabase
        .from("affiliate_store_settings")
        .select("*")
        .eq("store_id", store.id)
        .maybeSingle();
      if (error && (error as any).code !== 'PGRST116') throw error;
      return data as StoreSettings | null;
    },
    enabled: !!store?.id,
  });

  // حفظ السلة في localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${store?.id}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [store?.id]);

  useEffect(() => {
    if (store?.id && cart.length > 0) {
      localStorage.setItem(`cart-${store.id}`, JSON.stringify(cart));
    }
  }, [cart, store?.id]);

  // حفظ المفضلة في localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem(`wishlist-${store?.id}`);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [store?.id]);

  useEffect(() => {
    if (store?.id) {
      localStorage.setItem(`wishlist-${store.id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, store?.id]);

  // وظائف السلة المحسنة
  const addToCart = (product: Product, quantity: number = 1, variants?: { [key: string]: string }) => {
    const existingItem = cart.find(item => 
      item.product.id === product.id && 
      JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
    );
    
    if (existingItem) {
      setCart(cart.map(item =>
        item === existingItem
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity, selectedVariants: variants }]);
    }

    toast({
      title: "✅ تم إضافة المنتج للسلة",
      description: `تم إضافة ${product.title} إلى سلة التسوق`,
    });
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    toast({
      title: "🗑️ تم حذف المنتج",
      description: "تم حذف المنتج من السلة",
    });
  };

  const updateCartQuantity = (index: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(index);
      return;
    }

    setCart(cart.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    toast({
      title: wishlist.includes(productId) ? "💔 تم الحذف من المفضلة" : "❤️ تم الإضافة للمفضلة",
      description: wishlist.includes(productId) 
        ? "تم حذف المنتج من قائمة المفضلة" 
        : "تم إضافة المنتج لقائمة المفضلة",
    });
  };

  // حساب إجماليات السلة
  const cartTotal = cart.reduce((total, item) => 
    total + (item.product.final_price || item.product.price_sar) * item.quantity, 0
  );
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const shippingCost = cartTotal > 200 ? 0 : 25; // شحن مجاني للطلبات فوق 200 ريال
  const finalTotal = cartTotal + shippingCost;

  // فلترة المنتجات
  const categories = Array.from(new Set(products?.map(p => p.category) || []));
  
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const price = product.final_price || product.price_sar;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  })?.sort((a, b) => {
    const priceA = a.final_price || a.price_sar;
    const priceB = b.final_price || b.price_sar;
    
    switch (sortBy) {
      case 'price-low': return priceA - priceB;
      case 'price-high': return priceB - priceA;
      case 'name': return a.title.localeCompare(b.title);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'discount': return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      default: return Math.random() - 0.5;
    }
  }) || [];

  // فئات مميزة وبنرات العرض
  type CategoryBannerProductDisplay = {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number | null;
    product: Product | null;
  };
  type CategoryBannerDisplay = { category: StoreCategory; products: CategoryBannerProductDisplay[] };

  const featuredCategories = React.useMemo(
    () => parseFeaturedCategories(storeSettings?.featured_categories),
    [storeSettings?.featured_categories]
  );

  const categoryBanners = React.useMemo<CategoryBannerDisplay[]>(() => {
    if (!featuredCategories || featuredCategories.length === 0) return [];

    const productMap = new Map<string, Product>();
    (products ?? []).forEach((p) => productMap.set(p.id, p));

    return featuredCategories
      .filter((cat) => cat.isActive !== false && cat.bannerProducts && cat.bannerProducts.length > 0)
      .map((cat) => {
        const items: CategoryBannerProductDisplay[] = (cat.bannerProducts ?? [])
          .map((bp) => {
            const full = productMap.get(bp.id) ?? null;
            const title = full?.title || bp.title;
            if (!title) return null;
            const price = full ? (full.final_price || full.price_sar) : null;
            const imageUrl = full?.image_urls?.[0] || bp.image_url || null;
            return { id: bp.id, title, imageUrl, price, product: full } as CategoryBannerProductDisplay;
          })
          .filter((x): x is CategoryBannerProductDisplay => Boolean(x));
        return { category: cat, products: items };
      })
      .filter((b) => b.products.length > 0);
  }, [featuredCategories, products]);

  // Loading state
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h3 className="text-2xl font-bold mb-3">المتجر غير متاح</h3>
          <p className="text-muted-foreground mb-6">
            عذراً، لا يمكن الوصول إلى هذا المتجر في الوقت الحالي.
          </p>
          <button onClick={() => navigate('/')} className="px-8 py-2 bg-primary text-white rounded-lg">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <StoreThemeProvider storeId={store.id}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <StoreHeader 
          store={store}
          cartItemsCount={cartItemsCount}
          onCartClick={() => setShowCart(true)}
          onWishlistClick={() => {}} // TODO: إضافة صفحة المفضلة
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Search and Filters */}
          <SearchAndFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onClearFilters={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceRange([0, 1000]);
              setSortBy("newest");
            }}
          />

          {/* البنرات المخصصة للفئات */}
          {categoryBanners.length > 0 && (
            <section className="space-y-6 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm border border-primary/20 rounded-3xl p-6 shadow-lg">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  المنتجات المميزة حسب الفئات
                </h2>
                <p className="text-sm text-muted-foreground">
                  مجموعة مختارة بعناية من أفضل منتجاتنا في كل فئة
                </p>
              </div>
              <div className="space-y-8">
                {categoryBanners.map(({ category, products: bannerProducts }) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <span className="w-2 h-8 bg-primary rounded-full"></span>
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mr-4">
                          {bannerProducts.length} منتج مختار بعناية
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(category.name)}
                        className="text-primary hover:text-primary"
                      >
                        عرض الكل ←
                      </Button>
                    </div>
                    {/* شريط تمرير أفقي تلقائي الحركة */}
                    <div className="relative overflow-hidden">
                      <motion.div
                        className="flex gap-4 pr-4"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
                      >
                        {[...bannerProducts, ...bannerProducts].map((bp, idx) => {
                          const available = Boolean(bp.product);
                          return (
                            <motion.button
                              type="button"
                              key={`banner-${category.id}-${bp.id}-${idx}`}
                              onClick={() => bp.product && setSelectedProduct(bp.product)}
                              whileHover={available ? { y: -8, scale: 1.03 } : undefined}
                              className={`group relative w-64 flex-shrink-0 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                                available
                                  ? 'bg-card/80 hover:border-primary/60 shadow-md hover:shadow-2xl'
                                  : 'bg-muted cursor-not-allowed opacity-60'
                              }`}
                              disabled={!available}
                            >
                              {bp.imageUrl ? (
                                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                                  <img
                                    src={bp.imageUrl}
                                    alt={bp.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              ) : (
                                <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                                  <div className="text-center text-muted-foreground">
                                    <div className="text-5xl mb-2">📦</div>
                                    <p className="text-xs">لا توجد صورة</p>
                                  </div>
                                </div>
                              )}
                              <div className="p-4 space-y-2 bg-card/90 backdrop-blur-sm">
                                <p className="font-semibold text-base line-clamp-2 text-right">
                                  {bp.title}
                                </p>
                                {bp.price ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary">
                                      {bp.price.toFixed(0)} ريال
                                    </span>
                                    {available && (
                                      <Badge variant="secondary" className="text-xs">
                                        اضغط للعرض
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">سيتوفر قريباً</span>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            wishlist={wishlist}
            onProductClick={setSelectedProduct}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
          />

          {/* Empty State */}
          {filteredProducts.length === 0 && !productsLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground mb-6">
                لم نتمكن من العثور على أي منتجات مطابقة لبحثك
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                إظهار جميع المنتجات
              </button>
            </motion.div>
          )}
        </main>

        {/* Product Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={addToCart}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />
          )}
        </AnimatePresence>

        {/* Shopping Cart Sidebar */}
        <ShoppingCart
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          cartTotal={cartTotal}
          shippingCost={shippingCost}
          finalTotal={finalTotal}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />

        {/* Checkout Flow */}
        <AnimatePresence>
          {showCheckout && (
            <CheckoutFlow
              cart={cart}
              store={store}
              total={finalTotal}
              onClose={() => setShowCheckout(false)}
              onSuccess={() => {
                setCart([]);
                setShowCheckout(false);
                toast({
                  title: "🎉 تم تأكيد طلبك بنجاح!",
                  description: "سيتم التواصل معك قريباً لتأكيد التفاصيل"
                });
              }}
            />
          )}
        </AnimatePresence>

        {/* Floating Cart Button (Mobile) */}
        {cartItemsCount > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-50 md:hidden"
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0a1 1 0 100-2 1 1 0 000 2zm-6 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {cartItemsCount}
              </span>
            </div>
          </motion.button>
        )}
      </div>
    </StoreThemeProvider>
  );
};

export default ModernStorefront;