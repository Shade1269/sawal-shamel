import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreThemeProvider } from "@/components/store/ThemeProvider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StorefrontSession } from "@/utils/storefrontSession";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsolatedStoreCart } from "@/hooks/useIsolatedStoreCart";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { parseFeaturedCategories } from "@/hooks/useStoreSettings";
import type { StoreSettings } from "@/hooks/useStoreSettings";

// New Components
import {
  StorefrontHeader,
  StorefrontFilters,
  StorefrontProductGrid,
  ProductGridSkeleton,
} from "./components";

// Existing Components (keeping as is)
import { ModernBannerSlider } from "@/components/storefront/modern/ModernBannerSlider";
import { ModernProductModal } from "@/components/storefront/modern/ModernProductModal";
import { ModernShoppingCart } from "@/components/storefront/modern/ModernShoppingCart";
import { ModernFooter } from "@/components/storefront/modern/ModernFooter";
import { ModernCustomerOrders } from "@/components/storefront/modern/ModernCustomerOrders";
import { ModernInvoice } from "@/components/storefront/modern/ModernInvoice";
import { CustomerAuthModal } from "@/components/storefront/CustomerAuthModal";
import { UnifiedChatWidget } from "@/components/customer-service/UnifiedChatWidget";
import { Store, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Gaming Components
import {
  GamingStoreHeader,
  GamingProductCard,
  GamingParticles,
  GamingGridBackground,
  GamingScanLines,
  GamingMouseTrail,
  GamingThemeSwitcher,
  GamingLoadingScreen,
} from "@/components/storefront/gaming";
import { useGamingSettings } from "@/contexts/GamingSettingsContext";

// Ultra Effects (Sci-Fi)
import {
  HolographicCard,
  LaserClickEffect,
  NebulaStarsBackground,
} from "@/components/storefront/ultra";

// ULTIMATE 3.0 Effects
import {
  MatrixRain,
  WeatherSystem,
  CosmicEffects,
  LiveNotifications,
  MagneticAttraction,
  PhysicsFloatingCards,
  AIAssistantAvatar,
  GestureControls,
} from "@/components/storefront/ultimate3";

interface Product {
  id: string;
  title: string;
  description?: string;
  price_sar: number;
  image_urls?: string[];
  stock: number;
  category?: string;
  variants?: ProductVariant[];
  commission_amount?: number;
  final_price?: number;
  average_rating?: number;
  total_reviews?: number;
  discount_percentage?: number;
}

interface ProductVariant {
  id: string;
  product_id: string;
  size?: string | null;
  color?: string | null;
  available_stock: number;
  current_stock: number;
  selling_price?: number;
  variant_name?: string;
  is_active: boolean;
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
  gaming_settings?: {
    enabled: boolean;
    theme: string;
    performanceMode: string;
    features: Record<string, boolean | number>;
  };
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

  // Gaming Settings
  const { settings, toggleGamingMode, loadFromStore } = useGamingSettings();
  const isGamingMode = settings.isGamingMode;

  // UI State
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch affiliate store
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
  });

  // Cart management
  const {
    cart: isolatedCart,
    loading: cartLoading,
    addToCart: addToIsolatedCart,
    updateQuantity: updateIsolatedQuantity,
    removeFromCart: removeFromIsolatedCart,
    clearCart,
  } = useIsolatedStoreCart(affiliateStore?.id || "", storeSlug);

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
          .filter((item) => item.products && item.products.is_active)
          .map(async (item) => {
            const { data: ratingStats } = await (supabase.rpc as any)("get_product_rating_stats", {
              p_product_id: item.products.id,
            });

            return {
              ...item.products,
              commission_amount: item.products.price_sar * (item.commission_rate / 100),
              final_price: item.products.price_sar,
              average_rating: ratingStats?.[0]?.average_rating || 0,
              total_reviews: ratingStats?.[0]?.total_reviews || 0,
              discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
            };
          })
      ) as Product[];

      if (productsWithDetails.length === 0) return [];

      const productIds = productsWithDetails.map((p) => p.id);
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
      }

      return productsWithDetails.map((product) => ({
        ...product,
        variants: variantsByProduct[product.id] || [],
      }));
    },
    enabled: !!affiliateStore?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch store settings & banners
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
  });

  const { data: storeBanners } = useQuery({
    queryKey: ["store-banners", affiliateStore?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("store_banners")
        .select("*")
        .eq("store_id", affiliateStore!.id)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!affiliateStore?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Load gaming settings from store database
  useEffect(() => {
    if (affiliateStore?.gaming_settings) {
      const dbSettings = affiliateStore.gaming_settings;
      const features = dbSettings.features || {};

      loadFromStore({
        isGamingMode: dbSettings.enabled ?? true,
        gamingTheme: dbSettings.theme as any || 'cyberpunk',
        performanceMode: dbSettings.performanceMode as any || 'high',
        enableMouseTrail: features.mouseTrail ?? true,
        enable3DTilt: features.tilt3D ?? true,
        enableParticles: features.particles ?? true,
        enableScanLines: features.scanLines ?? true,
        enableGridBackground: features.gridBackground ?? true,
        enableParallax: features.parallax ?? true,
        enableGlowEffects: features.glowEffects ?? true,
        enableSoundEffects: features.soundEffects ?? false,
        soundVolume: features.soundVolume ?? 50,
        enableHolographic: features.holographic ?? true,
        enableLaserClicks: features.laserClicks ?? true,
        enableNebulaBackground: features.nebulaBackground ?? true,
        enablePortalTransitions: features.portalTransitions ?? true,
        enableQuantumGlitch: features.quantumGlitch ?? false,
        enableEnergyShield: features.energyShield ?? true,
        enableWarpSpeed: features.warpSpeed ?? true,
      });
    }
  }, [affiliateStore?.gaming_settings, loadFromStore]);

  // Calculate cart totals
  const cartTotal = isolatedCart?.total || 0;
  const cartItemsCount = isolatedCart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Process categories
  const productCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products?.forEach((product) => {
      const categoryName = product.category || "غير مصنف";
      counts[categoryName] = (counts[categoryName] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    return Object.entries(productCategoryCounts).map(([name, count]) => ({
      id: name,
      name,
      count,
      emoji: name.includes("ملابس") ? "👗" : name.includes("حقائب") ? "👜" : name.includes("أحذية") ? "👠" : "📦",
    }));
  }, [productCategoryCounts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return (
      products
        ?.filter((product) => {
          const matchesSearch =
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
          const price = product.final_price || product.price_sar;
          const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

          return matchesSearch && matchesCategory && matchesPrice;
        })
        ?.sort((a, b) => {
          const priceA = a.final_price || a.price_sar;
          const priceB = b.final_price || b.price_sar;

          switch (sortBy) {
            case "price-low":
              return priceA - priceB;
            case "price-high":
              return priceB - priceA;
            case "name":
              return a.title.localeCompare(b.title);
            case "rating":
              return (b.average_rating || 0) - (a.average_rating || 0);
            case "discount":
              return (b.discount_percentage || 0) - (a.discount_percentage || 0);
            case "newest":
            default:
              return 0;
          }
        }) || []
    );
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Calculate active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    return count;
  }, [selectedCategory, priceRange]);

  // Add to cart handler
  const addToCart = async (product: Product, quantity: number = 1, variantInfo?: { variant_id: string; size?: string | null; color?: string | null }) => {
    try {
      if (variantInfo) {
        const variant = product.variants?.find((v) => v.id === variantInfo.variant_id);
        if (variant && variant.current_stock < quantity) {
          toast({
            title: "⚠️ نفذت الكمية",
            description: `عذراً، المخزون المتاح: ${variant.current_stock} فقط`,
            variant: "destructive",
          });
          return;
        }
      } else {
        if (product.stock < quantity) {
          toast({
            title: "⚠️ نفذت الكمية",
            description: product.stock === 0 ? "عذراً، هذا المنتج غير متوفر حالياً" : `عذراً، المخزون المتاح: ${product.stock} فقط`,
            variant: "destructive",
          });
          return;
        }
      }

      const variants = variantInfo
        ? {
            variant_id: variantInfo.variant_id,
            size: variantInfo.size || "",
            color: variantInfo.color || "",
          }
        : undefined;

      await addToIsolatedCart(product.id, quantity, product.final_price || product.price_sar, product.title, variants);

      toast({
        title: "✅ تم إضافة المنتج للسلة",
        description: `تم إضافة ${product.title} إلى سلة التسوق`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "خطأ",
        description: "فشل إضافة المنتج للسلة",
        variant: "destructive",
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

  const toggleWishlist = (productId: string) => {
    const newWishlist = wishlist.includes(productId) ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
    setWishlist(newWishlist);

    toast({
      title: wishlist.includes(productId) ? "💔 تم الحذف من المفضلة" : "❤️ تم الإضافة للمفضلة",
      description: wishlist.includes(productId) ? "تم حذف المنتج من قائمة المفضلة" : "تم إضافة المنتج لقائمة المفضلة",
    });
  };

  const handleCheckoutClick = () => {
    if (!storeSlug || !affiliateStore?.id) return;

    const storefrontSession = new StorefrontSession(storeSlug);
    const isValidSession = storefrontSession.isSessionValid();

    if (!isValidSession) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "الرجاء تسجيل الدخول برقم جوالك لحفظ الطلب في صفحة طلباتي",
        variant: "default",
      });
      setPendingCheckout(true);
      setShowAuthModal(true);
      return;
    }

    navigate(`/${storeSlug}/checkout`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
    setSortBy("newest");
  };

  // Loading state
  if (storeLoading || productsLoading) {
    return isGamingMode ? (
      <div className="min-h-screen gaming-store-bg" data-gaming-theme={settings.gamingTheme}>
        <GamingLoadingScreen />
      </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
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
  if (storeError || !affiliateStore) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-muted">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">المتجر غير متاح</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            عذراً، لا يمكن الوصول إلى هذا المتجر في الوقت الحالي.
          </p>
          <Button onClick={() => navigate("/")} className="px-8">
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StoreThemeProvider storeId={affiliateStore.id}>
      <div
        className={`min-h-screen ${isGamingMode ? 'gaming-store-bg' : 'bg-background'}`}
        dir="rtl"
        data-gaming-theme={isGamingMode ? settings.gamingTheme : undefined}
      >
        {/* Gaming Background Effects */}
        {isGamingMode && settings.enableGridBackground && <GamingGridBackground />}
        {isGamingMode && settings.enableParticles && <GamingParticles />}
        {isGamingMode && settings.enableScanLines && <GamingScanLines />}
        {isGamingMode && settings.enableMouseTrail && <GamingMouseTrail />}

        {/* Ultra Effects (Sci-Fi) */}
        {isGamingMode && settings.enableNebulaBackground && <NebulaStarsBackground />}
        {isGamingMode && settings.enableLaserClicks && <LaserClickEffect />}

        {/* ULTIMATE 3.0 EFFECTS - خيال علمي كامل! */}
        {/* Reality Distortion */}
        {isGamingMode && settings.enableMatrixRain && <MatrixRain />}

        {/* Cosmic Phenomena */}
        {isGamingMode && (settings.enableAuroraBorealis || settings.enableShootingStars || settings.enableBlackHole || settings.enableCosmicDust) && <CosmicEffects />}

        {/* Weather System */}
        {isGamingMode && settings.enableWeatherEffects && (
          <WeatherSystem weather={settings.weatherType === 'auto' ? undefined : settings.weatherType} autoChange={settings.weatherType === 'auto'} />
        )}

        {/* Social Proof Live */}
        {isGamingMode && settings.enableLiveNotifications && <LiveNotifications />}

        {/* Magnetic Attraction */}
        {isGamingMode && settings.enableMagneticAttraction && <MagneticAttraction />}

        {/* AI Assistant Avatar */}
        {isGamingMode && settings.performanceMode === 'ultra' && <AIAssistantAvatar />}

        {/* Gesture Controls */}
        {isGamingMode && settings.performanceMode !== 'low' && <GestureControls />}

        {/* Gaming Theme Switcher */}
        {isGamingMode && <GamingThemeSwitcher />}

        {/* Gaming Mode Toggle */}
        <div className="fixed top-24 left-4 z-50">
          <Button
            onClick={toggleGamingMode}
            className={isGamingMode ? 'gaming-btn' : 'bg-primary'}
            size="sm"
          >
            <Zap className="h-4 w-4 ml-2" />
            {isGamingMode ? 'الوضع العادي' : 'وضع Gaming'}
          </Button>
        </div>

        {/* Header */}
        {isGamingMode ? (
          <GamingStoreHeader
            storeName={affiliateStore.store_name}
            storeSlug={storeSlug}
            cartCount={cartItemsCount}
            wishlistCount={wishlist.length}
            isAuthenticated={isAuthenticated}
            onSearchClick={() => setShowSearch(!showSearch)}
            onCartClick={() => setShowCart(true)}
            onOrdersClick={() => {
              if (!isAuthenticated) {
                toast({
                  title: "يجب تسجيل الدخول أولاً",
                  description: "الرجاء تسجيل الدخول لعرض طلباتك",
                  variant: "default",
                });
                setShowAuthModal(true);
                return;
              }
              setShowOrders(true);
            }}
            onAuthClick={() => setShowAuthModal(true)}
          />
        ) : (
          <StorefrontHeader
            storeName={affiliateStore.store_name}
            storeSlug={storeSlug}
            cartCount={cartItemsCount}
            wishlistCount={wishlist.length}
            isAuthenticated={isAuthenticated}
            onSearchClick={() => setShowSearch(!showSearch)}
            onCartClick={() => setShowCart(true)}
            onOrdersClick={() => {
              if (!isAuthenticated) {
                toast({
                  title: "يجب تسجيل الدخول أولاً",
                  description: "الرجاء تسجيل الدخول لعرض طلباتك",
                  variant: "default",
                });
                setShowAuthModal(true);
                return;
              }
              setShowOrders(true);
            }}
            onAuthClick={() => setShowAuthModal(true)}
          />
        )}

        {/* Main Content */}
        <main className="container mx-auto px-3 md:px-6 py-4 md:py-8 space-y-6 md:space-y-8">
          {/* Banner Slider */}
          {storeBanners && storeBanners.length > 0 && (
            <ModernBannerSlider
              banners={storeBanners}
              onBannerClick={(banner) => {
                if (banner.link_type === "product" && banner.link_url) {
                  const product = products?.find((p) => p.id === banner.link_url);
                  if (product) setSelectedProduct(product);
                } else if (banner.link_type === "category" && banner.link_url) {
                  setSelectedCategory(banner.link_url);
                } else if (banner.link_type === "external" && banner.link_url) {
                  window.open(banner.link_url, "_blank", "noopener,noreferrer");
                }
              }}
            />
          )}

          {/* Filters */}
          <StorefrontFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            maxPrice={10000}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Products Grid */}
          {productsLoading ? (
            <ProductGridSkeleton count={12} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">لا توجد منتجات متاحة</p>
            </div>
          ) : isGamingMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {filteredProducts.map((product, index) => (
                <GamingProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleProductAddToCart}
                  onProductClick={(product) => setSelectedProduct(product)}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.includes(product.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <StorefrontProductGrid
              products={filteredProducts}
              wishlist={wishlist}
              onAddToCart={handleProductAddToCart}
              onProductClick={(product) => setSelectedProduct(product)}
              onToggleWishlist={toggleWishlist}
              isLoading={false}
            />
          )}

          {/* Footer Info */}
          <section className={`py-16 relative z-10 ${isGamingMode ? 'gaming-glass-card mx-4' : 'bg-surface/30'}`}>
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <h3 className={`text-3xl font-bold ${isGamingMode ? 'gaming-neon-text' : 'text-foreground'}`}>
                  {affiliateStore.store_name}
                </h3>
                <p className={`text-lg ${isGamingMode ? 'text-white/70' : 'text-foreground/70'}`}>
                  {affiliateStore.bio || "منتجاتك المحفوظة ستظهر هنا"}
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Shopping Cart */}
        <ModernShoppingCart
          open={showCart}
          onClose={() => setShowCart(false)}
          items={isolatedCart?.items || []}
          total={cartTotal}
          onUpdateQuantity={async (itemId, newQuantity) => {
            if (newQuantity === 0) {
              await removeFromIsolatedCart(itemId);
              toast({
                title: "🗑️ تم حذف المنتج",
                description: "تم حذف المنتج من السلة",
              });
            } else {
              await updateIsolatedQuantity(itemId, newQuantity);
            }
          }}
          onRemoveItem={async (itemId) => {
            await removeFromIsolatedCart(itemId);
            toast({
              title: "🗑️ تم حذف المنتج",
              description: "تم حذف المنتج من السلة",
            });
          }}
          onCheckout={() => {
            if (!affiliateStore?.store_slug) return;

            const sessionManager = new StorefrontSession(affiliateStore.store_slug);
            const isValidSession = sessionManager.isSessionValid();

            if (!isValidSession) {
              toast({
                title: "يجب تسجيل الدخول أولاً",
                description: "الرجاء تسجيل الدخول برقم جوالك لحفظ الطلب في صفحة طلباتي",
                variant: "default",
              });
              setPendingCheckout(true);
              setShowCart(false);
              setShowAuthModal(true);
              return;
            }
            setShowCart(false);
            handleCheckoutClick();
          }}
        />

        {/* Product Modal */}
        <ModernProductModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setSelectedVariant(null);
            setVariantError(null);
          }}
          onAddToCart={() => {
            if (!selectedProduct) return;
            if (selectedProduct.variants && selectedProduct.variants.length > 0 && !selectedVariant) {
              const msg = "يرجى اختيار المقاس أو اللون أولاً";
              setVariantError(msg);
              toast({ title: "خطأ", description: msg, variant: "destructive" });
              return;
            }
            const variantInfo = selectedVariant
              ? {
                  variant_id: selectedVariant.id,
                  size: selectedVariant.size,
                  color: selectedVariant.color,
                }
              : undefined;
            addToCart(selectedProduct, 1, variantInfo);
            setSelectedProduct(null);
            setSelectedVariant(null);
            setVariantError(null);
          }}
          onToggleWishlist={toggleWishlist}
          isInWishlist={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
          selectedVariant={selectedVariant}
          onVariantChange={(variantId) => {
            const variant = selectedProduct?.variants?.find((v) => v.id === variantId);
            setSelectedVariant(variant || null);
            if (variant) setVariantError(null);
          }}
          variantError={variantError}
          storeId={affiliateStore?.id}
          customerId={customer?.id}
        />

        {/* Customer Orders Modal */}
        {showOrders && isAuthenticated && customer && affiliateStore && (
          <Dialog
            open={showOrders}
            onOpenChange={(isOpen) => {
              setShowOrders(isOpen);
              if (!isOpen) setSelectedOrderId(null);
            }}
          >
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              {selectedOrderId ? (
                <ModernInvoice orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
              ) : (
                <ModernCustomerOrders customerId={customer.profile_id} storeId={affiliateStore.id} onViewInvoice={(orderId) => setSelectedOrderId(orderId)} />
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Auth Modal */}
        <CustomerAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (pendingCheckout && storeSlug) {
              setPendingCheckout(false);
              const storefrontSession = new StorefrontSession(storeSlug);
              const isValidSession = storefrontSession.isSessionValid();
              if (isValidSession) {
                handleCheckoutClick();
              }
            }
          }}
          storeId={affiliateStore?.id || ""}
          storeSlug={storeSlug || ""}
          storeName={affiliateStore?.store_name || ""}
        />

        {/* Unified Chat Widget */}
        {affiliateStore && products && (
          <UnifiedChatWidget
            storeInfo={{
              id: affiliateStore.id,
              store_name: affiliateStore.store_name,
              bio: affiliateStore.bio,
            }}
            products={products.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price_sar: p.price_sar,
              stock: p.stock,
              category: p.category,
            }))}
            customerProfileId={customer?.profile_id}
            isAuthenticated={isAuthenticated}
            onAuthRequired={() => {
              toast({
                title: "تسجيل الدخول مطلوب",
                description: "يجب تسجيل الدخول لبدء المحادثة مع المتجر",
              });
              setShowAuthModal(true);
            }}
          />
        )}

        {/* Footer */}
        {affiliateStore && <ModernFooter store={affiliateStore} />}
      </div>
    </StoreThemeProvider>
  );
};

export default EnhancedStoreFront;
