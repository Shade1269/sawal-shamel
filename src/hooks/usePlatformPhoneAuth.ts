import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneAuthResponse {
  success: boolean;
  error?: string;
}

export const usePlatformPhoneAuth = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Normalize phone to E.164 (KSA default). Examples:
  // 0501234567 -> +966501234567, 966501234567 -> +966501234567, 00966501234567 -> +966501234567, +966501234567 -> +966501234567
  const formatPhone = (input: string) => {
    try {
      const digits = input.replace(/\D/g, '');
      // If already formatted with +, normalize +9660XXXXXXXX -> +966XXXXXXXX
      if (input.startsWith('+')) {
        if (digits.startsWith('966')) {
          const national = digits.slice(3);
          const normalized = national.startsWith('0') ? national.slice(1) : national;
          return `+966${normalized}`;
        }
        return input; // other countries not supported in this flow
      }
      // 00 -> +
      if (digits.startsWith('00')) return `+${digits.slice(2)}`;
      // Starts with country code 966
      if (digits.startsWith('966')) {
        const national = digits.slice(3);
        const normalized = national.startsWith('0') ? national.slice(1) : national;
        return `+966${normalized}`;
      }
      // Local format starting with 0 (e.g., 05...)
      if (digits.startsWith('0')) {
        return `+966${digits.slice(1)}`;
      }
      // Fallback: treat as national number without leading 0
      return `+966${digits}`;
    } catch {
      return input;
    }
  };

  // Validate phone number in E.164 format (accepts international +country numbers)
  const isValidSaudiPhone = (formatted: string): boolean => {
    const e164Pattern = /^\+\d{8,15}$/; // + and 8-15 digits
    const isValid = e164Pattern.test(formatted);

    if (!isValid) {
      console.log('Phone validation failed:', {
        input: formatted,
        pattern: 'Expected E.164 like +9665XXXXXXXX',
        length: formatted.length,
      });
    }

    return isValid;
  };
  const sendOTP = async (phone: string): Promise<PhoneAuthResponse> => {
    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);

      console.log('Original input:', phone);
      console.log('Formatted phone:', formattedPhone);

      if (!isValidSaudiPhone(formattedPhone)) {
        const errorMessage = `رقم الجوال غير صالح. تأكد من الصيغة: ${formattedPhone}`;
        console.error('Invalid phone format:', formattedPhone);
        
        toast.error('رقم غير صحيح', {
          description: errorMessage,
        });

        return { success: false, error: errorMessage };
      }

      console.log('✓ Phone validation passed, sending OTP via Supabase Phone Auth');

      // استخدام Supabase Phone Auth بدلاً من Firebase/Twilio
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
        }
      });

      if (error) {
        console.error('Supabase Phone Auth error:', error);
        toast.error('خطأ في الإرسال', {
          description: error.message || 'فشل في إرسال رمز التحقق',
        });
        return { success: false, error: error.message };
      }

      console.log('OTP sent successfully via Supabase Phone Auth');

      toast.success('تم الإرسال', {
        description: `تم إرسال رمز التحقق إلى ${formattedPhone}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      const errorMessage = error?.message || 'حدث خطأ غير متوقع';
      
      toast.error('خطأ', {
        description: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone: string, otp: string): Promise<PhoneAuthResponse> => {
    setVerifying(true);
    try {
      const formattedPhone = formatPhone(phone);

      console.log('Verifying OTP for:', formattedPhone);

      // التحقق من OTP باستخدام Supabase Phone Auth
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('Supabase OTP verification error:', error);
        let errorMessage = error.message;
        if (errorMessage.includes('expired') || errorMessage.includes('منتهي')) {
          errorMessage = 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.';
        } else if (errorMessage.includes('invalid')) {
          errorMessage = 'رمز التحقق غير صحيح';
        }
        
        toast.error('خطأ في التحقق', { 
          description: errorMessage 
        });
        return { success: false, error: errorMessage };
      }

      if (!data.session) {
        console.error('No session returned from verification');
        toast.error('خطأ في التحقق', { 
          description: 'فشل في إنشاء الجلسة' 
        });
        return { success: false, error: 'No session created' };
      }

      console.log('OTP verified successfully, user logged in');

      toast.success('تم التحقق بنجاح!', { 
        description: 'مرحباً بك في المنصة' 
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error?.message || 'حدث خطأ غير متوقع';
      
      toast.error('خطأ', {
        description: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      setVerifying(false);
    }
  };


  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('تم تسجيل الخروج بنجاح');
      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('خطأ في تسجيل الخروج');
      return { success: false, error: error.message };
    }
  };

  return {
    sendOTP,
    verifyOTP,
    signOut,
    loading,
    verifying,
  };
};
