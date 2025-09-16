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
      const config = await getThemeConfig(storeId);
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
    
    // تطبيق الألوان
    Object.entries(colors).forEach(([key, value]) => {
      // تحويل HSL إلى CSS variables
      if (typeof value === 'string' && value.startsWith('hsl')) {
        const hslValue = value.replace('hsl(', '').replace(')', '');
        root.style.setProperty(`--${key}`, hslValue);
      } else {
        root.style.setProperty(`--${key}`, value);
      }
    });

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