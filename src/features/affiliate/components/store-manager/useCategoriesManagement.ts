/**
 * Custom hook لإدارة الفئات
 * Categories Management Hook
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  parseFeaturedCategories,
  type StoreCategory,
  type StoreSettings
} from '@/hooks/useStoreSettings';

interface AffiliateProductWithDetails {
  products?: {
    id: string;
    category: string | null;
    is_active: boolean | null;
  } | null;
}

export interface StoreProductOption {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  isVisible: boolean;
}

export function useCategoriesManagement(
  storeId: string,
  settings: StoreSettings | null,
  updateSettings: (settings: Partial<StoreSettings>) => Promise<boolean>,
  refetch: () => Promise<void>
) {
  const { toast } = useToast();
  const [displayStyle, setDisplayStyle] = useState('grid');
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [availableCategories, setAvailableCategories] = useState<StoreCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // تحديث displayStyle من الإعدادات
  useEffect(() => {
    if (!settings?.category_display_style) {
      setDisplayStyle('grid');
      return;
    }
    setDisplayStyle(settings.category_display_style);
  }, [settings?.category_display_style]);

  // تحميل الفئات المتاحة
  useEffect(() => {
    const loadCategories = async () => {
      if (!storeId) return;

      try {
        const { data, error } = await supabase
          .from('affiliate_products')
          .select(`
            id,
            is_visible,
            products (
              id,
              category,
              is_active
            )
          `)
          .eq('affiliate_store_id', storeId)
          .eq('is_visible', true);

        if (error) throw error;

        const categoryCounts = new Map<string, number>();

        (data as AffiliateProductWithDetails[] | null)?.forEach((item) => {
          const product = item.products;
          if (!product || product.is_active === false) return;

          const categoryName = product.category || 'غير مصنف';
          categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
        });

        const derivedCategories: StoreCategory[] = Array.from(categoryCounts.entries()).map(
          ([name, count]) => ({
            id: name,
            name,
            isActive: true,
            productCount: count,
            bannerProducts: []
          })
        );

        setAvailableCategories(derivedCategories);
      } catch (error) {
        console.error('Error loading available categories for affiliate store:', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل الفئات المرتبطة بمنتجات المتجر',
          variant: 'destructive'
        });
      }
    };

    loadCategories();
  }, [storeId, toast]);

  // تحميل منتجات المتجر
  useEffect(() => {
    const loadStoreProducts = async () => {
      if (!storeId) return;

      setLoadingProducts(true);

      try {
        const { data, error } = await supabase
          .from('affiliate_products')
          .select(`
            id,
            is_visible,
            products (
              id,
              title,
              image_urls,
              category,
              is_active
            )
          `)
          .eq('affiliate_store_id', storeId);

        if (error) throw error;

        const formattedProducts: StoreProductOption[] = (data || [])
          .map((item: any) => {
            const product = item.products as any;
            if (!product || product.is_active === false || item?.is_visible === false) {
              return null;
            }

            const imageUrl =
              Array.isArray(product.image_urls) && product.image_urls.length > 0
                ? product.image_urls[0]
                : null;

            return {
              id: product.id,
              title: product.title,
              category: product.category || null,
              image_url: imageUrl,
              isVisible: item?.is_visible ?? true
            };
          })
          .filter((product): product is StoreProductOption => Boolean(product?.id));

        setStoreProducts(formattedProducts);
      } catch (error) {
        console.error('Error loading products for affiliate store:', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل المنتجات المتاحة للاختيار',
          variant: 'destructive'
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    loadStoreProducts();
  }, [storeId, toast]);

  // دمج الفئات المحفوظة مع المتاحة
  useEffect(() => {
    const storedCategories = parseFeaturedCategories(settings?.featured_categories);

    if (storedCategories.length === 0 && availableCategories.length === 0) {
      setCategories([]);
      return;
    }

    const availableById = new Map(availableCategories.map((category) => [category.id, category]));

    const mergedCategories: StoreCategory[] = availableCategories.map((category) => {
      const stored = storedCategories.find(
        (item) => item.id === category.id || item.name === category.name
      );
      return {
        ...category,
        isActive: stored?.isActive ?? true,
        productCount: stored?.productCount ?? category.productCount,
        bannerProducts: stored?.bannerProducts ?? category.bannerProducts ?? []
      };
    });

    storedCategories.forEach((category) => {
      const exists =
        availableById.has(category.id) ||
        mergedCategories.some((item) => item.name === category.name);
      if (!exists) {
        mergedCategories.push({
          id: category.id,
          name: category.name,
          isActive: category.isActive,
          productCount: category.productCount,
          bannerProducts: category.bannerProducts ?? []
        });
      }
    });

    setCategories(mergedCategories);
  }, [settings?.featured_categories, availableCategories]);

  // تبديل حالة الفئة
  const toggleCategoryStatus = async (categoryId: string) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    );

    setCategories(updatedCategories);

    const success = await updateSettings({
      featured_categories: JSON.parse(JSON.stringify(updatedCategories))
    });

    if (success) {
      await refetch();
    } else {
      setCategories(categories);
      toast({
        title: 'خطأ',
        description: 'فشل تغيير حالة الفئة',
        variant: 'destructive'
      });
    }
  };

  // تعديل فئة
  const handleCategoryEdit = async (updatedCategory: Partial<StoreCategory>) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat
    );

    setCategories(updatedCategories);

    const success = await updateSettings({
      featured_categories: JSON.parse(JSON.stringify(updatedCategories))
    });

    if (success) {
      await refetch();
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الفئة وحفظها بنجاح'
      });
    } else {
      setCategories(categories);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ التعديلات',
        variant: 'destructive'
      });
    }
  };

  // إضافة فئة
  const handleAddCategory = async (newCategory: Partial<StoreCategory>) => {
    const updatedCategories = [
      ...categories,
      {
        ...(newCategory as StoreCategory),
        bannerProducts: newCategory.bannerProducts ?? []
      }
    ];

    setCategories(updatedCategories);

    const success = await updateSettings({
      featured_categories: JSON.parse(JSON.stringify(updatedCategories))
    });

    if (success) {
      await refetch();
      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة الفئة وحفظها بنجاح'
      });
    } else {
      setCategories(categories);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الفئة',
        variant: 'destructive'
      });
    }
  };

  // حذف فئة
  const handleDeleteCategory = async (categoryId: string) => {
    const updatedCategories = categories.filter((cat) => cat.id !== categoryId);

    setCategories(updatedCategories);

    const success = await updateSettings({
      featured_categories: JSON.parse(JSON.stringify(updatedCategories))
    });

    if (success) {
      await refetch();
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الفئة بنجاح'
      });
    } else {
      setCategories(categories);
      toast({
        title: 'خطأ',
        description: 'فشل حذف الفئة',
        variant: 'destructive'
      });
    }
  };

  // حفظ إعدادات الفئات
  const saveCategorySettings = async () => {
    const success = await updateSettings({
      category_display_style: displayStyle,
      featured_categories: JSON.parse(JSON.stringify(categories))
    });

    if (success) {
      await refetch();

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الفئات بنجاح. سيتم تحديث المتجر تلقائياً.'
      });
    }
  };

  return {
    displayStyle,
    setDisplayStyle,
    categories,
    storeProducts,
    loadingProducts,
    toggleCategoryStatus,
    handleCategoryEdit,
    handleAddCategory,
    handleDeleteCategory,
    saveCategorySettings
  };
}
