import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { useShoppingCart } from './useShoppingCart';

interface UsePublicStorefrontProps {
  storeSlug: string;
}

export const usePublicStorefront = ({ storeSlug }: UsePublicStorefrontProps) => {
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

  // Use database-backed cart with store ID
  const {
    cart: cartData,
    loading: cartLoading,
    addToCart: addToCartDB,
    updateQuantity: updateQuantityDB,
    clearCart: clearCartDB,
    getCartTotals
  } = useShoppingCart(store?.id);

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

  // Convert DB cart to localStorage-compatible format for compatibility
  const cart = cartData?.items.map(item => ({
    product_id: item.product_id,
    title: item.product_title,
    price: item.unit_price_sar,
    quantity: item.quantity,
    image_url: item.product_image_url || '/placeholder.svg'
  })) || [];

  const addToCart = (product: any) => {
    if (!store?.id) return;
    
    addToCartDB(product.product_id, {
      name: product.products.title,
      title: product.products.title,
      price: product.products.price_sar,
      image_url: product.products.image_urls?.[0] || '/placeholder.svg',
      shop_id: store.id
    });
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

  const totalAmount = getCartTotals.subtotal;
  const totalItems = getCartTotals.totalItems;

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