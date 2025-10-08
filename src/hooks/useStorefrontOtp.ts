import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { toast } from 'sonner';
import { useCustomerOTP } from '@/hooks/useCustomerOTP';

interface UseStorefrontOtpProps {
  storeSlug: string;
  storeId?: string;
}

export const useStorefrontOtp = ({ storeSlug, storeId }: UseStorefrontOtpProps) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'orders'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const {
    sendOTP,
    verifyOTP,
    getCustomerSession,
    clearCustomerSession,
    loading: sending,
    verifying,
  } = useCustomerOTP(storeId || '');

  useEffect(() => {
    if (!storeId) return;

    const savedSession = getCustomerSession();
    if (savedSession?.sessionId) {
      setSessionId(savedSession.sessionId);
      setPhone(savedSession.phone || '');
      setStep('orders');
    }
  }, [storeId, getCustomerSession]);

  const handleSendOtp = async () => {
    if (!storeId) {
      toast.error('خطأ في إرسال الرمز', {
        description: 'لم يتم العثور على معرف المتجر',
      });
      return;
    }

    const result = await sendOTP(phone);
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (!storeId) {
      toast.error('رمز التحقق غير صحيح', {
        description: 'لم يتم العثور على معرف المتجر',
      });
      return;
    }

    const result = await verifyOTP(phone, otp);
    if (result.success && result.sessionId) {
      setSessionId(result.sessionId);
      if (storeSlug) {
        localStorage.setItem(`sf:${storeSlug}:cust_sess`, result.sessionId);
      }
      setStep('orders');
    }
  };

  // Fetch orders
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['customer-orders', storeId, sessionId],
    queryFn: async () => {
      if (!storeId || !sessionId) return [];

      const { data, error } = await supabasePublic.rpc('get_store_orders_for_session', {
        p_store_id: storeId,
        p_session_id: sessionId
      });

      if (error) throw error;
      return data;
    },
    enabled: !!storeId && !!sessionId && step === 'orders'
  });

  const handleLogout = () => {
    if (storeSlug) {
      localStorage.removeItem(`sf:${storeSlug}:cust_sess`);
    }
    clearCustomerSession();
    setSessionId(null);
    setPhone('');
    setOtp('');
    setStep('phone');
  };

  return {
    step,
    phone,
    setPhone,
    otp,
    setOtp,
    sessionId,
    orders,
    ordersLoading,
    sendOtpMutation: {
      mutate: handleSendOtp,
      isPending: sending,
    },
    verifyOtpMutation: {
      mutate: handleVerifyOtp,
      isPending: verifying,
    },
    refetchOrders,
    handleLogout
  };
};