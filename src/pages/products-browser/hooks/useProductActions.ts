import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AffiliateStore } from './useProductsData';

/**
 * Custom hook لإدارة إجراءات المنتجات (إضافة/حذف من المتجر)
 *
 * @param affiliateStore - متجر المسوق الحالي
 * @param myProducts - Set من IDs المنتجات في المتجر
 * @param setMyProducts - دالة لتحديث myProducts
 * @returns كائن يحتوي على دوال الإجراءات وحالة التحميل
 */
export function useProductActions(
  affiliateStore: AffiliateStore | null,
  myProducts: Set<string>,
  setMyProducts: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  const { toast } = useToast();
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set());

  const addToMyStore = async (productId: string, customPriceSar?: number) => {
    if (!affiliateStore) {
      toast({
        title: "خطأ",
        description: "يجب إنشاء متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    // تحقق من أن المنتج ليس قيد الإضافة بالفعل
    if (addingProducts.has(productId)) {
      return;
    }

    setAddingProducts(prev => new Set(prev).add(productId));

    // Timeout للتأكد من عدم تعليق الواجهة
    const timeoutId = setTimeout(() => {
      setAddingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      toast({
        title: "تم تجاوز وقت الانتظار",
        description: "العملية تأخذ وقت أطول من المتوقع",
        variant: "destructive",
      });
    }, 10000); // 10 ثواني timeout

    try {
      // 1) Preferred path: RPC (bypasses RLS and handles duplicates)
      const { data, error } = await supabase
        .rpc('add_affiliate_product', {
          p_store_id: affiliateStore.id,
          p_product_id: productId,
          p_is_visible: true,
          p_sort_order: 0,
          p_custom_price: typeof customPriceSar === 'number' && !Number.isNaN(customPriceSar)
            ? customPriceSar
            : null,
        } as any);

      clearTimeout(timeoutId);

      if (error || !data) {
        console.warn('RPC failed, falling back to upsert...', error);
        // 2) Fallback: direct upsert with onConflict (may be blocked by RLS in some projects)
        const { data: upsertData, error: upsertError } = await supabase
          .from('affiliate_products')
          .upsert(
            [{
              affiliate_store_id: affiliateStore.id,
              product_id: productId,
              is_visible: true,
              sort_order: 0,
              custom_price_sar: typeof customPriceSar === 'number' && !Number.isNaN(customPriceSar)
                ? customPriceSar
                : null,
              price_set_at: typeof customPriceSar === 'number' && !Number.isNaN(customPriceSar)
                ? new Date().toISOString()
                : null,
            }],
            { onConflict: 'affiliate_store_id,product_id', ignoreDuplicates: true }
          )
          .select('product_id')
          .maybeSingle();

        if (upsertError) {
          throw upsertError;
        }

        toast({ title: 'تم بنجاح', description: 'تم إضافة المنتج إلى متجرك' });
        setMyProducts(prev => new Set(prev).add(productId));
        return;
      }

      const result = data as { already_exists?: boolean; success?: boolean };

      if (result.already_exists) {
        toast({ title: 'تنبيه', description: 'المنتج موجود بالفعل في متجرك' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم إضافة المنتج إلى متجرك' });
      }
      setMyProducts(prev => new Set(prev).add(productId));

    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error adding product:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      let errorMessage = "تعذر إضافة المنتج";

      if (error.message?.includes('Not authenticated')) {
        errorMessage = "يجب تسجيل الدخول أولاً";
      } else if (error.message?.includes('Unauthorized store access')) {
        errorMessage = "غير مصرح لك بالوصول لهذا المتجر";
      } else if (error.message) {
        errorMessage = `خطأ: ${error.message}`;
      }

      toast({
        title: "فشل إضافة المنتج",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeFromMyStore = async (productId: string) => {
    if (!affiliateStore) return;

    setAddingProducts(prev => new Set(prev).add(productId));

    try {
      const { error } = await supabase
        .from('affiliate_products')
        .delete()
        .eq('affiliate_store_id', affiliateStore.id)
        .eq('product_id', productId);

      if (error) throw error;

      setMyProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج من متجرك",
      });

    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: "خطأ",
        description: "تعذر حذف المنتج",
        variant: "destructive",
      });
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return {
    addToMyStore,
    removeFromMyStore,
    addingProducts,
  };
}
