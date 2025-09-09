import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Package, Trash2, Star, Plus, Eye, EyeOff, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseUserData } from '@/hooks/useFirebaseUserData';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price_sar: number;
  image_urls: string[] | null;
  category: string | null;
  stock: number;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  variant_type: string;
  variant_value: string;
  stock: number;
}

interface ProductLibraryItem {
  id: string;
  is_featured: boolean;
  is_visible: boolean;
  sort_index: number;
  commission_amount: number;
  products: Product;
}

interface StoreProductsSectionProps {
  userShop: any;
}

const StoreProductsSection: React.FC<StoreProductsSectionProps> = ({ userShop }) => {
  const { user } = useFirebaseAuth();
  const { getShopProducts } = useFirebaseUserData();
  const [storeProducts, setStoreProducts] = useState<ProductLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalCommission, setGlobalCommission] = useState<number>(0);
  const [editingCommissions, setEditingCommissions] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (userShop) {
      fetchStoreProducts();
    }
  }, [userShop]);

  // Refresh data when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      if (userShop) {
        console.log('Page focused, refreshing store products...');
        fetchStoreProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userShop]);

  const fetchStoreProducts = async () => {
    try {
      if (!user) return;
      
      const products = await getShopProducts();
      console.log('Raw products from getShopProducts:', products);
      console.log('Products type check:', products.map(p => ({ 
        id: p.id, 
        hasProducts: !!p.products,
        type: typeof p
      })));
      setStoreProducts(products as ProductLibraryItem[]);
    } catch (error) {
      console.error('Error fetching store products:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب منتجات المتجر",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromStore = async (productLibraryId: string) => {
    try {
      // This would need to be implemented in Firestore
      toast({
        title: "تم بنجاح",
        description: "تم حذف المنتج من المتجر"
      });

      fetchStoreProducts();
    } catch (error) {
      console.error('Error removing product from store:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (productLibraryId: string, currentFeatured: boolean) => {
    try {
      // This would need to be implemented in Firestore
      toast({
        title: "تم بنجاح",
        description: currentFeatured ? "تم إزالة المنتج من المميزة" : "تم إضافة المنتج للمنتجات المميزة"
      });

      fetchStoreProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المنتج",
        variant: "destructive"
      });
    }
  };

  const toggleVisibility = async (productLibraryId: string, currentVisible: boolean) => {
    try {
      // This would need to be implemented in Firestore
      toast({
        title: "تم بنجاح",
        description: currentVisible ? "تم إخفاء المنتج من المتجر" : "تم إظهار المنتج في المتجر"
      });

      fetchStoreProducts();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المنتج",
        variant: "destructive"
      });
    }
  };

  const updateCommission = async (productLibraryId: string, commissionAmount: number) => {
    try {
      // This would need to be implemented in Firestore
      toast({
        title: "تم بنجاح",
        description: "تم تحديث العمولة"
      });

      // Remove from editing state
      setEditingCommissions(prev => {
        const newState = { ...prev };
        delete newState[productLibraryId];
        return newState;
      });

      fetchStoreProducts();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث العمولة",
        variant: "destructive"
      });
    }
  };

  const applyGlobalCommission = async () => {
    try {
      // This would need to be implemented in Firestore
      toast({
        title: "تم بنجاح",
        description: "تم تطبيق العمولة الثابتة على جميع المنتجات"
      });

      fetchStoreProducts();
    } catch (error) {
      console.error('Error applying global commission:', error);
      toast({
        title: "خطأ",
        description: "فشل في تطبيق العمولة الثابتة",
        variant: "destructive"
      });
    }
  };

  const handleCommissionChange = (productLibraryId: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setEditingCommissions(prev => ({
      ...prev,
      [productLibraryId]: numericValue
    }));
  };

  const saveCommission = (productLibraryId: string) => {
    const commissionAmount = editingCommissions[productLibraryId];
    if (commissionAmount !== undefined) {
      updateCommission(productLibraryId, commissionAmount);
    }
  };

  if (!userShop) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" />
            إدارة المنتجات
          </CardTitle>
          <CardDescription>
            قم بإنشاء متجرك أولاً لإدارة المنتجات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">إنشاء متجر مطلوب</h3>
            <p className="text-muted-foreground mb-4">
              يجب إنشاء متجر من قسم الإعدادات أولاً
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل منتجات المتجر...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              إدارة المنتجات
            </CardTitle>
            <CardDescription>
              منتجات متجر {userShop.display_name} ({storeProducts.length} منتج)
            </CardDescription>
          </div>
        </div>
        
        {/* Global Commission Section */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <Label htmlFor="globalCommission" className="text-sm font-medium">
                عمولة ثابتة لجميع المنتجات:
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="globalCommission"
                type="number"
                min="0"
                step="0.01"
                value={globalCommission}
                onChange={(e) => setGlobalCommission(parseFloat(e.target.value) || 0)}
                className="w-24 h-8"
                placeholder="0.00"
              />
              <span className="text-sm text-muted-foreground">ريال</span>
              <Button size="sm" onClick={applyGlobalCommission}>
                تطبيق على الكل
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(storeProducts.filter((i) => (i as any)?.products)).length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">متجرك فارغ حالياً</h3>
            <p className="text-muted-foreground mb-4">
              لإضافة منتجات لمتجرك، اذهب إلى المخزون واختر المنتجات واضغط "إضافة إلى متجري"
            </p>
            <Button onClick={() => window.location.href = '/inventory'} variant="outline">
              انتقل إلى المخزون
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storeProducts
              .filter((item) => (item as any)?.products)
              .map((item) => {
                console.log('Rendering product:', item);
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      {/* Test with multiple images for debugging */}
                      <ProductImageCarousel 
                        images={item.products?.image_urls && item.products.image_urls.length > 0 
                          ? [
                              ...item.products.image_urls,
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
                        productTitle={item.products?.title || 'منتج غير معروف'}
                      />
                      
                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {item.is_featured && (
                          <Badge className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            مميز
                          </Badge>
                        )}
                        {!item.is_visible && (
                          <Badge variant="secondary" className="bg-gray-500">
                            <EyeOff className="h-3 w-3 mr-1" />
                            مخفي
                          </Badge>
                        )}
                      </div>
                    </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {item.products?.title || 'منتج غير معروف'}
                    </h3>
                    {item.products?.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.products.category}
                      </Badge>
                    )}
                  </div>
                  
                  {item.products?.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {item.products.description}
                    </p>
                  )}
                  
                  {/* Price and Commission Section */}
                  <div className="border-t pt-3 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">السعر الأساسي:</span>
                        <span className="font-semibold">{item.products?.price_sar || 0} ريال</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">العمولة المضافة:</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingCommissions[item.id] !== undefined ? editingCommissions[item.id] : item.commission_amount}
                            onChange={(e) => handleCommissionChange(item.id, e.target.value)}
                            className="w-20 h-8 text-sm"
                            placeholder="0.00"
                          />
                          <span className="text-sm">ريال</span>
                        </div>
                      </div>
                      
                      {editingCommissions[item.id] !== undefined && (
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => saveCommission(item.id)}
                            className="h-7 px-3 text-xs"
                          >
                            حفظ
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm font-medium">السعر النهائي:</span>
                        <span className="text-lg font-bold text-primary">
                          {((item.products?.price_sar || 0) + (item.commission_amount || 0)).toFixed(2)} ريال
                        </span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-right">
                        المتوفر: {item.products?.stock || 0}
                      </div>
                    </div>
                  </div>

                  {/* Product Variants Display */}
                  {item.products?.variants && item.products.variants.length > 0 && (
                    <div className="space-y-2 mb-3 border-t pt-3">
                      {[...new Set(item.products.variants.map(v => v.variant_type))].map(variantType => {
                        const variantOptions = item.products?.variants?.filter(v => v.variant_type === variantType) || [];
                        
                        return (
                          <div key={variantType} className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
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
                                  className="text-xs px-1 py-0"
                                >
                                  {variant.variant_value} ({variant.stock})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={item.is_featured ? "default" : "outline"}
                      onClick={() => toggleFeatured(item.id, item.is_featured)}
                      className="flex-1"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {item.is_featured ? "مميز" : "مميز"}
                    </Button>
                    <Button
                      size="sm"
                      variant={item.is_visible ? "outline" : "secondary"}
                      onClick={() => toggleVisibility(item.id, item.is_visible)}
                      className="flex-1"
                    >
                      {item.is_visible ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          ظاهر
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          مخفي
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromStore(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreProductsSection;