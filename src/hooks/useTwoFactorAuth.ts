/**
 * Two-Factor Authentication Hook
 * 
 * Note: This hook requires the 'two_factor_auth' table to exist in the database.
 * Since the table is not currently in the schema, this hook will return null/false
 * for all operations to prevent build errors.
 * 
 * To enable 2FA functionality, create the table first using a migration.
 */

import { useState } from 'react';
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
   * Currently disabled - requires two_factor_auth table
   */
  const checkTwoFactorStatus = async (): Promise<TwoFactorStatus | null> => {
    console.warn('2FA: two_factor_auth table does not exist in database');
    return null;
  };

  /**
   * Setup 2FA - Generate secret and backup codes
   * Currently disabled - requires two_factor_auth table
   */
  const setup2FA = async (): Promise<TwoFactorSetupData | null> => {
    toast.error('المصادقة الثنائية غير مفعلة حالياً', {
      description: 'يتطلب هذا إنشاء جدول two_factor_auth في قاعدة البيانات',
    });
    return null;
  };

  /**
   * Verify 2FA code
   * Currently disabled - requires two_factor_auth table
   */
  const verify2FA = async (
    code: string,
    enableAfterVerify = false
  ): Promise<boolean> => {
    toast.error('المصادقة الثنائية غير مفعلة حالياً');
    return false;
  };

  /**
   * Disable 2FA
   * Currently disabled - requires two_factor_auth table
   */
  const disable2FA = async (): Promise<boolean> => {
    toast.error('المصادقة الثنائية غير مفعلة حالياً');
    return false;
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
