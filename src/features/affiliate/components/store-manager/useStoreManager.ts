/**
 * Custom hook لإدارة حالة ووظائف المتجر
 * Store Manager State and Functions Hook
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createStoreUrl } from '@/utils/domains';
import type { Store, EditData, HeroSettings } from './types';

export function useStoreManager(store: Store, onUpdateStore?: (storeData: any) => void) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    store_name: store.store_name,
    bio: store.bio,
    theme: store.theme
  });

  const storeUrl = createStoreUrl(store.store_slug);

  // حفظ التغييرات الأساسية
  const handleSaveChanges = useCallback(() => {
    if (onUpdateStore) {
      onUpdateStore(editData);
    }
    setIsEditing(false);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ تغييرات المتجر بنجاح",
    });
  }, [editData, onUpdateStore, toast]);

  // نسخ رابط المتجر
  const copyStoreLink = useCallback(() => {
    navigator.clipboard.writeText(storeUrl);
    toast({
      title: "تم نسخ الرابط",
      description: "تم نسخ رابط متجرك إلى الحافظة",
    });
  }, [storeUrl, toast]);

  // مشاركة المتجر
  const shareStore = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.store_name,
          text: store.bio,
          url: storeUrl,
        });
      } catch (error) {
        copyStoreLink();
      }
    } else {
      copyStoreLink();
    }
  }, [store.store_name, store.bio, storeUrl, copyStoreLink]);

  return {
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    storeUrl,
    handleSaveChanges,
    copyStoreLink,
    shareStore
  };
}
