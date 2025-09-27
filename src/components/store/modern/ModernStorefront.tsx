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

const ModernStorefront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
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