import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Cart = { id: string; session_id: string };
type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number | null;
  selected_variants?: any;
};

const mapCartItem = (item: any): CartItem => ({
  ...item,
  total_price_sar: item.total_price_sar ?? item.unit_price_sar * item.quantity
});

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    setLoading(true);
    const { data: carts, error: cartError } = await supabase
      .from('shopping_carts')
      .select('*')
      .limit(1);
    if (cartError) {
      setLoading(false);
      throw cartError;
    }
    let current = carts?.[0] as Cart | undefined;
    if (!current) {
      const { data, error } = await supabase
        .from('shopping_carts')
        .insert({})
        .select()
        .single();
      if (error) {
        setLoading(false);
        throw error;
      }
      current = data as Cart;
    }
    setCart(current);
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', current.id);
    if (itemsError) {
      setLoading(false);
      throw itemsError;
    }
    setItems((cartItems || []).map(item => ({
      ...item,
      total_price_sar: item.total_price_sar ?? item.unit_price_sar * item.quantity
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart().catch(console.error);
  }, [loadCart]);

  const addItem = useCallback(
    async (product_id: string, unit_price_sar: number, quantity = 1) => {
      if (!cart) return;
      const existing = items.find((item) => item.product_id === product_id);
      if (existing) {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) =>
          prev.map((item) => (item.id === existing.id ? mapCartItem(data) : item))
        );
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ cart_id: cart.id, product_id, quantity, unit_price_sar })
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => [...prev, mapCartItem(data)]);
      }
    },
    [cart, items]
  );

  const updateQuantity = useCallback(async (item_id: string, quantity: number) => {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', item_id)
      .select()
      .single();
    if (error) throw error;
    setItems((prev) =>
      prev.map((item) => (item.id === item_id ? mapCartItem(data) : item))
    );
  }, []);

  const removeItem = useCallback(async (item_id: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', item_id);
    if (error) throw error;
    setItems((prev) => prev.filter((item) => item.id !== item_id));
  }, []);

  const clearCart = useCallback(async () => {
    if (!cart) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);
    if (error) throw error;
    setItems([]);
  }, [cart]);

  const total = items.reduce((sum, item) => sum + item.unit_price_sar * item.quantity, 0);

  return {
    loading,
    cart,
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    total,
  };
}
