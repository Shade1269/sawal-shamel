import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { StoreThemeProvider } from '@/components/store/ThemeProvider';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  bio?: string;
  logo_url?: string;
  theme: string;
}

export const IsolatedStoreLayout: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { cart } = useIsolatedStoreCart(store?.id || '');

  const loadStore = async () => {
    if (!storeSlug) {
      setError('رابط المتجر غير صحيح');
      setLoading(false);
      return;
    }

    try {
      const { data: storeData, error: storeError } = await supabase
        .from('affiliate_stores')
        .select('id, store_name, store_slug, bio, logo_url, theme')
        .eq('store_slug', storeSlug)
        .eq('is_active', true)
        .single();

      if (storeError || !storeData) {
        setError('المتجر غير موجود أو غير متاح');
        setLoading(false);
        return;
      }

      setStore(storeData);
    } catch (err) {
      console.error('Error loading store:', err);
      setError('خطأ في تحميل المتجر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [storeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">المتجر غير متاح</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const cartItemsCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <StoreThemeProvider storeId={store.id}>
      <div className="min-h-screen bg-background">
        {/* Store Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {store.logo_url && (
                  <img
                    src={store.logo_url}
                    alt={store.store_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold">{store.store_name}</h1>
                  {store.bio && (
                    <p className="text-sm text-muted-foreground">{store.bio}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/store/${storeSlug}/orders`)}
                  className="hidden sm:flex"
                >
                  <Package className="h-4 w-4 mr-2" />
                  طلباتي
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/store/${storeSlug}/cart`)}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  السلة
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Store Content */}
        <main className="container mx-auto px-4 py-6">
          <Outlet context={{ store, cart }} />
        </main>

        {/* Floating Cart Button (Mobile) */}
        {cartItemsCount > 0 && (
          <div className="fixed bottom-4 right-4 sm:hidden">
            <Button
              onClick={() => navigate(`/store/${storeSlug}/cart`)}
              className="rounded-full h-14 w-14 shadow-lg"
            >
              <ShoppingCart className="h-6 w-6" />
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {cartItemsCount}
              </Badge>
            </Button>
          </div>
        )}
      </div>
    </StoreThemeProvider>
  );
};