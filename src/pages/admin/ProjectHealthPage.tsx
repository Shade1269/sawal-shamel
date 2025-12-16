import { useEffect, useState } from 'react';
import { useProjectHealthScanner, HealthIssue } from '@/hooks/useProjectHealthScanner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Database, 
  Shield, 
  Code, 
  Zap,
  RefreshCw,
  CheckCircle2,
  Clock,
  Trash2,
  Download,
  Timer,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const getCategoryIcon = (category: HealthIssue['category']) => {
  switch (category) {
    case 'database': return Database;
    case 'security': return Shield;
    case 'code': return Code;
    case 'performance': return Zap;
    default: return Activity;
  }
};

const getCategoryLabel = (category: HealthIssue['category']) => {
  switch (category) {
    case 'database': return 'قاعدة البيانات';
    case 'security': return 'الأمان';
    case 'code': return 'الكود';
    case 'performance': return 'الأداء';
    default: return category;
  }
};

const getSeverityConfig = (severity: HealthIssue['severity']) => {
  switch (severity) {
    case 'critical': 
      return { 
        icon: AlertCircle, 
        variant: 'error' as const, 
        label: 'حرج',
        bgClass: 'bg-red-500/10 border-red-500/30'
      };
    case 'warning': 
      return { 
        icon: AlertTriangle, 
        variant: 'warning' as const, 
        label: 'تحذير',
        bgClass: 'bg-yellow-500/10 border-yellow-500/30'
      };
    case 'info': 
      return { 
        icon: Info, 
        variant: 'default' as const, 
        label: 'معلومة',
        bgClass: 'bg-blue-500/10 border-blue-500/30'
      };
  }
};

