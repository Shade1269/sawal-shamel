import { useParams } from 'react-router-dom';
import { EnhancedStoreFront } from '@/features/affiliate';

const AffiliateStoreFront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  
  return <EnhancedStoreFront storeSlug={storeSlug} />;
};

export default AffiliateStoreFront;