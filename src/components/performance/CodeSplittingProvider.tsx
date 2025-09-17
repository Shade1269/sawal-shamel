import React, { Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CodeSplittingProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ComponentType<FallbackProps>;
  chunkName?: string;
}

// Default loading component
const DefaultLoadingFallback: React.FC<{ chunkName?: string }> = ({ chunkName }) => (
  <Card className="w-full">
    <CardContent className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-sm text-muted-foreground">
            جاري تحميل {chunkName || 'المكون'}...
          </span>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

// Default error boundary component
const DefaultErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <Card className="w-full border-destructive">
    <CardContent className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
        
        <div>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            خطأ في تحميل المكون
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            فشل في تحميل هذا الجزء من التطبيق
          </p>
          
          <details className="text-left bg-muted/30 p-3 rounded-lg text-xs">
            <summary className="cursor-pointer font-medium mb-2">
              تفاصيل الخطأ
            </summary>
            <code className="text-red-600 dark:text-red-400">
              {error.message}
            </code>
          </details>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="destructive"
            className="gap-2"
          >
            إعادة تحميل الصفحة
          </Button>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

// Intelligent loading based on connection speed
const getLoadingStrategy = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // Slow connection detection
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      return 'minimal'; // Show minimal loading state
    } else if (connection.effectiveType === '3g') {
      return 'standard'; // Standard loading
    }
  }
  
  return 'rich'; // Rich loading experience
};

// Enhanced loading component with connection awareness
const SmartLoadingFallback: React.FC<{ chunkName?: string }> = ({ chunkName }) => {
  const strategy = getLoadingStrategy();
  
  if (strategy === 'minimal') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <span className="mr-3 text-sm">تحميل...</span>
      </div>
    );
  }
  
  if (strategy === 'standard') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-sm">جاري التحميل...</span>
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  
  return <DefaultLoadingFallback chunkName={chunkName} />;
};

// Performance-optimized provider
export const CodeSplittingProvider: React.FC<CodeSplittingProviderProps> = ({
  children,
  fallback,
  errorFallback: ErrorComponent = DefaultErrorFallback,
  chunkName
}) => {
  // Use smart loading fallback if none provided
  const loadingFallback = fallback || <SmartLoadingFallback chunkName={chunkName} />;

  return (
    <ErrorBoundary
      FallbackComponent={ErrorComponent}
      onError={(error, errorInfo) => {
        console.error(`❌ Code splitting error in ${chunkName}:`, error);
        console.error('Error info:', errorInfo);
        
        // Report to analytics (if available)
        if (typeof (window as any).gtag !== 'undefined') {
          (window as any).gtag('event', 'exception', {
            description: `Code splitting error: ${error.message}`,
            fatal: false,
            custom_map: { chunk_name: chunkName }
          });
        }
      }}
      onReset={() => {
        console.log(`🔄 Resetting error boundary for ${chunkName}`);
      }}
    >
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Hook for measuring component load times
export const useComponentLoadTime = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`⏱️ Component ${componentName} render time: ${loadTime.toFixed(2)}ms`);
      
      // Warn about slow components
      if (loadTime > 500) {
        console.warn(`🐌 Slow component detected: ${componentName} (${loadTime.toFixed(2)}ms)`);
      }
    };
  }, [componentName]);
};

// Wrapper for lazy-loaded routes
export const LazyRoute: React.FC<{
  component: ComponentType<any>;
  name: string;
  props?: any;
}> = ({ component: Component, name, props = {} }) => {
  useComponentLoadTime(name);
  
  return (
    <CodeSplittingProvider chunkName={name}>
      <Component {...props} />
    </CodeSplittingProvider>
  );
};

export default CodeSplittingProvider;