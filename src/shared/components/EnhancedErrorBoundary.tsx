import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from '@/components/ui/enhanced-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
// useDesignSystem hook available from @/hooks/useDesignSystem

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error reporting service (if configured)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Here you can integrate with error reporting services like Sentry, LogRocket, etc.
    console.group('🚨 Error Report');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallbackUI 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        showDetails={this.props.showDetails}
        onRetry={this.handleRetry}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
        onCopyDetails={this.copyErrorDetails}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackUIProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails?: boolean;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onCopyDetails: () => void;
}

const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  error,
  errorInfo,
  errorId,
  showDetails = false,
  onRetry,
  onReload,
  onGoHome,
  onCopyDetails,
}) => {
  const [showFullDetails, setShowFullDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Error Card */}
        <EnhancedCard 
          variant="glass" 
          hover="glow" 
          size="lg"
          className="text-center animate-fade-in"
        >
          <EnhancedCardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-destructive/10 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 text-destructive animate-pulse-glow" />
              </div>
            </div>
            <EnhancedCardTitle className="text-2xl mb-2">
              عذراً، حدث خطأ غير متوقع
            </EnhancedCardTitle>
            <p className="text-muted-foreground">
              Something went wrong, but we're here to help fix it.
            </p>
          </EnhancedCardHeader>

          <EnhancedCardContent className="space-y-6">
            {/* Error ID */}
            <Alert variant="info" animation="fade">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Error ID: <code className="bg-muted px-2 py-1 rounded text-xs">{errorId}</code></p>
                  {error?.message && (
                    <p className="text-sm">
                      <strong>Message:</strong> {error.message}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <EnhancedButton
                variant="premium"
                onClick={onRetry}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                animation="glow"
              >
                Try Again
              </EnhancedButton>
              
              <EnhancedButton
                variant="secondary"
                onClick={onReload}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reload Page
              </EnhancedButton>
              
              <EnhancedButton
                variant="outline"
                onClick={onGoHome}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go Home
              </EnhancedButton>
            </div>

            {/* Show Details Toggle */}
            {showDetails && (
              <div className="border-t pt-4">
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="mb-3"
                >
                  {showFullDetails ? 'Hide' : 'Show'} Technical Details
                </EnhancedButton>

                {showFullDetails && (
                  <div className="space-y-4 text-left animate-fade-in">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Error Stack:</h4>
                      <pre className="text-xs overflow-auto max-h-48 text-muted-foreground">
                        {error?.stack}
                      </pre>
                    </div>

                    {errorInfo?.componentStack && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Component Stack:</h4>
                        <pre className="text-xs overflow-auto max-h-48 text-muted-foreground">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={onCopyDetails}
                      className="w-full"
                    >
                      Copy Error Details
                    </EnhancedButton>
                  </div>
                )}
              </div>
            )}
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          If this error persists, please contact our support team with the Error ID above.
        </div>
      </div>
    </div>
  );
};

export default EnhancedErrorBoundary;