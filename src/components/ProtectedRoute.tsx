import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // استخدم مزودي المصادقة مباشرة لتجنب الاعتماد على UserDataContext هنا
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();

  const loading = supabaseLoading || firebaseLoading;
  const user = firebaseUser || supabaseUser;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري التحقق من صحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};