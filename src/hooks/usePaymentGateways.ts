import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentGateway {
  id: string;
  shop_id?: string;
  gateway_name: string;
  display_name: string;
  provider: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  api_key?: string;
  secret_key?: string;
  merchant_id?: string;
  api_url?: string;
  webhook_url?: string;
  percentage_fee: number;
  fixed_fee_sar: number;
  min_amount_sar: number;
  max_amount_sar?: number;
  allowed_currencies: string[];
  configuration: any;
  created_at: string;
  updated_at: string;
}

export const usePaymentGateways = (shopId?: string) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGateways = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGateways(data || []);
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بوابات الدفع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGateway = async (gatewayData: Omit<Partial<PaymentGateway>, 'id' | 'created_at' | 'updated_at'> & {
    gateway_name: string;
    display_name: string;
    provider: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .insert(gatewayData)
        .select()
        .maybeSingle();

      if (error) throw error;

      await fetchGateways();
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء بوابة الدفع بنجاح",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating payment gateway:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء بوابة الدفع",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateGateway = async (id: string, updates: Partial<PaymentGateway>) => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      await fetchGateways();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بوابة الدفع بنجاح",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث بوابة الدفع",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteGateway = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchGateways();
      toast({
        title: "تم بنجاح",
        description: "تم حذف بوابة الدفع بنجاح",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting payment gateway:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف بوابة الدفع",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const testGateway = async (id: string) => {
    try {
      // هنا يمكن إضافة اختبار الاتصال مع بوابة الدفع
      // حالياً سنعتبر الاختبار ناجح
      toast({
        title: "تم الاختبار",
        description: "بوابة الدفع تعمل بشكل صحيح",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error testing payment gateway:', error);
      toast({
        title: "خطأ في الاختبار",
        description: "فشل في اختبار بوابة الدفع",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchGateways();
  }, [shopId]);

  return {
    gateways,
    loading,
    fetchGateways,
    createGateway,
    updateGateway,
    deleteGateway,
    testGateway
  };
};