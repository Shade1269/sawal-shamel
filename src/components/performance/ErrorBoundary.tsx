import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to external service (e.g., Sentry)
    const eventId = this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      eventId
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
    
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevResetKeys[index]);
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  private logErrorToService = (_error: Error, _errorInfo: ErrorInfo): string => {
    // Mock implementation - replace with actual error reporting service
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Example: Send to Sentry, LogRocket, etc.
    /*
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      Sentry.captureException(error);
    });
    */
    
    return eventId;
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      });
    }, 100);
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    
    // Prepare bug report data
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      eventId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Open email client or bug reporting form
    const subject = `خطأ في التطبيق - ${error?.name || 'Unknown Error'}`;
    const body = `تفاصيل الخطأ:\n\n${JSON.stringify(bugReport, null, 2)}`;
    const mailtoLink = `mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, eventId } = this.state;
      const { showDetails = false } = this.props;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">حدث خطأ غير متوقع</CardTitle>
              <p className="text-muted-foreground mt-2">
                نعتذر، لقد حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.
              </p>
              {eventId && (
                <p className="text-sm text-muted-foreground mt-2">
                  معرف الخطأ: <code className="bg-muted px-2 py-1 rounded">{eventId}</code>
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  إعادة المحاولة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  العودة للصفحة الرئيسية
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReportBug}
                  className="flex-1"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  الإبلاغ عن خطأ
                </Button>
              </div>

              {/* Error Details */}
              {showDetails && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    تفاصيل الخطأ التقنية
                  </summary>
                  <div className="bg-muted p-4 rounded-lg space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">رسالة الخطأ:</h4>
                      <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto">
                        {error.message}
                      </pre>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h4 className="font-medium text-sm">تتبع المكدس:</h4>
                        <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-sm">مكدس المكونات:</h4>
                        <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <p className="mb-2"><strong>إذا استمر هذا الخطأ:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>تأكد من اتصالك بالإنترنت</li>
                  <li>جرب تحديث الصفحة</li>
                  <li>امسح ذاكرة التخزين المؤقت للمتصفح</li>
                  <li>تواصل مع الدعم الفني مع معرف الخطأ أعلاه</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Hook for error boundary
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}