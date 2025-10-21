import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShippingZone {
  id: string;
  name: string;
  name_en: string;
  zone_code: string;
  zone_type: string;
  postal_codes: string[];
  is_active: boolean;
  created_at: string;
}

export const useShippingZones = () => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const createZone = async (zoneData: any) => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .insert([zoneData])
      .select()
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ في إضافة منطقة الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم إضافة منطقة الشحن بنجاح',
      description: 'تم حفظ البيانات'
    });

    await fetchZones();
    return { success: true, data };
  };

  const updateZone = async (id: string, updates: Partial<ShippingZone>) => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ في تحديث منطقة الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم تحديث منطقة الشحن بنجاح'
    });

    await fetchZones();
    return { success: true, data };
  };

  const deleteZone = async (id: string) => {
    const { error } = await supabase
      .from('shipping_zones')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ في حذف منطقة الشحن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم حذف منطقة الشحن بنجاح'
    });

    await fetchZones();
    return { success: true };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchZones();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    zones,
    loading,
    createZone,
    updateZone,
    deleteZone,
    refetch: fetchZones
  };
};
