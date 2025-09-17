import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  EnhancedCard, 
  EnhancedCardContent,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton,
  Card,
  CardContent,
  Button
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Star } from 'lucide-react';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { PromotionalBannerDisplay } from '@/components/storefront/PromotionalBannerDisplay';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description?: string;
  price_sar: number;
  image_urls?: string[];
  rating?: number;
  reviews_count?: number;
  stock_quantity?: number;
}

interface StoreContextType {
  store: {
    id: string;
    store_name: string;
    store_slug: string;
  };
}

export const IsolatedStorefront: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { store } = useOutletContext<StoreContextType>();
  const { addToCart } = useIsolatedStoreCart(store?.id || '');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!store?.id) return;

    try {
      const { data: affiliateProducts, error } = await supabase
        .from('affiliate_products')
        .select(`
          product_id,
          commission_rate,
          is_visible,
          products!inner (
            id,
            title,
            description,
            price_sar,
            image_urls,
            rating,
            reviews_count,
            stock_quantity,
            is_active
          )
        `)
        .eq('affiliate_store_id', store.id)
        .eq('is_visible', true);

      if (error) throw error;

      const formattedProducts: Product[] = (affiliateProducts || [])
        .map(item => {
          const product = item.products as any;
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            price_sar: product.price_sar,
            image_urls: product.image_urls,
            rating: product.rating,
            reviews_count: product.reviews_count,
            stock_quantity: product.stock_quantity
          };
        })
        .filter(product => product.stock_quantity > 0);

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    if (store?.id) {
      loadProducts();
    }
  }, [store?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground">
            لم يتم إضافة أي منتجات إلى هذا المتجر بعد
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banners */}
      <PromotionalBannerDisplay 
        affiliateStoreId={store?.id}
        bannerType="hero"
        position="top"
      />
      
      {/* Top Strip Banners */}
      <PromotionalBannerDisplay 
        affiliateStoreId={store?.id}
        bannerType="strip"
        position="top"
      />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">منتجات {store?.store_name}</h2>
        <p className="text-muted-foreground">
          تصفح واطلب المنتجات بسهولة ويسر
        </p>
      </div>

      {/* Middle Strip Banners */}
      <PromotionalBannerDisplay 
        affiliateStoreId={store?.id}
        bannerType="strip"
        position="middle"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square overflow-hidden">
              {product.image_urls && product.image_urls[0] ? (
                <img
                  src={product.image_urls[0]}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold line-clamp-2 text-sm">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {product.price_sar} ر.س
                  </span>
                  
                  {product.rating && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating}</span>
                      {product.reviews_count && (
                        <span>({product.reviews_count})</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    متوفر ({product.stock_quantity})
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className="text-xs"
                  >
                    {addingToCart === product.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        أضف للسلة
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Strip Banners */}
      <PromotionalBannerDisplay 
        affiliateStoreId={store?.id}
        bannerType="strip"
        position="bottom"
      />
      
      {/* Floating and Popup Banners (Global) */}
      <PromotionalBannerDisplay 
        affiliateStoreId={store?.id}
        bannerType="popup"
      />
      
      <PromotionalBannerDisplay 
        affiliateStoreId={store?.id}
        bannerType="sidebar"
        position="floating"
      />
    </div>
  );
};