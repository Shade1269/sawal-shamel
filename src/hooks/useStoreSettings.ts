import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoreSettings {
  payment_providers: any[];
  shipping_companies: any[];
}

export const useStoreSettings = (shopId: string | undefined) => {
  return useQuery({
    queryKey: ["store-settings", shopId],
    queryFn: async () => {
      if (!shopId) return null;
      
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("shop_id", shopId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching store settings:', error);
        return { payment_providers: [], shipping_companies: [] };
      }
      
      return data || { payment_providers: [], shipping_companies: [] };
    },
    enabled: !!shopId,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
    staleTime: 1000, // Consider data stale after 1 second
  });
};

export const getEnabledPaymentMethods = (storeSettings: any) => {
  if (!storeSettings || !Array.isArray(storeSettings.payment_providers)) return [];
  
  return storeSettings.payment_providers
    .filter((provider: any) => provider.enabled)
    .map((provider: any) => {
      // Map to payment method structure
      if (provider.name === 'الدفع نقداً عند الاستلام') {
        return {
          id: 'cod',
          name: 'الدفع عند الاستلام',
          description: 'ادفع نقداً عند وصول الطلب'
        };
      }
      return {
        id: provider.name.toLowerCase().replace(/\s+/g, '_'),
        name: provider.name,
        description: provider.name
      };
    });
};

export const getEnabledShippingMethods = (storeSettings: any) => {
  if (!storeSettings || !Array.isArray(storeSettings.shipping_companies)) return [];
  
  return storeSettings.shipping_companies
    .filter((company: any) => company.enabled)
    .map((company: any) => ({
      id: company.name.toLowerCase().replace(/\s+/g, '_'),
      name: company.name,
      price: company.price || 0,
      description: `${company.price || 0} ريال`
    }));
};