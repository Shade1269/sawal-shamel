import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Package, Trash2, Star, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price_sar: number;
  image_urls: string[] | null;
  category: string | null;
  stock: number;
}

interface ProductLibraryItem {
  id: string;
  is_featured: boolean;
  sort_index: number;
  products: Product;
}

interface StoreProductsSectionProps {
  userShop: any;
}

const StoreProductsSection: React.FC<StoreProductsSectionProps> = ({ userShop }) => {
  const { user } = useAuth();
  const [storeProducts, setStoreProducts] = useState<ProductLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userShop) {
      fetchStoreProducts();
    }
  }, [userShop]);

  const fetchStoreProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_library')
        .select(`
          id,
          is_featured,
          sort_index,
          products (
            id,
            title,
            description,
            price_sar,
            image_urls,
            category,
            stock
          )
        `)
        .eq('shop_id', userShop.id)
        .order('sort_index');

      if (error) throw error;

      setStoreProducts(data || []);
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
      const { error } = await supabase
        .from('product_library')
        .delete()
        .eq('id', productLibraryId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('product_library')
        .update({ is_featured: !currentFeatured })
        .eq('id', productLibraryId);

      if (error) throw error;

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
      </CardHeader>
      <CardContent>
        {storeProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد منتجات في المتجر</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإضافة منتجاتك الأولى باستخدام زر "إضافة المنتج لمتجري" أعلاه
            </p>
            <Button onClick={() => window.location.href = '/inventory'} variant="outline">
              أو تصفح المخزون
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storeProducts.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {item.products.image_urls && item.products.image_urls.length > 0 ? (
                    <img
                      src={item.products.image_urls[0]}
                      alt={item.products.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                  
                  {/* Featured Badge */}
                  {item.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {item.products.title}
                    </h3>
                    {item.products.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.products.category}
                      </Badge>
                    )}
                  </div>
                  
                  {item.products.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {item.products.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-primary">
                      {item.products.price_sar} ريال
                    </div>
                    <div className="text-xs text-muted-foreground">
                      المتوفر: {item.products.stock}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={item.is_featured ? "default" : "outline"}
                      onClick={() => toggleFeatured(item.id, item.is_featured)}
                      className="flex-1"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {item.is_featured ? "مميز" : "جعل مميز"}
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreProductsSection;