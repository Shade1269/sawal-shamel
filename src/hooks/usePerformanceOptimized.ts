import { useCallback, useRef, useEffect } from 'react';

// Cache مشترك لتجنب التكرار
const globalCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
}

export const usePerformanceOptimized = () => {
  const requestsInFlight = useRef<Set<string>>(new Set());

  // دالة للحصول على البيانات من Cache
  const getCachedData = useCallback((key: string) => {
    const cached = globalCache.get(key) as CacheEntry;
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      globalCache.delete(key);
      return null;
    }
    
    return cached.data;
  }, []);

  // دالة لحفظ البيانات في Cache
  const setCachedData = useCallback((key: string, data: any) => {
    globalCache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }, []);

  // دالة لمنع الطلبات المكررة
  const dedupedFetch = useCallback(async (key: string, fetchFn: () => Promise<any>) => {
    // تحقق من Cache أولاً
    const cached = getCachedData(key);
    if (cached !== null) {
      return cached;
    }

    // تحقق من الطلبات الجارية
    if (requestsInFlight.current.has(key)) {
      // انتظار الطلب الجاري
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!requestsInFlight.current.has(key)) {
            clearInterval(checkInterval);
            const result = getCachedData(key);
            resolve(result);
          }
        }, 50);
      });
    }

    // تسجيل الطلب
    requestsInFlight.current.add(key);

    try {
      const result = await fetchFn();
      setCachedData(key, result);
      return result;
    } catch (error) {
      console.error(`Error in deduped fetch for key ${key}:`, error);
      throw error;
    } finally {
      requestsInFlight.current.delete(key);
    }
  }, [getCachedData, setCachedData]);

  // دالة لمسح cache معين أو الكل
  const clearCache = useCallback((key?: string) => {
    if (key) {
      globalCache.delete(key);
    } else {
      globalCache.clear();
    }
  }, []);

  // تنظيف cache منتهي الصلاحية
  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of globalCache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        globalCache.delete(key);
      }
    }
  }, []);

  // تنظيف دوري للcache
  useEffect(() => {
    const interval = setInterval(cleanupExpiredCache, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, [cleanupExpiredCache]);

  return {
    getCachedData,
    setCachedData,
    dedupedFetch,
    clearCache,
    cleanupExpiredCache,
    // معلومات للdebugging
    getCacheSize: () => globalCache.size,
    getActiveRequests: () => requestsInFlight.current.size
  };
};