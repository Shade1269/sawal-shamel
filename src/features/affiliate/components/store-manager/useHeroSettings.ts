/**
 * Custom hook لإدارة إعدادات القسم الرئيسي
 * Hero Settings Management Hook
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { HeroSettings } from './types';
import type { StoreSettings } from '@/hooks/useStoreSettings';

export function useHeroSettings(
  settings: StoreSettings | null,
  updateSettings: (settings: Partial<StoreSettings>) => Promise<boolean>,
  refetch: () => Promise<void>,
  uploadImage: (file: File, folder: string) => Promise<{ success: boolean; url: string }>
) {
  const { toast } = useToast();
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    hero_title: settings?.hero_title || '',
    hero_subtitle: settings?.hero_subtitle || '',
    hero_description: settings?.hero_description || '',
    hero_cta_text: settings?.hero_cta_text || 'تسوق الآن',
    hero_cta_color: settings?.hero_cta_color || 'primary',
    hero_image_url: settings?.hero_image_url || ''
  });

  // تحديث heroSettings عند تحميل settings من قاعدة البيانات
  useEffect(() => {
    if (settings) {
      setHeroSettings({
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        hero_description: settings.hero_description || '',
        hero_cta_text: settings.hero_cta_text || 'تسوق الآن',
        hero_cta_color: settings.hero_cta_color || 'primary',
        hero_image_url: settings.hero_image_url || ''
      });
    }
  }, [settings]);

  // رفع صورة القسم الرئيسي
  const handleHeroImageUpload = async (file: File) => {
    const result = await uploadImage(file, 'hero');
    if (result.success) {
      setHeroSettings((prev) => ({ ...prev, hero_image_url: result.url }));
    }
  };

  // حفظ إعدادات القسم الرئيسي
  const saveHeroSettings = async () => {
    const success = await updateSettings(heroSettings);
    if (success) {
      // إعادة جلب البيانات لتحديث المعاينة
      await refetch();

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات القسم الرئيسي بنجاح. يمكنك معاينة التغييرات الآن.'
      });
    }
  };

  return {
    heroSettings,
    setHeroSettings,
    handleHeroImageUpload,
    saveHeroSettings
  };
}
