import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  compare_at_price_sar?: number;
  cost_price_sar?: number;
  sku?: string;
  barcode?: string;
  stock?: number;
  weight_kg?: number;
  dimensions_cm?: string;
  category_id?: string;
  brand_id?: string;
  tags: string[];
  is_active: boolean;
  featured: boolean;
  min_order_quantity?: number;
  max_order_quantity?: number;
  seo_title?: string;
  seo_description?: string;
  meta_keywords: string[];
  created_at: string;
  updated_at: string;
  merchant_id: string;
  // Relations
  product_categories?: { name: string; slug: string };
  product_brands?: { name: string; slug: string };
  product_images?: { id: string; image_url: string; alt_text?: string; sort_order: number }[];
  product_attributes?: { attribute_name: string; attribute_value: string }[];
}

export interface ProductFormData {
  title: string;
  description: string;
  price_sar: number;
  compare_at_price_sar?: number;
  cost_price_sar?: number;
  sku?: string;
  barcode?: string;
  stock?: number;
  weight_kg?: number;
  dimensions_cm?: string;
  category_id?: string;
  brand_id?: string;
  tags: string[];
  is_active: boolean;
  featured: boolean;
  min_order_quantity?: number;
  max_order_quantity?: number;
  seo_title?: string;
  seo_description?: string;
  meta_keywords: string[];
  merchant_id?: string;
}

export function useProducts(filters?: {
  search?: string;
  category_id?: string;
  brand_id?: string;
  is_active?: boolean;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_categories(name, slug),
          product_brands(name, slug),
          product_images(id, image_url, alt_text, sort_order),
          product_attributes(attribute_name, attribute_value)
        `)
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters?.brand_id) {
        query = query.eq("brand_id", filters.brand_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.featured !== undefined) {
        query = query.eq("featured", filters.featured);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    }
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories(name, slug),
          product_brands(name, slug),
          product_images(id, image_url, alt_text, sort_order),
          product_attributes(attribute_name, attribute_value)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormData & { merchant_id: string }) => {
      const { error } = await supabase
        .from("products")
        .insert(data as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم إنشاء المنتج بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إنشاء المنتج: " + error.message);
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const { error } = await supabase
        .from("products")
        .update(data as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("تم تحديث المنتج بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث المنتج: " + error.message);
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم حذف المنتج بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف المنتج: " + error.message);
    }
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    }
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    }
  });
}

export function useProductImages(productId: string) {
  return useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!productId
  });
}

export function useAddProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: string;
      image_url: string;
      alt_text?: string;
      sort_order?: number;
    }) => {
      const { error } = await supabase
        .from("product_images")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-images", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.product_id] });
      toast.success("تم إضافة الصورة بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إضافة الصورة: " + error.message);
    }
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { product_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-images", result.product_id] });
      queryClient.invalidateQueries({ queryKey: ["product", result.product_id] });
      toast.success("تم حذف الصورة بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف الصورة: " + error.message);
    }
  });
}