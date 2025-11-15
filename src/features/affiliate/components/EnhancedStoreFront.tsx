import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreThemeProvider } from "@/components/store/ThemeProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Package,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductImageCarousel } from "@/features/commerce/components/ProductImageCarousel";
import { CheckoutFlow } from "@/features/commerce/components/CheckoutFlow";
import { ProductVariantSelector } from "@/components/products/ProductVariantSelector";
import { motion, AnimatePresence } from "framer-motion";
import { parseFeaturedCategories, type StoreCategory, type StoreSettings } from "@/hooks/useStoreSettings";
import { useIsolatedStoreCart } from "@/hooks/useIsolatedStoreCart";
import { CustomerAuthModal } from "@/components/storefront/CustomerAuthModal";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedChatWidget } from "@/components/customer-service/UnifiedChatWidget";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { LuxuryCardV2, LuxuryCardContent } from "@/components/luxury/LuxuryCardV2";
import { ModernBannerSlider } from "@/components/storefront/modern/ModernBannerSlider";
import { ModernProductGrid } from "@/components/storefront/modern/ModernProductGrid";
import { ModernProductModal } from "@/components/storefront/modern/ModernProductModal";
import { ModernShoppingCart } from "@/components/storefront/modern/ModernShoppingCart";
import { ModernFooter } from "@/components/storefront/modern/ModernFooter";

