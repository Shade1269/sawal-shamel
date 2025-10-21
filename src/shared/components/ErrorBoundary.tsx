import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: error.stack || error.message 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error information
    this.setState({
      hasError: true,
      error,
      errorInfo: errorInfo.componentStack || error.message
    });

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // In production, you might want to send this to a logging service
    // Example: Sentry, LogRocket, etc.
  }

  private handleReload = () => {
    // Clear error state and reload - keep for error boundary
    this.setState({ hasError: false, error: null, errorInfo: '' });
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear error state and navigate to home - keep for error boundary
    this.setState({ hasError: false, error: null, errorInfo: '' });
    window.location.href = '/';
  };

  private handleRetry = () => {
    // Just clear the error state to retry rendering
    this.setState({ hasError: false, error: null, errorInfo: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl mx-auto shadow-luxury">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-destructive">
                حدث خطأ غير متوقع
              </CardTitle>
              <CardDescription className="text-base mt-2">
                نعتذر، حدث خطأ أثناء تشغيل التطبيق. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني إذا استمرت المشكلة.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">تفاصيل الخطأ (للمطورين):</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <strong>نوع الخطأ:</strong> {this.state.error.name}
                    </div>
                    <div>
                      <strong>الرسالة:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>تفاصيل إضافية:</strong>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {this.state.errorInfo}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة تحميل الصفحة
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  العودة للصفحة الرئيسية
                </Button>
              </div>

              {/* Support Information */}
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني</p>
                <p className="mt-1">
                  أو قم بتحديث المتصفح وحاول مرة أخرى
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}