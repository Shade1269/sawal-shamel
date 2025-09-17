import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Clock, 
  Cpu, 
  MemoryStick, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { AnimatedCounter } from '@/components/interactive/AnimatedCounter';

interface PerformanceMonitorProps {
  className?: string;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showControls = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    metrics,
    measureAPIResponse,
    resetMetrics,
    exportMetrics,
    trackMemoryUsage
  } = usePerformanceMonitoring({
    enabled: isEnabled,
    sampleRate: 0.1, // 10% sampling للأداء
    trackComponents: true,
    trackAPI: true,
    trackMemory: true
  });

  // تحديث تلقائي
  useEffect(() => {
    if (!autoRefresh || !isEnabled) return;

    const interval = setInterval(() => {
      trackMemoryUsage();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isEnabled, refreshInterval, trackMemoryUsage]);

  // تحديد لون الأداء حسب القيمة
  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-status-online';
    if (value <= thresholds.warning) return 'text-premium';
    return 'text-destructive';
  };

  // تصدير البيانات كـ JSON
  const handleExportMetrics = () => {
    const data = exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* عنوان وأدوات التحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">مراقب الأداء</h2>
          <p className="text-muted-foreground">مراقبة مقاييس الأداء في الوقت الفعلي</p>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="performance-monitoring"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
              <Label htmlFor="performance-monitoring">تفعيل المراقبة</Label>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetMetrics}
              disabled={!isEnabled}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة تعيين
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMetrics}
              disabled={!isEnabled}
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </Button>
          </div>
        )}
      </div>

      {/* بطاقات المقاييس الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* وقت الاستجابة */}
        <EnhancedCard variant="gradient" hover="glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وقت الاستجابة</CardTitle>
            <Clock className={`w-4 h-4 ${getPerformanceColor(metrics.responseTime, { good: 200, warning: 1000 })}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                to={metrics.responseTime}
                duration={500}
                suffix="ms"
                variant="primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.responseTime <= 200 ? 'ممتاز' : metrics.responseTime <= 1000 ? 'جيد' : 'بطيء'}
            </p>
          </CardContent>
        </EnhancedCard>

        {/* وقت الرندر */}
        <EnhancedCard variant="gradient" hover="glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وقت الرندر</CardTitle>
            <Cpu className={`w-4 h-4 ${getPerformanceColor(metrics.renderTime, { good: 16, warning: 100 })}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                to={metrics.renderTime}
                duration={500}
                suffix="ms"
                variant="accent"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.renderTime <= 16 ? 'سلس' : metrics.renderTime <= 100 ? 'مقبول' : 'متقطع'}
            </p>
          </CardContent>
        </EnhancedCard>

        {/* استخدام الذاكرة */}
        <EnhancedCard variant="gradient" hover="glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استخدام الذاكرة</CardTitle>
            <MemoryStick className={`w-4 h-4 ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 80 })}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                to={metrics.memoryUsage}
                duration={500}
                suffix="%"
                variant="luxury"
              />
            </div>
            <Progress 
              value={metrics.memoryUsage} 
              className="mt-2"
            />
          </CardContent>
        </EnhancedCard>

        {/* معدل الأخطاء */}
        <EnhancedCard variant="gradient" hover="glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الأخطاء</CardTitle>
            {metrics.errorRate > 0 ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-status-online" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter
                to={metrics.errorRate}
                duration={500}
                suffix="%"
                variant={metrics.errorRate > 0 ? "persian" : "default"}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.errorRate === 0 ? 'ممتاز' : metrics.errorRate < 5 ? 'مقبول' : 'يحتاج تحسين'}
            </p>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* تفاصيل إضافية */}
      {showDetails && (
        <EnhancedCard variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              تفاصيل الأداء المتقدمة
            </CardTitle>
            <CardDescription>
              معلومات مفصلة حول أداء التطبيق والمكونات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت تحميل المكونات</Label>
                <div className="flex items-center gap-2">
                  <Progress value={(metrics.componentLoadTime / 1000) * 100} className="flex-1" />
                  <span className="text-sm font-mono">
                    {metrics.componentLoadTime.toFixed(2)}ms
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>حالة الشبكة</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={metrics.responseTime < 500 ? "default" : "destructive"}>
                    {metrics.responseTime < 500 ? 'سريع' : 'بطيء'}
                  </Badge>
                  {metrics.responseTime < 500 ? (
                    <TrendingUp className="w-4 h-4 text-status-online" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>
            </div>

            {/* معلومات النظام */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">معلومات النظام</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">المتصفح:</span>
                  <span className="block font-mono">
                    {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'غير متاح'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">الدقة:</span>
                  <span className="block font-mono">
                    {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'غير متاح'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">الاتصال:</span>
                  <span className="block font-mono">
                    {typeof navigator !== 'undefined' && 'connection' in navigator
                      ? // @ts-ignore
                        navigator.connection?.effectiveType || 'غير محدد'
                      : 'غير متاح'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">الوقت:</span>
                  <span className="block font-mono">
                    {new Date().toLocaleTimeString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      )}

      {/* زر إظهار/إخفاء التفاصيل */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showDetails ? 'إخفاء التفاصيل' : 'إظهار تفاصيل إضافية'}
        </Button>
      </div>
    </div>
  );
};

export default PerformanceMonitor;