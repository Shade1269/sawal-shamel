import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { IsolatedStorefront } from '@/pages/storefront/IsolatedStorefront';

const AffiliateStoreFront = () => {
  const navigate = useNavigate();
  const { store, isLoading } = useAffiliateStore();

  useEffect(() => {
    // إذا لم يكن لدى المستخدم متجر، اذهب إلى صفحة الإنشاء
    if (!store && !isLoading) {
      navigate('/affiliate/store/setup', { replace: true });
      return;
    }
  }, [store, isLoading, navigate]);

  // إذا كان لا يزال يحمل البيانات
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

  if (!store) {
    return null;
  }
  
  return (
    <CustomerAuthProvider>
      <div className="container mx-auto px-4 py-6">
        <IsolatedStorefront 
          storeData={{
            id: store.id,
            store_name: store.store_name,
            store_slug: store.store_slug,
          }} 
        />
      </div>
    </CustomerAuthProvider>
  );
};

export default AffiliateStoreFront;