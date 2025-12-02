import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductVariant {
  type: string;
  value: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  images: any;
  image_urls: string[];
  category: string;
  is_active: boolean;
  stock: number;
  view_count: number;
  merchant_id: string;
  merchants: {
    id: string;
    business_name: string;
    default_commission_rate: number;
  };
  variants?: ProductVariant[];
}

export interface AffiliateStore {
  id: string;
  profile_id: string;
  [key: string]: any;
}

/**
 * Custom hook لجلب بيانات المنتجات ومتجر المسوق
 *
 * @param profile - بيانات المستخدم الحالي
 * @returns كائن يحتوي على المنتجات، المتجر، منتجات المسوق، حالة التحميل، ودالة إعادة الجلب
 */
export function useProductsData(profile: any) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [affiliateStore, setAffiliateStore] = useState<AffiliateStore | null>(null);
  const [myProducts, setMyProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {

      // جلب متجر المسوق - التحقق من الجدولين
      let storeData = null;

      // أولاً، جرب user_profiles.id
      const { data: storesByProfile, error: storesByProfileError } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (storesByProfileError) {
        console.error('Error fetching affiliate store (by profile_id):', storesByProfileError);
      }
      const userProfileStore = Array.isArray(storesByProfile) && storesByProfile.length > 0 ? storesByProfile[0] : null;

      if (userProfileStore) {
        storeData = userProfileStore;
      } else {
        // إذا لم نجده، جرب profiles.id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', profile.auth_user_id)
          .maybeSingle();

        if (profileData) {
          const { data: storesByProfile2, error: storesByProfileError2 } = await supabase
            .from('affiliate_stores')
            .select('*')
            .eq('profile_id', profileData.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (storesByProfileError2) {
            console.error('Error fetching affiliate store (by auth_user_id):', storesByProfileError2);
          }
          const profileStore = Array.isArray(storesByProfile2) && storesByProfile2.length > 0 ? storesByProfile2[0] : null;

          storeData = profileStore;
        }
      }

      setAffiliateStore(storeData);

      // جلب منتجات المسوق الحالية
      if (storeData) {
        const { data: myProductsData } = await supabase
          .from('affiliate_products')
          .select('product_id')
          .eq('affiliate_store_id', storeData.id);

        setMyProducts(new Set(myProductsData?.map(p => p.product_id) || []));
      }

      // جلب جميع المنتجات النشطة مع معلومات التجار
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          merchants (
            id,
            business_name,
            default_commission_rate
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // جلب المتغيرات لكل منتج
      const productsWithVariants = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: variants, error: variantsError } = await supabase
            .from('product_variants_advanced')
            .select('color, size, sku, quantity, is_active')
            .eq('product_id', product.id)
            .eq('is_active', true);

          if (variantsError) {
            console.error('Error loading variants for product', product.id, variantsError);
          }

          // تحويل المتغيرات إلى الصيغة المطلوبة
          const formattedVariants: ProductVariant[] = [];
          const processedTypes = new Set<string>();

          variants?.forEach(variant => {
            if (variant.color && !processedTypes.has(`color-${variant.color}`)) {
              formattedVariants.push({
                type: 'color',
                value: variant.color,
                stock: variant.quantity || 0
              });
              processedTypes.add(`color-${variant.color}`);
            }

            if (variant.size && !processedTypes.has(`size-${variant.size}`)) {
              formattedVariants.push({
                type: 'size',
                value: variant.size,
                stock: variant.quantity || 0
              });
              processedTypes.add(`size-${variant.size}`);
            }
          });

          return {
            ...product,
            variants: formattedVariants
          };
        })
      );

      setProducts(productsWithVariants || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب البيانات المطلوبة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    affiliateStore,
    myProducts,
    setMyProducts,
    loading,
    refetch: fetchData,
  };
}
