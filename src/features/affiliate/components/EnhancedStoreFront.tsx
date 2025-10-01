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
  Mail
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductImageCarousel } from "@/features/commerce/components/ProductImageCarousel";
import { CheckoutFlow } from "@/features/commerce/components/CheckoutFlow";
import { motion, AnimatePresence } from "framer-motion";
import { parseFeaturedCategories, type StoreCategory, type StoreSettings } from "@/hooks/useStoreSettings";
// import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';

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
  // Temporary authentication state - will be integrated with customer auth later
  const isAuthenticated = false;
  const customer = null;
  
  // States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: { [variantType: string]: string } }>({});
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
          final_price: item.products.price_sar,
          rating: Math.random() * 2 + 3, // Random rating between 3-5 for demo
          reviews_count: Math.floor(Math.random() * 100) + 5, // Random reviews count for demo
          discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0 // Random discount for demo
        })) as Product[];
    },
    enabled: !!affiliateStore?.id,
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
  });

  // حساب المجموع
  const cartTotal = cart.reduce((total, item) =>
    total + (item.product.final_price || item.product.price_sar) * item.quantity, 0
  );

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

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
              rating: fullProduct?.rating ?? null,
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
        return (b.rating || 0) - (a.rating || 0);
      case 'discount':
        return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      case 'newest':
      default:
        return Math.random() - 0.5; // Random for demo
    }
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
      title: "✅ تم إضافة المنتج للسلة",
      description: `تم إضافة ${product.title} إلى سلة التسوق`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast({
      title: "🗑️ تم حذف المنتج",
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
    if (!isAuthenticated) {
      navigate(`/store/${storeSlug}/auth`);
      return;
    }
    navigate(`/store/${storeSlug}/checkout`);
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
  if (storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Store Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Store Identity */}
            <div className="flex items-center gap-4">
              {affiliateStore?.logo_url && (
                <div className="relative">
                  <img
                    src={affiliateStore.logo_url}
                    alt={`شعار متجر ${affiliateStore.store_name}`}
                    className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-primary/10"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {affiliateStore?.store_name}
                </h1>
                {affiliateStore?.bio && (
                  <p className="text-sm text-muted-foreground max-w-md truncate">
                    {affiliateStore.bio}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {affiliateStore.total_orders} طلب
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {products?.length || 0} منتج
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
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-2 -left-2 min-w-[20px] h-5 animate-pulse">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-lg">
                  {/* Cart content will be rendered below */}
                </SheetContent>
              </Sheet>

              {/* Authentication Button */}
              <Button 
                variant="outline" 
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/customer/profile');
                  } else {
                    navigate('/customer/auth');
                  }
                }}
                className="hover:shadow-lg transition-all"
              >
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    حسابي
                  </>
                ) : (
                  'تسجيل دخول'
                )}
              </Button>

              {/* My Orders Button */}
              <Button 
                variant="outline"
                onClick={() => navigate('/customer/orders')}
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
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Search and Filter Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-8 rounded-3xl border-2 border-primary/10 shadow-2xl"
        >
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                <Input
                  placeholder="🔍 ابحث عن المنتجات المفضلة لديك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-14 pl-4 h-16 text-lg border-2 focus:border-primary/50 rounded-2xl bg-background/70 backdrop-blur-sm shadow-inner text-center"
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

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:shadow-lg transition-all duration-300"
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
                <Badge variant="secondary" className="px-3 py-1.5">
                  {filteredProducts?.length || 0} منتج متاح
                </Badge>
                <span className="text-muted-foreground">
                  من أصل {products?.length || 0} منتج
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
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-background/60 backdrop-blur-sm rounded-2xl border border-primary/20 mt-4">
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
                  {filteredProducts.length} من {products?.length || 0} منتج
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
                  <div className="p-4 bg-background/50 rounded-xl border mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Category Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">التصنيف</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="اختر التصنيف" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع التصنيفات</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort Options */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">ترتيب حسب</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">الأحدث</SelectItem>
                            <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                            <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
                            <SelectItem value="name">الاسم أبجدياً</SelectItem>
                            <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                            <SelectItem value="discount">الأعلى خصماً</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium mb-2 block">
                          نطاق السعر ({priceRange[0]} - {priceRange[1]} ريال)
                        </Label>
                        <div className="px-3 pt-2">
                          <Slider
                            value={priceRange}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                            max={1000}
                            min={0}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {categoryBanners.length > 0 && (
          <section className="space-y-6 bg-background/70 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 shadow-lg">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">البنرات المخصصة للفئات</h2>
              <p className="text-sm text-muted-foreground">
                المنتجات المختارة لكل فئة ستظهر هنا في شرائط عرضية أنيقة في أعلى المتجر.
              </p>
            </div>
            <div className="space-y-6">
              {categoryBanners.map(({ category, products }) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-primary">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {products.length} منتج مختار لعرضهم في واجهة الفئة
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(category.name)}
                      className="text-primary hover:text-primary"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      استكشاف فئة {category.name}
                    </Button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                    {products.map((product) => {
                      const isAvailable = Boolean(product.product);
                      return (
                        <motion.button
                          type="button"
                          key={`${category.id}-${product.id}`}
                          onClick={() => handleBannerProductClick(product)}
                          whileHover={isAvailable ? { y: -6, scale: 1.02 } : undefined}
                          className={`group relative w-60 flex-shrink-0 text-right rounded-2xl border overflow-hidden transition-all duration-300 ${
                            isAvailable
                              ? "bg-card/70 hover:border-primary/40 shadow-sm hover:shadow-xl"
                              : "bg-muted cursor-not-allowed opacity-70"
                          }`}
                          disabled={!isAvailable}
                        >
                          {product.imageUrl ? (
                            <div className="relative h-40 w-full overflow-hidden">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              {product.rating && (
                                <div className="absolute top-3 left-3 bg-background/90 text-xs px-2 py-1 rounded-full shadow">
                                  ⭐ {product.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-sm text-muted-foreground">
                              لا توجد صورة متاحة
                            </div>
                          )}
                          <div className="p-4 space-y-2">
                            <div className="space-y-1">
                              <p className="font-semibold line-clamp-2">{product.title}</p>
                              {product.category && (
                                <span className="text-xs text-muted-foreground">{product.category}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              {product.price ? (
                                <span className="font-bold text-primary">{product.price.toFixed(0)} ريال</span>
                              ) : (
                                <span className="text-muted-foreground">سيتوفر قريباً</span>
                              )}
                              <span className="text-xs text-muted-foreground">اضغط للعرض السريع</span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {categorySection && (
          <section className="space-y-4 bg-background/60 backdrop-blur-sm border border-primary/10 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">تصفح الفئات المميزة</h2>
                <p className="text-sm text-muted-foreground">
                  اختر فئة لعرض المنتجات المرتبطة بها أو استعرض كل المتجر
                </p>
              </div>
              {selectedCategory !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="text-primary hover:text-primary"
                >
                  <X className="h-4 w-4 mr-2" />
                  إظهار جميع المنتجات
                </Button>
              )}
            </div>
            {categorySection}
          </section>
        )}

        {/* Products Section */}
        <section className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">المنتجات</h2>
              <p className="text-muted-foreground">
                {productsLoading ? (
                  'جاري التحميل...'
                ) : filteredProducts.length > 0 ? (
                  `عرض ${filteredProducts.length} منتج`
                ) : (
                  'لا توجد منتجات'
                )}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-muted-foreground">جاري تحميل المنتجات الرائعة...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="space-y-6">
                <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-16 w-16 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">لم يتم العثور على منتجات</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? `لا توجد منتجات تتطابق مع "${searchQuery}"`
                      : 'لا توجد منتجات في هذا التصنيف'
                    }
                  </p>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <Button onClick={clearFilters} className="px-8">
                      <X className="h-4 w-4 mr-2" />
                      مسح الفلاتر والعرض الكامل
                    </Button>
                  )}
                </div>
              </div>
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
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-card to-card/80">
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-20 w-20 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discount_percentage && product.discount_percentage > 0 && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white animate-pulse">
                          <Percent className="h-3 w-3 mr-1" />
                          {product.discount_percentage}%
                        </Badge>
                      )}

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => setSelectedProduct(product)}
                          className="backdrop-blur-sm hover:scale-110 transition-transform"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => toggleWishlist(product.id)}
                          className="backdrop-blur-sm hover:scale-110 transition-transform"
                        >
                          <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="backdrop-blur-sm hover:scale-110 transition-transform"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Stock Status */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg px-6 py-2 font-bold">
                            نفد المخزون
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (product.rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({product.reviews_count || 0})
                          </span>
                        </div>
                      )}
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">
                              {(product.final_price || product.price_sar).toFixed(0)}
                            </span>
                            <span className="text-sm text-muted-foreground">ريال</span>
                          </div>
                          {product.discount_percentage && product.discount_percentage > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price_sar.toFixed(0)} ريال
                            </span>
                          )}
                        </div>
                        
                        {product.stock && product.stock <= 5 && product.stock > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {product.stock} متبقي
                          </Badge>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <Button 
                        onClick={() => addToCart(product)}
                        className="w-full group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                        size="lg"
                        disabled={product.stock === 0}
                      >
                        <Plus className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        إضافة للسلة
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Enhanced Shopping Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="h-6 w-6 text-primary" />
              سلة التسوق
              {cartItemsCount > 0 && (
                <Badge className="ml-2">{cartItemsCount} منتج</Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">السلة فارغة</h3>
                  <p className="text-muted-foreground text-sm">
                    ابدأ بإضافة المنتجات التي تعجبك
                  </p>
                </div>
                <Button onClick={() => setShowCart(false)} variant="outline">
                  متابعة التسوق
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.product.id} 
                      layout
                      className="flex items-center gap-3 p-4 border rounded-xl bg-card/50 hover:bg-card transition-colors"
                    >
                      <img 
                        src={item.product.image_urls?.[0] || '/placeholder.svg'} 
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.title}</h4>
                        <p className="text-primary font-bold">
                          {((item.product.final_price || item.product.price_sar) * item.quantity).toFixed(0)} ريال
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item.product.final_price || item.product.price_sar).toFixed(0)} ريال × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeFromCart(item.product.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span className="text-primary text-2xl">{cartTotal.toFixed(0)} ريال</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg" 
                      onClick={handleCheckoutClick}
                    >
                      <ArrowRight className="h-5 w-5 mr-2" />
                      إتمام الطلب
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowCart(false)}
                    >
                      متابعة التسوق
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Enhanced Product Quick View Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden">
                    {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 ? (
                      <ProductImageCarousel 
                        images={selectedProduct.image_urls} 
                        productTitle={selectedProduct.title} 
                      />
                    ) : (
                      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                        <Package className="h-24 w-24 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-3">{selectedProduct.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  {/* Rating */}
                  {selectedProduct.rating && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (selectedProduct.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium">{selectedProduct.rating?.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({selectedProduct.reviews_count || 0} تقييم)
                      </span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-primary">
                        {(selectedProduct.final_price || selectedProduct.price_sar).toFixed(0)} ريال
                      </span>
                      {selectedProduct.discount_percentage && selectedProduct.discount_percentage > 0 && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            {selectedProduct.price_sar.toFixed(0)} ريال
                          </span>
                          <Badge className="bg-red-500 hover:bg-red-600">
                            خصم {selectedProduct.discount_percentage}%
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    {selectedProduct.stock && selectedProduct.stock <= 5 && selectedProduct.stock > 0 && (
                      <p className="text-orange-600 font-medium">
                        ⚠️ متبقي {selectedProduct.stock} قطع فقط
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                      onClick={() => {
                        addToCart(selectedProduct);
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
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </StoreThemeProvider>
  );
};

export default EnhancedStoreFront;