import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthIssue {
  id: string;
  category: 'database' | 'security' | 'code' | 'performance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
  table_name?: string;
  auto_fixable?: boolean;
  detected_at: string;
}

export interface PerformanceMetrics {
  database_size_mb: number;
  active_connections: number;
  slow_queries_count: number;
  cache_hit_ratio: number;
  table_stats: { name: string; rows: number; size_kb: number }[];
}

export interface HealthScanResult {
  success: boolean;
  issues: HealthIssue[];
  performance?: PerformanceMetrics;
  scanned_at: string;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  auto_fixable_count?: number;
}

export interface CleanupResult {
  expired_sessions: number;
  expired_coupons: number;
  banned_members: number;
}

export const useProjectHealthScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastScan, setLastScan] = useState<HealthScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('project-health-scanner');

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.success) {
        setLastScan(data as HealthScanResult);
        
        if (data.critical_count > 0) {
          toast.error(`تم اكتشاف ${data.critical_count} مشكلة حرجة!`);
        } else if (data.warning_count > 0) {
          toast.warning(`تم اكتشاف ${data.warning_count} تحذير`);
        } else {
          toast.success('الفحص اكتمل بنجاح');
        }
      } else {
        throw new Error(data?.error || 'فشل الفحص');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(message);
      toast.error('فشل في إجراء الفحص: ' + message);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const runCleanup = useCallback(async (): Promise<CleanupResult | null> => {
    setIsCleaning(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/project-health-scanner?action=cleanup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.success && result.cleanup) {
        const { expired_sessions, expired_coupons, banned_members } = result.cleanup;
        toast.success(
          `تم التنظيف: ${expired_sessions} جلسة، ${expired_coupons} كوبون، ${banned_members} عضو`
        );
        return result.cleanup;
      } else {
        toast.error("حدث خطأ أثناء التنظيف");
        return null;
      }
    } catch (error) {
      console.error("Cleanup error:", error);
      toast.error("فشل التنظيف التلقائي");
      return null;
    } finally {
      setIsCleaning(false);
    }
  }, []);

  return {
    isScanning,
    isCleaning,
    lastScan,
    error,
    runScan,
    runCleanup,
    issues: lastScan?.issues || [],
    performance: lastScan?.performance || null,
    autoFixableCount: lastScan?.auto_fixable_count || (lastScan?.issues?.filter(i => i.auto_fixable).length || 0)
  };
};
