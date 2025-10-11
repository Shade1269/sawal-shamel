import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EnhancedStoreFront } from '@/features/affiliate';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';

const AffiliateStoreFront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store, isLoading } = useAffiliateStore();

  useEffect(() => {
    // إذا لم يكن هناك storeSlug في الرابط وكان المستخدم لديه متجر
    if (!storeSlug && store && !isLoading) {
      // إذا كان لدى المستخدم متجر، اذهب إلى إعدادات المتجر
      navigate(`/affiliate/store/settings`, { replace: true });
      return;
    }
    
    // إذا لم يكن هناك storeSlug ولا يوجد متجر
    if (!storeSlug && !store && !isLoading) {
      // اذهب إلى صفحة إنشاء المتجر
      navigate('/affiliate/store/setup', { replace: true });
      return;
    }
  }, [storeSlug, store, isLoading, navigate]);

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
  
  return (
    <CustomerAuthProvider>
      <EnhancedStoreFront storeSlug={storeSlug} />
    </CustomerAuthProvider>
  );
};

export default AffiliateStoreFront;