import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface StoreSettings {
  id?: string;
  store_id: string;
  hero_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_description?: string | null;
  hero_cta_text?: string | null;
  hero_cta_color?: string | null;
  category_display_style?: string | null;
  featured_categories?: Json;
  store_analytics?: Json;
}

export const useStoreSettings = (storeId: string) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('affiliate_store_settings')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching store settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل إعدادات المتجر",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    if (!storeId) return false;

    try {
      const { data, error } = await supabase
        .from('affiliate_store_settings')
        .upsert({
          store_id: storeId,
          ...updates
        }, {
          onConflict: 'store_id'
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح"
      });
      return true;
    } catch (error: any) {
      console.error('Error updating store settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive"
      });
      return false;
    }
  };

  const uploadImage = async (file: File, path: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const fileName = `${user.user.id}/${path}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(data.path);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [storeId]);

  return {
    settings,
    loading,
    updateSettings,
    uploadImage,
    refetch: fetchSettings,
    // Compatibility aliases for other components
    data: settings,
    isLoading: loading
  };
};

// Helper functions for payment and shipping methods
export const getEnabledPaymentMethods = (settings: StoreSettings | null) => {
  if (!settings?.store_analytics) return [];
  const analytics = typeof settings.store_analytics === 'string' 
    ? JSON.parse(settings.store_analytics) 
    : settings.store_analytics;
  return analytics?.paymentMethods || [];
};

export const getEnabledShippingMethods = (settings: StoreSettings | null) => {
  if (!settings?.store_analytics) return [];
  const analytics = typeof settings.store_analytics === 'string' 
    ? JSON.parse(settings.store_analytics) 
    : settings.store_analytics;
  return analytics?.shippingMethods || [];
};