import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';

export interface ModernStorefrontConfig {
  theme: 'damascus' | 'luxury' | 'feminine' | 'night' | 'legendary';
  enableModernMode: boolean;
  seoEnabled: boolean;
  paymentMethods: string[];
  analyticsEnabled: boolean;
}

const DEFAULT_CONFIG: ModernStorefrontConfig = {
  theme: 'luxury',
  enableModernMode: true,
  seoEnabled: true,
  paymentMethods: ['cod', 'tabby', 'tamara', 'visa'],
  analyticsEnabled: true
};

export const useModernStorefront = (storeSlug?: string) => {
  const { store } = useAffiliateStore();
  const slug = storeSlug || store?.store_slug;
  
  const [config, setConfig] = useState<ModernStorefrontConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Integration with existing storefront settings (memoized to avoid loops)
  const initialLegacySettings = useMemo(() => ({
    storeName: store?.store_name || '',
    shortDescription: store?.bio || '',
    logoUrl: store?.logo_url || '',
    accentColor: 'var(--primary)',
    useThemeHero: true,
  }), [store?.store_name, store?.bio, store?.logo_url]);

  const { settings: legacySettings, updateSettings: updateLegacySettings } = useStorefrontSettings(
    slug || 'default',
    {
      initialSettings: initialLegacySettings,
    }
  );

  // Load modern config from localStorage
  useEffect(() => {
    if (!slug) return;

    const savedConfig = localStorage.getItem(`modern-storefront-${slug}`);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (error) {
        console.warn('Failed to parse modern storefront config:', error);
      }
    }
    setIsLoading(false);
  }, [slug]);

  // Save config to localStorage
  const updateConfig = useCallback((updates: Partial<ModernStorefrontConfig>) => {
    if (!slug) return;

    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem(`modern-storefront-${slug}`, JSON.stringify(newConfig));
  }, [config, slug]);

  // Toggle modern mode
  const toggleModernMode = useCallback(() => {
    updateConfig({ enableModernMode: !config.enableModernMode });
  }, [config.enableModernMode, updateConfig]);

  // Change theme
  const changeTheme = useCallback((theme: ModernStorefrontConfig['theme']) => {
    updateConfig({ theme });
  }, [updateConfig]);

  // Get combined settings (legacy + modern)
  const combinedSettings = {
    ...legacySettings,
    ...config,
    storeData: store
  };

  return {
    config,
    isLoading,
    isModernMode: config.enableModernMode,
    currentTheme: config.theme,
    legacySettings,
    combinedSettings,
    updateConfig,
    toggleModernMode,
    changeTheme,
    updateLegacySettings
  };
};