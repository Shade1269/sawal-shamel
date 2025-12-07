import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShippingProvider {
  id: string;
  name: string;
  name_en: string;
  code: string;
  api_endpoint?: string | null;
  logo_url?: string | null;
  base_price_sar?: number;
  is_active: boolean | null;
  configuration: any;
  supported_services?: any;
  created_at: string | null;
  updated_at?: string | null;
}

export interface ShippingZone {
  id: string;
  name: string;
  name_en: string;
  zone_code: string;
  zone_type: string;
  postal_codes: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
  parent_zone_id?: string | null;
  delivery_days_min?: number | null;
  delivery_days_max?: number | null;
}

export interface ShippingRate {
  id: string;
  provider_id: string;
  zone_id: string;
  service_type: string;
  weight_from: number | null;
  weight_to: number | null;
  base_price: number | null;
  price_per_kg: number | null;
  min_price?: number | null;
  max_price?: number | null;
  is_active?: boolean | null;
  created_at: string | null;
  zone?: any;
}

export const useShippingManagement = () => {
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    const { data, error } = await supabase
      .from('shipping_providers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل شركات الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setProviders(data || []);
  };

  const fetchZones = async () => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل مناطق الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setZones(data || []);
  };

  const fetchRates = async () => {
    const { data, error } = await supabase
      .from('shipping_rates')
      .select(`
        *,
        provider:shipping_providers(name, code),
        zone:shipping_zones(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل أسعار الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setRates(data || []);
  };

  const calculateShippingCost = async (
    cityName: string,
    weight: number,
    serviceType: string = 'standard',
    isCOD: boolean = false
  ) => {
    try {
      // Find the zone that contains this city
      const zone = zones.find(z => 
        z.postal_codes.some(city => 
          city.toLowerCase().includes(cityName.toLowerCase()) ||
          cityName.toLowerCase().includes(city.toLowerCase())
        )
      );

      if (!zone) {
        return {
          success: false,
          error: 'المدينة غير مدعومة في نطاقات الشحن الحالية'
        };
      }

      // Get rates for this zone and service type
      const applicableRates = rates.filter(rate => 
        rate.zone_id === zone.id &&
        rate.service_type === serviceType &&
        weight >= rate.weight_from &&
        weight <= rate.weight_to
      );

      if (applicableRates.length === 0) {
        return {
          success: false,
          error: 'لا توجد أسعار شحن متاحة لهذا الوزن والنوع'
        };
      }

      // Calculate costs for each provider
      const costs = applicableRates.map(rate => {
        const baseCost = rate.base_price + (weight * rate.price_per_kg);
        const codFee = isCOD ? 5 : 0; // Fixed COD fee for now
        const totalCost = Math.max(baseCost + codFee, rate.min_price || 0);

        const provider = providers.find(p => p.id === rate.provider_id);

        return {
          providerId: rate.provider_id,
          providerName: provider?.name || 'غير معروف',
          serviceType: rate.service_type,
          baseCost,
          codFee,
          totalCost,
          estimatedDeliveryDays: getEstimatedDelivery(serviceType)
        };
      });

      return {
        success: true,
        costs: costs.sort((a, b) => a.totalCost - b.totalCost)
      };

    } catch (error) {
      return {
        success: false,
        error: 'خطأ في حساب تكلفة الشحن'
      };
    }
  };

  const getEstimatedDelivery = (serviceType: string): string => {
    switch (serviceType) {
      case 'express': return '1-2 أيام';
      case 'overnight': return 'نفس اليوم';
      case 'registered': return '3-5 أيام';
      default: return '2-4 أيام';
    }
  };

  const createProvider = async (providerData: any) => {
    const { data, error } = await supabase
      .from('shipping_providers')
      .insert([providerData])
      .select()
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ في إضافة شركة الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم إضافة شركة الشحن بنجاح',
      description: 'تم حفظ البيانات'
    });

    await fetchProviders();
    return { success: true, data };
  };

  const updateProvider = async (id: string, updates: Partial<ShippingProvider>) => {
    const { data, error } = await supabase
      .from('shipping_providers')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ في تحديث شركة الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم تحديث شركة الشحن بنجاح'
    });

    await fetchProviders();
    return { success: true, data };
  };

  const createRate = async (rateData: any) => {
    const { data, error } = await supabase
      .from('shipping_rates')
      .insert([rateData])
      .select()
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ في إضافة سعر الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم إضافة سعر الشحن بنجاح'
    });

    await fetchRates();
    return { success: true, data };
  };

  const updateRate = async (id: string, updates: Partial<ShippingRate>) => {
    const { data, error } = await supabase
      .from('shipping_rates')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ في تحديث سعر الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم تحديث سعر الشحن بنجاح'
    });

    await fetchRates();
    return { success: true, data };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProviders(),
        fetchZones(),
        fetchRates()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    providers,
    zones,
    rates,
    loading,
    calculateShippingCost,
    createProvider,
    updateProvider,
    createRate,
    updateRate,
    refetch: async () => {
      await Promise.all([
        fetchProviders(),
        fetchZones(),
        fetchRates()
      ]);
    }
  };
};