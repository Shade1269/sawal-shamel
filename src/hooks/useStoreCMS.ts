// useState reserved for future use
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorePage {
  id: string;
  store_id: string;
  title: string;
  slug: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_home_page: boolean;
  sort_order: number;
  template_id?: string;
  published_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: any;
  preview_image_url?: string;
  category: string;
  is_system_template: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentSection {
  id: string;
  store_id: string;
  page_id?: string;
  section_name: string;
  section_type: 'page' | 'section' | 'widget' | 'article' | 'faq' | 'testimonial';
  content: any;
  settings: any;
  sort_order: number;
  is_global: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  store_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  alt_text?: string;
  tags?: string[];
  folder_path: string;
  uploaded_by?: string;
  created_at: string;
}

export interface CustomForm {
  id: string;
  store_id: string;
  form_name: string;
  form_title: string;
  fields: any[];
  settings: any;
  submit_url?: string;
  success_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStorePages = (storeId: string) => {
  return useQuery({
    queryKey: ['store-pages', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_pages')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as StorePage[];
    },
    enabled: !!storeId
  });
};

export const useStorePage = (pageId: string) => {
  return useQuery({
    queryKey: ['store-page', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      return data as StorePage;
    },
    enabled: !!pageId
  });
};

export const usePageTemplates = () => {
  return useQuery({
    queryKey: ['page-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as PageTemplate[];
    }
  });
};

export const useCreateStorePage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pageData: Omit<Partial<StorePage>, 'id' | 'created_at' | 'updated_at'> & { store_id: string; title: string; slug: string }) => {
      const { data, error } = await supabase
        .from('store_pages')
        .insert([pageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['store-pages', data.store_id] });
      toast({
        title: "تم إنشاء الصفحة بنجاح",
        description: "تم إنشاء الصفحة الجديدة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء الصفحة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateStorePage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<StorePage> & { id: string }) => {
      const { data, error } = await supabase
        .from('store_pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['store-pages', data.store_id] });
      queryClient.invalidateQueries({ queryKey: ['store-page', data.id] });
      toast({
        title: "تم تحديث الصفحة بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث الصفحة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteStorePage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await supabase
        .from('store_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-pages'] });
      toast({
        title: "تم حذف الصفحة بنجاح",
        description: "تم حذف الصفحة من المتجر",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف الصفحة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useContentSections = (storeId: string, pageId?: string) => {
  return useQuery({
    queryKey: ['content-sections', storeId, pageId],
    queryFn: async () => {
      let query = supabase
        .from('content_sections')
        .select('*')
        .eq('store_id', storeId);

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ContentSection[];
    },
    enabled: !!storeId
  });
};

export const useMediaLibrary = (storeId: string) => {
  return useQuery({
    queryKey: ['media-library', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaFile[];
    },
    enabled: !!storeId
  });
};

export const useCustomForms = (storeId: string) => {
  return useQuery({
    queryKey: ['custom-forms', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomForm[];
    },
    enabled: !!storeId
  });
};

export const useCreateCustomForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: Omit<Partial<CustomForm>, 'id' | 'created_at' | 'updated_at'> & { store_id: string; form_name: string; form_title: string }) => {
      const { data, error } = await supabase
        .from('custom_forms')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-forms', data.store_id] });
      toast({
        title: "تم إنشاء النموذج بنجاح",
        description: "تم إنشاء النموذج المخصص بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء النموذج",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};