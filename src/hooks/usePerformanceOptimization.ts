import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce, throttle } from 'lodash-es';

// Bundle size monitoring
export const useBundleAnalytics = () => {
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    // Calculate initial bundle size from navigation timing
    const calculateBundleMetrics = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          setLoadTime(loadTime);
          
          // Estimate bundle size from transfer size
          const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          const jsResources = resources.filter(r => r.name.includes('.js'));
          const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
          
          setBundleSize(totalSize);
        }
      }
    };

    // Wait for page load to complete
    if (document.readyState === 'complete') {
      calculateBundleMetrics();
    } else {
      window.addEventListener('load', calculateBundleMetrics);
      return () => window.removeEventListener('load', calculateBundleMetrics);
    }
  }, []);

  return { bundleSize, loadTime };
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  }>({ used: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const percentage = (used / total) * 100;

        setMemoryUsage({ used, total, percentage });
      }
    };

    // Update every 5 seconds
    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage(); // Initial call

    return () => clearInterval(interval);
  }, []);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    ...memoryUsage,
    formattedUsed: formatBytes(memoryUsage.used),
    formattedTotal: formatBytes(memoryUsage.total),
  };
};

// Performance optimized event handlers
export const useOptimizedHandlers = () => {
  // Debounced handlers for search/input
  const createDebouncedHandler = useCallback((
    handler: (...args: any[]) => void,
    delay: number = 300
  ) => {
    return debounce(handler, delay);
  }, []);

  // Throttled handlers for scroll/resize
  const createThrottledHandler = useCallback((
    handler: (...args: any[]) => void,
    limit: number = 100
  ) => {
    return throttle(handler, limit);
  }, []);

  return {
    debounce: createDebouncedHandler,
    throttle: createThrottledHandler,
  };
};

// Lazy loading state management
export const useLazyLoading = <T>(
  loadFn: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await loadFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, dependencies);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, loading, error, load };
};

// Component rendering optimization
export const useRenderOptimization = () => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    lastRenderTime.current = Date.now();
  });

  const shouldUpdate = useCallback((prevProps: any, nextProps: any) => {
    // Shallow comparison for optimization
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) return true;

    return prevKeys.some(key => prevProps[key] !== nextProps[key]);
  }, []);

  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTime.current,
    shouldUpdate,
  };
};

// Virtual scrolling optimization
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

// Image optimization hook
export const useImageOptimization = () => {
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);

  useEffect(() => {
    const checkSupport = async () => {
      const formats = [];
      
      // Check WebP support
      if (await checkImageSupport('data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA')) {
        formats.push('webp');
      }
      
      // Check AVIF support
      if (await checkImageSupport('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=')) {
        formats.push('avif');
      }
      
      setSupportedFormats(formats);
    };

    checkSupport();
  }, []);

  const checkImageSupport = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  };

  const getOptimizedImageUrl = useCallback((
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    } = {}
  ) => {
    const { width, height, quality = 75, format } = options;
    
    // Use the best supported format
    const targetFormat = format || supportedFormats[0] || 'webp';
    
    // For URLs that support query parameters (like Unsplash)
    if (originalUrl.includes('unsplash.com') || originalUrl.includes('images.')) {
      const url = new URL(originalUrl);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', targetFormat);
      return url.toString();
    }
    
    return originalUrl;
  }, [supportedFormats]);

  return {
    supportedFormats,
    getOptimizedImageUrl,
  };
};

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0, // Time to First Byte
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }));
            }
            break;
        }
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

    // TTFB from navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({ 
        ...prev, 
        ttfb: navigation.responseStart - navigation.requestStart 
      }));
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};