import { ModernCustomerOrders } from "@/components/storefront/modern/ModernCustomerOrders";
import { ModernInvoice } from "@/components/storefront/modern/ModernInvoice";

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

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string };
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // استخدام نظام السلة المحسّن مع تمرير storeSlug
  const { 
    cart: isolatedCart, 
    loading: cartLoading, 
    addToCart: addToIsolatedCart,
    updateQuantity: updateIsolatedQuantity,
    removeFromCart: removeFromIsolatedCart,
    clearCart
  } = useIsolatedStoreCart(affiliateStore?.id || '', storeSlug);

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
      
      // Try advanced variants first, fallback to legacy table if needed
      let variantsByProduct: Record<string, ProductVariant[]> = {};

      // Attempt to fetch from product_variants_advanced (preferred)
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
            // selling_price can be derived in UI if needed using price_override
            selling_price: undefined,
            variant_name: [v.color, v.size].filter(Boolean).join(" / ") || v.sku || undefined,
            is_active: v.is_active,
          };
          if (!acc[v.product_id]) acc[v.product_id] = [] as ProductVariant[];
          acc[v.product_id].push(mapped);
          return acc;
        }, {} as Record<string, ProductVariant[]>);
      } else {
        // Fallback: legacy variants table
        const { data: legacyVariants, error: legacyError } = await supabase
          .from("product_variants")
          .select("*")
          .in("product_id", productIds);

        if (legacyError) {
          console.error("Error fetching variants:", advError || legacyError);
          return productsWithDetails;
        }

        variantsByProduct = (legacyVariants || []).reduce((acc: Record<string, ProductVariant[]>, variant: any) => {
          if (!acc[variant.product_id]) {
            acc[variant.product_id] = [];
          }
          acc[variant.product_id].push(variant as ProductVariant);
          return acc;
        }, {} as Record<string, ProductVariant[]>);
      }

      return productsWithDetails.map(product => ({
        ...product,
        variants: variantsByProduct[product.id] || []
      }));
    },
    enabled: !!affiliateStore?.id,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
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

  // حفظ واستعادة scroll position عند العودة للصفحة
  useEffect(() => {
    // استعادة scroll position عند العودة
    const savedScroll = sessionStorage.getItem(`scroll_store_${storeSlug}`);
    if (savedScroll && products && products.length > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
      });
    }

    // حفظ scroll position عند التمرير
    const handleScroll = () => {
      if (storeSlug) {
        sessionStorage.setItem(`scroll_store_${storeSlug}`, window.scrollY.toString());
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storeSlug, products?.length]);

  // Reset variant selection when a new product is opened
  useEffect(() => {
    if (selectedProduct) {
      setSelectedVariant(null);
      setVariantError(null);
    }
  }, [selectedProduct]);

  // حساب المجموع من السلة المعزولة
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

  const categoryDisplayStyle = storeSettings?.category_display_style || "grid";

  const categoryBanners = useMemo<CategoryBannerDisplay[]>(() => {
    if (!featuredCategories || featuredCategories.length === 0) {
      return [];
    }

    const productMap = new Map<string, Product>();
    (products ?? []).forEach((product) => {
      productMap.set(product.id, product);
    });

    return featuredCategories
      .filter((category) => category.isActive !== false && category.bannerProducts && category.bannerProducts.length > 0)
      .map((category) => {
        const productsForBanner: CategoryBannerProductDisplay[] = (category.bannerProducts ?? [])
          .map((bannerProduct) => {
            const fullProduct = productMap.get(bannerProduct.id) ?? null;
            const title = fullProduct?.title || bannerProduct.title;

            if (!title) {
              return null;
            }

            const price = fullProduct ? (fullProduct.final_price || fullProduct.price_sar) : null;
            const imageUrl = fullProduct?.image_urls?.[0] || bannerProduct.image_url || null;

            return {
              id: bannerProduct.id,
              title,
              imageUrl,
              price,
              rating: fullProduct?.average_rating ?? null,
              product: fullProduct,
              category: bannerProduct.category ?? fullProduct?.category ?? category.name,
            } satisfies CategoryBannerProductDisplay;
          })
          .filter((item): item is CategoryBannerProductDisplay => Boolean(item));

        return {
          category,
          products: productsForBanner,
        } satisfies CategoryBannerDisplay;
      })
      .filter((banner) => banner.products.length > 0);
  }, [featuredCategories, products]);

  // فلترة وترتيب المنتجات المحسنة
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
        return 0; // keep original order (no random shuffle)
    }
  }) || [];

  // وظائف السلة المحسّنة
  const addToCart = async (product: Product, quantity: number = 1, variantInfo?: { variant_id: string; size?: string | null; color?: string | null }) => {
    try {
      // التحقق من المخزون قبل الإضافة
      if (variantInfo) {
        // إذا كان هناك متغير محدد، تحقق من مخزون المتغير
        const variant = product.variants?.find(v => v.id === variantInfo.variant_id);
        if (variant && variant.current_stock < quantity) {
          toast({
            title: "⚠️ نفذت الكمية",
            description: `عذراً، المخزون المتاح: ${variant.current_stock} فقط`,
            variant: "destructive"
          });
          return;
        }
      } else {
        // إذا لم يكن هناك متغير، تحقق من مخزون المنتج الأساسي
        if (product.stock < quantity) {
          toast({
            title: "⚠️ نفذت الكمية",
            description: product.stock === 0 
              ? "عذراً، هذا المنتج غير متوفر حالياً" 
              : `عذراً، المخزون المتاح: ${product.stock} فقط`,
            variant: "destructive"
          });
          return;
        }
      }

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

  // معالج إضافة المنتج للسلة مع التحقق من المتغيرات
  const handleProductAddToCart = (product: Product) => {
    // إذا كان المنتج له متغيرات، افتح نافذة التفاصيل
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      return;
    }
    
    // إذا لم تكن هناك متغيرات، أضف مباشرة
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
    // التوجه لصفحة الطلب الخاصة بالمتجر (المسار المعزول ليتوافق مع السلة)
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

  const handleCategorySelection = (categoryName: string) => {
    setSelectedCategory((current) => current === categoryName ? "all" : categoryName);
  };

  const handleBannerProductClick = (bannerProduct: CategoryBannerProductDisplay) => {
    if (bannerProduct.product) {
      setSelectedProduct(bannerProduct.product);
      return;
    }

    toast({
      title: "المنتج غير متاح",
      description: "تمت إزالة هذا المنتج من المتجر. يرجى تحديث البنر أو اختيار منتج آخر.",
      variant: "destructive",
    });
  };

  const renderCategoryLayout = () => {
    if (visibleCategories.length === 0) return null;

    const categoriesToRender = visibleCategories.filter((category) => category.productCount >= 0);
    if (categoriesToRender.length === 0) return null;

    const renderCategoryCard = (
      category: StoreCategory,
      variant: "grid" | "horizontal" | "circular"
    ) => {
      const isSelected = selectedCategory === category.name;
      const baseClasses =
        "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

      if (variant === "horizontal") {
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategorySelection(category.name)}
            aria-pressed={isSelected}
            className={`${baseClasses} flex-shrink-0 px-5 py-3 rounded-full border text-sm font-medium whitespace-nowrap ${
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <span>{category.name}</span>
            <Badge variant="secondary" className="ml-3">
              {category.productCount} منتج
            </Badge>
          </button>
        );
      }

      if (variant === "circular") {
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategorySelection(category.name)}
            aria-pressed={isSelected}
            className={`${baseClasses} w-32 h-32 rounded-full border flex flex-col items-center justify-center gap-2 text-center px-4 ${
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-lg"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <span className="font-semibold text-sm leading-tight line-clamp-2">
              {category.name}
            </span>
            <span className="text-xs text-muted-foreground">{category.productCount} منتج</span>
          </button>
        );
      }

      return (
        <button
          key={category.id}
          type="button"
          onClick={() => handleCategorySelection(category.name)}
          aria-pressed={isSelected}
          className={`${baseClasses} text-right p-5 rounded-2xl border bg-background/80 hover:-translate-y-1 ${
            isSelected
              ? "border-primary bg-primary/10 shadow-xl"
              : "border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold text-lg">{category.name}</p>
              <p className="text-sm text-muted-foreground">
                اكتشف {category.productCount} منتجاً مميزاً في هذه الفئة
              </p>
            </div>
            <Badge variant={isSelected ? "default" : "secondary"} className="shrink-0">
              {category.productCount}
            </Badge>
          </div>
        </button>
      );
    };

    switch (categoryDisplayStyle) {
      case "horizontal":
        return (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`${
                selectedCategory === "all"
                  ? "border-primary bg-primary/10 text-primary shadow"
                  : "border-border bg-background hover:border-primary/40"
              } flex-shrink-0 px-5 py-3 rounded-full border text-sm font-medium whitespace-nowrap transition-colors`}
            >
              جميع الفئات
            </button>
            {categoriesToRender.map((category) => renderCategoryCard(category, "horizontal"))}
          </div>
        );
      case "circular":
        return (
          <div className="flex flex-wrap justify-center gap-6">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`w-32 h-32 rounded-full border flex flex-col items-center justify-center gap-2 text-center px-4 transition-colors ${
                selectedCategory === "all"
                  ? "border-primary bg-primary/10 text-primary shadow-lg"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <span className="font-semibold text-sm">جميع الفئات</span>
              <span className="text-xs text-muted-foreground">
                {products?.length || 0} منتج
              </span>
            </button>
            {categoriesToRender.map((category) => renderCategoryCard(category, "circular"))}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`${
                selectedCategory === "all"
                  ? "border-primary bg-primary/10 shadow-xl"
                  : "border-border hover:border-primary/40"
              } text-right p-5 rounded-2xl border bg-background/80 hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-lg">جميع الفئات</p>
                  <p className="text-sm text-muted-foreground">استعرض كل المنتجات المتاحة</p>
                </div>
                <Badge variant={selectedCategory === "all" ? "default" : "secondary"} className="shrink-0">
                  {products?.length || 0}
                </Badge>
              </div>
            </button>
            {categoriesToRender.map((category) => renderCategoryCard(category, "grid"))}
          </div>
        );
    }
  };

  const categorySection = renderCategoryLayout();

  // Loading states
  if (storeLoading || productsLoading) {
    return (
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
  if (storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-muted">
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

  // تطبيق الثيم إذا كان المتجر محمل
  if (!affiliateStore) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-muted">
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
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Clean Header - مطابق للديمو */}
        <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              {/* Search */}
              <button className="p-2.5 hover:bg-secondary/50 rounded-lg transition-colors">
                <Search className="w-6 h-6 text-foreground/70" />
              </button>

              {/* Logo/Brand */}
              <h1 className="text-3xl font-bold text-foreground cursor-pointer">
                {affiliateStore.store_name}
              </h1>

              {/* Icons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
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
                  className="p-2.5 rounded-lg transition-colors hover:bg-secondary/50"
                >
                  <Package className="w-6 h-6 text-foreground/70" />
                </button>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="p-2.5 rounded-lg transition-colors hover:bg-secondary/50"
                >
                  <User className="w-6 h-6 text-foreground/70" />
                </button>
                <button 
                  onClick={() => setShowCart(true)}
                  className="p-2.5 rounded-lg transition-colors relative hover:bg-secondary/50"
                >
                  <ShoppingCart className="w-6 h-6 text-foreground/70" />
                  {isolatedCart?.items?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {isolatedCart.items.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-6 py-4 md:py-8 space-y-6 md:space-y-8">
        {/* Banner Slider */}
        {storeBanners && storeBanners.length > 0 && (
          <ModernBannerSlider banners={storeBanners} onBannerClick={handleBannerClick} />
        )}

        {/* Categories Section - مطابق للديمو */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: 'الملابس', emoji: '👗', category: 'ملابس' },
                  { name: 'الحقائب', emoji: '👜', category: 'حقائب' },
                  { name: 'الأحذية', emoji: '👠', category: 'أحذية' }
                ].map((category, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedCategory(category.category === selectedCategory ? 'all' : category.category)}
                  >
                    <div className="relative aspect-square bg-surface rounded-xl overflow-hidden mb-4 border border-border/50">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                        <span className="text-5xl opacity-30">
                          {category.emoji}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-center font-semibold text-foreground text-lg">{category.name}</h3>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid Section - بسيط مثل الديمو */}
        <section id="products-section" className="space-y-6">
          {productsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-muted-foreground">جاري تحميل المنتجات الرائعة...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">لا توجد منتجات متاحة</p>
            </div>
          ) : (
            <ModernProductGrid
              products={filteredProducts}
              wishlist={wishlist}
              onAddToCart={handleProductAddToCart}
              onProductClick={setSelectedProduct}
              onToggleWishlist={toggleWishlist}
            />
          )}
        </section>

        {/* Footer Info - مطابق للديمو */}
        <section className="py-16 bg-surface/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h3 className="text-3xl font-bold text-foreground">{affiliateStore.store_name}</h3>
              <p className="text-foreground/70 text-lg">{affiliateStore.bio || 'منتجاتك المحفوظة ستظهر هنا'}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Shopping Cart */}
      <ModernShoppingCart
        open={showCart}
        onClose={() => setShowCart(false)}
        items={isolatedCart?.items || []}
        total={cartTotal}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          // التحقق من تسجيل الدخول والتأكد من صلاحية الجلسة
          const storeSessionKey = `customer_session_${affiliateStore?.id}`;
          const storedSession = localStorage.getItem(storeSessionKey);
          
          let isValidSession = false;
          if (storedSession) {
            try {
              const session = JSON.parse(storedSession);
              // التحقق من أن الجلسة لم تنتهِ صلاحيتها
              if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
                isValidSession = true;
              }
            } catch (e) {
              console.error('Error parsing session:', e);
            }
          }
          
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

      {/* Modern Product Modal */}
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
            const msg = 'يرجى اختيار المقاس أو اللون أولاً';
            setVariantError(msg);
            toast({ title: 'خطأ', description: msg, variant: 'destructive' });
            return;
          }
          const variantInfo = selectedVariant ? {
            variant_id: selectedVariant.id,
            size: selectedVariant.size,
            color: selectedVariant.color
          } : undefined;
          addToCart(selectedProduct, 1, variantInfo);
          setSelectedProduct(null);
          setSelectedVariant(null);
          setVariantError(null);
        }}
        onToggleWishlist={toggleWishlist}
        isInWishlist={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        selectedVariant={selectedVariant}
        onVariantChange={(variantId) => {
          const variant = selectedProduct?.variants?.find(v => v.id === variantId);
          setSelectedVariant(variant || null);
          if (variant) setVariantError(null);
        }}
        variantError={variantError}
        storeId={affiliateStore?.id}
        customerId={customer?.id}
      />


      {/* Customer Orders Modal */}
      {showOrders && isAuthenticated && customer && affiliateStore && (
        <Dialog open={showOrders} onOpenChange={setShowOrders}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {selectedOrderId ? (
              <ModernInvoice
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
              />
            ) : (
              <ModernCustomerOrders
                customerId={customer.id}
                storeId={affiliateStore.id}
                onViewInvoice={(orderId) => setSelectedOrderId(orderId)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Auth Modal */}
      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          // إذا كان العميل في وضع الـ checkout المعلق، تحقق من تسجيل دخوله ثم أكمل العملية
          if (pendingCheckout) {
            setPendingCheckout(false);
            const storeSessionKey = `customer_session_${affiliateStore?.id}`;
            const storedSession = localStorage.getItem(storeSessionKey);
            
            let isValidSession = false;
            if (storedSession) {
              try {
                const session = JSON.parse(storedSession);
                if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
                  isValidSession = true;
                }
              } catch (e) {
                console.error('Error parsing session:', e);
              }
            }
            
            if (isValidSession) {
              handleCheckoutClick();
            }
          }
        }}
        storeId={affiliateStore?.id || ''}
        storeSlug={storeSlug || ''}
        storeName={affiliateStore?.store_name || ''}
      />

      {/* Unified Chat Widget (AI + Human Support) */}
      {affiliateStore && products && (
        <UnifiedChatWidget
          storeInfo={{
            id: affiliateStore.id,
            store_name: affiliateStore.store_name,
            bio: affiliateStore.bio
          }}
          products={products.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price_sar: p.price_sar,
            stock: p.stock,
            category: p.category
          }))}
          customerProfileId={customer?.profile_id}
          isAuthenticated={isAuthenticated}
          onAuthRequired={() => {
            toast({
              title: 'تسجيل الدخول مطلوب',
              description: 'يجب تسجيل الدخول لبدء المحادثة مع المتجر',
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
