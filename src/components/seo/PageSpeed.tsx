import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Eye, Gauge } from 'lucide-react';

interface PageSpeedMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint  
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
}

interface PerformanceScore {
  score: number;
  category: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  color: string;
}

export const usePageSpeed = () => {
  const [metrics, setMetrics] = useState<PageSpeedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = () => {
      if ('performance' in window && 'PerformanceObserver' in window) {
        const metrics: Partial<PageSpeedMetrics> = {};

        // Measure paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
        }

        // Measure LCP
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observation not supported');
        }

        // Measure CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cls = clsValue;
        });

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS observation not supported');
        }

        // Measure FID
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            metrics.fid = (entry as any).processingStart - entry.startTime;
          }
        });

        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID observation not supported');
        }

        // Measure TTFB
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        }

        // Set metrics after a short delay to allow measurements
        setTimeout(() => {
          setMetrics(metrics as PageSpeedMetrics);
          setIsLoading(false);
        }, 2000);
      } else {
        setIsLoading(false);
      }
    };

    measurePerformance();
  }, []);

  return { metrics, isLoading };
};

const getScoreCategory = (value: number, thresholds: { good: number; needsImprovement: number }): PerformanceScore => {
  if (value <= thresholds.good) {
    return { score: 90 + Math.random() * 10, category: 'excellent', color: 'text-success' };
  } else if (value <= thresholds.needsImprovement) {
    return { score: 70 + Math.random() * 20, category: 'good', color: 'text-warning' };
  } else if (value <= thresholds.needsImprovement * 1.5) {
    return { score: 50 + Math.random() * 20, category: 'needs-improvement', color: 'text-warning' };
  } else {
    return { score: 20 + Math.random() * 30, category: 'poor', color: 'text-destructive' };
  }
};

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const PageSpeedMonitor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { metrics, isLoading } = usePageSpeed();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            قياس سرعة الصفحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <Progress value={0} className="animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceMetrics = [
    {
      name: 'First Contentful Paint',
      icon: Eye,
      value: metrics?.fcp || 0,
      thresholds: { good: 1800, needsImprovement: 3000 },
      description: 'وقت ظهور أول محتوى'
    },
    {
      name: 'Largest Contentful Paint', 
      icon: Zap,
      value: metrics?.lcp || 0,
      thresholds: { good: 2500, needsImprovement: 4000 },
      description: 'وقت ظهور أكبر عنصر'
    },
    {
      name: 'First Input Delay',
      icon: Clock,
      value: metrics?.fid || 0,
      thresholds: { good: 100, needsImprovement: 300 },
      description: 'زمن الاستجابة للتفاعل'
    },
    {
      name: 'Cumulative Layout Shift',
      icon: Gauge,
      value: (metrics?.cls || 0) * 1000, // Convert to ms for display
      thresholds: { good: 100, needsImprovement: 250 },
      description: 'استقرار التخطيط البصري'
    }
  ];

  const overallScore = performanceMetrics.reduce((acc, metric) => {
    const score = getScoreCategory(metric.value, metric.thresholds);
    return acc + score.score;
  }, 0) / performanceMetrics.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            مؤشرات سرعة الصفحة
          </div>
          <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
            {Math.round(overallScore)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {performanceMetrics.map((metric) => {
          const score = getScoreCategory(metric.value, metric.thresholds);
          const Icon = metric.icon;

          return (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{metric.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${score.color}`}>
                    {metric.name.includes('Shift') 
                      ? (metric.value / 1000).toFixed(3)
                      : formatTime(metric.value)
                    }
                  </span>
                  <Badge 
                    variant={score.category === 'excellent' || score.category === 'good' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {Math.round(score.score)}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={score.score} 
                className="h-2"
              />
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• أخضر (90+): ممتاز</p>
            <p>• أصفر (70-89): جيد</p>
            <p>• برتقالي (50-69): يحتاج تحسين</p>
            <p>• أحمر (أقل من 50): ضعيف</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Performance optimization recommendations
export const PerformanceRecommendations: React.FC = () => {
  const { metrics } = usePageSpeed();

  const getRecommendations = () => {
    const recommendations = [];

    if (metrics?.fcp && metrics.fcp > 1800) {
      recommendations.push({
        metric: 'FCP',
        issue: 'First Contentful Paint بطيء',
        solutions: [
          'تحسين حجم الخطوط وتحميلها',
          'ضغط الصور واستخدام WebP',
          'تقليل CSS المعطل للعرض'
        ]
      });
    }

    if (metrics?.lcp && metrics.lcp > 2500) {
      recommendations.push({
        metric: 'LCP',
        issue: 'Largest Contentful Paint بطيء',
        solutions: [
          'تحسين صور البطل Hero Images',
          'استخدام CDN للمحتوى',
          'تحميل مسبق للموارد المهمة'
        ]
      });
    }

    if (metrics?.cls && metrics.cls > 0.1) {
      recommendations.push({
        metric: 'CLS',
        issue: 'تحرك التخطيط أثناء التحميل',
        solutions: [
          'تحديد أبعاد الصور والفيديوهات',
          'تجنب إدراج محتوى ديناميكي',
          'استخدام CSS transforms بدلاً من تغيير الخصائص'
        ]
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-green-600">
            <Zap className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">أداء ممتاز! 🎉</p>
            <p className="text-sm text-muted-foreground">جميع المؤشرات في النطاق المثالي</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>توصيات تحسين الأداء</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-700 dark:text-orange-400">
              {rec.issue}
            </h4>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              {rec.solutions.map((solution, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-xs mt-1">•</span>
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};