import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  productClicks: number;
  totalOrders: number;
  totalSales: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    clicks: number;
    sales: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export const useStoreAnalytics = (storeId: string) => {
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      // جلب إحصائيات المتجر من جدول affiliate_stores
      const { data: storeData, error: storeError } = await supabase
        .from('affiliate_stores')
        .select('total_orders, total_sales')
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;

      // جلب إحصائيات التحليلات المتقدمة
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('advanced_analytics_events')
        .select('*')
        .eq('affiliate_store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (analyticsError) throw analyticsError;

      // حساب الإحصائيات
      const totalViews = analyticsData?.filter(event => event.event_type === 'page_view').length || 0;
      const uniqueVisitors = new Set(analyticsData?.map(event => event.session_id)).size || 0;
      const productClicks = analyticsData?.filter(event => event.event_type === 'product_click').length || 0;

      const totalOrders = storeData.total_orders ?? 0;
      const totalSales = storeData.total_sales ?? 0;
      const conversionRate = totalViews > 0 ? (totalOrders / totalViews * 100) : 0;
      const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders) : 0;

      // تجميع البيانات
      const analyticsResult: StoreAnalytics = {
        totalViews,
        uniqueVisitors,
        productClicks,
        totalOrders: storeData.total_orders || 0,
        totalSales: storeData.total_sales || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        topProducts: [], // سيتم تطويره لاحقاً
        recentActivity: analyticsData?.slice(0, 10).map(event => ({
          type: event.event_type,
          description: `${event.event_name} - ${event.page_url}`,
          timestamp: event.created_at
        })) || []
      };

      setAnalytics(analyticsResult);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (eventType: string, eventName: string, eventData: any = {}) => {
    try {
      await supabase
        .from('advanced_analytics_events')
        .insert({
          affiliate_store_id: storeId,
          event_type: eventType,
          event_name: eventName,
          event_data: eventData,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          session_id: sessionStorage.getItem('session_id') || Math.random().toString(36)
        });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [storeId]);

  return {
    analytics,
    loading,
    trackEvent,
    refetch: fetchAnalytics
  };
};