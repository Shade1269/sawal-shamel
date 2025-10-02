import React, { createContext, useContext, useEffect, useState } from 'react';
import { getThemeById, type ThemeType, type StoreTheme } from '@/config/storeThemes';
import { supabase } from '@/integrations/supabase/client';

interface ThemeContextType {
  currentTheme: StoreTheme;
  themeId: ThemeType;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
  storeId?: string;
}

export const EnhancedThemeProvider = ({ children, storeId }: EnhancedThemeProviderProps) => {
  const [themeId, setThemeId] = useState<ThemeType>('graceful-styles');
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الثيم من قاعدة البيانات
  useEffect(() => {
    if (storeId) {
      loadStoreTheme(storeId);
    } else {
      setIsLoading(false);
    }
  }, [storeId]);

  // تطبيق الثيم على DOM
  useEffect(() => {
    const theme = getThemeById(themeId);
    applyThemeToDOM(theme);
    
    // إزالة dark mode في صفحات المتجر
    const hasDark = document.body.classList.contains('dark');
    if (hasDark) {
      document.body.classList.remove('dark');
    }

    return () => {
      // تنظيف عند الخروج
      cleanupTheme();
    };
  }, [themeId]);

  const loadStoreTheme = async (storeId: string) => {
    try {
      setIsLoading(true);
      
      // جلب الثيم المحفوظ من affiliate_stores
      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('theme')
        .eq('id', storeId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.theme) {
        // تحويل theme القديم إلى ThemeType الجديد
        const oldToNewThemeMap: Record<string, ThemeType> = {
          'classic': 'timeless-elegance',
          'modern': 'modern-dark',
          'minimal': 'minimal-chic',
          'luxury': 'timeless-elegance',
          'traditional': 'timeless-elegance',
          'warm': 'graceful-styles',
          'colorful': 'graceful-styles'
        };

        const mappedTheme = oldToNewThemeMap[data.theme] || 'graceful-styles';
        setThemeId(mappedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading store theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeToDOM = (theme: StoreTheme) => {
    const root = document.documentElement;

    // تطبيق الألوان كـ CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
      
      // ربط بعض المتغيرات مع Tailwind
      if (key === 'primary') root.style.setProperty('--primary', value);
      if (key === 'secondary') root.style.setProperty('--secondary', value);
      if (key === 'accent') root.style.setProperty('--accent', value);
      if (key === 'background') root.style.setProperty('--background', value);
      if (key === 'text') root.style.setProperty('--foreground', value);
      if (key === 'textMuted') root.style.setProperty('--muted-foreground', value);
      if (key === 'border') root.style.setProperty('--border', value);
      if (key === 'cardBg') root.style.setProperty('--card', value);
    });

    // تطبيق الخطوط
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);
    if (theme.fonts.display) {
      root.style.setProperty('--font-display', theme.fonts.display);
    }

    // تطبيق الأنماط
    root.style.setProperty('--radius', theme.styles.borderRadius);
    root.style.setProperty('--card-elevation', theme.styles.cardElevation);

    // إضافة class للثيم
    document.body.classList.remove(
      'theme-timeless-elegance',
      'theme-graceful-styles',
      'theme-minimal-chic',
      'theme-modern-dark'
    );
    document.body.classList.add(`theme-${theme.id}`);
    
    // إضافة data attribute للـ layout style
    document.body.setAttribute('data-layout', theme.styles.layoutStyle);
    document.body.setAttribute('data-button-style', theme.styles.buttonStyle);

    console.info('✨ Theme applied:', theme.nameAr);
  };

  const cleanupTheme = () => {
    const root = document.documentElement;
    
    // إزالة CSS variables
    root.style.removeProperty('--font-heading');
    root.style.removeProperty('--font-body');
    root.style.removeProperty('--font-display');
    root.style.removeProperty('--radius');
    root.style.removeProperty('--card-elevation');

    // إزالة classes
    document.body.classList.remove(
      'theme-timeless-elegance',
      'theme-graceful-styles',
      'theme-minimal-chic',
      'theme-modern-dark'
    );
    
    document.body.removeAttribute('data-layout');
    document.body.removeAttribute('data-button-style');
  };

  const currentTheme = getThemeById(themeId);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeId, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useEnhancedTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within EnhancedThemeProvider');
  }
  return context;
};
