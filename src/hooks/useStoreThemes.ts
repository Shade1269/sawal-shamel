import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreTheme {
  id: string;
  name: string;
  name_ar: string;
  description?: string | null;
  description_ar?: string | null;
  theme_config: any;
  preview_image_url?: string | null;
  is_active: boolean | null;
  is_premium: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StoreThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
  };
  layout: {
    borderRadius: string;
    spacing: string;
    cardStyle: string;
  };
  effects: {
    shadows: string;
    animations: string;
    gradients: boolean;
    [key: string]: any;
  };
}

export const useStoreThemes = (storeId?: string) => {
  const [themes, setThemes] = useState<StoreTheme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<StoreTheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // جلب جميع الثيمات المتاحة
  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_themes')
        .select('*')
        .eq('is_active', true)
        .order('name_ar');

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('خطأ في جلب الثيمات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الثيمات المتاحة',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // جلب الثيم الحالي للمتجر
  const fetchCurrentTheme = async (storeId: string) => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from('affiliate_stores')
        .select(`
          current_theme_id,
          store_themes!current_theme_id(*)
        `)
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;
      
      if (storeData?.store_themes) {
        setCurrentTheme(storeData.store_themes as StoreTheme);
      }
    } catch (error) {
      console.error('خطأ في جلب الثيم الحالي:', error);
    }
  };

  // تطبيق ثيم على المتجر
  const applyTheme = async (storeId: string, themeId: string, customConfig = {}) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.rpc('apply_theme_to_store', {
        p_store_id: storeId,
        p_theme_id: themeId,
        p_custom_config: customConfig
      });

      if (error) throw error;

      // تحديث الثيم الحالي
      const appliedTheme = themes.find(t => t.id === themeId);
      if (appliedTheme) {
        setCurrentTheme(appliedTheme);
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم تطبيق الثيم على المتجر بنجاح',
        variant: 'default'
      });

      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الثيم:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تطبيق الثيم على المتجر',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // الحصول على إعدادات الثيم للمتجر
  const getThemeConfig = async (storeId: string): Promise<StoreThemeConfig | null> => {
    try {
      const { data, error } = await supabase.rpc('get_store_theme_config', {
        p_store_id: storeId
      });

      if (error) throw error;
      return data ? (data as unknown as StoreThemeConfig) : null;
    } catch (error) {
      console.error('خطأ في جلب إعدادات الثيم:', error);
      return null;
    }
  };

  // تطبيق الثيم على CSS
  const applyThemeToCSS = (themeConfig: StoreThemeConfig) => {
    if (!themeConfig?.colors) return;
    
    const root = document.documentElement;
    const { colors, typography, layout } = themeConfig;
    
    // تطبيق الألوان
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // تطبيق الخطوط
    if (typography?.fontFamily) {
      root.style.setProperty('--font-family', typography.fontFamily);
    }
    
    if (typography?.headingFont) {
      root.style.setProperty('--heading-font', typography.headingFont);
    }

    // تطبيق التخطيط
    if (layout?.borderRadius) {
      root.style.setProperty('--border-radius', layout.borderRadius);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchCurrentTheme(storeId);
    }
  }, [storeId]);

  return {
    themes,
    currentTheme,
    isLoading,
    fetchThemes,
    applyTheme,
    getThemeConfig,
    applyThemeToCSS,
    refreshCurrentTheme: () => storeId && fetchCurrentTheme(storeId)
  };
};