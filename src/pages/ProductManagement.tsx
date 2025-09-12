import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Package, 
  Tag, 
  Layers,
  ArrowRight,
  Home,
  Star,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFastAuth } from '@/hooks/useFastAuth';

interface Product {
  id: string;
  title: string;
  description?: string;
  price_sar: number;
  stock: number;
  is_active: boolean;
  featured: boolean;
  sku?: string;
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
  view_count: number;
  sales_count: number;
  created_at: string;
}

const ProductManagement = () => {
  const { profile } = useFastAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name),
          brand:product_brands(id, name),
          images:product_images(id, image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // جلب الفئات
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      // جلب العلامات التجارية
      const { data: brandsData, error: brandsError } = await supabase
        .from('product_brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (brandsError) throw brandsError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setBrands(brandsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ في الحذف",
        description: "تعذر حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));

      toast({
        title: !currentStatus ? "تم تفعيل المنتج" : "تم إلغاء تفعيل المنتج",
        description: !currentStatus ? "المنتج متاح الآن للعملاء" : "المنتج غير متاح للعملاء",
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تحديث حالة المنتج",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && product.is_active) ||
                         (selectedStatus === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    featured: products.filter(p => p.featured).length,
    outOfStock: products.filter(p => p.stock <= 0).length,
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
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2">
                  <Home className="h-4 w-4" />
                  الصفحة الرئيسية
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    إدارة المنتجات
                  </h1>
                  <p className="text-muted-foreground">
                    إضافة وتعديل وإدارة منتجات متجرك
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/product-management/add')}
              className="bg-gradient-primary gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">المنتجات النشطة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-luxury/10 to-luxury/5 border-luxury/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-luxury">المنتجات المميزة</p>
                  <p className="text-2xl font-bold text-luxury">{stats.featured}</p>
                </div>
                <Star className="h-8 w-8 text-luxury opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">نفد المخزون</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">جميع الفئات</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>

              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
              >
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                  {product.images?.find(img => img.is_primary)?.image_url ? (
                    <img 
                      src={product.images.find(img => img.is_primary)?.image_url} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  {product.featured && (
                    <Badge className="bg-luxury text-luxury-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  )}
                  {product.category && (
                    <p className="text-xs text-muted-foreground">{product.category.name}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      {product.price_sar} ر.س
                    </span>
                    <p className="text-xs text-muted-foreground">
                      المخزون: {product.stock}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-left">
                    <p>{product.view_count} مشاهدة</p>
                    <p>{product.sales_count} مبيعة</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/product-management/edit/${product.id}`)}
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant={product.is_active ? "destructive" : "default"}
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                  >
                    {product.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد منتجات</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'لا توجد منتجات تطابق معايير البحث الحالية'
                : 'لم تقم بإضافة أي منتجات بعد'
              }
            </p>
            <Button 
              onClick={() => navigate('/product-management/add')}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة منتج جديد
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">إدارة الفئات</h3>
              <p className="text-sm text-muted-foreground mb-4">
                إضافة وتعديل فئات المنتجات
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/product-management/categories')}
              >
                إدارة الفئات
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-luxury rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">إدارة العلامات التجارية</h3>
              <p className="text-sm text-muted-foreground mb-4">
                إضافة وتعديل العلامات التجارية
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/product-management/brands')}
              >
                إدارة العلامات
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">استيراد بالجملة</h3>
              <p className="text-sm text-muted-foreground mb-4">
                استيراد عدة منتجات من ملف CSV
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/product-management/bulk-import')}
              >
                استيراد منتجات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;