import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useModernStorefront } from '@/hooks/useModernStorefront';
import ModernStorefront from '@/components/store/modern/ModernStorefront';
import EnhancedStoreFront from '@/features/affiliate/components/EnhancedStoreFront';

const StorefrontIntegration: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isModernMode, isLoading } = useModernStorefront(slug);

  if (!slug) return <Navigate to="/" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return isModernMode ? (
    <ModernStorefront storeSlug={slug} />
  ) : (
    <EnhancedStoreFront storeSlug={slug} />
  );
};

export default StorefrontIntegration;
