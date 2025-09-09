import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, Search, Filter, ArrowLeft, X, Upload, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseUserData } from '@/hooks/useFirebaseUserData';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price_sar: number;
  image_urls: string[] | null;
  category: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
}

interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  variant_type: string;
  variant_value: string;
  stock: number;
}

const Inventory = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { getShopProducts, addProduct } = useFirebaseUserData();

  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Add state for user's shop
  const [userShop, setUserShop] = useState<any>(null);

  const addToStore = async (productId: string) => {
    try {
      if (!user) {
        toast({
          title: "تنبيه",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive"
        });
        return;
      }

      // Find the product from our current products list
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على المنتج",
          variant: "destructive"
        });
        return;
      }

      // Add the product to user's store with proper structure for ProductLibraryItem
      await addProduct({
        id: product.id,
        is_featured: false,
        is_visible: true,
        sort_index: 0,
        commission_amount: 0,
        products: {
          id: product.id,
          title: product.title,
          description: product.description,
          price_sar: product.price_sar,
          image_urls: product.image_urls,
          category: product.category,
          stock: product.stock,
          variants: product.variants
        }
      });

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج إلى متجرك"
      });

    } catch (error) {
      console.error('Error adding product to store:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المنتج إلى المتجر",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      if (!user) return;
      
      // Get products from Firestore
      const products = await getShopProducts();
      setProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب المنتجات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // No more realtime updates needed since we're using Firestore
  useEffect(() => {
    // This would need to be implemented with Firestore listeners if needed
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">المخزون</h1>
              <p className="text-muted-foreground">إدارة كتالوج المنتجات</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="min-w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">جميع الفئات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground mb-4">
                {products.length === 0 
                  ? "يمكنك إضافة منتجات جديدة من صفحة الإدارة" 
                  : "لا توجد منتجات مطابقة للبحث"}
              </p>
              {products.length === 0 && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/admin')} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة منتجات يدوياً
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                <ProductImageCarousel 
                  images={product.image_urls && product.image_urls.length > 0 
                    ? [
                        ...product.image_urls,
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
                        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
                      ]
                    : [
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
                        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
                      ]
                  }
                  productTitle={product.title}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  {product.description && (
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {product.price_sar} ريال
                      </div>
                      <div className="text-sm text-muted-foreground">
                        المتوفر: {product.stock}
                      </div>
                    </div>
                  </div>

                  {/* Product Variants Display */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      <h5 className="text-sm font-medium text-muted-foreground">المتوفر:</h5>
                      {[...new Set(product.variants.map(v => v.variant_type))].map(variantType => {
                        const variantOptions = product.variants!.filter(v => v.variant_type === variantType);
                        
                        return (
                          <div key={variantType} className="space-y-2">
                            <label className="text-sm font-medium">
                              {variantType === 'size' ? 'المقاسات' : 
                               variantType === 'color' ? 'الألوان' : 
                               variantType === 'style' ? 'الأنماط' :
                               variantType === 'material' ? 'المواد' : variantType}:
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {variantOptions.map(variant => (
                                <Badge
                                  key={variant.id}
                                  variant={variant.stock > 0 ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {variant.variant_value}
                                  <span className="mr-1">({variant.stock})</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add to Store Button */}
                  <Button
                    onClick={() => addToStore(product.id)}
                    className="w-full gap-2 mt-4"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة إلى متجري
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;