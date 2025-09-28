import { useParams } from 'react-router-dom';
import { EnhancedStoreFront } from '@/features/affiliate';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';

const AffiliateStoreFront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  
  return (
    <CustomerAuthProvider>
      <EnhancedStoreFront storeSlug={storeSlug} />
    </CustomerAuthProvider>
  );
};

export default AffiliateStoreFront;