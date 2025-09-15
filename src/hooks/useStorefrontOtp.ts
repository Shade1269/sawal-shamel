import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { toast } from 'sonner';

interface UseStorefrontOtpProps {
  storeSlug: string;
  storeId?: string;
}

export const useStorefrontOtp = ({ storeSlug, storeId }: UseStorefrontOtpProps) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'orders'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check for existing session on mount
  React.useEffect(() => {
    if (storeSlug) {
      const savedSessionId = localStorage.getItem(`sf:${storeSlug}:cust_sess`);
      if (savedSessionId) {
        setSessionId(savedSessionId);
        setStep('orders');
      }
    }
  }, [storeSlug]);

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      if (!storeId || !phone) throw new Error('Missing store ID or phone');

      const { data, error } = await supabasePublic.rpc('create_customer_otp_session', {
        p_store_id: storeId,
        p_phone: phone
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('تم إرسال رمز التحقق', {
        description: 'تحقق من رسائل الجوال الخاصة بك'
      });
      setStep('otp');
    },
    onError: (error: any) => {
      toast.error('خطأ في إرسال الرمز', {
        description: error.message
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!storeId || !phone || !otp) throw new Error('Missing required data');

      const { data, error } = await supabasePublic.rpc('verify_customer_otp', {
        p_store_id: storeId,
        p_phone: phone,
        p_code: otp
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSessionId(String(data));
      if (storeSlug && data) {
        localStorage.setItem(`sf:${storeSlug}:cust_sess`, String(data));
      }
      toast.success('تم التحقق بنجاح');
      setStep('orders');
    },
    onError: (error: any) => {
      toast.error('رمز التحقق غير صحيح', {
        description: error.message
      });
    }
  });

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
    sendOtpMutation,
    verifyOtpMutation,
    refetchOrders,
    handleLogout
  };
};