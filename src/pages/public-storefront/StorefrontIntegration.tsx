import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EnhancedStoreFront from '@/features/affiliate/components/EnhancedStoreFront';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';

const StorefrontIntegration: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <Navigate to="/" replace />;

  return (
    <CustomerAuthProvider>
      <EnhancedStoreFront storeSlug={slug} />
    </CustomerAuthProvider>
  );
};

export default StorefrontIntegration;
