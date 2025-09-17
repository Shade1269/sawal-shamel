import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for Advanced Marketing System
export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'email_sequence' | 'abandoned_cart' | 'post_purchase' | 'welcome_series' | 're_engagement' | 'birthday_campaign';
  trigger_type: 'event' | 'time_based' | 'behavioral' | 'manual';
  trigger_conditions: Record<string, any>;
  target_audience_rules: Record<string, any>;
  campaign_steps: Array<any>;
  is_active: boolean;
  store_id?: string;
  affiliate_store_id?: string;
  created_by?: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  company?: string;
  lead_source: 'website' | 'social_media' | 'referral' | 'advertising' | 'manual' | 'api';
  lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lead_score: number;
  interest_level: 'low' | 'medium' | 'high';
  custom_fields: Record<string, any>;
  tags: string[];
  notes?: string;
  assigned_to?: string;
  store_id?: string;
  affiliate_store_id?: string;
  conversion_date?: string;
  conversion_value: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 'email_opened' | 'email_clicked' | 'page_visited' | 'form_submitted' | 'call_made' | 'meeting_scheduled' | 'note_added' | 'status_changed';
  activity_description: string;
  activity_data: Record<string, any>;
  performed_by?: string;
  created_at: string;
}

export interface BehavioralTrigger {
  id: string;
  trigger_name: string;
  trigger_description?: string;
  conditions: Record<string, any>;
  actions: Array<any>;
  is_active: boolean;
  store_id?: string;
  affiliate_store_id?: string;
  triggered_count: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PredictiveInsight {
  id: string;
  insight_type: 'sales_forecast' | 'customer_churn' | 'product_demand' | 'seasonal_trends' | 'customer_lifetime_value';
  insight_data: Record<string, any>;
  confidence_score?: number;
  prediction_period?: string;
  store_id?: string;
  affiliate_store_id?: string;
  generated_at: string;
  valid_until?: string;
}

// Hook for Marketing Campaigns
export function useMarketingCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_automation_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MarketingCampaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: Partial<MarketingCampaign>) => {
      const { data, error } = await supabase
        .from('marketing_automation_campaigns')
        .insert([campaignData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('تم إنشاء الحملة التسويقية بنجاح');
    },
    onError: (error) => {
      console.error('Error creating marketing campaign:', error);
      toast.error('فشل في إنشاء الحملة التسويقية');
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketing_automation_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('تم تحديث الحملة بنجاح');
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
      toast.error('فشل في تحديث الحملة');
    },
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    createCampaign,
    updateCampaign,
    isCreating: createCampaign.isPending,
    isUpdating: updateCampaign.isPending,
  };
}

// Hook for Lead Management
export function useLeadManagement() {
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const createLead = useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('تم إضافة العميل المحتمل بنجاح');
    },
    onError: (error) => {
      console.error('Error creating lead:', error);
      toast.error('فشل في إضافة العميل المحتمل');
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('تم تحديث العميل المحتمل بنجاح');
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error('فشل في تحديث العميل المحتمل');
    },
  });

  const addLeadActivity = useMutation({
    mutationFn: async (activityData: Partial<LeadActivity>) => {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert([activityData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
    },
    onError: (error) => {
      console.error('Error adding lead activity:', error);
      toast.error('فشل في إضافة نشاط العميل');
    },
  });

  return {
    leads: leads || [],
    isLoading,
    createLead,
    updateLead,
    addLeadActivity,
    isCreating: createLead.isPending,
    isUpdating: updateLead.isPending,
  };
}

// Hook for Behavioral Triggers
export function useBehavioralTriggers() {
  const queryClient = useQueryClient();

  const { data: triggers, isLoading } = useQuery({
    queryKey: ['behavioral-triggers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('behavioral_triggers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BehavioralTrigger[];
    },
  });

  const createTrigger = useMutation({
    mutationFn: async (triggerData: Partial<BehavioralTrigger>) => {
      const { data, error } = await supabase
        .from('behavioral_triggers')
        .insert([triggerData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavioral-triggers'] });
      toast.success('تم إنشاء المحفز السلوكي بنجاح');
    },
    onError: (error) => {
      console.error('Error creating trigger:', error);
      toast.error('فشل في إنشاء المحفز السلوكي');
    },
  });

  const updateTrigger = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BehavioralTrigger> & { id: string }) => {
      const { data, error } = await supabase
        .from('behavioral_triggers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavioral-triggers'] });
      toast.success('تم تحديث المحفز بنجاح');
    },
    onError: (error) => {
      console.error('Error updating trigger:', error);
      toast.error('فشل في تحديث المحفز');
    },
  });

  return {
    triggers: triggers || [],
    isLoading,
    createTrigger,
    updateTrigger,
    isCreating: createTrigger.isPending,
    isUpdating: updateTrigger.isPending,
  };
}

// Hook for Predictive Insights
export function usePredictiveInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['predictive-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictive_insights')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data as PredictiveInsight[];
    },
  });

  return {
    insights: insights || [],
    isLoading,
  };
}

// Hook for Advanced Analytics Events
export function useAdvancedAnalytics() {
  const trackEvent = useMutation({
    mutationFn: async (eventData: {
      event_type: string;
      event_name: string;
      event_data?: Record<string, any>;
      page_url?: string;
      referrer_url?: string;
      store_id?: string;
      affiliate_store_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('advanced_analytics_events')
        .insert([{
          ...eventData,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error tracking analytics event:', error);
    },
  });

  return {
    trackEvent,
    isTracking: trackEvent.isPending,
  };
}