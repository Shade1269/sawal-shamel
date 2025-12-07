import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreThemeProvider } from '@/components/store/ThemeProvider';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  bio?: string | null;
  logo_url?: string | null;
  theme: string;
}

export const IsolatedStoreLayout: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart hook for bottom nav
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

  // حساب عدد المنتجات في السلة
  const cartCount = cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <CustomerAuthProvider>
      <StoreThemeProvider storeId={store.id}>
        <Outlet context={{ store }} />
        <BottomNav storeSlug={storeSlug} cartCount={cartCount} />
      </StoreThemeProvider>
    </CustomerAuthProvider>
  );
};