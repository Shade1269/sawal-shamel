import { ComponentType, lazy, LazyExoticComponent } from 'react';

// Bundle optimization utilities
export class BundleOptimizer {
  private static loadedChunks = new Set<string>();
  private static preloadedRoutes = new Set<string>();
  
  // Intelligent code splitting based on route importance
  static createOptimizedLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    chunkName?: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): LazyExoticComponent<T> {
    const LazyComponent = lazy(() => {
      const startTime = performance.now();
      
      return importFn().then(module => {
        const loadTime = performance.now() - startTime;
        
        if (chunkName) {
          this.loadedChunks.add(chunkName);
          console.log(`📦 Chunk loaded: ${chunkName} (${loadTime.toFixed(2)}ms)`);
        }
        
        // Report slow chunks
        if (loadTime > 1000) {
          console.warn(`⚠️ Slow chunk: ${chunkName} took ${loadTime.toFixed(2)}ms`);
        }
        
        return module;
      });
    });

    // Set component name for debugging (via wrapper)
    Object.defineProperty(LazyComponent, 'displayName', {
      value: `LazyComponent(${chunkName || 'Unknown'})`,
      writable: false
    });
    
    return LazyComponent;
  }

  // Preload routes based on user behavior
  static preloadRoute(routePath: string, importFn: () => Promise<any>) {
    if (this.preloadedRoutes.has(routePath)) {
      return Promise.resolve();
    }

    this.preloadedRoutes.add(routePath);
    
    // Preload when browser is idle
    if ('requestIdleCallback' in window) {
      return new Promise((resolve) => {
        (window as any).requestIdleCallback(() => {
          importFn().then(resolve);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      return new Promise((resolve) => {
        setTimeout(() => {
          importFn().then(resolve);
        }, 100);
      });
    }
  }

  // Preload critical routes
  static preloadCriticalRoutes() {
    const criticalRoutes = [
      { path: '/dashboard', import: () => import('@/pages/unified/UnifiedDashboardPage') },
      { path: '/products', import: () => import('@/pages/ProductsBrowser') },
      { path: '/orders', import: () => import('@/pages/OrderManagement') },
    ];

    criticalRoutes.forEach(route => {
      this.preloadRoute(route.path, route.import);
    });
  }

  // Dynamic imports based on user role
  static async loadRoleBasedComponents(userRole: string) {
    const roleComponentMap = {
      'admin': [
        () => import('@/pages/unified/UnifiedDashboardPage'),
        () => import('@/pages/AdminUsers'),
        () => import('@/pages/ComprehensiveAdminPanel'),
      ],
      'affiliate': [
        () => import('@/pages/unified/UnifiedDashboardPage'),
        () => import('@/pages/AffiliateStoreFront'),
      ],
      'merchant': [
        () => import('@/pages/unified/UnifiedDashboardPage'),
        () => import('@/pages/ProductManagement'),
        () => import('@/pages/Inventory'),
      ],
      'customer': [
        () => import('@/pages/PublicStorefront'),
        () => import('@/pages/Cart'),
      ],
    };

    const components = roleComponentMap[userRole as keyof typeof roleComponentMap] || [];
    
    return Promise.all(
      components.map(importFn => this.preloadRoute(`role-${userRole}`, importFn))
    );
  }

  // Monitor bundle sizes
  static monitorBundleSizes() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resources.filter(r => 
        r.name.includes('.js') && !r.name.includes('node_modules')
      );
      
      const bundleInfo = jsResources.map(r => ({
        name: r.name.split('/').pop()?.split('?')[0] || 'unknown',
        size: r.transferSize || 0,
        loadTime: r.responseEnd - r.requestStart,
        cached: r.transferSize === 0 && r.decodedBodySize > 0,
      }));

      // Log large bundles
      bundleInfo
        .filter(bundle => bundle.size > 100 * 1024) // > 100KB
        .forEach(bundle => {
          console.warn(`📦 Large bundle detected: ${bundle.name} (${(bundle.size / 1024).toFixed(1)}KB)`);
        });

      return bundleInfo;
    }
    
    return [];
  }

  // Tree shaking analyzer
  static analyzeUnusedExports() {
    // This would require build-time analysis
    // For runtime, we can track used components
    const usedComponents = new Set<string>();
    
    return {
      trackUsage: (componentName: string) => {
        usedComponents.add(componentName);
      },
      getUnusedComponents: (allComponents: string[]) => {
        return allComponents.filter(comp => !usedComponents.has(comp));
      },
      getUsageStats: () => {
        return {
          total: usedComponents.size,
          components: Array.from(usedComponents),
        };
      }
    };
  }
}

// Web Workers for heavy computations
export class WebWorkerManager {
  private static workers = new Map<string, Worker>();

  static createWorker(name: string, workerScript: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    this.workers.set(name, worker);
    return worker;
  }

  static async runTask<T>(
    workerName: string,
    taskData: any,
    workerScript: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = this.createWorker(workerName, workerScript);
      
      const timeout = setTimeout(() => {
        reject(new Error('Worker task timeout'));
      }, 30000); // 30 second timeout

      worker.onmessage = (event) => {
        clearTimeout(timeout);
        resolve(event.data);
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      worker.postMessage(taskData);
    });
  }

  static terminateWorker(name: string) {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  static terminateAllWorkers() {
    this.workers.forEach((worker, name) => {
      worker.terminate();
    });
    this.workers.clear();
  }
}

// Performance budgets
export class PerformanceBudget {
  private static budgets = {
    // Bundle sizes (in bytes)
    mainBundle: 500 * 1024, // 500KB
    vendorBundle: 1024 * 1024, // 1MB
    asyncChunk: 200 * 1024, // 200KB
    
    // Timing budgets (in ms)
    fcp: 1800, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
    
    // Resource budgets
    totalRequests: 50,
    totalSize: 2 * 1024 * 1024, // 2MB
  };

  static checkBudgets() {
    const violations = [];
    
    // Check bundle sizes
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      
      jsResources.forEach(resource => {
        const size = resource.transferSize || 0;
        const name = resource.name.split('/').pop() || 'unknown';
        
        if (name.includes('vendor') && size > this.budgets.vendorBundle) {
          violations.push({
            type: 'bundle-size',
            resource: name,
            actual: size,
            budget: this.budgets.vendorBundle,
            severity: 'error'
          });
        } else if (size > this.budgets.asyncChunk) {
          violations.push({
            type: 'bundle-size',
            resource: name,
            actual: size,
            budget: this.budgets.asyncChunk,
            severity: 'warning'
          });
        }
      });

      // Check total requests
      if (resources.length > this.budgets.totalRequests) {
        violations.push({
          type: 'request-count',
          actual: resources.length,
          budget: this.budgets.totalRequests,
          severity: 'warning'
        });
      }

      // Check total size
      const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      if (totalSize > this.budgets.totalSize) {
        violations.push({
          type: 'total-size',
          actual: totalSize,
          budget: this.budgets.totalSize,
          severity: 'error'
        });
      }
    }

    return violations;
  }

  static setBudget(key: keyof typeof PerformanceBudget.budgets, value: number) {
    this.budgets[key] = value as any;
  }

  static getBudgets() {
    return { ...this.budgets };
  }
}

// Initialize performance optimization
export const initializePerformanceOptimization = () => {
  // Preload critical routes
  BundleOptimizer.preloadCriticalRoutes();
  
  // Monitor bundle sizes
  setTimeout(() => {
    BundleOptimizer.monitorBundleSizes();
  }, 2000);
  
  // Check performance budgets
  setTimeout(() => {
    const violations = PerformanceBudget.checkBudgets();
    if (violations.length > 0) {
      console.group('⚠️ Performance Budget Violations');
      violations.forEach(violation => {
        console.warn(`${violation.type}: ${violation.resource || 'N/A'}`, violation);
      });
      console.groupEnd();
    }
  }, 5000);
  
  console.log('🚀 Performance optimization initialized');
};