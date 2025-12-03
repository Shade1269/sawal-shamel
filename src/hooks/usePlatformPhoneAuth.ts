import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneAuthResponse {
  success: boolean;
  error?: string;
  code?: 'COOLDOWN' | 'INSUFFICIENT_BALANCE' | 'RATE_LIMIT' | 'GENERIC';
  cooldownSeconds?: number;
  isExistingUser?: boolean;
  existingRole?: 'affiliate' | 'merchant' | null;
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
      if (digits.startsWith('00')) {
        return `+${digits.slice(2)}`;
      }
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

  // Validate Saudi phone number in E.164 format
  const isValidSaudiPhone = (formatted: string): boolean => {
    // Saudi numbers: +966 followed by 9 digits (total 13 characters)
    const saudiPattern = /^\+966[5-9]\d{8}$/; // +966 + 5-9 + 8 digits
    return saudiPattern.test(formatted);
  };
  const sendOTP = async (phone: string): Promise<PhoneAuthResponse> => {
    setLoading(true);
    try {
      // تنسيق رقم الجوال
      const formattedPhone = formatPhone(phone);

      // التحقق من صحة الرقم
      if (!isValidSaudiPhone(formattedPhone)) {
        toast.error('رقم غير صحيح', {
          description: 'رقم الجوال غير صالح. تأكد من الصيغة',
        });
        return { success: false, error: 'رقم الجوال غير صالح' };
      }

      // استدعاء Edge Function لإرسال OTP للمنصة الرئيسية
      const { data, error } = await supabase.functions.invoke('send-platform-otp', {
        body: {
          phone: formattedPhone
        }
      });

      // التحقق من البيانات أولاً (حتى مع وجود error، قد تكون data موجودة)
      if (data && !data.success) {
        const errText: string = data?.error || 'فشل في إرسال رمز التحقق';
        const details = data?.details || data?.twilioCode || '';
        const fullError = details ? `${errText} - ${details}` : errText;
        
        // التحقق من RATE_LIMIT (محاولات متكررة)
        if (data.code === 'RATE_LIMIT') {
          const secs = data.cooldownSeconds || 300;
          const mins = Math.ceil(secs / 60);
          toast.error('تم حظر الإرسال مؤقتاً', { 
            description: `تم حظر إرسال الرموز بسبب كثرة المحاولات. الرجاء الانتظار ${mins} دقيقة.`,
            duration: 5000 
          });
          return { success: false, error: errText, code: 'RATE_LIMIT', cooldownSeconds: secs };
        }
        
        // التحقق من cooldown العادي
        const match = /الرجاء\s+الانتظار\s+(\d+)\s*ثانية/i.exec(errText);
        if (match) {
          const secs = parseInt(match[1], 10) || 30;
          toast.error('تم الطلب كثيراً', { description: `الرجاء الانتظار ${secs} ثانية قبل طلب رمز جديد` });
          return { success: false, error: 'Cooldown', code: 'COOLDOWN', cooldownSeconds: secs };
        }
        
        toast.error('خطأ في الإرسال', {
          description: fullError,
        });
        return { success: false, error: fullError, code: 'GENERIC' };
      }

      if (error) {
        const context = (error as any)?.context;

        // محاولة قراءة Response body من context
        let responseData: any = null;
        if (context && context instanceof Response) {
          try {
            responseData = await context.json();
          } catch {
            // Ignore parse errors
          }
        }

        const status = context?.status || (error as any)?.status;
        const message = (error as any)?.message || '';

        // فقط عند 429 الحقيقي نعرض cooldown
        if (status === 429 || /too\s*many\s*requests/i.test(message)) {
          toast.error('تم الطلب كثيراً', {
            description: 'الرجاء الانتظار 30 ثانية قبل طلب رمز جديد',
          });
          return { success: false, error: 'Cooldown', code: 'COOLDOWN', cooldownSeconds: 30 };
        }

        if (status === 402 || /insufficient_balance|insufficient balance|لا توجد رصيد/i.test(message)) {
          toast.error('الخدمة غير متاحة مؤقتاً', {
            description: 'نفدت رصيد رسائل SMS حالياً. استخدم تسجيل الدخول بالبريد الإلكتروني أو حاول لاحقاً.',
          });
          return { success: false, error: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' };
        }
        
        // استخراج الخطأ الحقيقي من response body
        let displayError = 'فشل في إرسال رمز التحقق';
        
        if (responseData?.error) {
          displayError = responseData.error;
          // إضافة التفاصيل إن وجدت
          if (responseData.details) {
            displayError += ` - ${responseData.details}`;
          }
        } else if (message && !message.includes('non-2xx')) {
          displayError = message;
        }
        
        // إضافة حالة الخطأ
        if (status && status !== 200) {
          displayError += ` (HTTP ${status})`;
        }
        
        toast.error('خطأ في الإرسال', {
          description: displayError,
        });
        return { success: false, error: displayError, code: 'GENERIC' };
      }

      // إظهار OTP في التطوير إذا كان متوفراً
      const otpMessage = data?.otp 
        ? `تم إرسال رمز التحقق إلى ${formattedPhone}\nالرمز: ${data.otp}`
        : `تم إرسال رمز التحقق إلى ${formattedPhone}`;

      toast.success('تم الإرسال', {
        description: otpMessage,
      });

      return { 
        success: true, 
        isExistingUser: data?.is_existing_user || false,
        existingRole: data?.existing_role || null
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'حدث خطأ غير متوقع';
      
      toast.error('خطأ', {
        description: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone: string, otp: string, role: 'affiliate' | 'merchant'): Promise<PhoneAuthResponse> => {
    setVerifying(true);
    try {
      const formattedPhone = formatPhone(phone);

      // استدعاء Edge Function للتحقق من OTP للمنصة الرئيسية
      const { data, error } = await supabase.functions.invoke('verify-platform-otp', {
        body: {
          phone: formattedPhone,
          otp: otp,
          role: role
        }
      });

      if (error) {
        toast.error('خطأ في التحقق', {
          description: 'فشل في التحقق من الرمز',
        });
        return { success: false, error: error.message };
      }

      // التحقق من نجاح العملية أولاً
      if (!data?.success) {
        let errorMessage = data?.error || 'رمز التحقق غير صحيح';
        if (typeof errorMessage === 'string' && (errorMessage.includes('expired') || errorMessage.includes('منتهي'))) {
          errorMessage = 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.';
        }
        toast.error('خطأ في التحقق', { description: errorMessage });
        return { success: false, error: errorMessage };
      }

      // التحقق الناجح - استخدام magic_link للمصادقة
      if (data?.magic_link || data?.redirect_url) {
        const authUrl = data.magic_link || data.redirect_url;
        // إعادة التوجيه للرابط السحري لإكمال المصادقة
        window.location.href = authUrl;
        return { success: true };
      }

      // Fallback: للتوافق مع البنية القديمة
      if (data?.session?.email && data?.session?.email_otp) {
        const { error: authError } = await supabase.auth.verifyOtp({
          email: data.session.email,
          token: data.session.email_otp,
          type: 'email',
        });

        if (authError) {
          toast.error('خطأ', { description: 'فشل في تسجيل الدخول' });
          return { success: false, error: authError.message };
        }
        return { success: true };
      }

      // لم يتم إرجاع بيانات جلسة صالحة
      toast.error('خطأ', { description: 'فشل في إنشاء الجلسة' });
      return { success: false, error: 'No session data' };
    } catch (error: any) {
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
