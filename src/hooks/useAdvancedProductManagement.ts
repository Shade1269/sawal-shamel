import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// أنواع البيانات المتقدمة
export interface AdvancedProduct {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  compare_at_price_sar?: number;
  cost_price_sar?: number;
  sku_root: string;
  status: string;
  brand?: string;
  category_id?: string;
  has_variants: boolean;
  weight_grams?: number;
  dimensions_cm?: string;
  tags: string[];
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  merchant_id: string;
}

export interface ProductMedia {
  id?: string;
  product_id: string;
  media_type: 'cover_image' | 'gallery' | 'video';
  media_url: string;
  alt_text?: string;
  sort_order: number;
  file_size?: number;
  dimensions?: { width: number; height: number };
}

export interface ProductDiscount {
  id?: string;
  product_id: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface ProductVariantAdvanced {
  id?: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  color_code?: string;
  color_swatch_url?: string;
  barcode?: string;
  price_override?: number;
  quantity: number;
  min_stock_alert: number;
  variant_image_url?: string;
  is_active: boolean;
}

export interface ProductSEO {
  id?: string;
  product_id: string;
  seo_title?: string;
  seo_description?: string;
  meta_keywords: string[];
  slug?: string;
}

export interface ProductShipping {
  id?: string;
  product_id: string;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  warehouse_id?: string;
  handling_time_days: number;
  origin_country?: string;
  return_policy?: string;
}

export interface CompleteProductData {
  product: AdvancedProduct;
  media: ProductMedia[];
  discounts: ProductDiscount[];
  variants: ProductVariantAdvanced[];
  seo: ProductSEO;
  shipping: ProductShipping;
}

// خطافات الاستعلام
export function useAdvancedProduct(id: string) {
  return useQuery({
    queryKey: ["advanced-product", id],
    queryFn: async () => {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (productError) throw productError;
      if (!product) return null;

      // جلب الوسائط
      const { data: media } = await supabase
        .from("product_media")
        .select("*")
        .eq("product_id", id)
        .order("sort_order");

      // جلب الخصومات
      const { data: discounts } = await supabase
        .from("product_discounts")
        .select("*")
        .eq("product_id", id)
        .eq("is_active", true);

      // جلب المتغيرات
      const { data: variants } = await supabase
        .from("product_variants_advanced")
        .select("*")
        .eq("product_id", id)
        .order("id");

      // جلب معلومات SEO
      const { data: seo } = await supabase
        .from("product_seo")
        .select("*")
        .eq("product_id", id)
        .maybeSingle();

      // جلب معلومات الشحن
      const { data: shipping } = await supabase
        .from("product_shipping")
        .select("*")
        .eq("product_id", id)
        .maybeSingle();

      return {
        product: {
          ...product,
          sku_root: product.sku || '',
          status: product.status || 'draft',
          has_variants: product.has_variants || false
        },
        media: media || [],
        discounts: discounts || [],
        variants: variants || [],
        seo: seo || { product_id: id, meta_keywords: [] },
        shipping: shipping || { product_id: id, handling_time_days: 1 }
      };
    },
    enabled: !!id
  });
}

export function useAdvancedProducts(filters?: {
  search?: string;
  category_id?: string;
  status?: string;
  has_variants?: boolean;
}) {
  return useQuery({
    queryKey: ["advanced-products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          media:product_media(*),
          variants:product_variants_advanced(*)
        `)
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,sku_root.ilike.%${filters.search}%`);
      }

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.has_variants !== undefined) {
        query = query.eq("has_variants", filters.has_variants);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
}

// خطافات الطفرات
export function useCreateAdvancedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompleteProductData) => {
      // إنشاء المنتج الأساسي
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([{
          ...data.product,
          id: undefined // دع قاعدة البيانات تولد المعرف
        }])
        .select()
        .single();

      if (productError) throw productError;

      const productId = product.id;

      // إنشاء الوسائط
      if (data.media.length > 0) {
        const { error: mediaError } = await supabase
          .from("product_media")
          .insert(data.media.map(m => ({ ...m, product_id: productId })));
        
        if (mediaError) throw mediaError;
      }

      // إنشاء الخصومات
      if (data.discounts.length > 0) {
        const { error: discountError } = await supabase
          .from("product_discounts")
          .insert(data.discounts.map(d => ({ ...d, product_id: productId })));
        
        if (discountError) throw discountError;
      }

      // إنشاء المتغيرات
      if (data.variants.length > 0) {
        const { error: variantsError } = await supabase
          .from("product_variants_advanced")
          .insert(data.variants.map(v => ({ ...v, product_id: productId })));
        
        if (variantsError) throw variantsError;
      }

      // إنشاء معلومات SEO
      if (data.seo) {
        const { error: seoError } = await supabase
          .from("product_seo")
          .insert([{ ...data.seo, product_id: productId }]);
        
        if (seoError) throw seoError;
      }

      // إنشاء معلومات الشحن
      if (data.shipping) {
        const { error: shippingError } = await supabase
          .from("product_shipping")
          .insert([{ ...data.shipping, product_id: productId }]);
        
        if (shippingError) throw shippingError;
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advanced-products"] });
      toast.success("تم إنشاء المنتج بنجاح");
    },
    onError: (error: any) => {
      toast.error("حدث خطأ في إنشاء المنتج: " + error.message);
    }
  });
}

