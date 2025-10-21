import { useState, useEffect, useCallback, useRef } from 'react';
import { useDeviceDetection } from './useDeviceDetection';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  networkSpeed: 'slow' | 'medium' | 'fast';
  batteryLevel?: number;
  isLowEndDevice: boolean;
}

interface PerformanceConfig {
  enableAnimations: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  lazyLoadThreshold: number;
  maxConcurrentRequests: number;
  enableVirtualScrolling: boolean;
  enablePrefetching: boolean;
}

export const usePerformance = () => {
  const device = useDeviceDetection();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    networkSpeed: 'medium',
    isLowEndDevice: false
  });
  const [config, setConfig] = useState<PerformanceConfig>({
    enableAnimations: true,
    imageQuality: 'high',
    lazyLoadThreshold: 300,
    maxConcurrentRequests: device.isMobile ? 2 : 6,
    enableVirtualScrolling: false,
    enablePrefetching: true
  });

  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const frameRef = useRef<number>();

  // Monitor frame rate
  const measureFrameRate = useCallback(() => {
    let frames = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, frameRate: Math.round(frames * 1000 / (currentTime - lastTime)) }));
        frames = 0;
        lastTime = currentTime;
      }
      
      frameRef.current = requestAnimationFrame(countFrames);
    };

    frameRef.current = requestAnimationFrame(countFrames);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Monitor memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      setMetrics(prev => ({ ...prev, memoryUsage: Math.round(memoryUsage * 100) }));
    }
  }, []);

  // Detect network speed
  const detectNetworkSpeed = useCallback(async () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      let speed: 'slow' | 'medium' | 'fast' = 'medium';
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          speed = 'slow';
          break;
        case '3g':
          speed = 'medium';
          break;
        case '4g':
        case '5g':
          speed = 'fast';
          break;
      }
      
      setMetrics(prev => ({ ...prev, networkSpeed: speed }));
    }
  }, []);

  // Detect low-end device
  const detectDeviceCapabilities = useCallback(() => {
    const isLowEnd = 
      device.isMobile && (
        navigator.hardwareConcurrency <= 2 ||
        window.devicePixelRatio <= 1.5 ||
        metrics.memoryUsage > 75
      );
    
    setMetrics(prev => ({ ...prev, isLowEndDevice: isLowEnd }));
  }, [device.isMobile, metrics.memoryUsage]);

  // Auto-adjust performance config based on metrics
  const optimizeConfig = useCallback(() => {
    const newConfig: PerformanceConfig = { ...config };

    // Disable animations on low-end devices or poor performance
    if (metrics.isLowEndDevice || metrics.frameRate < 30) {
      newConfig.enableAnimations = false;
    }

    // Adjust image quality based on network and device
    if (metrics.networkSpeed === 'slow' || metrics.isLowEndDevice) {
      newConfig.imageQuality = 'low';
      newConfig.lazyLoadThreshold = 150;
    } else if (metrics.networkSpeed === 'medium') {
      newConfig.imageQuality = 'medium';
      newConfig.lazyLoadThreshold = 250;
    }

    // Enable virtual scrolling for low-end devices
    if (metrics.isLowEndDevice) {
      newConfig.enableVirtualScrolling = true;
    }

    // Reduce concurrent requests on slow networks
    if (metrics.networkSpeed === 'slow') {
      newConfig.maxConcurrentRequests = 1;
      newConfig.enablePrefetching = false;
    }

    setConfig(newConfig);
  }, [config, metrics]);

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            setMetrics(prev => ({ ...prev, renderTime: entry.duration }));
          }
        });
      });

      performanceObserver.current.observe({ entryTypes: ['measure', 'navigation'] });
    }

    const frameCleanup = measureFrameRate();
    const memoryInterval = setInterval(measureMemoryUsage, 5000);
    const networkInterval = setInterval(detectNetworkSpeed, 10000);

    detectNetworkSpeed();
    detectDeviceCapabilities();

    return () => {
      frameCleanup();
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [measureFrameRate, measureMemoryUsage, detectNetworkSpeed, detectDeviceCapabilities]);

  // Auto-optimize config when metrics change
  useEffect(() => {
    optimizeConfig();
  }, [metrics.isLowEndDevice, metrics.frameRate, metrics.networkSpeed]);

  // Performance measurement utilities
  const measureRender = useCallback((name: string, fn: () => void) => {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }, []);

  const prefetchResource = useCallback(async (url: string, type: 'image' | 'script' | 'style' = 'image') => {
    if (!config.enablePrefetching || metrics.networkSpeed === 'slow') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
  }, [config.enablePrefetching, metrics.networkSpeed]);

  const loadImageOptimized = useCallback((src: string, options?: { 
    quality?: number; 
    width?: number; 
    height?: number;
  }) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const quality = options?.quality || (config.imageQuality === 'low' ? 60 : config.imageQuality === 'medium' ? 80 : 95);
      
      // Add quality and size parameters if supported
      let optimizedSrc = src;
      if (src.includes('cloudinary.com') || src.includes('imagekit.io')) {
        const params = new URLSearchParams();
        params.set('q', quality.toString());
        if (options?.width) params.set('w', options.width.toString());
        if (options?.height) params.set('h', options.height.toString());
        optimizedSrc = `${src}?${params.toString()}`;
      }

      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = optimizedSrc;
    });
  }, [config.imageQuality]);

  return {
    metrics,
    config,
    measureRender,
    prefetchResource,
    loadImageOptimized,
    isLowPerformanceMode: metrics.isLowEndDevice || metrics.frameRate < 30,
    shouldReduceAnimations: !config.enableAnimations,
    shouldUseVirtualScrolling: config.enableVirtualScrolling,
    getOptimalImageQuality: () => config.imageQuality,
    getLazyLoadThreshold: () => config.lazyLoadThreshold
  };
};