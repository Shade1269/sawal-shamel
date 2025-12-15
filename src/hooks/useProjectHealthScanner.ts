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
  detected_at: string;
}

export interface HealthScanResult {
  success: boolean;
  issues: HealthIssue[];
  scanned_at: string;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
}

export const useProjectHealthScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
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

  return {
    isScanning,
    lastScan,
    error,
    runScan,
    issues: lastScan?.issues || []
  };
};
