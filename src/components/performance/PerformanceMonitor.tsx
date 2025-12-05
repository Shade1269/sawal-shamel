import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Zap, 
  Clock, 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePerformanceMetrics, useBundleAnalytics, useMemoryMonitor } from '@/hooks/usePerformanceOptimization';
import { motion } from 'framer-motion';

interface PerformanceMonitorProps {
  showDetailed?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetailed = true,
  autoRefresh = true,
  className = ''
}) => {
  const metrics = usePerformanceMetrics();
  const { bundleSize, loadTime } = useBundleAnalytics();
  const memory = useMemoryMonitor();
  
  const [recommendations, setRecommendations] = useState<Array<{
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    action?: string;
  }>>([]);

  // Performance score calculation
  const getPerformanceScore = () => {
    let score = 100;
    
    // FCP penalty
    if (metrics.fcp > 3000) score -= 20;
    else if (metrics.fcp > 1800) score -= 10;
    
    // LCP penalty
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
    
    // CLS penalty
    if (metrics.cls > 0.25) score -= 20;
    else if (metrics.cls > 0.1) score -= 10;
    
    // Memory penalty
    if (memory.percentage > 80) score -= 15;
    else if (memory.percentage > 60) score -= 8;
    
    return Math.max(0, Math.round(score));
  };

  const performanceScore = getPerformanceScore();

  // Generate recommendations
  useEffect(() => {
    const newRecommendations = [];

    if (metrics.fcp > 3000) {
      newRecommendations.push({
        type: 'error' as const,
        title: 'First Contentful Paint بطيء',
        description: 'يستغرق تحميل المحتوى وقتاً طويلاً',
        action: 'استخدم lazy loading وقلل حجم الـ JavaScript'
      });
    }

    if (metrics.lcp > 4000) {
      newRecommendations.push({
        type: 'error' as const,
        title: 'Largest Contentful Paint بطيء',
        description: 'أكبر عنصر يحتاج وقت طويل للتحميل',
        action: 'حسن صور البطل واستخدم CDN'
      });
    }

    if (metrics.cls > 0.25) {
      newRecommendations.push({
        type: 'warning' as const,
        title: 'Layout Shift عالي',
        description: 'الصفحة تتحرك كثيراً أثناء التحميل',
        action: 'حدد أبعاد الصور ومساحة الإعلانات'
      });
    }

    if (memory.percentage > 80) {
      newRecommendations.push({
        type: 'error' as const,
        title: 'استهلاك ذاكرة عالي',
        description: `استهلاك الذاكرة ${memory.percentage.toFixed(1)}%`,
        action: 'راجع memory leaks ونظف event listeners'
      });
    }

    if (bundleSize > 1024 * 1024) { // > 1MB
      newRecommendations.push({
        type: 'warning' as const,
        title: 'حجم Bundle كبير',
        description: `حجم الملفات ${(bundleSize / 1024 / 1024).toFixed(1)} MB`,
        action: 'استخدم code splitting وشجرة الاعتمادات'
      });
    }

    if (newRecommendations.length === 0) {
      newRecommendations.push({
        type: 'info' as const,
        title: 'الأداء ممتاز! 🎉',
        description: 'جميع مقاييس الأداء في المستوى المطلوب',
      });
    }

    setRecommendations(newRecommendations);
  }, [metrics, memory, bundleSize]);

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(0)} ms`;
    return `${(time / 1000).toFixed(1)} s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">مراقب الأداء</CardTitle>
              <CardDescription>
                قياس وتحليل أداء التطبيق في الوقت الفعلي
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={getScoreBadgeVariant(performanceScore)}
              className="text-lg px-3 py-1"
            >
              <Gauge className="h-4 w-4 mr-1" />
              {performanceScore}/100
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showDetailed ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="metrics">المقاييس</TabsTrigger>
              <TabsTrigger value="resources">الموارد</TabsTrigger>
              <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Score */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-6xl font-bold ${getScoreColor(performanceScore)}`}
                >
                  {performanceScore}
                </motion.div>
                
                <div className="flex justify-center">
                  {performanceScore >= 90 ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">أداء ممتاز</span>
                    </div>
                  ) : performanceScore >= 70 ? (
                    <div className="flex items-center gap-2 text-warning">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">أداء جيد</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">يحتاج تحسين</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{formatTime(metrics.fcp)}</div>
                    <div className="text-sm text-muted-foreground">FCP</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{formatTime(metrics.lcp)}</div>
                    <div className="text-sm text-muted-foreground">LCP</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{metrics.cls.toFixed(3)}</div>
                    <div className="text-sm text-muted-foreground">CLS</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{formatTime(loadTime)}</div>
                    <div className="text-sm text-muted-foreground">Load Time</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>First Contentful Paint</span>
                        <span>{formatTime(metrics.fcp)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metrics.fcp / 3000) * 100)} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Largest Contentful Paint</span>
                        <span>{formatTime(metrics.lcp)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metrics.lcp / 4000) * 100)} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Cumulative Layout Shift</span>
                        <span>{metrics.cls.toFixed(3)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metrics.cls / 0.25) * 100)} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Time to First Byte</span>
                        <span>{formatTime(metrics.ttfb)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metrics.ttfb / 1000) * 100)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">استهلاك الموارد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>استهلاك الذاكرة</span>
                        <span>{memory.formattedUsed} / {memory.formattedTotal}</span>
                      </div>
                      <Progress value={memory.percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground mt-1">
                        {memory.percentage.toFixed(1)}% مستخدم
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>حجم Bundle</span>
                        <span>{formatBytes(bundleSize)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (bundleSize / (2 * 1024 * 1024)) * 100)} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>وقت التحميل الكلي</span>
                        <span>{formatTime(loadTime)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (loadTime / 5000) * 100)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendations.map((rec, index) => (
                <Alert key={index}>
                  <div className="flex items-start gap-3">
                    {rec.type === 'error' && <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />}
                    {rec.type === 'warning' && <Clock className="h-5 w-5 text-warning mt-0.5" />}
                    {rec.type === 'info' && <Info className="h-5 w-5 text-info mt-0.5" />}
                    
                    <div className="flex-1">
                      <AlertTitle className="mb-1">{rec.title}</AlertTitle>
                      <AlertDescription className="mb-2">
                        {rec.description}
                      </AlertDescription>
                      {rec.action && (
                        <div className="text-sm font-medium text-primary">
                          💡 {rec.action}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          // Compact view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">نقاط الأداء</span>
              <Badge variant={getScoreBadgeVariant(performanceScore)}>
                {performanceScore}/100
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">FCP:</span>
                <span className="font-medium mr-2">{formatTime(metrics.fcp)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">LCP:</span>
                <span className="font-medium mr-2">{formatTime(metrics.lcp)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">CLS:</span>
                <span className="font-medium mr-2">{metrics.cls.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Memory:</span>
                <span className="font-medium mr-2">{memory.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;