const IssueCard = ({ issue }: { issue: HealthIssue }) => {
  const CategoryIcon = getCategoryIcon(issue.category);
  const severityConfig = getSeverityConfig(issue.severity);
  const SeverityIcon = severityConfig.icon;

  return (
    <div className={`p-4 rounded-lg border ${severityConfig.bgClass} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-background/50">
          <SeverityIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-semibold text-foreground">{issue.title}</h4>
            <Badge variant={issue.severity === 'critical' ? 'destructive' : issue.severity === 'warning' ? 'secondary' : 'outline'}>
              {severityConfig.label}
            </Badge>
            <Badge variant="outline">
              <CategoryIcon className="h-3 w-3 ml-1" />
              {getCategoryLabel(issue.category)}
            </Badge>
            {issue.auto_fixable && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                <Wrench className="h-3 w-3 ml-1" />
                قابل للإصلاح
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {issue.suggestion}
            </span>
            {issue.table_name && (
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {issue.table_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectHealthPage = () => {
  const { isScanning, isCleaning, lastScan, runScan, runCleanup, issues, performance, error, autoFixableCount } = useProjectHealthScanner();
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    runScan();
  }, []);

  // Auto-scan every 30 minutes if enabled
  useEffect(() => {
    if (!autoScanEnabled) return;
    
    const interval = setInterval(() => {
      runScan();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoScanEnabled, runScan]);

  const handleCleanup = async () => {
    const result = await runCleanup();
    if (result) {
      await runScan();
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const now = new Date().toLocaleString('ar-SA');
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      const warningIssues = issues.filter(i => i.severity === 'warning');
      const infoIssues = issues.filter(i => i.severity === 'info');

      const reportContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير صحة المشروع - ${now}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; }
    h1 { color: #5A2647; border-bottom: 3px solid #5A2647; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    .stats { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
    .stat-box { background: #f5f5f5; padding: 15px 25px; border-radius: 8px; text-align: center; min-width: 100px; }
    .stat-number { font-size: 28px; font-weight: bold; color: #5A2647; }
    .stat-label { color: #666; font-size: 14px; }
    .issue { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .issue.critical { border-right: 4px solid #dc2626; }
    .issue.warning { border-right: 4px solid #eab308; }
    .issue.info { border-right: 4px solid #3b82f6; }
    .issue-title { font-weight: bold; margin-bottom: 5px; }
    .issue-desc { color: #666; margin-bottom: 5px; }
    .issue-suggestion { color: #5A2647; font-size: 14px; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>🔍 تقرير صحة المشروع</h1>
  <p>تاريخ التقرير: ${now}</p>
  
  <div class="stats">
    <div class="stat-box">
      <div class="stat-number">${issues.length}</div>
      <div class="stat-label">إجمالي المشاكل</div>
    </div>
    <div class="stat-box">
      <div class="stat-number" style="color: #dc2626;">${criticalIssues.length}</div>
      <div class="stat-label">حرجة</div>
    </div>
    <div class="stat-box">
      <div class="stat-number" style="color: #eab308;">${warningIssues.length}</div>
      <div class="stat-label">تحذيرات</div>
    </div>
    <div class="stat-box">
      <div class="stat-number" style="color: #3b82f6;">${infoIssues.length}</div>
      <div class="stat-label">معلومات</div>
    </div>
  </div>

  ${criticalIssues.length > 0 ? `
  <h2>🚨 مشاكل حرجة</h2>
  ${criticalIssues.map(issue => `
    <div class="issue critical">
      <div class="issue-title">${issue.title}</div>
      <div class="issue-desc">${issue.description}</div>
      <div class="issue-suggestion">💡 ${issue.suggestion}</div>
    </div>
  `).join('')}
  ` : ''}

  ${warningIssues.length > 0 ? `
  <h2>⚠️ تحذيرات</h2>
  ${warningIssues.map(issue => `
    <div class="issue warning">
      <div class="issue-title">${issue.title}</div>
      <div class="issue-desc">${issue.description}</div>
      <div class="issue-suggestion">💡 ${issue.suggestion}</div>
    </div>
  `).join('')}
  ` : ''}

  ${infoIssues.length > 0 ? `
  <h2>ℹ️ معلومات</h2>
  ${infoIssues.map(issue => `
    <div class="issue info">
      <div class="issue-title">${issue.title}</div>
      <div class="issue-desc">${issue.description}</div>
      <div class="issue-suggestion">💡 ${issue.suggestion}</div>
    </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام فحص صحة المشروع</p>
    <p>منصة أطلانتس © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;

      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } finally {
      setIsExporting(false);
    }
  };

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const infoIssues = issues.filter(i => i.severity === 'info');

  return (
    <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              مراقبة صحة المشروع
            </h1>
            <p className="text-muted-foreground mt-1">
              فحص شامل للكود، قاعدة البيانات، والأمان
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runScan} 
              disabled={isScanning}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'جاري الفحص...' : 'فحص الآن'}
            </Button>

            {autoFixableCount > 0 && (
              <Button
                onClick={handleCleanup}
                disabled={isCleaning}
                variant="outline"
                className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <Trash2 className={`h-4 w-4 ${isCleaning ? 'animate-spin' : ''}`} />
                تنظيف تلقائي ({autoFixableCount})
              </Button>
            )}

            <Button
              onClick={handleExportPDF}
              disabled={isExporting || issues.length === 0}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير PDF
            </Button>

            <Button
              onClick={() => setAutoScanEnabled(!autoScanEnabled)}
              variant={autoScanEnabled ? "default" : "outline"}
              className={`gap-2 ${autoScanEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <Timer className="h-4 w-4" />
              {autoScanEnabled ? 'الفحص التلقائي ✓' : 'فحص تلقائي'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{lastScan?.total_issues || 0}</div>
            <div className="text-sm text-muted-foreground">إجمالي النتائج</div>
          </Card>
          
          <Card className="p-4 text-center border-red-500/30 bg-red-500/5">
            <div className="text-3xl font-bold text-red-500">{lastScan?.critical_count || 0}</div>
            <div className="text-sm text-muted-foreground">حرج</div>
          </Card>
          
          <Card className="p-4 text-center border-yellow-500/30 bg-yellow-500/5">
            <div className="text-3xl font-bold text-yellow-500">{lastScan?.warning_count || 0}</div>
            <div className="text-sm text-muted-foreground">تحذيرات</div>
          </Card>
          
          <Card className="p-4 text-center border-blue-500/30 bg-blue-500/5">
            <div className="text-3xl font-bold text-blue-500">{lastScan?.info_count || 0}</div>
            <div className="text-sm text-muted-foreground">معلومات</div>
          </Card>

          <Card className="p-4 text-center border-green-500/30 bg-green-500/5">
            <div className="text-3xl font-bold text-green-500">{autoFixableCount}</div>
            <div className="text-sm text-muted-foreground">قابل للإصلاح</div>
          </Card>
        </div>

        {/* Performance Metrics - Database Monitoring */}
        {performance && (
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              مراقبة قاعدة البيانات
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{performance.cache_hit_ratio}%</div>
                <div className="text-xs text-muted-foreground">نسبة الكاش</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{performance.table_stats.reduce((sum, t) => sum + t.rows, 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">إجمالي السجلات</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{performance.table_stats.length}</div>
                <div className="text-xs text-muted-foreground">الجداول المراقبة</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{performance.slow_queries_count}</div>
                <div className="text-xs text-muted-foreground">استعلامات بطيئة</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">إحصائيات الجداول:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {performance.table_stats.map((table) => (
                  <div key={table.name} className="flex justify-between items-center p-2 bg-background border rounded text-sm">
                    <span className="font-mono text-xs">{table.name}</span>
                    <Badge variant="outline">{table.rows.toLocaleString()} سجل</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Last Scan Time */}
        {lastScan?.scanned_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Clock className="h-4 w-4" />
            آخر فحص: {format(new Date(lastScan.scanned_at), 'PPpp', { locale: ar })}
            {autoScanEnabled && (
              <Badge variant="outline" className="mr-2 border-green-500 text-green-600">
                <Timer className="h-3 w-3 ml-1" />
                فحص تلقائي كل 30 دقيقة
              </Badge>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="p-4 border-red-500/50 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Issues List */}
        <div className="space-y-6">
          {/* Critical Issues */}
          {criticalIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-500 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                مشاكل حرجة ({criticalIssues.length})
              </h2>
              <div className="space-y-3">
                {criticalIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warningIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                تحذيرات ({warningIssues.length})
              </h2>
              <div className="space-y-3">
                {warningIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {infoIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-blue-500 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                معلومات وتوصيات ({infoIssues.length})
              </h2>
              <div className="space-y-3">
                {infoIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isScanning && issues.length === 0 && !error && (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">المشروع سليم!</h3>
              <p className="text-muted-foreground">لم يتم اكتشاف أي مشاكل</p>
            </Card>
          )}

          {/* Loading State */}
          {isScanning && issues.length === 0 && (
            <Card className="p-8 text-center">
              <RefreshCw className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
              <h3 className="text-lg font-semibold">جاري الفحص...</h3>
              <p className="text-muted-foreground">يتم فحص قاعدة البيانات والأمان والأداء</p>
            </Card>
          )}
        </div>
      </div>
  );
};

export default ProjectHealthPage;
