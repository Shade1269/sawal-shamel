import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useModernStorefront } from '@/hooks/useModernStorefront';
import ModernStorefront from '../ModernStorefront';
import { EnhancedStoreFront } from '@/features/affiliate';

interface StoreIntegrationProps {
  storeSlug?: string;
  forceModern?: boolean;
}

export const StoreIntegration: React.FC<StoreIntegrationProps> = ({ 
  storeSlug, 
  forceModern = false 
}) => {
  const { storeSlug: urlSlug } = useParams<{ storeSlug: string }>();
  const effectiveSlug = storeSlug || urlSlug;
  const { isModernMode, isLoading } = useModernStorefront(effectiveSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Force modern mode or check user preference
  const shouldUseModern = forceModern || isModernMode;

  // If we have a storeSlug prop but need to use ModernStorefront, redirect to proper URL
  if (shouldUseModern && storeSlug && !urlSlug) {
    return <Navigate to={`/store/${storeSlug}`} replace />;
  }

  return shouldUseModern ? (
    <ModernStorefront />
  ) : (
    <EnhancedStoreFront storeSlug={effectiveSlug} />
  );
};