import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const WISHLIST_KEY = 'store_wishlist';

interface WishlistItem {
  productId: string;
  addedAt: number;
}

export const useWishlist = (storeId: string) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getStorageKey = useCallback(() => `${WISHLIST_KEY}_${storeId}`, [storeId]);

  // تحميل المفضلة من localStorage
  useEffect(() => {
    if (!storeId) return;
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, [storeId, getStorageKey]);

  // حفظ المفضلة في localStorage
  const saveWishlist = useCallback((items: WishlistItem[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }, [getStorageKey]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.productId === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((productId: string) => {
    setLoading(true);
    
    try {
      if (isInWishlist(productId)) {
        // إزالة من المفضلة
        const updated = wishlist.filter(item => item.productId !== productId);
        setWishlist(updated);
        saveWishlist(updated);
        toast.success('تم إزالة المنتج من المفضلة');
      } else {
        // إضافة للمفضلة
        const newItem: WishlistItem = {
          productId,
          addedAt: Date.now()
        };
        const updated = [...wishlist, newItem];
        setWishlist(updated);
        saveWishlist(updated);
        toast.success('تم إضافة المنتج للمفضلة');
      }
    } finally {
      setLoading(false);
    }
  }, [wishlist, isInWishlist, saveWishlist]);

  const addToWishlist = useCallback((productId: string) => {
    if (!isInWishlist(productId)) {
      toggleWishlist(productId);
    }
  }, [isInWishlist, toggleWishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (isInWishlist(productId)) {
      toggleWishlist(productId);
    }
  }, [isInWishlist, toggleWishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    saveWishlist([]);
    toast.success('تم مسح قائمة المفضلة');
  }, [saveWishlist]);

  const getWishlistProductIds = useCallback(() => {
    return wishlist.map(item => item.productId);
  }, [wishlist]);

  return {
    wishlist,
    loading,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    getWishlistProductIds,
    wishlistCount: wishlist.length
  };
};
