import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from './useFastAuth';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  product_id: string;
  product_title?: string;
  product_image_url?: string;
  unit_price_sar: number;
  quantity: number;
  total_price_sar: number | null;
  shop_id?: string;
  cart_id?: string;
  added_at?: string;
  updated_at?: string;
  selected_variants?: any;
}

export interface ShoppingCartData {
  id: string;
  user_id?: string;
  session_id?: string;
  affiliate_store_id?: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}

export const useShoppingCart = (storeId?: string) => {
  const { profile } = useFastAuth();
  const [cart, setCart] = useState<ShoppingCartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const cartIdRef = useRef<string | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(storeId ?? null);
  const isInitializedRef = useRef(false);
  const lastProfileIdRef = useRef<string | null>(null);

  const resolveStoreContext = useCallback(async () => {
    let resolvedStoreId = storeId ?? null;
    let resolvedSessionId: string | null = null;

    if (!resolvedStoreId && typeof window !== 'undefined') {
      resolvedStoreId = localStorage.getItem('storefront:last-store-id');
    }

    if (!profile?.id && typeof window !== 'undefined') {
      if (resolvedStoreId) {
        resolvedSessionId = localStorage.getItem(`store_session_${resolvedStoreId}`);
      }

      if (!resolvedSessionId) {
        resolvedSessionId = localStorage.getItem('storefront:last-session-id');
      }
    }

    if (!resolvedStoreId && typeof window !== 'undefined') {
      const lastSlug = localStorage.getItem('storefront:last-slug');
      if (lastSlug) {
        try {
          const { data: storeData } = await supabase
            .from('affiliate_stores')
            .select('id')
            .eq('store_slug', lastSlug)
            .eq('is_active', true)
            .maybeSingle();

          if (storeData?.id) {
            resolvedStoreId = storeData.id;
            try {
              localStorage.setItem('storefront:last-store-id', storeData.id);
            } catch (error) {
              console.warn('Unable to persist storefront store id', error);
            }

            if (!resolvedSessionId) {
              resolvedSessionId = localStorage.getItem(`store_session_${storeData.id}`);
            }
          }
        } catch (error) {
          console.warn('Unable to resolve storefront store id from slug', error);
        }
      }
    }

    if (!profile?.id && typeof window !== 'undefined') {
      if (resolvedStoreId && !resolvedSessionId) {
        resolvedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          localStorage.setItem(`store_session_${resolvedStoreId}`, resolvedSessionId);
          localStorage.setItem('storefront:last-session-id', resolvedSessionId);
        } catch (error) {
          console.warn('Unable to persist storefront session', error);
        }
      }

      if (!resolvedStoreId && !resolvedSessionId) {
        resolvedSessionId = localStorage.getItem('storefront:last-session-id');
      }
    }

    return { storeId: resolvedStoreId, sessionId: resolvedSessionId };
  }, [profile?.id, storeId]);

  // Initialize cart with store support
  const initializeCart = useCallback(async () => {
    setLoading(true);
    try {
      let existingCart = null;

      const { storeId: resolvedStoreId, sessionId } = await resolveStoreContext();

      if (profile?.id) {
        // Get user cart for specific store if provided
        let query = supabase
          .from('shopping_carts')
          .select(`
            *,
            cart_items(*)
          `)
          .eq('user_id', profile.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (resolvedStoreId) {
          query = query.eq('affiliate_store_id', resolvedStoreId);
        }

        const { data: userCart } = await query.maybeSingle();
        existingCart = userCart;
      } else if (sessionId) {
        let query = supabase
          .from('shopping_carts')
          .select(`
            *,
            cart_items(*)
          `)
          .eq('session_id', sessionId)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (resolvedStoreId) {
          query = query.eq('affiliate_store_id', resolvedStoreId);
        }

        const { data: sessionCart } = await query.maybeSingle();
        existingCart = sessionCart;
      }

      if (!existingCart) {
        // Create new cart with store support
        const cartData: any = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (profile?.id) {
          cartData.user_id = profile.id;
        } else if (sessionId) {
          cartData.session_id = sessionId;
        } else {
          const fallbackSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          cartData.session_id = fallbackSession;

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('storefront:last-session-id', fallbackSession);
            } catch (error) {
              console.warn('Unable to persist fallback storefront session', error);
            }
          }
        }

        if (resolvedStoreId) {
          cartData.affiliate_store_id = resolvedStoreId;
        } else if (storeId) {
          cartData.affiliate_store_id = storeId;
        }

        const { data: newCart, error } = await supabase
          .from('shopping_carts')
          .insert(cartData)
          .select(`
            *,
            cart_items(*)
          `)
          .maybeSingle();

        if (error) throw error;

        existingCart = {
          ...newCart,
          cart_items: newCart?.cart_items ?? []
        };
      }

      if (existingCart) {
        const rawItems = existingCart.cart_items || [];
        const items: CartItem[] = rawItems.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_title: item.product_title || 'منتج',
          product_image_url: item.product_image_url,
          unit_price_sar: item.unit_price_sar,
          quantity: item.quantity,
          total_price_sar: item.total_price_sar ?? 0,
          shop_id: item.shop_id || '',
          cart_id: item.cart_id,
          added_at: item.added_at,
          updated_at: item.updated_at,
          selected_variants: item.selected_variants
        }));

        setCart({
          id: existingCart.id ?? '',
          user_id: existingCart.user_id ?? undefined,
          session_id: existingCart.session_id ?? undefined,
          affiliate_store_id: existingCart.affiliate_store_id ?? undefined,
          created_at: existingCart.created_at ?? new Date().toISOString(),
          updated_at: existingCart.updated_at ?? new Date().toISOString(),
          items
        });
        setCartId(existingCart.id ?? null);
        cartIdRef.current = existingCart.id ?? null;
        setActiveStoreId(existingCart.affiliate_store_id ?? resolvedStoreId ?? storeId ?? null);

        if (typeof window !== 'undefined') {
          try {
            if (existingCart.session_id) {
              localStorage.setItem('storefront:last-session-id', existingCart.session_id);
              if (existingCart.affiliate_store_id) {
                localStorage.setItem(`store_session_${existingCart.affiliate_store_id}`, existingCart.session_id);
              }
            }
            if (existingCart.affiliate_store_id) {
              localStorage.setItem('storefront:last-store-id', existingCart.affiliate_store_id);
            }
            localStorage.setItem('storefront:last-cart-id', existingCart.id ?? '');
          } catch (error) {
            console.warn('Unable to persist shopping cart context', error);
          }
        }
      }

    } catch (error) {
      console.error('Error initializing cart:', error);
      toast.error('حدث خطأ أثناء تحميل عربة التسوق');
    } finally {
      setLoading(false);
    }
  }, [profile, resolveStoreContext, storeId]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, product: any, quantity: number = 1) => {
    let targetCartId = cartIdRef.current;

    if (!targetCartId) {
      await initializeCart();
      targetCartId = cartIdRef.current;
    }

    if (!targetCartId) {
      toast.error('تعذر تجهيز العربة، حاول مرة أخرى');
      return;
    }

    setLoading(true);
    try {
      const existingItem = cart?.items.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = newQuantity * existingItem.unit_price_sar;

        const { error } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price_sar: newTotalPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) throw error;

        // Update local state
        setCart(prev => prev ? {
          ...prev,
          items: prev.items.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity, total_price_sar: newTotalPrice }
              : item
          )
        } : null);
      } else {
        // Add new item
        const newItem = {
          cart_id: targetCartId,
          product_id: productId,
          quantity,
          unit_price_sar: product.price,
          total_price_sar: product.price * quantity,
        };

        const { data: createdItem, error } = await supabase
          .from('cart_items')
          .insert(newItem)
          .select()
          .maybeSingle();

        if (error) throw error;

        // Update local state
        if (createdItem) {
          const newItem: CartItem = {
            id: createdItem.id,
            product_id: createdItem.product_id,
            product_title: product.name || product.title || 'منتج',
            product_image_url: product.image_url,
            unit_price_sar: createdItem.unit_price_sar,
            quantity: createdItem.quantity,
            total_price_sar: createdItem.total_price_sar ?? 0,
            shop_id: product.shop_id || activeStoreId || '',
            cart_id: createdItem.cart_id,
            added_at: createdItem.added_at,
            updated_at: createdItem.updated_at,
            selected_variants: createdItem.selected_variants
          };
          setCart(prev => prev ? {
            ...prev,
            items: [...prev.items, newItem]
          } : null);
        }
      }

      toast.success('تم إضافة المنتج إلى العربة');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج');
    } finally {
      setLoading(false);
    }
  }, [activeStoreId, cart, initializeCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeFromCart(itemId);
    }

    setLoading(true);
    try {
      const item = cart?.items.find(i => i.id === itemId);
      if (!item) return;

      const newTotalPrice = newQuantity * item.unit_price_sar;

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          total_price_sar: newTotalPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      setCart(prev => prev ? {
        ...prev,
        items: prev.items.map(i => 
          i.id === itemId 
            ? { ...i, quantity: newQuantity, total_price_sar: newTotalPrice }
            : i
        )
      } : null);

    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('حدث خطأ أثناء تحديث الكمية');
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCart(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      } : null);

      toast.success('تم حذف المنتج من العربة');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!cartId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;

      setCart(prev => prev ? { ...prev, items: [] } : null);
      toast.success('تم إفراغ العربة');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('حدث خطأ أثناء إفراغ العربة');
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  // Get cart totals
  const getCartTotals = useCallback(() => {
    if (!cart?.items.length) {
      return {
        subtotal: 0,
        itemCount: 0,
        totalItems: 0
      };
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.total_price_sar ?? 0), 0);
    const itemCount = cart.items.length;
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      itemCount,
      totalItems
    };
  }, [cart]);

  // Initialize cart on mount or when profile changes
  useEffect(() => {
    const currentProfileId = profile?.id ?? null;

    // Skip if already initialized with the same profile
    if (isInitializedRef.current && lastProfileIdRef.current === currentProfileId) {
      return;
    }

    // Re-initialize if profile changed (e.g., user logged in/out)
    isInitializedRef.current = true;
    lastProfileIdRef.current = currentProfileId;
    initializeCart();
  }, [profile?.id, initializeCart]);

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotals: getCartTotals(),
    initializeCart
  };
};