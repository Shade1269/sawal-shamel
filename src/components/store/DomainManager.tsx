import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoreSlugFromDomain } from '@/utils/storeRedirects';

interface DomainManagerProps {
  children: React.ReactNode;
}

/**
 * يدير النطاقات المخصصة والتوجيه للمتجر المناسب
 */
const DomainManager = ({ children }: DomainManagerProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    const currentPath = location.pathname;
    const search = location.search;

    // السماح لجميع متاجر المسوقين بالعمل من أي دومين
    // لا حاجة لربط كل متجر بدومين مخصص - يكفي المسار /:slug
    
    const isLovableProjectDomain = hostname.endsWith('.lovableproject.com');
    const isCustomDomain = hostname !== 'localhost'
      && !hostname.includes('lovable.app')
      && !isLovableProjectDomain;

    // إذا كان دومين مخصص، السماح بالوصول لأي متجر عبر /:slug
    if (isCustomDomain) {
      const storeSlug = getStoreSlugFromDomain(hostname);

      // فقط إذا كان الدومين مربوط بمتجر محدد في STORE_DOMAINS
      if (storeSlug) {
        // توجيه الصفحة الرئيسية للدومين المخصص إلى المتجر المربوط
        if (currentPath === '/' || currentPath === '') {
          navigate(`/${storeSlug}${search}`, { replace: true });
          return;
        }

        // منع مسارات المنصة من الدومينات المربوطة
        const platformPaths = ['/admin', '/affiliate', '/auth'];
        if (platformPaths.some(path => currentPath === path || currentPath.startsWith(`${path}/`))) {
          navigate(`/${storeSlug}`, { replace: true });
          return;
        }
      }
    }
  }, [location, navigate]);

  return <>{children}</>;
};

export default DomainManager;
