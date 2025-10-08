import { useCallback, useMemo, useState } from 'react';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { useToast } from '@/hooks/use-toast';

const CONFIRMATION_STORAGE_KEY = (storeId: string) => `customer-otp-confirmation:${storeId}`;

const ensureRecaptchaContainer = (containerId: string) => {
  if (typeof window === 'undefined') return;

  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.display = 'none';
    document.body.appendChild(container);
  }
};

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

const createOrExtendSession = async (
  storeId: string,
  phoneFormats: { e164: string; national: string }
) => {
  if (!storeId) {
    throw new Error('معرّف المتجر غير متوفر');
  }

  const phoneForStorage = phoneFormats.national || phoneFormats.e164;
  const sanitizedPhone = sanitizeForStorage(phoneForStorage);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { data: existingSession, error: fetchError } = await supabasePublic
    .from('customer_otp_sessions')
    .select('id, expires_at')
    .eq('store_id', storeId)
    .eq('phone', sanitizedPhone)
    .eq('verified', true)
    .order('verified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.warn('Failed to fetch existing customer session:', fetchError);
  }

  if (existingSession && existingSession.id) {
    try {
      await supabasePublic
        .from('customer_otp_sessions')
        .update({
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', existingSession.id);
    } catch (updateError) {
      console.warn('Failed to extend existing session:', updateError);
    }

    return existingSession.id as string;
  }

  const { data: insertedSession, error: insertError } = await supabasePublic
    .from('customer_otp_sessions')
    .insert({
      store_id: storeId,
      phone: sanitizedPhone,
      otp_code: 'firebase',
      verified: true,
      verified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single();

  if (insertError || !insertedSession) {
    throw insertError || new Error('تعذر إنشاء جلسة العميل');
  }

  return insertedSession.id as string;
};

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

      ensureRecaptchaContainer('storefront-customer-recaptcha');

      const { setupRecaptcha, sendSMSOTP } = await import('@/lib/firebase');
      const verifier = await setupRecaptcha('storefront-customer-recaptcha');

      const result = await sendSMSOTP(e164, verifier);
      if (!result.success) {
        throw new Error(result.error || 'فشل في إرسال كود التحقق');
      }

      sessionStorage.setItem(
        CONFIRMATION_STORAGE_KEY(storeId),
        JSON.stringify({
          verificationId: result.confirmationResult.verificationId,
          phone: e164,
          storeId,
        })
      );

      toast({
        title: 'تم إرسال الكود',
        description: `تم إرسال كود التحقق إلى ${e164}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending OTP via Firebase:', error);
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

        const confirmationRaw = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY(storeId));
        if (!confirmationRaw) {
          throw new Error('لم يتم العثور على جلسة التحقق');
        }

        const { verificationId, phone: storedPhone } = JSON.parse(confirmationRaw);

        const { PhoneAuthProvider, signInWithCredential } = await import('firebase/auth');
        const { getFirebaseAuth } = await import('@/lib/firebase');

        const auth = await getFirebaseAuth();
        if (!auth) {
          throw new Error('خدمة Firebase غير متوفرة حالياً');
        }

        const credential = PhoneAuthProvider.credential(verificationId, cleanCode);
        await signInWithCredential(auth, credential);

        sessionStorage.removeItem(CONFIRMATION_STORAGE_KEY(storeId));

        if (window.recaptchaVerifier) {
          try {
            await window.recaptchaVerifier.clear();
            delete window.recaptchaVerifier;
          } catch (recaptchaError) {
            console.log('Error clearing reCAPTCHA:', recaptchaError);
          }
        }

        const phoneFormats = normalizePhone(storedPhone || phone);
        const sessionId = await createOrExtendSession(storeId, phoneFormats);

        const customerSession = {
          sessionId,
          phone: phoneFormats.national || sanitizeForStorage(phoneFormats.e164),
          storeId,
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        localStorage.setItem(`customer_session_${storeId}`, JSON.stringify(customerSession));

        toast({
          title: 'تم التحقق بنجاح',
          description: 'مرحباً بك! يمكنك الآن مشاهدة طلباتك',
        });

        return { success: true, sessionId };
      } catch (error: any) {
        console.error('Error verifying OTP via Firebase:', error);
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