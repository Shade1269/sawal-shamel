import React from 'react';
import { useParams } from 'react-router-dom';
import { BannerManager } from '@/components/marketing/BannerManager';

const BannerManagementPage: React.FC = () => {
  const { storeId } = useParams<{ storeId?: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <BannerManager 
        storeId={storeId}
        affiliateStoreId={storeId} // يمكن تمرير معرف المتجر التابع إذا كان متاحاً
      />
    </div>
  );
};

export default BannerManagementPage;