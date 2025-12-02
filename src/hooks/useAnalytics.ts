import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getErrorTracker } from '@/utils/errorTracking';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface UserData {
  userId?: string;
  role?: string;
  email?: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const location = useLocation();
  const tracker = getErrorTracker();

  // Track page views automatically
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Track page view
  const trackPageView = useCallback((path: string, title?: string) => {
    const event: AnalyticsEvent = {
      event: 'page_view',
      category: 'navigation',
      action: 'view',
      label: path,
      metadata: { 
        path, 
        title,
        referrer: document.referrer,
        timestamp: Date.now()
      }
    };

    sendAnalyticsEvent(event);
    tracker.trackPageView(path, title);
  }, [tracker]);

  // Track user interactions
  const trackEvent = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    const event: AnalyticsEvent = {
      event: 'user_interaction',
      category,
      action,
      label,
      value,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        url: window.location.href
      }
    };

    sendAnalyticsEvent(event);
    tracker.logUserAction(action, category, metadata);
  }, [tracker]);

  // Track button clicks
  const trackButtonClick = useCallback((buttonName: string, context?: string) => {
    trackEvent('ui', 'click', buttonName, undefined, { context });
  }, [trackEvent]);

  // Track form submissions
  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    trackEvent('form', success ? 'submit_success' : 'submit_error', formName);
  }, [trackEvent]);

  // Track search queries
  const trackSearch = useCallback((query: string, results?: number) => {
    trackEvent('search', 'query', query, results);
  }, [trackEvent]);

  // Track e-commerce events
  const trackPurchase = useCallback((orderId: string, amount: number, currency: string = 'SAR') => {
    trackEvent('ecommerce', 'purchase', orderId, amount, { currency });
  }, [trackEvent]);

  const trackAddToCart = useCallback((productId: string, productName: string, price: number) => {
    trackEvent('ecommerce', 'add_to_cart', productName, price, { productId });
  }, [trackEvent]);

  const trackRemoveFromCart = useCallback((productId: string, productName: string) => {
    trackEvent('ecommerce', 'remove_from_cart', productName, undefined, { productId });
  }, [trackEvent]);

  // Track affiliate actions
  const trackAffiliateAction = useCallback((action: string, storeId?: string, metadata?: Record<string, any>) => {
    trackEvent('affiliate', action, storeId, undefined, metadata);
  }, [trackEvent]);

  // Track performance metrics
  const trackPerformance = useCallback((metricName: string, value: number, unit: string = 'ms') => {
    const event: AnalyticsEvent = {
      event: 'performance',
      category: 'performance',
      action: 'metric',
      label: metricName,
      value,
      metadata: { unit }
    };

    sendAnalyticsEvent(event);
    tracker.trackMetric({
      type: 'measure',
      name: metricName,
      value,
      unit: unit as any
    });
  }, [tracker]);

  // Set user properties
  const setUser = useCallback((userData: UserData) => {
    tracker.setUser(userData.userId!, userData.role);

    // Send user data to analytics
    sendAnalyticsEvent({
      event: 'user_identify',
      category: 'user',
      action: 'identify',
      metadata: userData
    });
  }, [tracker]);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    const event: AnalyticsEvent = {
      event: 'error',
      category: 'error',
      action: 'exception',
      label: error.message,
      metadata: {
        stack: error.stack,
        context,
        url: window.location.href
      }
    };

    sendAnalyticsEvent(event);
    tracker.logError({
      message: error.message,
      stack: error.stack,
      level: 'error',
      component: context || 'unknown'
    });
  }, [tracker]);

  return {
    // Page tracking
    trackPageView,
    
    // Event tracking
    trackEvent,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    
    // E-commerce tracking
    trackPurchase,
    trackAddToCart,
    trackRemoveFromCart,
    
    // Affiliate tracking
    trackAffiliateAction,
    
    // Performance tracking
    trackPerformance,
    
    // User management
    setUser,
    
    // Error tracking
    trackError
  };
};

// Send analytics event to various services
const sendAnalyticsEvent = (event: AnalyticsEvent) => {
  // Analytics events are processed silently

  // Send to Google Analytics (gtag)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      custom_parameter: event.metadata
    });
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    sendToAnalyticsEndpoint(event);
  }

  // Store locally for debugging
  storeAnalyticsLocally(event);
};

// Send to custom analytics service
const sendToAnalyticsEndpoint = async (event: AnalyticsEvent) => {
  try {
    if (typeof fetch === 'undefined') return;

    const tracker = getErrorTracker();
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...event,
        timestamp: Date.now(),
        sessionId: tracker.sessionId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      })
    });
  } catch {
    // Ignore analytics send errors
  }
};

// Store analytics locally for debugging
const storeAnalyticsLocally = (event: AnalyticsEvent) => {
  try {
    const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    stored.push({
      ...event,
      timestamp: Date.now()
    });
    
    // Keep only last 100 events
    if (stored.length > 100) {
      stored.splice(0, stored.length - 100);
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(stored));
  } catch {
    // Ignore localStorage errors
  }
};

// Analytics utilities
export const AnalyticsUtils = {
  // Get stored events
  getStoredEvents: () => {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  },

  // Clear stored events
  clearStoredEvents: () => {
    localStorage.removeItem('analytics_events');
  },

  // Get analytics summary
  getSummary: (timeRange: number = 24 * 60 * 60 * 1000) => {
    const events = AnalyticsUtils.getStoredEvents();
    const cutoff = Date.now() - timeRange;
    const recentEvents = events.filter((e: any) => e.timestamp > cutoff);

    return {
      totalEvents: recentEvents.length,
      byCategory: groupBy(recentEvents, 'category'),
      byAction: groupBy(recentEvents, 'action'),
      pageViews: recentEvents.filter((e: any) => e.event === 'page_view').length,
      userInteractions: recentEvents.filter((e: any) => e.event === 'user_interaction').length,
      errors: recentEvents.filter((e: any) => e.event === 'error').length
    };
  }
};

// Helper function
const groupBy = (array: any[], key: string) => {
  return array.reduce((groups: any, item: any) => {
    const group = item[key] || 'unknown';
    groups[group] = (groups[group] || 0) + 1;
    return groups;
  }, {});
};
