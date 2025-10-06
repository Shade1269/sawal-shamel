import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStoreThemes, type StoreThemeConfig } from '@/hooks/useStoreThemes';
import { supabasePublic } from '@/integrations/supabase/publicClient';

interface ThemeContextType {
  currentTheme: StoreThemeConfig | null;
  applyTheme: (config: StoreThemeConfig) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  storeId?: string;
}

export const StoreThemeProvider = ({ children, storeId }: ThemeProviderProps) => {
  const [currentThemeConfig, setCurrentThemeConfig] = useState<StoreThemeConfig | null>(null);

  // تحميل إعدادات الثيم للمتجر
  useEffect(() => {
    if (storeId) {
      console.log('🎨 StoreThemeProvider: Loading theme for store', storeId);
      loadThemeConfig(storeId);
    }
  }, [storeId]);

  // إزالة dark mode وتطبيق ثيم المتجر
  useEffect(() => {
    // إزالة dark mode من body
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    
    // إضافة class للإشارة إلى أننا في صفحة متجر
    document.body.classList.add('store-theme');
    
    return () => {
      document.body.classList.remove('store-theme');
    };
  }, []);

  const loadThemeConfig = async (storeId: string) => {
    try {
      console.log('🎨 Loading theme config for store:', storeId);
      
      // استخدام supabasePublic مباشرة لجلب إعدادات الثيم
      const { data, error } = await supabasePublic.rpc('get_store_theme_config', {
        p_store_id: storeId
      });

      if (error) {
        console.error('❌ Theme config error:', error);
        return;
      }

      console.log('✅ Raw theme data:', data);
      
      const rawData = data as any;
      const config = rawData?.theme_config ? rawData.theme_config : rawData;
      
      console.log('🎨 Processed theme config:', {
        hasConfig: !!config,
        colors: config?.colors,
        typography: config?.typography,
      });
      
      if (config && Object.keys(config).length > 0) {
        setCurrentThemeConfig(config as StoreThemeConfig);
        applyThemeToDOM(config as StoreThemeConfig);
      } else {
        console.warn('⚠️ No theme config found');
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل إعدادات الثيم:', error);
    }
  };

  const applyThemeToDOM = (configParam: StoreThemeConfig | any) => {
    console.log('🎨 Starting to apply theme to DOM...', configParam);
    
    // دعم الأشكال: { theme_config: {...} } أو { colors: {...} } أو خريطة ألوان مسطحة
    const themeConfig: any = (configParam as any)?.theme_config ?? configParam;
    const colorsSource: Record<string, any> = themeConfig?.colors ?? themeConfig;
    
    console.log('🎨 Color source:', colorsSource);
    
    if (!colorsSource || Object.keys(colorsSource).length === 0) {
      console.warn('⚠️ No colors found in theme config');
      return;
    }

    const root = document.documentElement;
    const { typography, layout, effects } = themeConfig as any;

    // تحويل Hex/RGB إلى ثلاثية H S% L%
    const hexToHslTriplet = (hex: string): string => {
      let h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const r = parseInt(h.substring(0, 2), 16) / 255;
      const g = parseInt(h.substring(2, 4), 16) / 255;
      const b = parseInt(h.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let hh = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
          case g: hh = (b - r) / d + 2; break;
          case b: hh = (r - g) / d + 4; break;
        }
        hh /= 6;
      }
      return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const rgbToHslTriplet = (rgb: string): string => {
      const nums = rgb.replace(/rgba?\(/, '').replace(/\)/, '').split(',').slice(0,3).map(n => parseFloat(n.trim()));
      const [r0, g0, b0] = nums as any;
      const r = (r0 as number) / 255, g = (g0 as number) / 255, b = (b0 as number) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const normalizeColor = (val: string): string => {
      if (!val) return '';
      const v = String(val).trim();
      if (v.startsWith('hsl(')) return v.slice(4, -1).replace(/,\s*/g, ' ').trim();
      if (v.startsWith('#')) return hexToHslTriplet(v).replace(/,\s*/g, ' ').trim();
      if (v.startsWith('rgb')) return rgbToHslTriplet(v).replace(/,\s*/g, ' ').trim();
      // إذا كانت بالفعل ثلاثية HSL بدون hsl() نتركها كما هي لكن نزيل الفواصل
      if (!v.includes('(') && v.includes('%')) return v.replace(/,\s*/g, ' ').trim();
      return v; // fallback (قد تكون var(--...))
    };

    // مفاتيح شائعة → الرموز القياسية في Tailwind (hsl(var(--token)))
    const keyAliasMap: Record<string, string> = {
      // الأساسية
      primary_color: 'primary', primaryColor: 'primary',
      secondary_color: 'secondary', secondaryColor: 'secondary',
      accent_color: 'accent', accentColor: 'accent',
      background_color: 'background', backgroundColor: 'background', bg: 'background',
      foreground_color: 'foreground', foregroundColor: 'foreground', fg: 'foreground', text: 'foreground', textColor: 'foreground',
      muted_color: 'muted', mutedColor: 'muted',
      card_background: 'card', cardColor: 'card', card_background_color: 'card',
      border_color: 'border', borderColor: 'border',
      input_color: 'input', inputColor: 'input',
      ring_color: 'ring', ringColor: 'ring',
      popover_color: 'popover', popover: 'popover',
      // foregrounds
      primary_foreground: 'primary-foreground', primaryForeground: 'primary-foreground',
      secondary_foreground: 'secondary-foreground', secondaryForeground: 'secondary-foreground',
      accent_foreground: 'accent-foreground', accentForeground: 'accent-foreground',
      muted_foreground: 'muted-foreground', mutedForeground: 'muted-foreground',
      card_foreground: 'card-foreground', cardForeground: 'card-foreground',
      popover_foreground: 'popover-foreground', popoverForeground: 'popover-foreground',
      destructive_color: 'destructive', destructive: 'destructive',
      destructive_foreground: 'destructive-foreground', destructiveForeground: 'destructive-foreground',
    };

    const appliedKeys: string[] = [];
    Object.entries(colorsSource).forEach(([rawKey, value]) => {
      const key = keyAliasMap[rawKey] || rawKey;
      const normalized = normalizeColor(String(value));
      // استخدام القيمة المنظمة مباشرة بدون إضافة hsl() لأن Tailwind يتوقع ثلاثية فقط
      root.style.setProperty(`--${key}`, normalized);
      appliedKeys.push(key);
      console.log(`✅ Applied color: --${key} = ${normalized}`);
    });
    
    console.log('🎨 All applied colors:', { 
      appliedKeys, 
      originalColors: Object.keys(colorsSource),
    });

    // الخطوط
    if (typography?.fontFamily) {
      root.style.setProperty('--font-sans', typography.fontFamily);
      document.body.style.fontFamily = typography.fontFamily;
    }
    if (typography?.headingFont) {
      root.style.setProperty('--font-heading', typography.headingFont);
    }

    // التخطيط
    if (layout?.borderRadius) {
      root.style.setProperty('--radius', String(layout.borderRadius).replace('px', '').replace('rem', 'rem'));
    }

    // التأثيرات
    if (effects) {
      if (effects.shadows === 'luxury') {
        root.style.setProperty('--shadow', '0 25px 50px -12px rgba(0, 0, 0, 0.25)');
      } else if (effects.shadows === 'minimal') {
        root.style.setProperty('--shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1)');
      } else if (effects.shadows === 'warm') {
        root.style.setProperty('--shadow', '0 10px 15px -3px rgba(251, 146, 60, 0.1)');
      } else if (effects.shadows === 'colorful') {
        root.style.setProperty('--shadow', '0 10px 15px -3px rgba(147, 51, 234, 0.1)');
      }

      if (effects.animations === 'elegant') {
        root.style.setProperty('--transition', 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)');
      } else if (effects.animations === 'bouncy') {
        root.style.setProperty('--transition', 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)');
      } else if (effects.animations === 'gentle') {
        root.style.setProperty('--transition', 'all 0.5s ease-in-out');
      }
    }

    // تنظيف classes السابقة وإضافة class للثيم
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
    const themeClass = getThemeClassName(themeConfig as StoreThemeConfig);
    document.body.classList.add(themeClass, 'store-theme');
    
    console.log('🎨 ✅ Theme applied successfully!', { 
      appliedKeys: appliedKeys.length, 
      themeClass,
      hasTypography: !!typography,
      hasLayout: !!layout,
      hasEffects: !!effects
    });
    
    // فرض إعادة render للتأكد من تطبيق الألوان
    document.body.style.visibility = 'hidden';
    setTimeout(() => {
      document.body.style.visibility = 'visible';
    }, 0);
  };

  const getThemeClassName = (config: StoreThemeConfig): string => {
    const { primary } = (config as any).colors || (config as any) || {};
    if (typeof primary === 'string') {
      if (primary.includes('45, 100%, 51%')) return 'theme-luxury';
      if (primary.includes('30, 67%, 44%')) return 'theme-traditional';
      if (primary.includes('280, 100%, 70%')) return 'theme-colorful';
    }
    return 'theme-modern';
  };

  const applyTheme = (config: StoreThemeConfig) => {
    setCurrentThemeConfig(config);
    applyThemeToDOM(config);
  };

  const resetTheme = () => {
    setCurrentThemeConfig(null);
    const root = document.documentElement;
    const cssVariables = [
      '--primary', '--secondary', '--accent', '--background', '--foreground',
      '--muted', '--card', '--border', '--input', '--ring',
      '--primary-foreground', '--secondary-foreground', '--accent-foreground', '--muted-foreground', '--card-foreground',
      '--font-sans', '--font-heading', '--radius', '--shadow', '--transition'
    ];
    cssVariables.forEach(variable => root.style.removeProperty(variable));
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
  };

  return (
    <ThemeContext.Provider value={{ currentTheme: currentThemeConfig, applyTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useStoreTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useStoreTheme must be used within a StoreThemeProvider');
  return context;
};
