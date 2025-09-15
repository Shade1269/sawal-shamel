import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';

interface CartItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface UsePublicStorefrontProps {
  storeSlug: string;
}

export const usePublicStorefront = ({ storeSlug }: UsePublicStorefrontProps) => {
  // Store-specific cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined' && storeSlug) {
      const saved = localStorage.getItem(`cart:${storeSlug}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (storeSlug) {
      localStorage.setItem(`cart:${storeSlug}`, JSON.stringify(cart));
    }
  }, [cart, storeSlug]);

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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!storeSlug
  });

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

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.product_id,
        title: product.products.title,
        price: product.products.price_sar,
        quantity: 1,
        image_url: product.products.image_urls?.[0] || '/placeholder.svg'
      }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
    if (storeSlug) {
      localStorage.removeItem(`cart:${storeSlug}`);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    totalItems
  };
};