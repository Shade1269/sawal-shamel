import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EnhancedStoreFront from '@/features/affiliate/components/EnhancedStoreFront';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';

const StorefrontPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();

  if (!storeSlug) return <Navigate to="/" replace />;

  return (
    <CustomerAuthProvider>
      <EnhancedStoreFront storeSlug={storeSlug} />
    </CustomerAuthProvider>
  );
};

export default StorefrontPage;
