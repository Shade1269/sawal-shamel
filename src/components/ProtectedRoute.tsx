import { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'merchant' | 'affiliate' | 'customer';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-destructive mb-4">غير مسموح</h2>
          <p className="text-muted-foreground">
            ليس لديك الصلاحية للوصول إلى هذه الصفحة
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};