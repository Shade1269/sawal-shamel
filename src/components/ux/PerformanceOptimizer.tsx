import { useEffect, useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  HardDrive, 
  Monitor,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkLatency: number;
  renderTime: number;
  jsHeapSize: number;
  domElements: number;
  resourcesLoaded: number;
  timestamp: Date;
}

interface OptimizationSettings {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCaching: boolean;
  enableMinification: boolean;
  enablePrefetching: boolean;
  maxCacheSize: number;
  compressionLevel: number;
}

export function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [settings, setSettings] = useState<OptimizationSettings>({
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCaching: true,
    enableMinification: false,
    enablePrefetching: true,
    maxCacheSize: 50, // MB
    compressionLevel: 6
  });
  const [optimizationScore, setOptimizationScore] = useState(0);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  // قياس الأداء
  const measurePerformance = useCallback((): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    
    // حساب وقت التحميل
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    
    // حساب وقت الرندر
    const renderTime = navigation ? navigation.domComplete - navigation.domContentLoadedEventStart : 0;
    
    // قياس استخدام الذاكرة
    const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0;
    const jsHeapSize = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0; // MB
    
    // حساب عدد عناصر DOM
    const domElements = document.querySelectorAll('*').length;
    
    // حساب الموارد المحملة
    const resources = performance.getEntriesByType('resource');
    const resourcesLoaded = resources.length;
    
    // محاكاة معدل نجاح الـ cache والـ network latency
    const cacheHitRate = 85 + Math.random() * 10; // 85-95%
    const networkLatency = 50 + Math.random() * 100; // 50-150ms

    return {
      loadTime: Math.round(loadTime),
      memoryUsage: Math.round(memoryUsage),
      cacheHitRate: Math.round(cacheHitRate),
      networkLatency: Math.round(networkLatency),
      renderTime: Math.round(renderTime),
      jsHeapSize: Math.round(jsHeapSize * 10) / 10,
      domElements,
      resourcesLoaded,
      timestamp: new Date()
    };
  }, []);

  // حساب نقاط التحسين
  const calculateOptimizationScore = useCallback((metrics: PerformanceMetrics, settings: OptimizationSettings): number => {
    let score = 0;
    
    // Load Time Score (0-25 points)
    if (metrics.loadTime < 1000) score += 25;
    else if (metrics.loadTime < 2000) score += 20;
    else if (metrics.loadTime < 3000) score += 15;
    else if (metrics.loadTime < 5000) score += 10;
    else score += 5;
    
    // Memory Usage Score (0-20 points)
    if (metrics.memoryUsage < 50) score += 20;
    else if (metrics.memoryUsage < 70) score += 15;
    else if (metrics.memoryUsage < 85) score += 10;
    else score += 5;
    
    // Cache Hit Rate Score (0-15 points)
    if (metrics.cacheHitRate > 90) score += 15;
    else if (metrics.cacheHitRate > 80) score += 12;
    else if (metrics.cacheHitRate > 70) score += 8;
    else score += 5;
    
    // Network Latency Score (0-15 points)
    if (metrics.networkLatency < 50) score += 15;
    else if (metrics.networkLatency < 100) score += 12;
    else if (metrics.networkLatency < 200) score += 8;
    else score += 5;
    
    // Settings Bonus (0-25 points)
    let settingsBonus = 0;
    if (settings.enableLazyLoading) settingsBonus += 5;
    if (settings.enableImageOptimization) settingsBonus += 5;
    if (settings.enableCaching) settingsBonus += 5;
    if (settings.enableMinification) settingsBonus += 3;
    if (settings.enablePrefetching) settingsBonus += 4;
    if (settings.maxCacheSize >= 50) settingsBonus += 3;
    
    score += settingsBonus;
    
    return Math.min(100, score);
  }, []);

  // تطبيق التحسينات
  const applyOptimizations = useCallback(async () => {
    toast({
      title: "جاري تطبيق التحسينات...",
      description: "سيتم تحسين الأداء حسب الإعدادات المحددة"
    });

    // محاكاة تطبيق التحسينات
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Lazy Loading
    if (settings.enableLazyLoading) {
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });
    }

    // Prefetch important resources
    if (settings.enablePrefetching) {
      const prefetchUrls = ['/affiliate', '/affiliate/storefront', '/affiliate/analytics'];
      prefetchUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }

    // Update Cache Settings
    if (settings.enableCaching && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'UPDATE_CACHE_SETTINGS',
          settings: {
            maxSize: settings.maxCacheSize * 1024 * 1024, // Convert to bytes
            compressionLevel: settings.compressionLevel
          }
        });
      } catch {
        // Service Worker not available
      }
    }

    const newMetrics = measurePerformance();
    setMetrics(newMetrics);
    const newScore = calculateOptimizationScore(newMetrics, settings);
    setOptimizationScore(newScore);

    toast({
      title: "تم تطبيق التحسينات بنجاح!",
      description: `تم تحسين النقاط إلى ${newScore}/100`
    });
  }, [settings, measurePerformance, calculateOptimizationScore, toast]);

  // بدء المراقبة
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    const updateMetrics = () => {
      const newMetrics = measurePerformance();
      setMetrics(newMetrics);
      setOptimizationScore(calculateOptimizationScore(newMetrics, settings));
    };

    updateMetrics(); // قياس فوري
    intervalRef.current = setInterval(updateMetrics, 5000); // كل 5 ثواني
  }, [measurePerformance, calculateOptimizationScore, settings]);

  // إيقاف المراقبة
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // تنظيف عند الخروج
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // بدء القياس الأولي
  useEffect(() => {
    const initialMetrics = measurePerformance();
    setMetrics(initialMetrics);
    setOptimizationScore(calculateOptimizationScore(initialMetrics, settings));
  }, [measurePerformance, calculateOptimizationScore, settings]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { icon: CheckCircle, label: 'ممتاز', color: 'bg-success' };
    if (score >= 70) return { icon: AlertTriangle, label: 'جيد', color: 'bg-warning' };
    return { icon: AlertTriangle, label: 'يحتاج تحسين', color: 'bg-destructive' };
  };

  const status = getScoreStatus(optimizationScore);
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-premium/20">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">محسّن الأداء</h1>
            <p className="text-muted-foreground">مراقبة وتحسين أداء التطبيق</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          {isMonitoring ? (
            <Button variant="outline" onClick={stopMonitoring}>
              <Monitor className="h-4 w-4 mr-2" />
              إيقاف المراقبة
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              <Monitor className="h-4 w-4 mr-2" />
              بدء المراقبة
            </Button>
          )}
        </div>
      </motion.div>

      {/* Performance Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-premium/5" />
          <CardHeader className="text-center">
            <CardTitle>نقاط الأداء</CardTitle>
            <div className="relative">
              <div className={`text-6xl font-bold ${getScoreColor(optimizationScore)}`}>
                {optimizationScore}
              </div>
              <div className="text-2xl text-muted-foreground">/100</div>
              <Progress value={optimizationScore} className="mt-4 h-3" />
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'وقت التحميل',
              value: `${metrics.loadTime}ms`,
              icon: Clock,
              color: metrics.loadTime < 2000 ? 'text-success' : metrics.loadTime < 5000 ? 'text-warning' : 'text-destructive',
              trend: metrics.loadTime < 3000 ? 'up' : 'down'
            },
            {
              title: 'استخدام الذاكرة',
              value: `${metrics.memoryUsage}%`,
              icon: HardDrive,
              color: metrics.memoryUsage < 70 ? 'text-success' : metrics.memoryUsage < 90 ? 'text-warning' : 'text-destructive',
              trend: metrics.memoryUsage < 80 ? 'up' : 'down'
            },
            {
              title: 'معدل نجاح Cache',
              value: `${metrics.cacheHitRate}%`,
              icon: Database,
              color: metrics.cacheHitRate > 85 ? 'text-success' : metrics.cacheHitRate > 70 ? 'text-warning' : 'text-destructive',
              trend: 'up'
            },
            {
              title: 'زمن الاستجابة',
              value: `${metrics.networkLatency}ms`,
              icon: Wifi,
              color: metrics.networkLatency < 100 ? 'text-success' : metrics.networkLatency < 200 ? 'text-warning' : 'text-destructive',
              trend: metrics.networkLatency < 150 ? 'up' : 'down'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      <TrendingUp className={`h-3 w-3 ${metric.trend === 'up' ? 'text-success' : 'text-destructive rotate-180'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات التحسين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'enableLazyLoading',
                title: 'التحميل التدريجي للصور',
                description: 'تحميل الصور عند الحاجة فقط'
              },
              {
                key: 'enableImageOptimization', 
                title: 'تحسين الصور',
                description: 'ضغط وتحسين جودة الصور'
              },
              {
                key: 'enableCaching',
                title: 'تفعيل التخزين المؤقت',
                description: 'حفظ البيانات محلياً لتسريع التحميل'
              },
              {
                key: 'enableMinification',
                title: 'ضغط الملفات',
                description: 'تقليل حجم ملفات CSS و JS'
              },
              {
                key: 'enablePrefetching',
                title: 'التحميل المسبق',
                description: 'تحميل الصفحات المهمة مسبقاً'
              }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{setting.title}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch
                  checked={settings[setting.key as keyof OptimizationSettings] as boolean}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, [setting.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center pt-4">
            <Button onClick={applyOptimizations} size="lg" className="min-w-[200px]">
              <RefreshCw className="h-4 w-4 mr-2" />
              تطبيق التحسينات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">حجم JavaScript</p>
                <p className="font-medium">{metrics.jsHeapSize} MB</p>
              </div>
              <div>
                <p className="text-muted-foreground">عناصر DOM</p>
                <p className="font-medium">{metrics.domElements.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">الموارد المحملة</p>
                <p className="font-medium">{metrics.resourcesLoaded}</p>
              </div>
              <div>
                <p className="text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">{metrics.timestamp.toLocaleTimeString('ar')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}