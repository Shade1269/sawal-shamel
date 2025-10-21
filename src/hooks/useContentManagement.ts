import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for Content Management System
export interface PageTemplate {
  id: string;
  template_name: string;
  template_description?: string;
  template_category: string;
  template_data: Record<string, any>;
  preview_image_url?: string;
  is_premium: boolean;
  is_active: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomPage {
  id: string;
  page_title: string;
  page_slug: string;
  meta_description?: string;
  meta_keywords?: string[];
  page_content: Record<string, any>;
  page_settings: Record<string, any>;
  template_id?: string;
  store_id?: string;
  affiliate_store_id?: string;
  is_published: boolean;
  is_homepage: boolean;
  view_count: number;
  seo_score?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ContentWidget {
  id: string;
  widget_name: string;
  widget_type: string;
  widget_config: Record<string, any>;
  widget_data: Record<string, any>;
  page_id: string;
  section_id?: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  block_name: string;
  block_category: string;
  block_description?: string;
  block_template: Record<string, any>;
  preview_image_url?: string;
  is_premium: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SEOAnalytics {
  id: string;
  page_id: string;
  keyword: string;
  search_volume?: number;
  ranking_position?: number;
  click_through_rate?: number;
  impressions: number;
  clicks: number;
  date_recorded: string;
  created_at: string;
}

export interface PageRevision {
  id: string;
  page_id: string;
  revision_number: number;
  content_snapshot: Record<string, any>;
  change_description?: string;
  created_by?: string;
  created_at: string;
}

// Hook for Page Templates
export function usePageTemplates() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['page-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_page_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PageTemplate[];
    },
  });

  return {
    templates: templates || [],
    isLoading,
  };
}

// Hook for Custom Pages
export function useCustomPages() {
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['custom-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_custom_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomPage[];
    },
  });

  const createPage = useMutation({
    mutationFn: async (pageData: Partial<CustomPage>) => {
      const { data, error } = await supabase
        .from('cms_custom_pages')
        .insert([pageData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast.success('تم إنشاء الصفحة بنجاح');
    },
    onError: (error) => {
      console.error('Error creating page:', error);
      toast.error('فشل في إنشاء الصفحة');
    },
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_custom_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast.success('تم تحديث الصفحة بنجاح');
    },
    onError: (error) => {
      console.error('Error updating page:', error);
      toast.error('فشل في تحديث الصفحة');
    },
  });

  const publishPage = useMutation({
    mutationFn: async (pageId: string) => {
      const { data, error } = await supabase
        .from('cms_custom_pages')
        .update({ 
          is_published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast.success('تم نشر الصفحة بنجاح');
    },
    onError: (error) => {
      console.error('Error publishing page:', error);
      toast.error('فشل في نشر الصفحة');
    },
  });

  return {
    pages: pages || [],
    isLoading,
    createPage,
    updatePage,
    publishPage,
    isCreating: createPage.isPending,
    isUpdating: updatePage.isPending,
    isPublishing: publishPage.isPending,
  };
}

// Hook for Content Widgets
export function useContentWidgets(pageId?: string) {
  const queryClient = useQueryClient();

  const { data: widgets, isLoading } = useQuery({
    queryKey: ['content-widgets', pageId],
    queryFn: async () => {
      let query = supabase
        .from('cms_content_widgets')
        .select('*')
        .order('sort_order', { ascending: true });

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ContentWidget[];
    },
    enabled: !!pageId,
  });

  const createWidget = useMutation({
    mutationFn: async (widgetData: Partial<ContentWidget>) => {
      const { data, error } = await supabase
        .from('cms_content_widgets')
        .insert([widgetData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-widgets'] });
      toast.success('تم إضافة العنصر بنجاح');
    },
    onError: (error) => {
      console.error('Error creating widget:', error);
      toast.error('فشل في إضافة العنصر');
    },
  });

  const updateWidget = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentWidget> & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_content_widgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-widgets'] });
      toast.success('تم تحديث العنصر بنجاح');
    },
    onError: (error) => {
      console.error('Error updating widget:', error);
      toast.error('فشل في تحديث العنصر');
    },
  });

  const deleteWidget = useMutation({
    mutationFn: async (widgetId: string) => {
      const { error } = await supabase
        .from('cms_content_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-widgets'] });
      toast.success('تم حذف العنصر بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting widget:', error);
      toast.error('فشل في حذف العنصر');
    },
  });

  return {
    widgets: widgets || [],
    isLoading,
    createWidget,
    updateWidget,
    deleteWidget,
    isCreating: createWidget.isPending,
    isUpdating: updateWidget.isPending,
    isDeleting: deleteWidget.isPending,
  };
}

// Hook for Content Blocks Library
export function useContentBlocksLibrary() {
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['content-blocks-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content_blocks_library')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data as ContentBlock[];
    },
  });

  return {
    blocks: blocks || [],
    isLoading,
  };
}

// Hook for SEO Analytics
export function useSEOAnalytics(pageId?: string) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['seo-analytics', pageId],
    queryFn: async () => {
      let query = supabase
        .from('cms_seo_analytics')
        .select('*')
        .order('date_recorded', { ascending: false });

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SEOAnalytics[];
    },
    enabled: !!pageId,
  });

  return {
    analytics: analytics || [],
    isLoading,
  };
}

// Hook for Page Revisions
export function usePageRevisions(pageId?: string) {
  const { data: revisions, isLoading } = useQuery({
    queryKey: ['page-revisions', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_page_revisions')
        .select('*')
        .eq('page_id', pageId!)
        .order('revision_number', { ascending: false });

      if (error) throw error;
      return data as PageRevision[];
    },
    enabled: !!pageId,
  });

  return {
    revisions: revisions || [],
    isLoading,
  };
}