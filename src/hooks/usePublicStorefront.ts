import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { useIsolatedStoreCart } from './useIsolatedStoreCart';
import { StorefrontSession } from '@/utils/storefrontSession';

interface UsePublicStorefrontProps {
  storeSlug: string;
}

export const usePublicStorefront = ({ storeSlug }: UsePublicStorefrontProps) => {
  const [sessionManager] = useState(() => new StorefrontSession(storeSlug));
  const [customerSession, setCustomerSession] = useState(() => sessionManager.getSession());

  // Fetch store data
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['public-store', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      
      const { data, error } = await supabasePublic
        .from('affiliate_stores')
        .select('*')
        .eq('store_slug', storeSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!storeSlug
  });

  // Use isolated cart for public storefront
  const {
    cart: cartData,
    loading: cartLoading,
    addToCart: addToCartDB,
    updateQuantity: updateQuantityDB,
    clearCart: clearCartDB,
    refetch: refetchCart
  } = useIsolatedStoreCart(store?.id || '');

  // Fetch store products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['public-products', store?.id],
    queryFn: async () => {
      if (!store) return [];
      
      const { data, error } = await supabasePublic
        .from('affiliate_products')
        .select(`
          *,
          products (
            id,
            title,
            price_sar,
            image_urls,
            description
          )
        `)
        .eq('affiliate_store_id', store.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!store
  });

  // Convert isolated cart to localStorage-compatible format for compatibility
  const cart = cartData?.items.map(item => ({
    product_id: item.product_id,
    title: item.product_title,
    price: item.unit_price_sar,
    quantity: item.quantity,
    image_url: item.product_image_url || '/placeholder.svg'
  })) || [];

  const addToCart = (product: any) => {
    if (!store?.id) return;
    
    addToCartDB(product.product_id);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cartData?.items.find(item => item.product_id === productId);
    if (item) {
      updateQuantityDB(item.id, newQuantity);
    }
  };

  const clearCart = () => {
    clearCartDB();
  };

  const totalAmount = cartData?.total || 0;
  const totalItems = cartData?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Initialize guest session if needed
  useEffect(() => {
    if (store && !customerSession) {
      const guestSession = sessionManager.createGuestSession(store.id);
      setCustomerSession(guestSession);
    }
  }, [store, customerSession, sessionManager]);

  // Customer authentication methods
  const setCustomerVerified = (customerData: { 
    phone: string; 
    name?: string; 
    email?: string; 
    sessionId: string;
  }) => {
    sessionManager.verifySession(customerData.phone, customerData.name, customerData.email);
    setCustomerSession(sessionManager.getSession());
  };

  const isCustomerAuthenticated = () => {
    return customerSession?.isVerified || false;
  };

  const getCustomerInfo = () => {
    return customerSession ? {
      phone: customerSession.phone,
      name: customerSession.name,
      email: customerSession.email,
      sessionId: customerSession.sessionId
    } : null;
  };

  return {
    store,
    products,
    cart,
    storeLoading,
    productsLoading,
    storeError,
    addToCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
    // Enhanced session management
    customerSession,
    setCustomerVerified,
    isCustomerAuthenticated,
    getCustomerInfo,
    sessionManager
  };
};