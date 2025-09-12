import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Cache للبيانات المُحمّلة
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

interface CachedData {
  data: any;
  timestamp: number;
}

export const useOptimizedDataFetch = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // دالة للحصول على البيانات من Cache
  const getCachedData = useCallback((key: string): any | null => {
    const cached = dataCache.get(key) as CachedData;
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      dataCache.delete(key);
      return null;
    }
    
    return cached.data;
  }, []);

  // دالة لحفظ البيانات في Cache
  const setCachedData = useCallback((key: string, data: any) => {
    dataCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // دالة محسّنة لجلب بيانات المسوق
  const fetchAffiliateData = useCallback(async (profileId: string) => {
    const cacheKey = `affiliate-${profileId}`;
    
    // التحقق من Cache أولاً
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    setLoading(true);
    
    try {
      // جلب بيانات المتجر
      const { data: stores, error: storesError } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (storesError) {
        throw storesError;
      }

      const storeData = Array.isArray(stores) ? stores[0] : null;


      const result = {
        store: storeData,
        products: [],
        commissions: [],
        activities: [],
        stats: {
          totalCommissions: 0,
          thisMonthCommissions: 0,
          totalSales: storeData?.total_sales || 0,
          activeProducts: 0,
          weeklyProgress: 0
        }
      };

      // جلب البيانات المرتبطة فقط إذا وجد المتجر
      if (storeData?.id) {
        const requests = await Promise.allSettled([
          supabase
            .from('affiliate_products')
            .select('*, products (*)')
            .eq('affiliate_store_id', storeData.id)
            .eq('is_visible', true),
          supabase
            .from('commissions')
            .select('*')
            .eq('affiliate_id', profileId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', profileId)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        // معالجة النتائج
        if (requests[0].status === 'fulfilled' && !requests[0].value.error) {
          result.products = requests[0].value.data || [];
          result.stats.activeProducts = result.products.length;
        }

        if (requests[1].status === 'fulfilled' && !requests[1].value.error) {
          result.commissions = requests[1].value.data || [];
          
          // حساب الإحصائيات
          const totalCommissions = result.commissions.reduce((sum: number, c: any) => sum + (c.amount_sar || 0), 0);
          const thisMonth = new Date();
          thisMonth.setDate(1);
          const thisMonthCommissions = result.commissions
            .filter((c: any) => new Date(c.created_at) >= thisMonth)
            .reduce((sum: number, c: any) => sum + (c.amount_sar || 0), 0);

          result.stats.totalCommissions = totalCommissions;
          result.stats.thisMonthCommissions = thisMonthCommissions;
          result.stats.weeklyProgress = (thisMonthCommissions / 5000) * 100;
        }

        if (requests[2].status === 'fulfilled' && !requests[2].value.error) {
          result.activities = requests[2].value.data || [];
        }
      }

      // حفظ في Cache
      setCachedData(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات المسوق",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, toast]);

  // دالة لمسح Cache عند الحاجة
  const clearCache = useCallback((key?: string) => {
    if (key) {
      dataCache.delete(key);
    } else {
      dataCache.clear();
    }
  }, []);

  // دالة محسّنة لإنشاء المتجر
  const createAffiliateStore = useCallback(async (profileId: string, storeData: any) => {
    try {
      setLoading(true);
      
      const { data: newStoreId, error } = await supabase
        .rpc('create_affiliate_store', {
          p_store_name: storeData.store_name,
          p_bio: storeData.bio || null,
          p_store_slug: storeData.store_slug
        });

      if (error) throw error;

      // مسح Cache بعد إنشاء متجر جديد
      clearCache(`affiliate-${profileId}`);
      
      return newStoreId;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearCache]);

  return {
    loading,
    fetchAffiliateData,
    createAffiliateStore,
    clearCache
  };
};