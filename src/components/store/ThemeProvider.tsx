import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStoreThemes, type StoreThemeConfig } from '@/hooks/useStoreThemes';

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
  const { getThemeConfig } = useStoreThemes();

  // تحميل إعدادات الثيم للمتجر
  useEffect(() => {
    if (storeId) {
      loadThemeConfig(storeId);
    }
  }, [storeId]);

  const loadThemeConfig = async (storeId: string) => {
    try {
      console.info('ThemeProvider: Loading store theme config', { storeId });
      const config = await getThemeConfig(storeId);
      console.info('ThemeProvider: Theme config loaded', { hasConfig: !!config, colorKeys: Object.keys(config?.colors || {}) });
      if (config) {
        setCurrentThemeConfig(config);
        applyThemeToDOM(config);
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الثيم:', error);
    }
  };

  const applyThemeToDOM = (themeConfig: StoreThemeConfig) => {
    if (!themeConfig?.colors) return;
    
    const root = document.documentElement;
    const { colors, typography, layout, effects } = themeConfig;

    // نحول أي قيمة ألوان (hex/rgb/hsl) إلى صيغة H S% L% المطلوبة من نظام التصميم
    const hexToHslTriplet = (hex: string): string => {
      let h = hex.replace('#', '');
      if (h.length === 3) {
        h = h.split('').map(c => c + c).join('');
      }
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
      const [r0, g0, b0] = nums;
      const r = r0 / 255, g = g0 / 255, b = b0 / 255;
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
      const v = val.trim();
      if (v.startsWith('hsl(')) return v.slice(4, -1); // "hsl(222 47% 11%)" => "222 47% 11%"
      if (v.startsWith('#')) return hexToHslTriplet(v);
      if (v.startsWith('rgb')) return rgbToHslTriplet(v);
      // إذا كانت بالفعل ثلاثية HSL بدون hsl() نتركها كما هي
      if (!v.includes('(') && v.includes('%')) return v;
      return v; // fallback (قد تكون var(--...))
    };
    
    // تطبيق الألوان بصيغة متوافقة مع tailwind (hsl(var(--token))) + تحويل مفاتيح شائعة
    const keyAliasMap: Record<string, string> = {
      primary_color: 'primary', primaryColor: 'primary',
      secondary_color: 'secondary', secondaryColor: 'secondary',
      accent_color: 'accent', accentColor: 'accent',
      background_color: 'background', backgroundColor: 'background', bg: 'background',
      foreground_color: 'foreground', foregroundColor: 'foreground', fg: 'foreground', text: 'foreground', textColor: 'foreground',
      muted_color: 'muted', mutedColor: 'muted',
      card_background: 'card', cardColor: 'card', card_background_color: 'card',
      border_color: 'border', borderColor: 'border',
      input_color: 'input', inputColor: 'input',
      ring_color: 'ring', ringColor: 'ring'
    };

    const appliedKeys: string[] = [];
    Object.entries(colors).forEach(([rawKey, value]) => {
      const key = keyAliasMap[rawKey] || rawKey;
      const normalized = normalizeColor(String(value));
      root.style.setProperty(`--${key}`, normalized);
      appliedKeys.push(key);
    });
    console.info('ThemeProvider: Applied color variables', { appliedKeys });


    // تطبيق الخطوط
    if (typography?.fontFamily) {
      root.style.setProperty('--font-sans', typography.fontFamily);
      document.body.style.fontFamily = typography.fontFamily;
    }
    
    if (typography?.headingFont) {
      root.style.setProperty('--font-heading', typography.headingFont);
    }

    // تطبيق التخطيط
    if (layout?.borderRadius) {
      root.style.setProperty('--radius', layout.borderRadius.replace('px', '').replace('rem', 'rem'));
    }

    // تطبيق التأثيرات
    if (effects) {
      // تطبيق الظلال
      if (effects.shadows === 'luxury') {
        root.style.setProperty('--shadow', '0 25px 50px -12px rgba(0, 0, 0, 0.25)');
      } else if (effects.shadows === 'minimal') {
        root.style.setProperty('--shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1)');
      } else if (effects.shadows === 'warm') {
        root.style.setProperty('--shadow', '0 10px 15px -3px rgba(251, 146, 60, 0.1)');
      } else if (effects.shadows === 'colorful') {
        root.style.setProperty('--shadow', '0 10px 15px -3px rgba(147, 51, 234, 0.1)');
      }

      // تطبيق الانيميشن
      if (effects.animations === 'elegant') {
        root.style.setProperty('--transition', 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)');
      } else if (effects.animations === 'bouncy') {
        root.style.setProperty('--transition', 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)');
      } else if (effects.animations === 'gentle') {
        root.style.setProperty('--transition', 'all 0.5s ease-in-out');
      }
    }

    // إضافة class للثيم المحدد
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    
    const themeClass = getThemeClassName(themeConfig);
    document.body.classList.add(themeClass);
  };

  const getThemeClassName = (config: StoreThemeConfig): string => {
    // تحديد نوع الثيم بناءً على الألوان
    const { primary } = config.colors || {};
    
    if (primary?.includes('45, 100%, 51%')) return 'theme-luxury';
    if (primary?.includes('30, 67%, 44%')) return 'theme-traditional';
    if (primary?.includes('280, 100%, 70%')) return 'theme-colorful';
    
    return 'theme-modern';
  };

  const applyTheme = (config: StoreThemeConfig) => {
    setCurrentThemeConfig(config);
    applyThemeToDOM(config);
  };

  const resetTheme = () => {
    setCurrentThemeConfig(null);
    const root = document.documentElement;
    
    // إزالة CSS variables المخصصة
    const cssVariables = [
      '--primary', '--secondary', '--accent', '--background', 
      '--foreground', '--muted', '--card', '--border',
      '--font-sans', '--font-heading', '--radius', '--shadow', '--transition'
    ];
    
    cssVariables.forEach(variable => {
      root.style.removeProperty(variable);
    });

    // إزالة classes الثيم
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme: currentThemeConfig,
      applyTheme,
      resetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useStoreTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useStoreTheme must be used within a StoreThemeProvider');
  }
  return context;
};