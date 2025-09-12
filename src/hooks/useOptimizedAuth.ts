import { useMemo } from 'react';
import { useFastAuth } from './useFastAuth';
import { useOptimizedDataFetch } from './useOptimizedDataFetch';

/**
 * Hook محسّن يجمع المصادقة وجلب البيانات بطريقة محسّنة
 * يستخدم caching ويقلل من استدعاءات قاعدة البيانات
 */
export const useOptimizedAuth = () => {
  const auth = useFastAuth();
  const dataFetch = useOptimizedDataFetch();

  // دالة موحدة لجلب بيانات المستخدم حسب دوره
  const fetchUserData = useMemo(() => {
    return async (forceRefresh = false) => {
      if (!auth.profile?.id) return null;
      
      switch (auth.profile.role) {
        case 'affiliate':
          return await dataFetch.fetchAffiliateData(auth.profile.id);
        default:
          return null;
      }
    };
  }, [auth.profile?.id, auth.profile?.role, dataFetch.fetchAffiliateData]);

  // دالة لمسح جميع الcaches
  const clearAllCaches = useMemo(() => {
    return () => {
      auth.clearCache();
      dataFetch.clearCache();
    };
  }, [auth.clearCache, dataFetch.clearCache]);

  return {
    // بيانات المصادقة
    ...auth,
    
    // دوال جلب البيانات المحسّنة
    fetchUserData,
    optimizedDataFetch: dataFetch,
    
    // أدوات إضافية
    clearAllCaches,
    
    // حالة التحميل الشاملة
    isLoading: auth.loading || dataFetch.loading
  };
};