import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  VirtualizedList,
  EnhancedButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, 
  Search,
  Filter,
  ShoppingCart,
  Star,
  Eye,
  Heart,
  Share,
  Plus,
  Home,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFastAuth } from '@/hooks/useFastAuth';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useFastAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          merchant:merchants (
            business_name,
            profile:profiles (full_name)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      
      // استخراج الفئات
      const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ في جلب المنتجات",
        description: "تعذر جلب قائمة المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price_sar - b.price_sar);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price_sar - a.price_sar);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToLibrary = async (productId: string) => {
    if (!isAuthenticated || !profile) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول لإضافة المنتجات",
        variant: "destructive",
      });
      return;
    }

    try {
      // احصل على معرف الملف الشخصي الحقيقي من جدول profiles (مطلوب بواسطة RLS)
      const { data: baseProfile, error: baseProfileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('auth_user_id', profile.auth_user_id)
        .maybeSingle();

      if (baseProfileError || !baseProfile) {
        throw new Error('تعذر العثور على الملف الشخصي الأساسي');
      }

      // ابحث عن متجر المسوق المرتبط بهذا الملف الشخصي
      let { data: store } = await supabase
        .from('affiliate_stores')
        .select('id')
        .eq('profile_id', baseProfile.id)
        .maybeSingle();

      // أنشئ المتجر إذا لم يكن موجوداً (سيمر RLS لأن profile_id من جدول profiles)
      if (!store) {
        const suggestedName = baseProfile.full_name || profile.full_name || 'My Store';
        const suggestedSlug = (suggestedName || 'store')
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .trim()
          .replace(/\s+/g, '-') + '-store';

        const { data: newStore, error: storeError } = await supabase
          .from('affiliate_stores')
          .insert({
            profile_id: baseProfile.id,
            store_name: suggestedName + ' Store',
            store_slug: suggestedSlug,
            is_active: true
          })
          .select('id')
          .maybeSingle();

        if (storeError) throw storeError;
        store = newStore;
      }

      // أضف المنتج إلى مكتبة المتجر
      const { error } = await supabase
        .from('affiliate_products')
        .insert({
          affiliate_store_id: store.id,
          product_id: productId,
          is_visible: true,
          sort_order: 0
        });

      if (error) {
        if ((error as any).code === '23505') {
          toast({
            title: "المنتج موجود بالفعل",
            description: "هذا المنتج مضاف لمتجرك بالفعل",
            variant: "destructive",
          });
        } else {
          throw error as any;
        }
        return;
      }

      toast({
        title: "تم إضافة المنتج",
        description: "تم إضافة المنتج لمتجرك بنجاح",
      });

    } catch (error) {
      console.error('Error adding product to library:', error);
      toast({
        title: "خطأ في الإضافة",
        description: "تعذر إضافة المنتج لمتجرك",
        variant: "destructive",
      });
    }
  };

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Back to Home Button */}
      <div className="flex justify-start">
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
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          متجر المنتجات
        </h1>
        <p className="text-muted-foreground">
          اكتشف أفضل المنتجات وابدأ التسويق بالعمولة
        </p>
      </div>

      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الفئات" />
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
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب بواسطة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="popular">الأكثر مشاهدة</SelectItem>
                <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('newest');
              }}
            >
              <Filter className="ml-2 h-4 w-4" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          عرض {filteredProducts.length} من أصل {products.length} منتج
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => (
          <Card key={product.id} className="group border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 overflow-hidden">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img 
                    src={product.image_urls[0]} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              
              {product.category && (
                <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
                  {product.category}
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {product.price_sar} ريال
                  </span>
                  {product.merchant?.profile?.full_name && (
                    <p className="text-xs text-muted-foreground">
                      بواسطة: {product.merchant.profile.full_name}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {product.view_count || 0}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-primary"
                >
                  <Eye className="ml-1 h-4 w-4" />
                  عرض
                </Button>
                
                {isAuthenticated && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddToLibrary(product.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد منتجات</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? 'جرب تغيير معايير البحث'
              : 'لا توجد منتجات متاحة حالياً'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;