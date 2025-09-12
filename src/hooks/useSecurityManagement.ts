import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FraudAlert {
  id: string;
  transaction_id?: string;
  order_id?: string;
  user_id?: string;
  alert_type: string;
  risk_score: number;
  status: 'PENDING' | 'REVIEWING' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED';
  metadata?: any;
  created_at: string;
}

export interface SecuritySetting {
  id: string;
  shop_id?: string;
  setting_name: string;
  setting_value: any;
  category: 'FRAUD_DETECTION' | 'ENCRYPTION' | 'BACKUP' | 'PCI_COMPLIANCE' | 'ACCESS_CONTROL';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackupLog {
  id: string;
  backup_type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
  backup_scope: 'DATABASE' | 'TRANSACTIONS' | 'USER_DATA' | 'SYSTEM_CONFIG';
  file_path: string;
  file_size_bytes?: number;
  checksum: string;
  backup_status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'VERIFIED';
  created_at: string;
  retention_until: string;
}

export interface SecurityAuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string;
  action_performed: string;
  risk_assessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  metadata?: any;
}

export const useSecurityManagement = () => {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFraudAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setFraudAlerts((data as any) || []);
    } catch (err) {
      console.error('Error fetching fraud alerts:', err);
      setError('فشل في جلب تنبيهات الاحتيال');
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSecuritySettings((data as any) || []);
    } catch (err) {
      console.error('Error fetching security settings:', err);
      setError('فشل في جلب إعدادات الأمان');
    }
  };

  const fetchBackupLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBackupLogs((data as any) || []);
    } catch (err) {
      console.error('Error fetching backup logs:', err);
      setError('فشل في جلب سجلات النسخ الاحتياطية');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs((data as any) || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('فشل في جلب سجلات التدقيق');
    }
  };

  const runFraudCheck = async (orderData: {
    user_id: string;
    order_id: string;
    transaction_data: any;
    user_data: any;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('fraud-detection', {
        body: orderData
      });

      if (error) throw error;

      toast({
        title: "فحص الاحتيال مكتمل",
        description: `مستوى المخاطر: ${data.risk_level} - النقاط: ${data.risk_score}`,
        variant: data.risk_level === 'HIGH' || data.risk_level === 'CRITICAL' ? "destructive" : "default"
      });

      return data;
    } catch (err) {
      console.error('Error running fraud check:', err);
      toast({
        title: "خطأ في فحص الاحتيال",
        description: "حدث خطأ أثناء فحص المعاملة",
        variant: "destructive"
      });
      throw err;
    }
  };

  const createBackup = async (backupConfig: {
    backup_type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
    backup_scope: 'DATABASE' | 'TRANSACTIONS' | 'USER_DATA' | 'SYSTEM_CONFIG';
    shop_id?: string;
    retention_days?: number;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-backup', {
        body: backupConfig
      });

      if (error) throw error;

      toast({
        title: "النسخة الاحتياطية مكتملة",
        description: `تم إنشاء النسخة الاحتياطية بنجاح - الحجم: ${data.estimated_size_mb} ميجابايت`,
      });

      await fetchBackupLogs();
      return data;
    } catch (err) {
      console.error('Error creating backup:', err);
      toast({
        title: "خطأ في النسخ الاحتياطي",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateSecuritySetting = async (settingName: string, settingValue: any, category: string, shopId?: string) => {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert({
          shop_id: shopId,
          setting_name: settingName,
          setting_value: settingValue,
          category: category,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم تحديث الإعدادات",
        description: "تم حفظ إعدادات الأمان بنجاح",
      });

      await fetchSecuritySettings();
      return data;
    } catch (err) {
      console.error('Error updating security setting:', err);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateFraudAlertStatus = async (alertId: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({
          status,
          resolution_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم تحديث التنبيه",
        description: "تم تحديث حالة تنبيه الاحتيال بنجاح",
      });

      await fetchFraudAlerts();
      return data;
    } catch (err) {
      console.error('Error updating fraud alert:', err);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث التنبيه",
        variant: "destructive"
      });
      throw err;
    }
  };

  const getSecurityInsights = () => {
    const totalAlerts = fraudAlerts.length;
    const pendingAlerts = fraudAlerts.filter(alert => alert.status === 'PENDING').length;
    const highRiskAlerts = fraudAlerts.filter(alert => alert.risk_score >= 70).length;
    const criticalAlerts = fraudAlerts.filter(alert => alert.risk_score >= 90).length;

    const recentBackups = backupLogs.filter(
      log => new Date(log.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const criticalEvents = auditLogs.filter(
      log => log.risk_assessment === 'HIGH' || log.risk_assessment === 'CRITICAL'
    ).length;

    return {
      totalAlerts,
      pendingAlerts,
      highRiskAlerts,
      criticalAlerts,
      recentBackups,
      criticalEvents,
      securityScore: Math.max(0, 100 - (pendingAlerts * 5) - (highRiskAlerts * 10) - (criticalAlerts * 20))
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchFraudAlerts(),
        fetchSecuritySettings(),
        fetchBackupLogs(),
        fetchAuditLogs()
      ]);
    } catch (err) {
      console.error('Error fetching security data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    fraudAlerts,
    securitySettings,
    backupLogs,
    auditLogs,
    loading,
    error,
    runFraudCheck,
    createBackup,
    updateSecuritySetting,
    updateFraudAlertStatus,
    getSecurityInsights,
    refetch: fetchAllData
  };
};