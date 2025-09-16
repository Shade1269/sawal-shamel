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

    const isCustomDomain = hostname !== 'localhost' 
      && !hostname.includes('atlantiss.tech') 
      && !hostname.includes('lovableproject.com') 
      && !hostname.includes('lovable.app');

    // Skip redirect logic for atlantiss.tech - let normal routing handle it
    if (hostname.includes('atlantiss.tech')) {
      return;
    }

    if (isCustomDomain) {
      const storeSlug = getStoreSlugFromDomain(hostname);

      // Apply redirects ONLY if this domain is mapped to a store
      if (storeSlug) {
        // Redirect custom domain root to its mapped store slug
        if (!currentPath.startsWith(`/store/${storeSlug}`)) {
          navigate(`/store/${storeSlug}${search}`, { replace: true });
          return;
        }

        // Block platform routes on mapped custom domains
        const platformPaths = ['/admin', '/affiliate', '/merchant', '/dashboard', '/auth'];
        if (platformPaths.some(path => currentPath === path || currentPath.startsWith(`${path}/`))) {
          navigate(`/store/${storeSlug}`, { replace: true });
          return;
        }
      }
    }

    // منع الوصول للمنصة من مسارات المتجر
    if (currentPath.startsWith('/store/')) {
      const platformPaths = ['/admin', '/affiliate', '/merchant', '/dashboard'];
      platformPaths.forEach(path => {
        const platformLinks = document.querySelectorAll(`a[href="${path}"]`);
        platformLinks.forEach(link => {
          link.remove(); // إزالة الروابط للمنصة
        });
      });
    }
  }, [location, navigate]);

  return <>{children}</>;
};

export default DomainManager;