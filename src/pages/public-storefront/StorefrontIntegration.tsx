import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EnhancedStoreFront from '@/features/affiliate/components/EnhancedStoreFront';

const StorefrontIntegration: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <Navigate to="/" replace />;

  return <EnhancedStoreFront storeSlug={slug} />;
};

export default StorefrontIntegration;
