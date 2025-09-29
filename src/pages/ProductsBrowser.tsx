import { useState, useEffect } from 'react';
import { 
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardDescription,
  EnhancedCardHeader,
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  Check,
  Eye,
  Star,
  ShoppingCart,
  Store,
  Users,
  Heart,
  Share2,
  Home,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  images: any;
  image_urls: string[];
  category: string;
  is_active: boolean;
  stock: number;
  view_count: number;
  merchant_id: string;
  merchants: {
    id: string;
    business_name: string;
    default_commission_rate: number;
  };
}

const ProductsBrowser = () => {
  console.log('ProductsBrowser component mounted');
  const { profile } = useFastAuth();
  console.log('ProductsBrowser - profile from useFastAuth:', profile);
  const { goToUserHome } = useSmartNavigation();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [affiliateStore, setAffiliateStore] = useState(null);
  const [myProducts, setMyProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set());
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  useEffect(() => {
    console.log('useEffect triggered - profile check:', { profile });
    if (profile) {
      console.log('Profile exists, calling fetchData...');
      fetchData();
    } else {
      console.log('No profile found, skipping fetchData');
    }
  }, [profile]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, priceRange]);

  const fetchData = async () => {
    console.log('fetchData started...', { profile });
    setLoading(true);
    try {
      // تجربة جلب المنتجات بشكل مبسط أولاً
      const { data: simpleProductsData, error: simpleError } = await supabase
        .from('products')
        .select('id, title, price_sar, is_active')
        .eq('is_active', true)
        .limit(5);

      console.log('Simple products query:', { simpleProductsData, simpleError });

      // جلب متجر المسوق - التحقق من الجدولين
      let storeData = null;
      
      // أولاً، جرب user_profiles.id
      const { data: storesByProfile, error: storesByProfileError } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (storesByProfileError) {
        console.error('Error fetching affiliate store (by profile_id):', storesByProfileError);
      }
      const userProfileStore = Array.isArray(storesByProfile) && storesByProfile.length > 0 ? storesByProfile[0] : null;
      
      if (userProfileStore) {
        storeData = userProfileStore;
      } else {
        // إذا لم نجده، جرب profiles.id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', profile.auth_user_id)
          .maybeSingle();
          
        if (profileData) {
          const { data: storesByProfile2, error: storesByProfileError2 } = await supabase
            .from('affiliate_stores')
            .select('*')
            .eq('profile_id', profileData.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (storesByProfileError2) {
            console.error('Error fetching affiliate store (by auth_user_id):', storesByProfileError2);
          }
          const profileStore = Array.isArray(storesByProfile2) && storesByProfile2.length > 0 ? storesByProfile2[0] : null;
            
          storeData = profileStore;
        }
      }

      setAffiliateStore(storeData);

      // جلب منتجات المسوق الحالية
      if (storeData) {
        const { data: myProductsData } = await supabase
          .from('affiliate_products')
          .select('product_id')
          .eq('affiliate_store_id', storeData.id);

        setMyProducts(new Set(myProductsData?.map(p => p.product_id) || []));
      }

      // جلب جميع المنتجات النشطة مع معلومات التجار
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          merchants (
            id,
            business_name,
            default_commission_rate
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Products query result:', { productsData, productsError });
      console.log('Products count:', productsData?.length || 0);

      setProducts(productsData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب البيانات المطلوبة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // البحث النصي
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.merchants?.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // فلتر الفئة
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // فلتر السعر
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.price_sar;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredProducts(filtered);
  };

  const addToMyStore = async (productId: string) => {
    if (!affiliateStore) {
      toast({
        title: "خطأ",
        description: "يجب إنشاء متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    setAddingProducts(prev => new Set(prev).add(productId));

    try {
      // استخدام الدالة الآمنة الجديدة
      const { data, error } = await supabase
        .rpc('add_affiliate_product', {
          p_store_id: affiliateStore.id,
          p_product_id: productId,
          p_is_visible: true,
          p_sort_order: 0
        });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Add product result:', data);

      const result = data as { already_exists?: boolean; success?: boolean };
      
      if (result.already_exists) {
        toast({
          title: "تنبيه",
          description: "المنتج موجود بالفعل في متجرك",
          variant: "default",
        });
      } else {
        toast({
          title: "تم بنجاح",
          description: "تم إضافة المنتج إلى متجرك",
        });
      }

      setMyProducts(prev => new Set(prev).add(productId));

    } catch (error: any) {
      console.error('Error adding product:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = "تعذر إضافة المنتج";
      
      if (error.message?.includes('Not authenticated')) {
        errorMessage = "يجب تسجيل الدخول أولاً";
      } else if (error.message?.includes('Unauthorized store access')) {
        errorMessage = "غير مصرح لك بالوصول لهذا المتجر";
      } else if (error.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      toast({
        title: "فشل إضافة المنتج",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeFromMyStore = async (productId: string) => {
    if (!affiliateStore) return;

    setAddingProducts(prev => new Set(prev).add(productId));

    try {
      const { error } = await supabase
        .from('affiliate_products')
        .delete()
        .eq('affiliate_store_id', affiliateStore.id)
        .eq('product_id', productId);

      if (error) throw error;

      setMyProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج من متجرك",
      });

    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: "خطأ",
        description: "تعذر حذف المنتج",
        variant: "destructive",
      });
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // الحصول على الفئات المتاحة
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => goToUserHome(profile?.role)}
                className="text-primary hover:bg-primary/10 gap-1 sm:gap-2 text-sm sm:text-base px-2 sm:px-4"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">الصفحة الرئيسية</span>
                <span className="sm:hidden">الرئيسية</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  مخزن المنتجات
                </h1>
                <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
                  تصفح واختر المنتجات لإضافتها إلى متجرك
                </p>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-primary">{products.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">منتج متاح</div>
            </div>
            <Separator orientation="vertical" className="h-8 sm:h-12" />
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-accent">{myProducts.size}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">في متجري</div>
            </div>
          </div>
        </div>

        {/* تنبيه في حالة عدم وجود متجر */}
        {!affiliateStore && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                    لم يتم إنشاء متجرك بعد
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 mt-1">
                    يمكنك تصفح المنتجات، لكن لإضافتها لمتجرك يجب إنشاء المتجر أولاً من لوحة المسوق
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* تعليمات للمسوق */}
        {affiliateStore && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">
                    مرحباً بك في مخزن المنتجات
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-300 mt-1">
                    يمكنك الآن تصفح المنتجات والضغط على "إضافة لمتجري" لإضافتها إلى متجرك الخاص
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* أدوات البحث والفلترة */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* البحث */}
              <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8 sm:pr-10 text-sm"
                />
              </div>

              {/* فلتر الفئات */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 sm:px-4 py-2 rounded-md border border-border bg-background text-xs sm:text-sm"
              >
                <option value="all">جميع الفئات</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* نطاق السعر */}
              <div className="flex gap-2">
                <Input
                  placeholder="من"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 text-xs sm:text-sm"
                />
                <Input
                  placeholder="إلى"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 text-xs sm:text-sm"
                />
              </div>

              {/* تبديل العرض */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 px-2 sm:px-4"
                >
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 px-2 sm:px-4"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* عرض المنتجات */}
        {filteredProducts.length === 0 ? (
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max
                  ? 'لا توجد منتجات تطابق معايير البحث'
                  : 'لا توجد منتجات متاحة حالياً'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-3 sm:space-y-4'
          }>
            {filteredProducts.map((product) => {
              const isInMyStore = myProducts.has(product.id);
              const isProcessing = addingProducts.has(product.id);
              
              return (
                <Card key={product.id} className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 group overflow-hidden">
                  {viewMode === 'grid' ? (
                    <>
                      {/* صورة المنتج */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={Array.isArray(product.images) && product.images[0]?.url || 
                               Array.isArray(product.image_urls) && product.image_urls[0] || 
                               '/placeholder.svg'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* شارة التاجر */}
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                            <Store className="h-3 w-3 ml-1" />
                            {product.merchants?.business_name}
                          </Badge>
                        </div>

                        {/* حالة المنتج في متجري */}
                        {isInMyStore && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              في متجري
                            </Badge>
                          </div>
                        )}

                        {/* تنبيه المخزون */}
                        {product.stock <= 10 && (
                          <div className="absolute bottom-3 right-3">
                            <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm">
                              باقي {product.stock}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* تفاصيل المنتج */}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold mb-1 line-clamp-1">{product.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xl font-bold text-primary">
                                {product.price_sar} ريال
                              </div>
                              <div className="text-xs text-muted-foreground">
                                العمولة: {product.merchants?.default_commission_rate || 10}%
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>

                          {/* أزرار الإجراءات */}
                          <div className="flex gap-2 pt-2">
                            {affiliateStore && (
                              <>
                                {isInMyStore ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromMyStore(product.id)}
                                    disabled={isProcessing}
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    {isProcessing ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                                    ) : (
                                      <>
                                        <Check className="h-3 w-3 ml-1" />
                                        حذف من متجري
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => addToMyStore(product.id)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-gradient-primary"
                                  >
                                    {isProcessing ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3 ml-1" />
                                        إضافة لمتجري
                                      </>
                                    )}
                                  </Button>
                                )}
                              </>
                            )}
                            
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    // List View
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* صورة مصغرة */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={Array.isArray(product.images) && product.images[0]?.url || 
                                 Array.isArray(product.image_urls) && product.image_urls[0] || 
                                 '/placeholder.svg'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* تفاصيل المنتج */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{product.title}</h3>
                              <p className="text-sm text-muted-foreground mb-1">
                                {product.merchants?.business_name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                                {isInMyStore && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    في متجري
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {product.price_sar} ريال
                              </div>
                              <div className="text-xs text-muted-foreground">
                                العمولة: {product.merchants?.default_commission_rate || 10}%
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-end">
                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1 ml-4">
                              {product.description}
                            </p>
                            
                            {affiliateStore && (
                              <div className="flex gap-2">
                                {isInMyStore ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromMyStore(product.id)}
                                    disabled={isProcessing}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    {isProcessing ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                                    ) : (
                                      <>
                                        <Check className="h-3 w-3 ml-1" />
                                        حذف من متجري
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => addToMyStore(product.id)}
                                    disabled={isProcessing}
                                    className="bg-gradient-primary"
                                  >
                                    {isProcessing ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3 ml-1" />
                                        إضافة لمتجري
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* إحصائيات في أسفل الصفحة */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          عرض {filteredProducts.length} من أصل {products.length} منتج
          {myProducts.size > 0 && (
            <span className="mx-2">•</span>
          )}
          {myProducts.size > 0 && (
            <span>{myProducts.size} منتج في متجرك</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsBrowser;