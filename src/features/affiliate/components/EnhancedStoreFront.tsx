import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreThemeProvider } from "@/components/store/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Store, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StoreBannerDisplay } from "@/components/store/StoreBannerDisplay";
import { parseFeaturedCategories, type StoreCategory, type StoreSettings } from "@/hooks/useStoreSettings";
import { useIsolatedStoreCart } from "@/hooks/useIsolatedStoreCart";
import { CustomerChatWidget } from "@/components/customer-service/CustomerChatWidget";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  StoreHeader,
  StoreHeroSection,
  ProductFilters,
  ProductGrid,
  CartSheet,
  ProductModal,
  type Product,
  type ProductVariant
} from "./storefront";

interface CategoryBannerProductDisplay {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  rating: number | null;
  product: Product | null;
  category: string | null;
}

interface CategoryBannerDisplay {
  category: StoreCategory;
  products: CategoryBannerProductDisplay[];
}

interface StoreBanner {
  id: string;
  store_id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  link_type: 'product' | 'category' | 'external' | 'none';
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

interface EnhancedStoreFrontProps {
  storeSlug?: string;
}

const EnhancedStoreFront = ({ storeSlug: propStoreSlug }: EnhancedStoreFrontProps = {}) => {
  const { storeSlug: paramStoreSlug } = useParams<{ storeSlug: string }>();
  const storeSlug = propStoreSlug || paramStoreSlug;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customer, isAuthenticated } = useCustomerAuth();
  
  // States
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch store data
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
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Cart hooks
  const { 
    cart: isolatedCart, 
    addToCart: addToIsolatedCart,
    updateQuantity: updateIsolatedQuantity,
    removeFromCart: removeFromIsolatedCart,
  } = useIsolatedStoreCart(affiliateStore?.id || '', storeSlug);

  // Fetch products
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

      const productsWithDetails = await Promise.all(
        affiliateProducts
          .filter(item => item.products && item.products.is_active)
          .map(async item => {
            const { data: ratingStats } = await (supabase.rpc as any)('get_product_rating_stats', {
              p_product_id: item.products.id
            });

            return {
              ...item.products,
              commission_amount: (item.products.price_sar * (item.commission_rate / 100)),
              final_price: item.products.price_sar,
              average_rating: ratingStats?.[0]?.average_rating || 0,
              total_reviews: ratingStats?.[0]?.total_reviews || 0,
              discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0
            };
          })
      ) as Product[];

      if (productsWithDetails.length === 0) return [];

      const productIds = productsWithDetails.map(p => p.id);
      let variantsByProduct: Record<string, ProductVariant[]> = {};

      const { data: advVariants, error: advError } = await supabase
        .from("product_variants_advanced")
        .select("id, product_id, color, size, quantity, price_override, is_active, sku")
        .in("product_id", productIds)
        .eq("is_active", true);

      if (!advError && (advVariants?.length || 0) > 0) {
        variantsByProduct = (advVariants || []).reduce((acc, v: any) => {
          const mapped: ProductVariant = {
            id: v.id,
            product_id: v.product_id,
            size: v.size,
            color: v.color,
            available_stock: v.quantity ?? 0,
            current_stock: v.quantity ?? 0,
            selling_price: undefined,
            variant_name: [v.color, v.size].filter(Boolean).join(" / ") || v.sku || undefined,
            is_active: v.is_active,
          };
          if (!acc[v.product_id]) acc[v.product_id] = [] as ProductVariant[];
          acc[v.product_id].push(mapped);
          return acc;
        }, {} as Record<string, ProductVariant[]>);
      } else {
        const { data: legacyVariants, error: legacyError } = await supabase
          .from("product_variants")
          .select("*")
          .in("product_id", productIds);

        if (!legacyError) {
          variantsByProduct = (legacyVariants || []).reduce((acc: Record<string, ProductVariant[]>, variant: any) => {
            if (!acc[variant.product_id]) {
              acc[variant.product_id] = [];
            }
            acc[variant.product_id].push(variant as ProductVariant);
            return acc;
          }, {} as Record<string, ProductVariant[]>);
        }
      }

