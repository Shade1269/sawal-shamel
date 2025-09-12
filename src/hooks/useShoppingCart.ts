import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from './useFastAuth';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url?: string;
  unit_price_sar: number;
  quantity: number;
  total_price_sar: number;
  shop_id: string;
}

export interface ShoppingCartData {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}

export const useShoppingCart = () => {
  const { profile } = useFastAuth();
  const [cart, setCart] = useState<ShoppingCartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  // Initialize cart
  const initializeCart = useCallback(async () => {
    setLoading(true);
    try {
      let existingCart = null;

      if (profile?.id) {
        // Get user cart
        const { data: userCart } = await supabase
          .from('shopping_carts')
          .select(`
            *,
            cart_items(*)
          `)
          .eq('user_id', profile.id)
          .maybeSingle();

        existingCart = userCart;
      }

      if (!existingCart) {
        // Create new cart
        const cartData: any = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (profile?.id) {
          cartData.user_id = profile.id;
        } else {
          cartData.session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        const { data: newCart, error } = await supabase
          .from('shopping_carts')
          .insert(cartData)
          .select()
          .maybeSingle();

        if (error) throw error;

        existingCart = {
          ...newCart,
          cart_items: []
        };
      }

      setCart({
        ...existingCart,
        items: existingCart.cart_items || []
      });
      setCartId(existingCart.id);

    } catch (error) {
      console.error('Error initializing cart:', error);
      toast.error('حدث خطأ أثناء تحميل عربة التسوق');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, product: any, quantity: number = 1) => {
    if (!cartId) {
      await initializeCart();
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
          cart_id: cartId,
          product_id: productId,
          product_title: product.name || product.title,
          product_image_url: product.image_url,
          unit_price_sar: product.price,
          quantity,
          total_price_sar: product.price * quantity,
          shop_id: product.shop_id || ''
        };

        const { data: createdItem, error } = await supabase
          .from('cart_items')
          .insert(newItem)
          .select()
          .maybeSingle();

        if (error) throw error;

        // Update local state
        setCart(prev => prev ? {
          ...prev,
          items: [...prev.items, {
            ...createdItem,
            product_title: newItem.product_title,
            product_image_url: newItem.product_image_url,
            shop_id: newItem.shop_id
          }]
        } : null);
      }

      toast.success('تم إضافة المنتج إلى العربة');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج');
    } finally {
      setLoading(false);
    }
  }, [cartId, cart, initializeCart]);

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

    const subtotal = cart.items.reduce((sum, item) => sum + item.total_price_sar, 0);
    const itemCount = cart.items.length;
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      itemCount,
      totalItems
    };
  }, [cart]);

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

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