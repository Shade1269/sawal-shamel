import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromotionCampaign {
  id: string;
  campaign_name: string;
  campaign_name_ar?: string;
  description?: string;
  campaign_type: 'flash_sale' | 'seasonal' | 'bundle' | 'limited_time';
  status: 'draft' | 'active' | 'paused' | 'ended';
  start_date: string;
  end_date: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_products?: any;
  applicable_categories?: any;
  minimum_order_amount?: number;
  usage_limit?: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface BundleOffer {
  id: string;
  name: string;
  description?: string;
  bundle_products: any; // jsonb
  bundle_price: number;
  original_price: number;
  discount_percentage: number;
  is_active: boolean;
  store_id?: string;
  affiliate_store_id?: string;
  created_at: string;
  updated_at: string;
}

export const usePromotionCampaigns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['promotion-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotion_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any as PromotionCampaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: Omit<PromotionCampaign, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('promotion_campaigns')
        .insert({
          campaign_name: campaignData.campaign_name,
          campaign_name_ar: campaignData.campaign_name_ar,
          description: campaignData.description,
          campaign_type: campaignData.campaign_type,
          status: campaignData.status,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
          discount_type: campaignData.discount_type,
          discount_value: campaignData.discount_value,
          applicable_products: campaignData.applicable_products,
          applicable_categories: campaignData.applicable_categories,
          minimum_order_amount: campaignData.minimum_order_amount,
          usage_limit: campaignData.usage_limit,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-campaigns'] });
      toast({
        title: "تم إنشاء الحملة",
        description: "تم إنشاء حملة الترويج بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الحملة الترويجية",
        variant: "destructive",
      });
    },
  });

  return {
    campaigns,
    isLoading,
    createCampaign: createCampaign.mutate,
    isCreating: createCampaign.isPending,
  };
};

export const useBundleOffers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ['bundle-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BundleOffer[];
    },
  });

  const createBundle = useMutation({
    mutationFn: async (bundleData: Omit<BundleOffer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bundle_offers')
        .insert(bundleData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundle-offers'] });
      toast({
        title: "تم إنشاء العرض",
        description: "تم إنشاء عرض المجموعة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء عرض المجموعة",
        variant: "destructive",
      });
    },
  });

  return {
    bundles,
    isLoading,
    createBundle: createBundle.mutate,
    isCreating: createBundle.isPending,
  };
};