      return productsWithDetails.map(product => ({
        ...product,
        variants: variantsByProduct[product.id] || []
      }));
    },
    enabled: !!affiliateStore?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: storeSettings } = useQuery<StoreSettings | null>({
    queryKey: ["affiliate-store-settings", affiliateStore?.id],
    queryFn: async () => {
      if (!affiliateStore?.id) return null;

      const { data, error } = await supabase
        .from("affiliate_store_settings")
        .select("*")
        .eq("store_id", affiliateStore.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data as StoreSettings | null;
    },
    enabled: !!affiliateStore?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: storeBanners } = useQuery<StoreBanner[]>({
    queryKey: ["store-banners", affiliateStore?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("store_banners")
        .select("*")
        .eq("store_id", affiliateStore!.id)
        .eq("is_active", true)
        .order("position", { ascending: true });
      
      if (error) throw error;
      return (data || []) as StoreBanner[];
    },
    enabled: !!affiliateStore?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Save and restore scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`scroll_store_${storeSlug}`);
    if (savedScroll && products && products.length > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
      });
    }

    const handleScroll = () => {
      if (storeSlug) {
        sessionStorage.setItem(`scroll_store_${storeSlug}`, window.scrollY.toString());
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storeSlug, products?.length]);

  // Calculate cart totals
  const cartTotal = isolatedCart?.total || 0;
  const cartItemsCount = isolatedCart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const productCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products?.forEach((product) => {
      const categoryName = product.category || "غير مصنف";
      counts[categoryName] = (counts[categoryName] || 0) + 1;
    });
    return counts;
  }, [products]);

  const featuredCategories = useMemo(
    () => parseFeaturedCategories(storeSettings?.featured_categories),
    [storeSettings?.featured_categories]
  );

  const visibleCategories: StoreCategory[] = useMemo(() => {
    if (featuredCategories.length > 0) {
      return featuredCategories
        .map((category) => ({
          ...category,
          productCount:
            category.productCount ?? productCategoryCounts[category.name] ?? 0,
        }))
        .filter((category) => category.isActive !== false);
    }

    return Object.entries(productCategoryCounts).map(([name, count]) => ({
      id: name,
      name,
      isActive: true,
      productCount: count,
    }));
  }, [featuredCategories, productCategoryCounts]);

  const categories = useMemo(() => {
    if (visibleCategories.length > 0) {
      return visibleCategories.map((category) => category.name);
    }
    return Object.keys(productCategoryCounts);
  }, [visibleCategories, productCategoryCounts]);

  // Filter and sort products
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
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'discount':
        return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      case 'newest':
      default:
        return 0;
    }
  }) || [];

  // Cart functions
  const addToCart = async (product: Product, quantity: number = 1, variantInfo?: { variant_id: string; size?: string | null; color?: string | null }) => {
    try {
      const variants = variantInfo ? {
        variant_id: variantInfo.variant_id,
        size: variantInfo.size || '',
        color: variantInfo.color || ''
      } : undefined;
      
      await addToIsolatedCart(
        product.id,
        quantity,
        product.final_price || product.price_sar,
        product.title,
        variants
      );
      
      toast({
        title: "✅ تم إضافة المنتج للسلة",
        description: `تم إضافة ${product.title} إلى سلة التسوق`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "خطأ",
        description: "فشل إضافة المنتج للسلة",
        variant: "destructive"
      });
    }
  };

  const handleProductAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      return;
    }
    addToCart(product);
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await removeFromIsolatedCart(itemId);
      toast({
        title: "🗑️ تم حذف المنتج",
        description: "تم حذف المنتج من السلة",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      await updateIsolatedQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    
    toast({
      title: wishlist.includes(productId) ? "💔 تم الحذف من المفضلة" : "❤️ تم الإضافة للمفضلة",
      description: wishlist.includes(productId) ? "تم حذف المنتج من قائمة المفضلة" : "تم إضافة المنتج لقائمة المفضلة",
    });
  };

  const handleCheckoutClick = () => {
    if (storeSlug) {
      navigate(`/${storeSlug}/checkout`);
    }
  };

  const handleBannerClick = (banner: any) => {
    if (banner.link_type === 'product' && banner.link_url) {
      const product = products?.find(p => p.id === banner.link_url);
      if (product) {
        setSelectedProduct(product);
      }
    } else if (banner.link_type === 'category' && banner.link_url) {
      setSelectedCategory(banner.link_url);
    } else if (banner.link_type === 'external' && banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSortBy("newest");
  };

  // Loading states
  if (storeLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-secondary">
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
  if (storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-danger-light">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">خطأ في تحميل المتجر</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            حدث خطأ أثناء محاولة تحميل المتجر. الرجاء المحاولة مرة أخرى.
          </p>
          <Button onClick={() => navigate('/')} className="px-8">
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (!affiliateStore) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-danger-light">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">المتجر غير متاح</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            عذراً، لا يمكن الوصول إلى هذا المتجر في الوقت الحالي. 
            إذا كنت مسوقة، يمكنك إنشاء متجرك الخاص من هنا.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/affiliate/store/setup')} className="px-8 w-full">
              <Store className="h-4 w-4 mr-2" />
              إنشاء متجر جديد
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="px-8 w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StoreThemeProvider storeId={affiliateStore.id}>
      <div className="min-h-screen bg-background">
        {/* Store Header */}
        <StoreHeader
          affiliateStore={{
            id: affiliateStore.id,
            store_name: affiliateStore.store_name,
            bio: affiliateStore.bio,
            logo_url: affiliateStore.logo_url,
            total_orders: affiliateStore.total_orders,
            total_sales: affiliateStore.total_sales,
          }}
          productsCount={products?.length || 0}
          cartItemsCount={cartItemsCount}
          isAuthenticated={isAuthenticated}
          customer={customer}
          storeSlug={storeSlug}
          onCartOpen={() => setShowCart(true)}
        />

        {/* Main Content */}
        <main className="container mx-auto px-3 md:px-6 py-6 md:py-8 space-y-8">
          {/* Store Banners */}
          {storeBanners && storeBanners.length > 0 && (
            <StoreBannerDisplay
              banners={storeBanners}
              onBannerClick={handleBannerClick}
            />
          )}

          {/* Hero Section */}
          <StoreHeroSection
            heroTitle={storeSettings?.hero_title}
            heroSubtitle={storeSettings?.hero_subtitle}
            heroDescription={storeSettings?.hero_description}
            heroImageUrl={storeSettings?.hero_image_url}
            heroCtaText={storeSettings?.hero_cta_text}
            heroCtaColor={storeSettings?.hero_cta_color}
          />

          {/* Product Filters */}
          <ProductFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            filteredCount={filteredProducts.length}
            totalCount={products?.length || 0}
            onClearFilters={clearFilters}
          />

          {/* Products Grid */}
          <div id="products-section">
            <ProductGrid
              products={filteredProducts}
              isLoading={productsLoading}
              onProductClick={setSelectedProduct}
              onToggleWishlist={toggleWishlist}
              onAddToCart={handleProductAddToCart}
              wishlist={wishlist}
              onClearFilters={clearFilters}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </div>
        </main>

        {/* Cart Sheet */}
        <CartSheet
          open={showCart}
          onOpenChange={setShowCart}
          cart={isolatedCart}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckoutClick}
        />

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, variant) => {
            if (variant) {
              addToCart(product, 1, {
                variant_id: variant.id,
                size: variant.size,
                color: variant.color
              });
            } else {
              addToCart(product);
            }
          }}
          onToggleWishlist={toggleWishlist}
          wishlist={wishlist}
        />

        {/* Customer Chat Widget */}
        {affiliateStore && (
          <CustomerChatWidget
            storeId={affiliateStore.id}
            storeName={affiliateStore.store_name}
            customerProfileId={customer?.profile_id}
            isAuthenticated={isAuthenticated}
            onAuthRequired={() => {
              toast({
                title: 'تسجيل الدخول مطلوب',
                description: 'يجب تسجيل الدخول لبدء المحادثة مع المتجر',
              });
            }}
          />
        )}
      </div>
    </StoreThemeProvider>
  );
};

export default EnhancedStoreFront;