import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  Bug,
  Zap
} from 'lucide-react';
import { getErrorTracker } from '@/utils/errorTracking';
import { AnalyticsUtils } from '@/hooks/useAnalytics';
import { ABTestUtils } from '@/components/testing/ABTestProvider';

interface DashboardStats {
  totalErrors: number;
  criticalErrors: number;
  activeUsers: number;
  pageViews: number;
  avgLoadTime: number;
  errorRate: number;
}

export const MonitoringDashboard: React.FC = () => {
  const errorTracker = getErrorTracker();
  const [stats, setStats] = useState<DashboardStats>({
    totalErrors: 0,
    criticalErrors: 0,
    activeUsers: 0,
    pageViews: 0,
    avgLoadTime: 0,
    errorRate: 0
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    refreshStats();
  }, [timeRange]);

  const refreshStats = async () => {
    setRefreshing(true);
    
    try {
      // Get error data
      const timeInMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      }[timeRange];

      const errorSummary = errorTracker.getErrorSummary(timeInMs);
      const analyticsSummary = AnalyticsUtils.getSummary(timeInMs);
      const performanceSummary = errorTracker.getPerformanceSummary();

      setStats({
        totalErrors: errorSummary.total,
        criticalErrors: errorSummary.byLevel.critical + errorSummary.byLevel.error,
        activeUsers: Math.floor(Math.random() * 50) + 10, // Mock data
        pageViews: analyticsSummary.pageViews,
        avgLoadTime: performanceSummary.avgPageLoadTime,
        errorRate: analyticsSummary.totalEvents > 0 ? 
          (analyticsSummary.errors / analyticsSummary.totalEvents) * 100 : 0
      });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      stats,
      errorLogs: errorTracker.exportLogs(),
      analytics: AnalyticsUtils.getStoredEvents(),
      abTests: {
        assignments: JSON.parse(localStorage.getItem('ab_test_assignments') || '[]'),
        results: ABTestUtils.getResults()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getErrorSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مراقبة النظام</h1>
          <p className="text-muted-foreground">
            تتبع الأداء والأخطاء والتحليلات
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">آخر ساعة</option>
            <option value="24h">آخر 24 ساعة</option>
            <option value="7d">آخر 7 أيام</option>
          </select>
          
          <Button 
            onClick={refreshStats} 
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير البيانات
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.criticalErrors > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                {stats.criticalErrors > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-medium">الأخطاء الحرجة</p>
                <p className="text-2xl font-bold">{stats.criticalErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">المستخدمون النشطون</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-premium/10 text-premium">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">مشاهدات الصفحات</p>
                <p className="text-2xl font-bold">{stats.pageViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.avgLoadTime > 3000 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">متوسط وقت التحميل</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgLoadTime)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="errors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="errors">الأخطاء</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="abtests">اختبارات A/B</TabsTrigger>
        </TabsList>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <ErrorsOverview timeRange={timeRange} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceOverview />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsOverview timeRange={timeRange} />
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="abtests" className="space-y-6">
          <ABTestsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Error Overview Component
const ErrorsOverview: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [errorSummary, setErrorSummary] = useState<any>(null);

  useEffect(() => {
    const timeInMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange];

    const tracker = getErrorTracker();
    setErrorSummary(tracker.getErrorSummary(timeInMs));
  }, [timeRange]);

  if (!errorSummary) return <div>جاري التحميل...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>توزيع الأخطاء حسب المستوى</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(errorSummary.byLevel).map(([level, count]) => (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={getErrorSeverityColor(level) as any}>
                  {level}
                </Badge>
                <span className="text-sm">{count as number} خطأ</span>
              </div>
              <Progress 
                value={((count as number) / errorSummary.total) * 100} 
                className="w-24" 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الأخطاء الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorSummary.recentErrors.slice(0, 5).map((error: any) => (
              <div key={error.id} className="border-l-4 border-red-500 pl-3">
                <p className="font-medium text-sm">{error.message}</p>
                <p className="text-xs text-muted-foreground">
                  {error.component} • {new Date(error.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Performance Overview Component
const PerformanceOverview: React.FC = () => {
  const tracker = getErrorTracker();
  const performanceSummary = tracker.getPerformanceSummary();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>مؤشرات الأداء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>إجمالي القياسات</span>
            <span className="font-bold">{performanceSummary.totalMetrics}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>متوسط وقت التحميل</span>
            <span className="font-bold">{performanceSummary.avgPageLoadTime}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span>قياسات التنقل</span>
            <span className="font-bold">{performanceSummary.navigationMetrics.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>قياسات الموارد</span>
            <span className="font-bold">{performanceSummary.resourceMetrics.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Overview Component
const AnalyticsOverview: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

  useEffect(() => {
    const timeInMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange];

    setAnalyticsSummary(AnalyticsUtils.getSummary(timeInMs));
  }, [timeRange]);

  if (!analyticsSummary) return <div>جاري التحميل...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ملخص النشاط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>إجمالي الأحداث</span>
            <span className="font-bold">{analyticsSummary.totalEvents}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>مشاهدات الصفحات</span>
            <span className="font-bold">{analyticsSummary.pageViews}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>تفاعلات المستخدمين</span>
            <span className="font-bold">{analyticsSummary.userInteractions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>الأخطاء</span>
            <span className="font-bold text-red-600">{analyticsSummary.errors}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التصنيف حسب النوع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(analyticsSummary.byCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm">{category}</span>
              <Badge variant="outline">{count as number}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// A/B Tests Overview Component
const ABTestsOverview: React.FC = () => {
  const assignments = JSON.parse(localStorage.getItem('ab_test_assignments') || '[]');
  const results = ABTestUtils.getResults();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ملخص اختبارات A/B</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>إجمالي التخصيصات</span>
            <span className="font-bold">{assignments.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>إجمالي النتائج</span>
            <span className="font-bold">{results.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getErrorSeverityColor = (level: string) => {
  switch (level) {
    case 'critical': return 'destructive';
    case 'error': return 'destructive';  
    case 'warning': return 'secondary';
    default: return 'outline';
  }
};

export default MonitoringDashboard;