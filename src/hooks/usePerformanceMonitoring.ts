import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook لمراقبة الأداء وقياس المقاييس الحيوية
 */
export interface PerformanceMetrics {
  responseTime: number;
  renderTime: number;
  componentLoadTime: number;
  errorRate: number;
  memoryUsage: number;
}

export interface PerformanceConfig {
  enabled?: boolean;
  sampleRate?: number; // من 0 إلى 1
  trackComponents?: boolean;
  trackAPI?: boolean;
  trackMemory?: boolean;
}

export const usePerformanceMonitoring = (config: PerformanceConfig = {}) => {
  const {
    enabled = true,
    sampleRate = 1.0,
    trackComponents = true,
    trackAPI = true,
    trackMemory = true
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    renderTime: 0,
    componentLoadTime: 0,
    errorRate: 0,
    memoryUsage: 0
  });

  const renderStartTime = useRef<number>(0);
  const componentMountTime = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const totalRequests = useRef<number>(0);

  // قياس وقت الرندر
  const measureRenderTime = useCallback(() => {
    if (!enabled || !trackComponents || Math.random() > sampleRate) return;

    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, [enabled, trackComponents, sampleRate]);

  // قياس وقت تحميل المكون
  const measureComponentLoad = useCallback((componentName: string) => {
    if (!enabled || !trackComponents) return;

    componentMountTime.current = performance.now();
    
    return () => {
      const loadTime = performance.now() - componentMountTime.current;
      setMetrics(prev => ({ ...prev, componentLoadTime: loadTime }));
      
      // تسجيل في Web Vitals إذا كان متاحاً
      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.mark(`${componentName}-loaded`);
      }
    };
  }, [enabled, trackComponents]);

  // قياس استجابة API
  const measureAPIResponse = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint?: string
  ): Promise<T> => {
    if (!enabled || !trackAPI) {
      return apiCall();
    }

    const startTime = performance.now();
    totalRequests.current += 1;

    try {
      const result = await apiCall();
      const responseTime = performance.now() - startTime;
      
      setMetrics(prev => ({ 
        ...prev, 
        responseTime,
        errorRate: errorCount.current / totalRequests.current * 100
      }));

      // تسجيل في Performance API
      if (endpoint && typeof window !== 'undefined') {
        performance.mark(`api-${endpoint}-end`);
        performance.measure(`api-${endpoint}`, `api-${endpoint}-start`, `api-${endpoint}-end`);
      }

      return result;
    } catch (error) {
      errorCount.current += 1;
      setMetrics(prev => ({ 
        ...prev, 
        errorRate: errorCount.current / totalRequests.current * 100
      }));
      throw error;
    }
  }, [enabled, trackAPI]);

  // مراقبة استخدام الذاكرة
  const trackMemoryUsage = useCallback(() => {
    if (!enabled || !trackMemory || typeof window === 'undefined') return;

    // @ts-ignore
    const memory = (performance as any).memory;
    if (memory) {
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize * 100;
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, [enabled, trackMemory]);

  // Web Vitals مراقبة
  const trackWebVitals = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    // مراقبة Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
          setMetrics(prev => ({ ...prev, componentLoadTime: loadTime }));
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });

    return () => observer.disconnect();
  }, [enabled]);

  // تتبع تلقائي لاستخدام الذاكرة
  useEffect(() => {
    if (!trackMemory) return;

    const interval = setInterval(trackMemoryUsage, 5000); // كل 5 ثواني
    return () => clearInterval(interval);
  }, [trackMemoryUsage, trackMemory]);

  // تهيئة مراقبة Web Vitals
  useEffect(() => {
    const cleanup = trackWebVitals();
    return cleanup;
  }, [trackWebVitals]);

  // إعادة تعيين المقاييس
  const resetMetrics = useCallback(() => {
    setMetrics({
      responseTime: 0,
      renderTime: 0,
      componentLoadTime: 0,
      errorRate: 0,
      memoryUsage: 0
    });
    errorCount.current = 0;
    totalRequests.current = 0;
  }, []);

  // تصدير البيانات
  const exportMetrics = useCallback(() => {
    return {
      ...metrics,
      timestamp: Date.now(),
      totalRequests: totalRequests.current,
      totalErrors: errorCount.current
    };
  }, [metrics]);

  return {
    metrics,
    measureRenderTime,
    measureComponentLoad,
    measureAPIResponse,
    trackMemoryUsage,
    resetMetrics,
    exportMetrics,
    isEnabled: enabled
  };
};