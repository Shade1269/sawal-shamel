// Advanced Error Tracking System

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  userAgent?: string;
  url: string;
  userId?: string;
  userRole?: string;
  sessionId: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  id: string;
  timestamp: number;
  type: 'navigation' | 'resource' | 'measure' | 'mark';
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private logs: ErrorLog[] = [];
  private metrics: PerformanceMetric[] = [];
  private readonly isBrowser: boolean;
  // Public getter for session ID
  get sessionId(): string {
    return this._sessionId;
  }

  private _sessionId: string;
  private userId?: string;
  private userRole?: string;
  private maxLogs = 1000;

  constructor(isBrowser: boolean) {
    this.isBrowser = isBrowser;
    this._sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupPerformanceTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set user context
  setUser(userId: string, role?: string) {
    this.userId = userId;
    this.userRole = role;
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers() {
    if (!this.isBrowser || typeof window === 'undefined') {
      return;
    }

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        level: 'error',
        component: 'global',
        action: 'javascript_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        level: 'error',
        component: 'global',
        action: 'promise_rejection',
        metadata: {
          reason: event.reason
        }
      });
    });

    // Handle React Error Boundaries
    this.setupReactErrorTracking();
  }

  private setupReactErrorTracking() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      const message = args.join(' ');
      if (message.includes('React') || message.includes('Warning:')) {
        this.logError({
          message: message,
          level: message.includes('Warning:') ? 'warning' : 'error',
          component: 'react',
          action: 'react_error',
          metadata: { args }
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  // Setup performance tracking
  private setupPerformanceTracking() {
    if (!this.isBrowser || typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return;
    }

    if ('PerformanceObserver' in window) {
      // Track navigation timing
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackMetric({
              type: 'navigation',
              name: 'page_load_time',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              unit: 'ms'
            });

            this.trackMetric({
              type: 'navigation',
              name: 'dom_content_loaded',
              value: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              unit: 'ms'
            });
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
      } catch {
        // Navigation timing not supported
      }

      // Track resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.trackMetric({
              type: 'resource',
              name: resourceEntry.name,
              value: resourceEntry.responseEnd - resourceEntry.requestStart,
              unit: 'ms',
              metadata: {
                transferSize: resourceEntry.transferSize,
                type: resourceEntry.initiatorType
              }
            });
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch {
        // Resource timing not supported
      }
    }
  }

  // Log error with context
  logError(error: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message || 'Unknown error',
      stack: error.stack,
      level: error.level || 'error',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : error.url || 'unknown',
      userId: this.userId,
      userRole: this.userRole,
      sessionId: this._sessionId,
      component: error.component,
      action: error.action,
      metadata: error.metadata
    };

    this.logs.push(errorLog);
    this.maintainLogLimit();
    
    // Error logged to internal tracking system

    // Send to external service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.sendToExternalService(errorLog);
    }

    return errorLog;
  }

  // Track performance metric
  trackMetric(metric: Partial<PerformanceMetric>) {
    const perfMetric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: metric.type || 'measure',
      name: metric.name || 'unknown',
      value: metric.value || 0,
      unit: metric.unit || 'ms',
      metadata: metric.metadata
    };

    this.metrics.push(perfMetric);
    this.maintainMetricsLimit();

    return perfMetric;
  }

  // Log user action
  logUserAction(action: string, component: string, metadata?: Record<string, any>) {
    this.logError({
      message: `User action: ${action}`,
      level: 'info',
      component,
      action,
      metadata
    });
  }

  // Track page view
  trackPageView(path: string, title?: string) {
    this.logError({
      message: `Page view: ${path}`,
      level: 'info',
      component: 'navigation',
      action: 'page_view',
      metadata: { path, title }
    });
  }

  // Get error summary
  getErrorSummary(timeRange?: number) {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const recentLogs = this.logs.filter(log => log.timestamp > cutoff);

    return {
      total: recentLogs.length,
      byLevel: {
        critical: recentLogs.filter(log => log.level === 'critical').length,
        error: recentLogs.filter(log => log.level === 'error').length,
        warning: recentLogs.filter(log => log.level === 'warning').length,
        info: recentLogs.filter(log => log.level === 'info').length
      },
      byComponent: this.groupBy(recentLogs, 'component'),
      recentErrors: recentLogs.slice(-5)
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    return {
      totalMetrics: this.metrics.length,
      navigationMetrics: this.metrics.filter(m => m.type === 'navigation'),
      resourceMetrics: this.metrics.filter(m => m.type === 'resource'),
      avgPageLoadTime: this.calculateAverage(
        this.metrics.filter(m => m.name === 'page_load_time')
      )
    };
  }

  // Export logs for debugging
  exportLogs() {
    return {
      session: this._sessionId,
      user: { id: this.userId, role: this.userRole },
      errors: this.logs,
      metrics: this.metrics,
      summary: this.getErrorSummary(),
      performance: this.getPerformanceSummary()
    };
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.metrics = [];
  }

  // Private helper methods
  private maintainLogLimit() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private maintainMetricsLimit() {
    if (this.metrics.length > this.maxLogs) {
      this.metrics = this.metrics.slice(-this.maxLogs);
    }
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  private calculateAverage(metrics: PerformanceMetric[]) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return Math.round(sum / metrics.length);
  }

  private async sendToExternalService(errorLog: ErrorLog) {
    try {
      // In production, send to your error tracking service
      // Example: Sentry, LogRocket, or custom endpoint
      if (typeof fetch === 'undefined') return;

      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog)
      });
    } catch {
      // Failed to send error to external service
    }
  }
}

let errorTrackerInstance: ErrorTracker | null = null;

export const getErrorTracker = () => {
  if (!errorTrackerInstance) {
    const isBrowser = typeof window !== 'undefined';
    errorTrackerInstance = new ErrorTracker(isBrowser);
  }

  return errorTrackerInstance;
};

// Helper functions for React components
export const useErrorTracking = () => {
  const errorTracker = getErrorTracker();
  return {
    logError: errorTracker.logError.bind(errorTracker),
    logAction: errorTracker.logUserAction.bind(errorTracker),
    trackMetric: errorTracker.trackMetric.bind(errorTracker),
    setUser: errorTracker.setUser.bind(errorTracker),
    getSummary: errorTracker.getErrorSummary.bind(errorTracker)
  };
};

export default getErrorTracker;
