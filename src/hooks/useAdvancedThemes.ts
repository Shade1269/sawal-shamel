import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThemeTemplate {
  id: string;
  name: string;
  name_ar: string;
  description_ar?: string;
  category: string;
  difficulty_level: string;
  theme_config: any;
  preview_image_url?: string;
  thumbnail_url?: string;
  color_palette: any;
  is_premium: boolean;
  is_active: boolean;
  popularity_score: number;
}

export interface CustomTheme {
  id: string;
  user_id: string;
  store_id?: string;
  theme_name: string;
  theme_config: any;
  color_palette: any;
  is_public: boolean;
  version: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  dark: string;
  success?: string;
  warning?: string;
  error?: string;
}

export const useAdvancedThemes = (storeId?: string) => {
  const [templates, setTemplates] = useState<ThemeTemplate[]>([]);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // جلب القوالب المتاحة
  const fetchTemplates = useCallback(async (category?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('theme_templates')
        .select('*')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('خطأ في جلب القوالب:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب قوالب الثيمات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // جلب الثيمات المخصصة
  const fetchCustomThemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_custom_themes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCustomThemes(data || []);
    } catch (error) {
      console.error('خطأ في جلب الثيمات المخصصة:', error);
    }
  }, []);

  // حفظ ثيم مخصص
  const saveCustomTheme = useCallback(async (
    themeName: string,
    themeConfig: any,
    colorPalette: ColorPalette,
    isPublic = false
  ) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_custom_themes')
        .insert({
          theme_name: themeName,
          theme_config: themeConfig,
          color_palette: colorPalette as any,
          is_public: isPublic,
          store_id: storeId,
          version: 1,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (error) throw error;

      // تحديث القائمة المحلية
      setCustomThemes(prev => [data, ...prev]);

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الثيم المخصص بنجاح',
        variant: 'default'
      });

      return data;
    } catch (error) {
      console.error('خطأ في حفظ الثيم:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الثيم المخصص',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storeId, toast]);

  // تطبيق ثيم من قالب
  const applyTemplate = useCallback(async (templateId: string, customizations = {}) => {
    try {
      setIsLoading(true);
      
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('القالب غير موجود');

      const finalConfig = {
        ...template.theme_config,
        ...customizations
      };

      // تطبيق على المتجر إذا كان محدد
      if (storeId) {
        const { error } = await supabase.rpc('apply_theme_to_store', {
          p_store_id: storeId,
          p_theme_id: templateId,
          p_custom_config: customizations
        });

        if (error) throw error;
      }

      // تسجيل الاستخدام للتحليلات
      if (storeId) {
        await supabase
          .from('theme_usage_analytics')
          .insert({
            template_id: templateId,
            store_id: storeId,
            action_type: 'applied',
            customizations: customizations as any,
            user_id: (await supabase.auth.getUser()).data.user?.id || ''
          });
      }

      setCurrentTheme({ ...template, theme_config: finalConfig });

      toast({
        title: 'تم التطبيق',
        description: `تم تطبيق قالب ${template.name_ar} بنجاح`,
        variant: 'default'
      });

      return true;
    } catch (error) {
      console.error('خطأ في تطبيق القالب:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تطبيق القالب',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [templates, storeId, toast]);

  // معاينة ثيم
  const previewTheme = useCallback(async (themeConfig: any) => {
    try {
      setPreviewMode(true);
      
      // تطبيق مؤقت على DOM
      applyThemeToDOM(themeConfig);
      
      // تسجيل المعاينة
      if (storeId) {
        await supabase
          .from('theme_usage_analytics')
          .insert({
            store_id: storeId,
            action_type: 'previewed',
            customizations: themeConfig as any,
            user_id: (await supabase.auth.getUser()).data.user?.id || ''
          });
      }

      toast({
        title: 'وضع المعاينة',
        description: 'يمكنك الآن مشاهدة التغييرات',
        variant: 'default'
      });
    } catch (error) {
      console.error('خطأ في المعاينة:', error);
    }
  }, [storeId, toast]);

  // إنهاء وضع المعاينة
  const exitPreview = useCallback(() => {
    setPreviewMode(false);
    
    // استرجاع الثيم الأصلي
    if (currentTheme?.theme_config) {
      applyThemeToDOM(currentTheme.theme_config);
    } else {
      resetThemeDOM();
    }

    toast({
      title: 'تم الإنهاء',
      description: 'تم إنهاء وضع المعاينة',
      variant: 'default'
    });
  }, [currentTheme]);

  // تطبيق الثيم على DOM
  const applyThemeToDOM = useCallback((themeConfig: any) => {
    if (!themeConfig?.colors) return;
    
    const root = document.documentElement;
    const { colors, typography, layout, effects } = themeConfig;
    
    // تطبيق الألوان
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value as string);
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
      root.style.setProperty('--radius', layout.borderRadius);
    }

    if (layout?.spacing) {
      root.style.setProperty('--spacing', layout.spacing);
    }

    // تطبيق التأثيرات
    if (effects?.shadows) {
      root.style.setProperty('--shadow-level', effects.shadows);
    }
  }, []);

  // إعادة تعيين DOM
  const resetThemeDOM = useCallback(() => {
    const root = document.documentElement;
    const themeVars = [
      '--primary', '--secondary', '--accent', '--background', 
      '--foreground', '--muted', '--card', '--border',
      '--font-family', '--heading-font', '--radius', '--spacing', '--shadow-level'
    ];
    
    themeVars.forEach(varName => {
      root.style.removeProperty(varName);
    });
  }, []);

  // توليد لوحة ألوان ذكية
  const generateSmartPalette = useCallback((baseColor: string): ColorPalette => {
    // خوارزمية بسيطة لتوليد لوحة ألوان متناسقة
    const hsl = hexToHsl(baseColor);
    
    return {
      primary: baseColor,
      secondary: hslToHex((hsl.h + 30) % 360, Math.max(hsl.s - 20, 10), Math.min(hsl.l + 30, 90)),
      accent: hslToHex((hsl.h + 60) % 360, hsl.s, Math.max(hsl.l - 10, 20)),
      neutral: hslToHex(hsl.h, Math.max(hsl.s - 40, 5), 95),
      dark: hslToHex(hsl.h, Math.min(hsl.s + 10, 20), 15),
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444'
    };
  }, []);

  // دوال مساعدة للألوان
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // التحميل الأولي
  useEffect(() => {
    fetchTemplates();
    fetchCustomThemes();
  }, [fetchTemplates, fetchCustomThemes]);

  return {
    // البيانات
    templates,
    customThemes,
    currentTheme,
    isLoading,
    previewMode,

    // الوظائف
    fetchTemplates,
    fetchCustomThemes,
    saveCustomTheme,
    applyTemplate,
    previewTheme,
    exitPreview,
    applyThemeToDOM,
    resetThemeDOM,
    generateSmartPalette,

    // الفئات المتاحة
    categories: ['all', 'modern', 'luxury', 'nature', 'minimalist', 'classic', 'bold'],
    
    // مستويات الصعوبة
    difficultyLevels: ['beginner', 'intermediate', 'advanced']
  };
};