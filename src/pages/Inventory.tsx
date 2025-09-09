import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, Search, Filter, ArrowLeft, X, Upload, RefreshCw, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseUserData } from '@/hooks/useFirebaseUserData';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { extractAllProductImages } from '@/lib/imageExtractors';
import FileUpload from '@/components/FileUpload';

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
  raw_variants?: any[];
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

  // Get user profile from Firebase
  const { userProfile } = useFirebaseAuth();

  // Debug: اطبع معلومات المستخدم الحالي
  useEffect(() => {
    if (user && userProfile) {
      console.log('Current user:', {
        uid: user.uid,
        email: user.email,
        role: userProfile.role
      });
      
      // إضافة وظيفة مؤقتة لتعيين دور admin
      if (user.email === 'shade199633@icloud.com' || user.email === 'Shade199633@icloud.com') {
        console.log('Admin user detected. To make this user admin, run: makeUserAdmin()');
        (window as any).makeUserAdmin = async () => {
          try {
            const { updateUserInFirestore } = await import('@/lib/firestore');
            const result = await updateUserInFirestore(user.uid, {
              role: 'admin',
              updatedAt: new Date()
            });
            console.log('User role updated to admin:', result);
            if (result.success) {
              window.location.reload(); // إعادة تحميل الصفحة لتحديث البيانات
            }
            return result;
          } catch (error) {
            console.error('Error making user admin:', error);
            return { success: false, error };
          }
        };
      }
    }
  }, [user, userProfile]);

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

  const handleImageUpload = async (productId: string, imageUrl: string) => {
    try {
      // Get current product
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Add new image to existing images
      const currentImages = currentProduct.image_urls || [];
      const updatedImages = [...currentImages, imageUrl];

      // Update product in Firebase (this would need to be implemented properly)
      // For now, just update local state
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, image_urls: updatedImages }
          : p
      ));

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الصورة للمنتج مؤقتاً (تحتاج تطبيق حفظ Firebase)"
      });

    } catch (error) {
      console.error('Error updating product images:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الصورة",
        variant: "destructive"
      });
    }
  };

  const fetchProducts = async () => {
    try {
      if (!user) return;
      
      console.log('Fetching products from Firebase...');
      const raw = await getShopProducts();
      
      // Normalize Firebase data (supports nested `products` structure)
      const normalized: ProductWithVariants[] = (raw || []).map((p: any) => {
        const { mergedImages, variants } = extractAllProductImages(p);
        const src = p?.products ?? p ?? {};
        
        return {
          id: src?.id || p?.id,
          title: src?.title || '',
          description: src?.description || null,
          price_sar: src?.price_sar ?? src?.price ?? 0,
          image_urls: mergedImages.length > 0 ? mergedImages : null,
          category: src?.category || null,
          stock: src?.stock ?? 0,
          is_active: src?.is_active ?? p?.isActive ?? true,
          created_at: src?.created_at || p?.createdAt?.toISOString?.() || new Date().toISOString(),
          variants: variants.map((v: any) => ({
            id: v?.id || String(Math.random()),
            variant_type: v?.variant_type || v?.type || 'default',
            variant_value: v?.variant_value || v?.value || '',
            stock: v?.stock || 0
          })),
          raw_variants: variants,
        };
      });
      
      console.log(`Loaded ${normalized.length} products from Firebase (normalized)`, normalized.slice(0,3));
      setProducts(normalized);
      
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
                  images={product.image_urls}
                  productTitle={product.title}
                  variants={(product as any).raw_variants || product.variants}
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
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => addToStore(product.id)}
                      className="flex-1 gap-2"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة إلى متجري
                    </Button>
                    
                    {/* Admin-only Image Upload */}
                    {userProfile?.role === 'admin' && (
                      <div className="relative">
                        <FileUpload
                          onFileUpload={(imageUrl) => handleImageUpload(product.id, imageUrl)}
                          accept="image/*"
                          maxSize={5}
                          className="inline-block"
                        />
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
                          إضافة صورة
                        </div>
                      </div>
                    )}
                  </div>
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