export function useUpdateAdvancedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompleteProductData> }) => {
      // تحديث المنتج الأساسي
      if (data.product) {
        const { error: productError } = await supabase
          .from("products")
          .update(data.product)
          .eq("id", id);

        if (productError) throw productError;
      }

      // تحديث الوسائط
      if (data.media) {
        // حذف الوسائط القديمة وإضافة الجديدة
        await supabase.from("product_media").delete().eq("product_id", id);
        
        if (data.media.length > 0) {
          const { error: mediaError } = await supabase
            .from("product_media")
            .insert(data.media.map(m => ({ ...m, product_id: id })));
          
          if (mediaError) throw mediaError;
        }
      }

      // تحديث الخصومات
      if (data.discounts) {
        await supabase.from("product_discounts").delete().eq("product_id", id);
        
        if (data.discounts.length > 0) {
          const { error: discountError } = await supabase
            .from("product_discounts")
            .insert(data.discounts.map(d => ({ ...d, product_id: id })));
          
          if (discountError) throw discountError;
        }
      }

      // تحديث المتغيرات
      if (data.variants) {
        await supabase.from("product_variants_advanced").delete().eq("product_id", id);
        
        if (data.variants.length > 0) {
          const { error: variantsError } = await supabase
            .from("product_variants_advanced")
            .insert(data.variants.map(v => ({ ...v, product_id: id })));
          
          if (variantsError) throw variantsError;
        }
      }

      // تحديث معلومات SEO
      if (data.seo) {
        await supabase.from("product_seo").delete().eq("product_id", id);
        
        const { error: seoError } = await supabase
          .from("product_seo")
          .insert([{ ...data.seo, product_id: id }]);
        
        if (seoError) throw seoError;
      }

      // تحديث معلومات الشحن
      if (data.shipping) {
        await supabase.from("product_shipping").delete().eq("product_id", id);
        
        const { error: shippingError } = await supabase
          .from("product_shipping")
          .insert([{ ...data.shipping, product_id: id }]);
        
        if (shippingError) throw shippingError;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["advanced-products"] });
      queryClient.invalidateQueries({ queryKey: ["advanced-product", id] });
      toast.success("تم تحديث المنتج بنجاح");
    },
    onError: (error: any) => {
      toast.error("حدث خطأ في تحديث المنتج: " + error.message);
    }
  });
}

// خطاف لحساب السعر النهائي
export function useCalculateFinalPrice() {
  return (basePrice: number, discount?: ProductDiscount) => {
    if (!discount || !discount.is_active) return basePrice;

    const now = new Date();
    const startDate = discount.start_date ? new Date(discount.start_date) : null;
    const endDate = discount.end_date ? new Date(discount.end_date) : null;

    // التحقق من صحة التواريخ
    if (startDate && now < startDate) return basePrice;
    if (endDate && now > endDate) return basePrice;

    // حساب الخصم
    let discountAmount = 0;
    if (discount.discount_type === 'percent') {
      discountAmount = basePrice * (discount.discount_value / 100);
    } else {
      discountAmount = discount.discount_value;
    }

    return Math.max(basePrice - discountAmount, 0);
  };
}

// خطاف للتحقق من الصلاحيات
export function useProductPermissions() {
  return useQuery({
    queryKey: ["product-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_permissions")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    }
  });
}

// خطاف لسجل النشاط
export function useProductActivityLog(productId?: string) {
  return useQuery({
    queryKey: ["product-activity-log", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_activity_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId
  });
}