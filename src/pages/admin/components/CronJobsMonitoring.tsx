import { Clock } from 'lucide-react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle, UnifiedBadge, UnifiedButton } from "@/components/design-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CronLog {
  id: string;
  job_name: string;
  executed_at: string | null;
  status: 'success' | 'partial_success' | 'error';
  message: string | null;
}

interface CronJobsMonitoringProps {
  cronLogs: CronLog[];
  loading: boolean;
  onRefresh: () => void;
}

export function CronJobsMonitoring({ cronLogs, loading, onRefresh }: CronJobsMonitoringProps) {
  return (
    <section aria-labelledby="cron-monitoring">
      <UnifiedCard className="admin-card-enhanced">
        <UnifiedCardHeader className="pb-6">
          <UnifiedCardTitle id="cron-monitoring" className="text-3xl font-black admin-card">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-info flex items-center justify-center shadow-glow">
                <Clock className="h-5 w-5 text-white" />
              </div>
              سجل المهام التلقائية (Cron Jobs)
            </div>
          </UnifiedCardTitle>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                آخر 50 عملية تلقائية لنظام المخزون الداخلي
              </p>
              <UnifiedButton
                onClick={onRefresh}
                size="sm"
                disabled={loading}
              >
                تحديث
              </UnifiedButton>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المهمة</TableHead>
                    <TableHead>وقت التنفيذ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الرسالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cronLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        لا توجد سجلات متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    cronLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.job_name}
                        </TableCell>
                        <TableCell>
                          {log.executed_at ? new Date(log.executed_at).toLocaleString('ar') : 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <UnifiedBadge
                            variant={
                              log.status === 'success' ? 'success' :
                              log.status === 'partial_success' ? 'warning' :
                              'error'
                            }
                          >
                            {log.status === 'success' ? 'نجح' :
                             log.status === 'partial_success' ? 'نجح جزئياً' :
                             'فشل'}
                          </UnifiedBadge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={log.message || ''}>
                            {log.message || 'لا توجد رسالة'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {cronLogs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                عرض {cronLogs.length} من آخر العمليات التلقائية لنظام المخزون
              </div>
            )}
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </section>
  );
}
