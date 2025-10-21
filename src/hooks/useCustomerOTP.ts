import { useCallback, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return { e164: '', national: '' };
  }

  if (digits.startsWith('966')) {
    return { e164: `+${digits}`, national: `0${digits.slice(3)}` };
  }

  if (digits.startsWith('0')) {
    const core = digits.replace(/^0+/, '');
    return { e164: `+966${core}`, national: `0${core}` };
  }

  if (digits.startsWith('5') && digits.length === 9) {
    return { e164: `+966${digits}`, national: `0${digits}` };
  }

  return { e164: digits.startsWith('+') ? digits : `+${digits}`, national: digits };
};

const sanitizeForStorage = (phone: string) => phone.replace(/\D/g, '');

interface OTPResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export const useCustomerOTP = (storeId: string) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const sendOTP = useCallback(async (phone: string): Promise<OTPResponse> => {
    try {
      setLoading(true);

      const { e164 } = normalizePhone(phone);

      if (!e164 || e164.length < 8) {
        toast({
          title: 'رقم جوال غير صحيح',
          description: 'يرجى إدخال رقم جوال صحيح',
          variant: 'destructive',
        });
        return { success: false, error: 'Invalid phone number' };
      }

      if (!storeId) {
        throw new Error('لا يمكن إرسال الكود بدون معرف المتجر');
      }

      // إرسال OTP عبر Edge Function (Twilio + WhatsApp)
      const { data, error } = await supabase.functions.invoke('send-customer-otp', {
        body: { phone: e164, storeId }
      });

      if (error) {
        throw new Error(error.message || 'فشل في إرسال كود التحقق');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'فشل في إرسال كود التحقق');
      }

      // حفظ رقم الهاتف للتحقق لاحقاً
      sessionStorage.setItem(
        `customer-otp-phone:${storeId}`,
        JSON.stringify({ phone: e164, storeId })
      );

      toast({
        title: 'تم إرسال الكود',
        description: `تم إرسال كود التحقق عبر واتساب إلى ${e164}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending customer OTP:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: error.message || 'فشل في إرسال كود التحقق',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  const verifyOTP = useCallback(
    async (phone: string, code: string): Promise<OTPResponse> => {
      try {
        setVerifying(true);

        if (!storeId) {
          throw new Error('معرّف المتجر غير متوفر');
        }

        const cleanCode = code.replace(/\D/g, '');
        if (!cleanCode || cleanCode.length !== 6) {
          toast({
            title: 'كود غير صحيح',
            description: 'يرجى إدخال كود مكون من 6 أرقام',
            variant: 'destructive',
          });
          return { success: false, error: 'Invalid code format' };
        }

        const phoneDataRaw = sessionStorage.getItem(`customer-otp-phone:${storeId}`);
        if (!phoneDataRaw) {
          throw new Error('لم يتم العثور على جلسة التحقق');
        }

        const { phone: storedPhone } = JSON.parse(phoneDataRaw);
        const { e164 } = normalizePhone(storedPhone || phone);

        // التحقق من OTP عبر Edge Function
        const { data, error } = await supabase.functions.invoke('verify-customer-otp', {
          body: { phone: e164, otp: cleanCode, storeId }
        });

        if (error) {
          throw new Error(error.message || 'فشل في التحقق من الرمز');
        }

        if (!data?.success) {
          throw new Error(data?.error || 'رمز التحقق غير صحيح');
        }

        const sessionId = data.sessionId;

        // حفظ الجلسة محلياً
        const phoneFormats = normalizePhone(e164);
        const customerSession = {
          sessionId,
          phone: phoneFormats.national || sanitizeForStorage(phoneFormats.e164),
          storeId,
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        localStorage.setItem(`customer_session_${storeId}`, JSON.stringify(customerSession));
        sessionStorage.removeItem(`customer-otp-phone:${storeId}`);

        toast({
          title: 'تم التحقق بنجاح',
          description: 'مرحباً بك! يمكنك الآن مشاهدة طلباتك',
        });

        return { success: true, sessionId };
      } catch (error: any) {
        console.error('Error verifying customer OTP:', error);
        toast({
          title: 'خطأ في التحقق',
          description: error.message || 'كود التحقق غير صحيح أو منتهي الصلاحية',
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      } finally {
        setVerifying(false);
      }
    },
    [storeId, toast]
  );

  const getCustomerSession = useCallback(() => {
    if (!storeId) return null;

    try {
      const sessionData = localStorage.getItem(`customer_session_${storeId}`);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(`customer_session_${storeId}`);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting customer session:', error);
      return null;
    }
  }, [storeId]);

  const clearCustomerSession = useCallback(() => {
    if (!storeId) return;
    localStorage.removeItem(`customer_session_${storeId}`);
  }, [storeId]);

  return useMemo(
    () => ({
      sendOTP,
      verifyOTP,
      getCustomerSession,
      clearCustomerSession,
      loading,
      verifying,
    }),
    [sendOTP, verifyOTP, getCustomerSession, clearCustomerSession, loading, verifying]
  );
};