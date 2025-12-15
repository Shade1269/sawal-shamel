import { useEffect } from 'react';
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
  Clock
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
  const { isScanning, lastScan, runScan, issues, error } = useProjectHealthScanner();

  useEffect(() => {
    runScan();
  }, []);

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const infoIssues = issues.filter(i => i.severity === 'info');

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
          
          <Button 
            onClick={runScan} 
            disabled={isScanning}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'جاري الفحص...' : 'فحص الآن'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        {/* Last Scan Time */}
        {lastScan?.scanned_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            آخر فحص: {format(new Date(lastScan.scanned_at), 'PPpp', { locale: ar })}
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
    </div>
  );
};

export default ProjectHealthPage;
