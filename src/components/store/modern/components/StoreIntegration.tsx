import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { EnhancedStoreFront } from '@/features/affiliate';

interface StoreIntegrationProps {
  storeSlug?: string;
}

export const StoreIntegration: React.FC<StoreIntegrationProps> = ({ storeSlug }) => {
  const { storeSlug: urlSlug } = useParams<{ storeSlug: string }>();
  const effectiveSlug = storeSlug || urlSlug;

  if (!effectiveSlug) {
    return <Navigate to="/" replace />;
  }

  return <EnhancedStoreFront storeSlug={effectiveSlug} />;
};