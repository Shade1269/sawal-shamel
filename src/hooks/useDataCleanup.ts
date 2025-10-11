import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataQualityCheck {
  check_category: string;
  check_name: string;
  status: 'ok' | 'warning' | 'error';
  found_issues: number;
  details: any;
}

interface CleanupResult {
  timestamp: string;
  quality_checks: any[];
  fixes_applied: any[];
  cleanup_done: any[];
  backfill_done: any[];
}

export function useDataCleanup() {
  const queryClient = useQueryClient();

  // فحص جودة البيانات
  const qualityCheckQuery = useQuery({
    queryKey: ['data-quality-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('check_all_data_quality');
      
      if (error) throw error;
      return data as DataQualityCheck[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // إصلاح البيانات المفقودة
  const fixMissingDataMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('auto_fix_missing_data');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const totalFixed = data?.reduce((sum: number, item: any) => sum + item.rows_affected, 0) || 0;
      toast.success(`تم إصلاح ${totalFixed} سجل بنجاح`);
      queryClient.invalidateQueries({ queryKey: ['data-quality-check'] });
    },
    onError: (error) => {
      toast.error('فشل إصلاح البيانات');
      console.error('Fix missing data error:', error);
    },
  });

  // حذف البيانات القديمة
  const cleanupExpiredMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('cleanup_expired_data');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const totalDeleted = data?.reduce((sum: number, item: any) => sum + item.rows_deleted, 0) || 0;
      toast.success(`تم حذف ${totalDeleted} سجل قديم`);
      queryClient.invalidateQueries({ queryKey: ['data-quality-check'] });
    },
    onError: (error) => {
      toast.error('فشل حذف البيانات القديمة');
      console.error('Cleanup expired data error:', error);
    },
  });

  // تحديث الإحصائيات
  const backfillStatsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('backfill_statistics');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const totalUpdated = data?.reduce((sum: number, item: any) => sum + item.rows_updated, 0) || 0;
      toast.success(`تم تحديث ${totalUpdated} سجل`);
      queryClient.invalidateQueries({ queryKey: ['data-quality-check'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
    onError: (error) => {
      toast.error('فشل تحديث الإحصائيات');
      console.error('Backfill statistics error:', error);
    },
  });

  // تشغيل التنظيف الشامل
  const fullCleanupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('run_full_cleanup');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      const fixesCount = data?.fixes_applied?.length || 0;
      const cleanupCount = data?.cleanup_done?.length || 0;
      const backfillCount = data?.backfill_done?.length || 0;
      
      toast.success(`تم التنظيف الشامل: ${fixesCount} إصلاحات، ${cleanupCount} حذف، ${backfillCount} تحديث`);
      queryClient.invalidateQueries({ queryKey: ['data-quality-check'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
    onError: (error) => {
      toast.error('فشل التنظيف الشامل');
      console.error('Full cleanup error:', error);
    },
  });

  // حساب إحصائيات المشاكل
  const getIssuesStats = () => {
    if (!qualityCheckQuery.data) return { total: 0, errors: 0, warnings: 0 };
    
    return qualityCheckQuery.data.reduce(
      (acc, check) => {
        acc.total += check.found_issues;
        if (check.status === 'error') acc.errors += check.found_issues;
        if (check.status === 'warning') acc.warnings += check.found_issues;
        return acc;
      },
      { total: 0, errors: 0, warnings: 0 }
    );
  };

  return {
    // البيانات
    qualityChecks: qualityCheckQuery.data || [],
    issuesStats: getIssuesStats(),
    
    // الحالات
    isChecking: qualityCheckQuery.isLoading,
    isFixing: fixMissingDataMutation.isPending,
    isCleaning: cleanupExpiredMutation.isPending,
    isBackfilling: backfillStatsMutation.isPending,
    isRunningFullCleanup: fullCleanupMutation.isPending,
    
    // الأخطاء
    error: qualityCheckQuery.error,
    
    // العمليات
    refetchQuality: qualityCheckQuery.refetch,
    fixMissingData: fixMissingDataMutation.mutate,
    cleanupExpired: cleanupExpiredMutation.mutate,
    backfillStats: backfillStatsMutation.mutate,
    runFullCleanup: fullCleanupMutation.mutate,
  };
}
