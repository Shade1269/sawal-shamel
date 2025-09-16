import { useState } from 'react';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { useToast } from '@/hooks/use-toast';

interface OTPResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export const useCustomerOTP = (storeId: string) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const sendOTP = async (phone: string): Promise<OTPResponse> => {
    try {
      setLoading(true);
      
      // تنظيف رقم الجوال (إزالة المسافات والرموز الخاصة)
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (!cleanPhone || cleanPhone.length < 10) {
        toast({
          title: "رقم جوال غير صحيح",
          description: "يرجى إدخال رقم جوال صحيح",
          variant: "destructive"
        });
        return { success: false, error: "Invalid phone number" };
      }

      // إنشاء جلسة OTP جديدة
      const { data, error } = await supabasePublic.functions.invoke('create-customer-otp-session', {
        body: { 
          store_id: storeId,
          phone: cleanPhone 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "تم إرسال الكود",
          description: "تم إرسال كود التحقق إلى رقم جوالك",
        });
        return { success: true, sessionId: data.sessionId };
      } else {
        throw new Error(data?.error || "فشل في إرسال كود التحقق");
      }

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "فشل في إرسال كود التحقق",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone: string, code: string): Promise<OTPResponse> => {
    try {
      setVerifying(true);
      
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanCode = code.replace(/\D/g, '');

      if (!cleanCode || cleanCode.length !== 6) {
        toast({
          title: "كود غير صحيح",
          description: "يرجى إدخال كود مكون من 6 أرقام",
          variant: "destructive"
        });
        return { success: false, error: "Invalid code format" };
      }

      // التحقق من كود OTP
      const { data, error } = await supabasePublic.functions.invoke('verify-customer-otp', {
        body: { 
          store_id: storeId,
          phone: cleanPhone,
          code: cleanCode 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "تم التحقق بنجاح",
          description: "مرحباً بك! يمكنك الآن مشاهدة طلباتك",
        });
        
        // حفظ جلسة العميل محلياً
        const customerSession = {
          sessionId: data.sessionId,
          phone: cleanPhone,
          storeId: storeId,
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
        };
        
        localStorage.setItem(`customer_session_${storeId}`, JSON.stringify(customerSession));
        
        return { success: true, sessionId: data.sessionId };
      } else {
        throw new Error(data?.error || "كود التحقق غير صحيح");
      }

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "خطأ في التحقق",
        description: error.message || "كود التحقق غير صحيح أو منتهي الصلاحية",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setVerifying(false);
    }
  };

  const getCustomerSession = () => {
    try {
      const sessionData = localStorage.getItem(`customer_session_${storeId}`);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // التحقق من انتهاء صلاحية الجلسة
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(`customer_session_${storeId}`);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting customer session:', error);
      return null;
    }
  };

  const clearCustomerSession = () => {
    localStorage.removeItem(`customer_session_${storeId}`);
  };

  return {
    sendOTP,
    verifyOTP,
    getCustomerSession,
    clearCustomerSession,
    loading,
    verifying
  };
};