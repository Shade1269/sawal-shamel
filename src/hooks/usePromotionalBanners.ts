import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromotionalBanner {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  banner_type: 'hero' | 'sidebar' | 'popup' | 'strip';
  position: 'top' | 'middle' | 'bottom' | 'floating';
  priority: number;
  
  content_config: any;
  image_url?: string;
  background_color: string;
  text_color: string;
  button_text?: string;
  button_text_ar?: string;
  button_url?: string;
  button_color: string;
  
  target_audience: any;
  display_conditions: any;
  max_impressions?: number;
  current_impressions: number;
  max_clicks?: number;
  current_clicks: number;
  
  start_date?: string;
  end_date?: string;
  timezone: string;
  
  is_active: boolean;
  auto_hide_after_interaction: boolean;
  show_close_button: boolean;
  animation_type: 'fade' | 'slide' | 'scale' | 'bounce';
  
  store_id?: string;
  affiliate_store_id?: string;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BannerAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click Through Rate
  conversionRate: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
}

export const usePromotionalBanners = (storeId?: string, affiliateStoreId?: string) => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Record<string, BannerAnalytics>>({});
  const { toast } = useToast();

  // جلب البانرات
  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('promotional_banners')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      if (affiliateStoreId) {
        query = query.eq('affiliate_store_id', affiliateStoreId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setBanners((data || []) as PromotionalBanner[]);
    } catch (error) {
      console.error('خطأ في جلب البانرات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب البانرات الترويجية',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [storeId, affiliateStoreId, toast]);

  // جلب البانرات النشطة للعرض العام
  const fetchActiveBanners = useCallback(async (bannerType?: string, position?: string) => {
    try {
      let query = supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      // فلتر حسب التواريخ
      const now = new Date().toISOString();
      query = query.or(`start_date.is.null,start_date.lte.${now}`)
                  .or(`end_date.is.null,end_date.gte.${now}`);

      if (bannerType) {
        query = query.eq('banner_type', bannerType);
      }
      if (position) {
        query = query.eq('position', position);
      }
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      if (affiliateStoreId) {
        query = query.eq('affiliate_store_id', affiliateStoreId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('خطأ في جلب البانرات النشطة:', error);
      return [];
    }
  }, [storeId, affiliateStoreId]);

  // إنشاء بانر جديد
  const createBanner = useCallback(async (bannerData: Partial<PromotionalBanner>) => {
    try {
      setIsLoading(true);
      
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('promotional_banners')
        .insert({
          title: bannerData.title || 'بانر جديد',
          banner_type: bannerData.banner_type || 'hero',
          position: bannerData.position || 'top',
          priority: bannerData.priority || 1,
          background_color: bannerData.background_color || '#000000',
          text_color: bannerData.text_color || '#ffffff',
          button_color: bannerData.button_color || '#ffffff',
          timezone: bannerData.timezone || 'Asia/Riyadh',
          animation_type: bannerData.animation_type || 'fade',
          ...bannerData,
          affiliate_store_id: affiliateStoreId,
          created_by: user.data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setBanners(prev => [data as PromotionalBanner, ...prev]);
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء البانر الترويجي بنجاح',
        variant: 'default'
      });

      return data;
    } catch (error) {
      console.error('خطأ في إنشاء البانر:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء البانر الترويجي',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storeId, affiliateStoreId, toast]);

  // تحديث بانر
  const updateBanner = useCallback(async (id: string, updates: Partial<PromotionalBanner>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('promotional_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBanners(prev => prev.map(banner => 
        banner.id === id ? { ...banner, ...(data as PromotionalBanner) } : banner
      ));
      
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث البانر بنجاح',
        variant: 'default'
      });

      return data;
    } catch (error) {
      console.error('خطأ في تحديث البانر:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث البانر',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // حذف بانر
  const deleteBanner = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('promotional_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBanners(prev => prev.filter(banner => banner.id !== id));
      
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف البانر بنجاح',
        variant: 'default'
      });

      return true;
    } catch (error) {
      console.error('خطأ في حذف البانر:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف البانر',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // تسجيل تفاعل مع البانر
  const trackBannerInteraction = useCallback(async (
    bannerId: string, 
    eventType: 'impression' | 'click' | 'close' | 'conversion',
    metadata: any = {}
  ) => {
    try {
      // تسجيل الحدث في التحليلات
      await supabase
        .from('banner_analytics')
        .insert({
          banner_id: bannerId,
          event_type: eventType,
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          page_url: window.location.href,
          referrer_url: document.referrer,
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser_type: navigator.userAgent.split(' ').pop() || 'unknown',
          metadata
        });

      // تحديث الإحصائيات في البانر
      if (eventType === 'impression') {
        await supabase
          .from('promotional_banners')
          .update({ 
            current_impressions: banners.find(b => b.id === bannerId)?.current_impressions + 1 || 1 
          })
          .eq('id', bannerId);
      } else if (eventType === 'click') {
        await supabase
          .from('promotional_banners')
          .update({ 
            current_clicks: banners.find(b => b.id === bannerId)?.current_clicks + 1 || 1 
          })
          .eq('id', bannerId);
      }
    } catch (error) {
      console.error('خطأ في تتبع التفاعل:', error);
    }
  }, []);

  // جلب تحليلات البانر
  const fetchBannerAnalytics = useCallback(async (bannerId: string, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('banner_analytics')
        .select('*')
        .eq('banner_id', bannerId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // معالجة البيانات لحساب الإحصائيات
      const impressions = data.filter(d => d.event_type === 'impression').length;
      const clicks = data.filter(d => d.event_type === 'click').length;
      const conversions = data.filter(d => d.event_type === 'conversion').length;
      
      const analytics: BannerAnalytics = {
        impressions,
        clicks,
        conversions,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        topPages: [],
        deviceBreakdown: []
      };

      // حساب أكثر الصفحات مشاهدة
      const pageViews = data.reduce((acc: any, item) => {
        const page = item.page_url || 'غير معروف';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {});

      analytics.topPages = Object.entries(pageViews)
        .map(([page, views]) => ({ page, views: views as number }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // حساب توزيع الأجهزة
      const deviceCounts = data.reduce((acc: any, item) => {
        const device = item.device_type || 'غير معروف';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      analytics.deviceBreakdown = Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count: count as number }));

      setAnalytics(prev => ({ ...prev, [bannerId]: analytics }));
      return analytics;
    } catch (error) {
      console.error('خطأ في جلب تحليلات البانر:', error);
      return null;
    }
  }, []);

  // تحميل البيانات عند التهيئة
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return {
    banners,
    isLoading,
    analytics,
    fetchBanners,
    fetchActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    trackBannerInteraction,
    fetchBannerAnalytics
  };
};