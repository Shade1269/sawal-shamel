import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  User, 
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Plus,
  Minus,
  ShoppingBag,
  Crown,
  Verified,
  Award,
  TrendingUp,
  Home,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

interface AffiliateStore {
  id: string;
  store_name: string;
  store_slug: string;
  bio: string;
  logo_url: string;
  theme: string;
  total_sales: number;
  total_orders: number;
  is_active: boolean;
  profile_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
    level: string;
    points: number;
  };
}

interface Product {
  id: string;
  product_id: string;
  sort_order: number;
  is_visible: boolean;
  products: {
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
  };
}

const AffiliateStoreFront = () => {
  const { storeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { goToUserHome } = useSmartNavigation();
  
  const [store, setStore] = useState<AffiliateStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);

  useEffect(() => {
    if (storeSlug) {
      fetchStoreData();
      // تتبع الإحالة
      const ref = searchParams.get('ref');
      if (ref) {
        setAffiliateRef(ref);
        trackVisit(ref);
      }
    }
  }, [storeSlug, searchParams]);

  const fetchStoreData = async () => {
    try {
      // جلب بيانات المتجر
      const { data: storeData, error: storeError } = await supabase
        .from('affiliate_stores')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            level,
            points
          )
        `)
        .eq('store_slug', storeSlug)
        .eq('is_active', true)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // جلب منتجات المتجر
      const { data: productsData, error: productsError } = await supabase
        .from('affiliate_products')
        .select(`
          *,
          products (
            *
          )
        `)
        .eq('affiliate_store_id', storeData.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error) {
      console.error('Error fetching store data:', error);
      toast({
        title: "خطأ في تحميل المتجر",
        description: "تعذر تحميل بيانات المتجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async (referrerId: string) => {
    // تسجيل الزيارة في قاعدة البيانات (يمكن إضافتها لاحقاً)
    console.log('Tracking visit for affiliate:', referrerId);
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast({
      title: "تمت الإضافة للسلة",
      description: "تم إضافة المنتج إلى سلة التسوق",
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.product_id === productId);
      return total + (product?.products.price_sar || 0) * quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.products.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.products.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.products.category).filter(Boolean))];

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      default: return 'bg-gradient-to-r from-orange-300 to-orange-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-persian-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-persian-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المتجر غير موجود</h2>
          <p className="text-muted-foreground">لم يتم العثور على المتجر المطلوب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Back to Home Button */}
      <div className="container mx-auto px-6 py-4">
        <Button 
          variant="ghost" 
          onClick={goToUserHome}
          className="text-primary hover:bg-primary/10 gap-2"
        >
          <Home className="h-4 w-4" />
          العودة إلى الصفحة الرئيسية
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Header المتجر */}
      <div className="relative">
        {/* خلفية المتجر */}
        <div className="h-80 bg-gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        </div>

        {/* معلومات المتجر */}
        <div className="container mx-auto px-6">
          <div className="relative -mt-32 z-10">
            <Card className="border-0 bg-card/95 backdrop-blur-sm shadow-luxury">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* صورة المتجر */}
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                      <AvatarImage src={store.logo_url || store.profiles?.avatar_url} />
                      <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                        {store.store_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Badge className={`${getLevelBadgeColor(store.profiles?.level || 'bronze')} border-2 border-background`}>
                        <Crown className="h-3 w-3 ml-1" />
                        {store.profiles?.level === 'legendary' ? 'أسطوري' :
                         store.profiles?.level === 'gold' ? 'ذهبي' :
                         store.profiles?.level === 'silver' ? 'فضي' : 'برونزي'}
                      </Badge>
                    </div>
                  </div>

                  {/* تفاصيل المتجر */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold">{store.store_name}</h1>
                      <Verified className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{store.profiles?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{store.profiles?.points || 0} نقطة</span>
                      </div>
                    </div>

                    {store.bio && (
                      <p className="text-muted-foreground mb-4">{store.bio}</p>
                    )}

                    {/* إحصائيات المتجر */}
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{store.total_orders || 0}</div>
                        <div className="text-sm text-muted-foreground">طلب</div>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{store.total_sales?.toFixed(0) || 0}</div>
                        <div className="text-sm text-muted-foreground">ريال مبيعات</div>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-premium">{products.length}</div>
                        <div className="text-sm text-muted-foreground">منتج</div>
                      </div>
                    </div>
                  </div>

                  {/* أدوات المتجر */}
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 ml-2" />
                      متابعة
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 ml-2" />
                      مشاركة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* شريط السلة العائم */}
      {getCartItemsCount() > 0 && (
        <div className="fixed bottom-6 left-6 z-50">
          <Card className="border-0 bg-primary shadow-luxury">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-white">
                <ShoppingBag className="h-5 w-5" />
                <div>
                  <div className="font-medium">{getCartItemsCount()} منتج</div>
                  <div className="text-sm opacity-90">{getCartTotal().toFixed(2)} ريال</div>
                </div>
                <Button size="sm" variant="secondary">
                  عرض السلة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* منطقة المنتجات */}
      <div className="container mx-auto px-6 py-8">
        {/* أدوات البحث والتصفية */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1">
                {/* البحث */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* فلتر الفئات */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="all">جميع الفئات</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* تبديل العرض */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* عرض المنتجات */}
        {filteredProducts.length === 0 ? (
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">لم يتم العثور على منتجات في هذا المتجر</p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredProducts.map((item) => (
              <Card key={item.id} className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 group overflow-hidden">
                {viewMode === 'grid' ? (
                  <>
                    {/* صورة المنتج */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={Array.isArray(item.products.images) && item.products.images[0]?.url || 
                             Array.isArray(item.products.image_urls) && item.products.image_urls[0] || 
                             '/placeholder.svg'}
                        alt={item.products.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          <Eye className="h-3 w-3 ml-1" />
                          {item.products.view_count || 0}
                        </Badge>
                      </div>
                      {item.products.stock <= 5 && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm">
                            باقي {item.products.stock}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* تفاصيل المنتج */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.products.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.products.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-bold text-primary">{item.products.price_sar} ريال</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">4.5</span>
                        </div>
                      </div>

                      {/* أزرار الإضافة للسلة */}
                      <div className="flex gap-2">
                        {cart[item.product_id] ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Button size="sm" variant="outline" onClick={() => removeFromCart(item.product_id)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 bg-background rounded text-sm font-medium">
                              {cart[item.product_id]}
                            </span>
                            <Button size="sm" onClick={() => addToCart(item.product_id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => addToCart(item.product_id)} className="flex-1">
                            <ShoppingCart className="h-4 w-4 ml-2" />
                            أضف للسلة
                          </Button>
                        )}
                        <Button size="icon" variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  /* عرض القائمة */
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={Array.isArray(item.products.images) && item.products.images[0]?.url || 
                               Array.isArray(item.products.image_urls) && item.products.image_urls[0] || 
                               '/placeholder.svg'}
                          alt={item.products.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.products.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{item.products.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-primary">{item.products.price_sar} ريال</div>
                          <div className="flex gap-2">
                            {cart[item.product_id] ? (
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => removeFromCart(item.product_id)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-2">{cart[item.product_id]}</span>
                                <Button size="sm" onClick={() => addToCart(item.product_id)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => addToCart(item.product_id)}>
                                أضف للسلة
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateStoreFront;