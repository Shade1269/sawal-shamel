import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import FastAuthForm from '@/components/auth/FastAuthForm';

const FastAuth = () => {
  const { isAuthenticated, loading } = useFastAuth();

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  return <FastAuthForm />;
};

export default FastAuth;