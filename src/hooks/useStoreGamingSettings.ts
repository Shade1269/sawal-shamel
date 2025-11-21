import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GamingTheme, PerformanceMode } from '@/contexts/GamingSettingsContext';

export interface StoreGamingSettings {
  enabled: boolean;
  theme: GamingTheme;
  performanceMode: PerformanceMode;
  features: {
    mouseTrail: boolean;
    tilt3D: boolean;
    particles: boolean;
    scanLines: boolean;
    gridBackground: boolean;
    parallax: boolean;
    glowEffects: boolean;
    soundEffects: boolean;
    soundVolume: number;
    holographic: boolean;
    laserClicks: boolean;
    nebulaBackground: boolean;
    portalTransitions: boolean;
    quantumGlitch: boolean;
    energyShield: boolean;
    warpSpeed: boolean;
  };
}

const defaultSettings: StoreGamingSettings = {
  enabled: true,
  theme: 'cyberpunk',
  performanceMode: 'high',
  features: {
    mouseTrail: true,
    tilt3D: true,
    particles: true,
    scanLines: true,
    gridBackground: true,
    parallax: true,
    glowEffects: true,
    soundEffects: false,
    soundVolume: 50,
    holographic: true,
    laserClicks: true,
    nebulaBackground: true,
    portalTransitions: true,
    quantumGlitch: false,
    energyShield: true,
    warpSpeed: true,
  },
};

/**
 * Hook لجلب وحفظ إعدادات Gaming للمتجر من قاعدة البيانات
 * يستخدمه المسوق في لوحة التحكم
 */
export const useStoreGamingSettings = (storeId: string) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreGamingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings from database
  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('affiliate_stores')
          .select('gaming_settings')
          .eq('id', storeId)
          .single();

        if (error) throw error;

        if (data?.gaming_settings) {
          // Merge with defaults to ensure all fields exist
          setSettings({
            ...defaultSettings,
            ...data.gaming_settings,
            features: {
              ...defaultSettings.features,
              ...(data.gaming_settings.features || {}),
            },
          });
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error fetching gaming settings:', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل إعدادات Gaming',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [storeId, toast]);

  // Save settings to database
  const saveSettings = async (newSettings: Partial<StoreGamingSettings>) => {
    if (!storeId) return;

    try {
      setSaving(true);

      const updatedSettings = {
        ...settings,
        ...newSettings,
        features: {
          ...settings.features,
          ...(newSettings.features || {}),
        },
      };

      const { error } = await supabase
        .from('affiliate_stores')
        .update({
          gaming_settings: updatedSettings,
        })
        .eq('id', storeId);

      if (error) throw error;

      setSettings(updatedSettings);

      toast({
        title: '✅ تم الحفظ',
        description: 'تم حفظ إعدادات Gaming بنجاح',
      });

      return true;
    } catch (error) {
      console.error('Error saving gaming settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update a specific feature
  const updateFeature = async (featureName: keyof StoreGamingSettings['features'], value: boolean | number) => {
    return saveSettings({
      features: {
        ...settings.features,
        [featureName]: value,
      },
    });
  };

  // Toggle gaming mode
  const toggleGamingMode = async () => {
    return saveSettings({
      enabled: !settings.enabled,
    });
  };

  // Change theme
  const changeTheme = async (theme: GamingTheme) => {
    return saveSettings({
      theme,
    });
  };

  // Change performance mode
  const changePerformanceMode = async (mode: PerformanceMode) => {
    return saveSettings({
      performanceMode: mode,
    });
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    return saveSettings(defaultSettings);
  };

  return {
    settings,
    loading,
    saving,
    saveSettings,
    updateFeature,
    toggleGamingMode,
    changeTheme,
    changePerformanceMode,
    resetToDefaults,
  };
};
