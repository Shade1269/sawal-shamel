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
      // Already in international format with plus
      if (input.startsWith('+')) return input;
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
  const sendOTP = async (phone: string): Promise<PhoneAuthResponse> => {
    setLoading(true);
    try {
      // تنسيق رقم الجوال
      const formattedPhone = formatPhone(phone);

      console.log('Sending OTP to:', formattedPhone);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
        }
      });

      if (error) {
        console.error('Supabase OTP error:', error);
        
        let errorMessage = 'فشل في إرسال رمز التحقق';
        if (error.message.includes('rate limit')) {
          errorMessage = 'تم تجاوز حد الإرسال. حاول بعد دقائق.';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'رقم الجوال غير صحيح';
        }

        toast.error('خطأ في الإرسال', {
          description: errorMessage,
        });

        return { success: false, error: errorMessage };
      }

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

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('Supabase verify error:', error);
        
        let errorMessage = 'رمز التحقق غير صحيح';
        if (error.message.includes('expired')) {
          errorMessage = 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'رمز التحقق غير صحيح';
        }

        toast.error('خطأ في التحقق', {
          description: errorMessage,
        });

        return { success: false, error: errorMessage };
      }

      if (!data.user) {
        toast.error('خطأ', {
          description: 'لم يتم التحقق من المستخدم',
        });
        return { success: false, error: 'لم يتم التحقق من المستخدم' };
      }

      // التأكد من وجود profile
      await ensureProfile(data.user.id, formattedPhone);

      toast.success('تم التحقق بنجاح!', {
        description: 'مرحباً بك في المنصة',
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

  const ensureProfile = async (userId: string, phone: string) => {
    try {
      // التحقق من وجود profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        console.log('Profile exists, updating activity');
        // تحديث آخر نشاط
        await supabase
          .from('profiles')
          .update({ 
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('auth_user_id', userId);
        return;
      }

      // إنشاء profile جديد
      console.log('Creating new profile');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          auth_user_id: userId,
          phone: phone,
          full_name: phone,
          role: 'affiliate',
          is_active: true,
          points: 0,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // لا نرمي خطأ لأن المصادقة نجحت
      } else {
        console.log('Profile created successfully');
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
      // لا نرمي خطأ لأن المصادقة نجحت
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
