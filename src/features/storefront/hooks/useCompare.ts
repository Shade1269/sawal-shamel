import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const COMPARE_KEY = 'store_compare';
const MAX_COMPARE_ITEMS = 4;

export const useCompare = (storeId: string) => {
  const [compareList, setCompareList] = useState<string[]>([]);

  const getStorageKey = useCallback(() => `${COMPARE_KEY}_${storeId}`, [storeId]);

  // تحميل قائمة المقارنة من localStorage
  useEffect(() => {
    if (!storeId) return;
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading compare list:', error);
    }
  }, [storeId, getStorageKey]);

  // حفظ قائمة المقارنة في localStorage
  const saveCompareList = useCallback((items: string[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
    } catch (error) {
      console.error('Error saving compare list:', error);
    }
  }, [getStorageKey]);

  const isInCompare = useCallback((productId: string) => {
    return compareList.includes(productId);
  }, [compareList]);

  const toggleCompare = useCallback((productId: string) => {
    if (isInCompare(productId)) {
      // إزالة من المقارنة
      const updated = compareList.filter(id => id !== productId);
      setCompareList(updated);
      saveCompareList(updated);
      toast.success('تم إزالة المنتج من المقارنة');
    } else {
      // التحقق من الحد الأقصى
      if (compareList.length >= MAX_COMPARE_ITEMS) {
        toast.error(`يمكنك مقارنة ${MAX_COMPARE_ITEMS} منتجات كحد أقصى`);
        return;
      }
      // إضافة للمقارنة
      const updated = [...compareList, productId];
      setCompareList(updated);
      saveCompareList(updated);
      toast.success('تم إضافة المنتج للمقارنة');
    }
  }, [compareList, isInCompare, saveCompareList]);

  const addToCompare = useCallback((productId: string) => {
    if (!isInCompare(productId) && compareList.length < MAX_COMPARE_ITEMS) {
      toggleCompare(productId);
    }
  }, [isInCompare, compareList.length, toggleCompare]);

  const removeFromCompare = useCallback((productId: string) => {
    if (isInCompare(productId)) {
      const updated = compareList.filter(id => id !== productId);
      setCompareList(updated);
      saveCompareList(updated);
    }
  }, [isInCompare, compareList, saveCompareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    saveCompareList([]);
    toast.success('تم مسح قائمة المقارنة');
  }, [saveCompareList]);

  return {
    compareList,
    compareCount: compareList.length,
    isInCompare,
    toggleCompare,
    addToCompare,
    removeFromCompare,
    clearCompare,
    maxItems: MAX_COMPARE_ITEMS,
    canAddMore: compareList.length < MAX_COMPARE_ITEMS
  };
};
