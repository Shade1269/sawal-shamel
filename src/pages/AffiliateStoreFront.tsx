import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Search,
  Grid,
  List,
  Eye,
  Home,
  ArrowRight,
  Plus,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StoreHeader } from '@/components/StoreHeader';
import { SimpleCart, useSimpleCart } from '@/components/SimpleCart';

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
  const navigate = useNavigate();
  
  const [store, setStore] = useState<AffiliateStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);

  const { addToCart, getTotalItems, getTotalPrice } = useSimpleCart(storeSlug || 'default');

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
        .maybeSingle();

      if (storeError) throw storeError;
      
      if (!storeData) {
        setStore(null);
        setLoading(false);
        return;
      }
      
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
      toast.error('خطأ في تحميل بيانات المتجر');
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async (referrerId: string) => {
    // تسجيل الزيارة في قاعدة البيانات (يمكن إضافتها لاحقاً)
    console.log('Tracking visit for affiliate:', referrerId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.product_id,
      name: product.products.title,
      price: product.products.price_sar,
      image: Array.isArray(product.products.images) && product.products.images[0]?.url || 
             Array.isArray(product.products.image_urls) && product.products.image_urls[0] || 
             undefined
    });
  };

  // فلترة المنتجات
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.products.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.products.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.products.category === selectedCategory;
    
    return matchesSearch && matchesCategory && item.products.is_active;
  });

  // استخراج الفئات
  const categories = [...new Set(products.map(item => item.products.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">المتجر غير موجود</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على المتجر المطلوب</p>
            <Button onClick={() => navigate('/')}>العودة للصفحة الرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Back to Home Button */}
      <div className="container mx-auto px-6 py-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-primary hover:bg-primary/10 gap-2"
        >
          <Home className="h-4 w-4" />
          العودة إلى الصفحة الرئيسية
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Store Header */}
      <div className="container mx-auto px-6 pb-8">
        <StoreHeader store={store} productsCount={filteredProducts.length} />
      </div>

      {/* شريط السلة العائم */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 left-6 z-50">
          <Card className="border-0 bg-primary shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-white">
                <ShoppingBag className="h-5 w-5" />
                <div>
                  <div className="font-medium">{getTotalItems()} منتج</div>
                  <div className="text-sm opacity-90">{getTotalPrice()} ريال</div>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => navigate(`/store/${storeSlug}/checkout`)}
                  className="text-primary"
                >
                  إتمام الطلب - {getTotalPrice()} ريال
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
              <Card key={item.id} className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
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
                        <Button onClick={() => handleAddToCart(item)} className="flex-1">
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          أضف للسلة
                        </Button>
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
                          <Button size="sm" onClick={() => handleAddToCart(item)}>
                            أضف للسلة
                          </Button>
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