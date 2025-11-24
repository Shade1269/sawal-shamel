import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  method: 'totp' | 'sms';
  last_used_at?: string;
  backup_codes_remaining?: number;
}

export function useTwoFactorAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);

  /**
   * Check if user has 2FA enabled
   */
  const checkTwoFactorStatus = async (): Promise<TwoFactorStatus | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('enabled, method, last_used_at, backup_codes')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No 2FA setup
          return null;
        }
        throw error;
      }

      return {
        enabled: data.enabled,
        method: data.method,
        last_used_at: data.last_used_at,
        backup_codes_remaining: data.backup_codes?.length || 0,
      };
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return null;
    }
  };

  /**
   * Setup 2FA - Generate secret and backup codes
   */
  const setup2FA = async (): Promise<TwoFactorSetupData | null> => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('يجب تسجيل الدخول أولاً');
        return null;
      }

      const response = await supabase.functions.invoke('setup-2fa', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const { data } = response.data;
      setSetupData(data);

      toast.success('تم إعداد المصادقة الثنائية', {
        description: 'امسح رمز QR بتطبيق المصادقة',
      });

      return data;
    } catch (error: any) {
      console.error('Error setting up 2FA:', error);
      toast.error('خطأ في إعداد المصادقة الثنائية', {
        description: error.message,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify 2FA code
   */
  const verify2FA = async (
    code: string,
    enableAfterVerify = false
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('يجب تسجيل الدخول أولاً');
        return false;
      }

      const response = await supabase.functions.invoke('verify-2fa', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          code: code.trim(),
          enableAfterVerify,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const { success, message, usedBackupCode } = response.data;

      if (!success) {
        toast.error('رمز خاطئ', {
          description: 'الرجاء المحاولة مرة أخرى',
        });
        return false;
      }

      if (enableAfterVerify) {
        toast.success('تم تفعيل المصادقة الثنائية! 🔒', {
          description: 'حسابك الآن محمي بالمصادقة الثنائية',
        });
      } else if (usedBackupCode) {
        toast.warning('تم استخدام رمز احتياطي', {
          description: 'هذا الرمز لن يعمل مرة أخرى',
        });
      } else {
        toast.success('تم التحقق بنجاح');
      }

      return true;
    } catch (error: any) {
      console.error('Error verifying 2FA:', error);
      toast.error('خطأ في التحقق', {
        description: error.message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Disable 2FA
   */
  const disable2FA = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('يجب تسجيل الدخول أولاً');
        return false;
      }

      const response = await supabase.functions.invoke('disable-2fa', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      toast.success('تم إيقاف المصادقة الثنائية', {
        description: 'يمكنك تفعيلها مجدداً في أي وقت',
      });

      setSetupData(null);
      return true;
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast.error('خطأ في إيقاف المصادقة الثنائية', {
        description: error.message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setupData,
    checkTwoFactorStatus,
    setup2FA,
    verify2FA,
    disable2FA,
  };
}
