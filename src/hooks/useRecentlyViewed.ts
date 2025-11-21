import { useState, useEffect } from 'react';

/**
 * 👁️ Hook لإدارة المنتجات المشاهدة مؤخراً
 *
 * يحفظ آخر 10 منتجات شاهدها المستخدم في localStorage
 * ويوفر دوال لإضافة وإزالة المنتجات
 */

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  store_slug?: string;
  category?: string;
  viewedAt: number; // timestamp
}

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [viewedProducts, setViewedProducts] = useState<RecentlyViewedProduct[]>([]);

  // تحميل المنتجات من localStorage عند التهيئة
  useEffect(() => {
    loadFromStorage();
  }, []);

  /**
   * تحميل المنتجات من localStorage
   */
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setViewedProducts(parsed);
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    }
  };

  /**
   * حفظ المنتجات في localStorage
   */
  const saveToStorage = (products: RecentlyViewedProduct[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving recently viewed products:', error);
    }
  };

  /**
   * إضافة منتج للمنتجات المشاهدة مؤخراً
   */
  const addProduct = (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    const newProduct: RecentlyViewedProduct = {
      ...product,
      viewedAt: Date.now(),
    };

    setViewedProducts((prev) => {
      // إزالة المنتج إذا كان موجوداً مسبقاً
      const filtered = prev.filter((p) => p.id !== product.id);

      // إضافة المنتج في البداية
      const updated = [newProduct, ...filtered];

      // الاحتفاظ بآخر MAX_ITEMS منتجات فقط
      const limited = updated.slice(0, MAX_ITEMS);

      // حفظ في localStorage
      saveToStorage(limited);

      return limited;
    });
  };

  /**
   * إزالة منتج من المنتجات المشاهدة مؤخراً
   */
  const removeProduct = (productId: string) => {
    setViewedProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== productId);
      saveToStorage(filtered);
      return filtered;
    });
  };

  /**
   * مسح جميع المنتجات المشاهدة مؤخراً
   */
  const clearAll = () => {
    setViewedProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * التحقق من وجود منتج في القائمة
   */
  const hasProduct = (productId: string): boolean => {
    return viewedProducts.some((p) => p.id === productId);
  };

  return {
    viewedProducts,
    addProduct,
    removeProduct,
    clearAll,
    hasProduct,
    count: viewedProducts.length,
  };
}
