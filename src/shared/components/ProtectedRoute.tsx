import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  fallback?: string;
  allowInactive?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallback = "/auth", 
  allowInactive = false 
}: ProtectedRouteProps) => {
  const { 
    user, 
    profile, 
    loading, 
    hasRole, 
    isActive 
  } = useFastAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg-accent flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 gradient-btn-primary rounded-2xl flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">جاري التحقق من الهوية</h3>
            <p className="text-sm text-muted-foreground">الرجاء الانتظار...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to={fallback} replace />;
  }

  // If a specific role is required but profile isn't loaded yet, don't block the user
  if (requiredRole && !profile) {
    return (
      <div className="min-h-screen gradient-bg-accent flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 gradient-btn-primary rounded-2xl flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">جاري التحقق من الصلاحيات</h3>
            <p className="text-sm text-muted-foreground">الرجاء الانتظار...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is active (unless explicitly allowed)
  if (!allowInactive && profile && !isActive) {
    return (
      <div className="min-h-screen gradient-bg-destructive flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center bg-background rounded-2xl shadow-2xl p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">حساب معطل</h1>
          <p className="text-muted-foreground mb-6">
            تم تعطيل حسابك. يرجى التواصل مع الدعم الفني لمزيد من المعلومات.
          </p>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen gradient-bg-warning flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center bg-background rounded-2xl shadow-2xl p-8">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">غير مخول</h1>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية للوصول إلى هذه الصفحة.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};