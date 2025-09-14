import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

    // إذا كان النطاق المخصص للمستخدم (مستقبلاً)
    if (hostname !== 'localhost' && !hostname.includes('lovable.app')) {
      // يمكن هنا إضافة منطق للنطاقات المخصصة
      // مثال: store.yourdomain.com → /store/your-shop
      console.log('Custom domain detected:', hostname);
      
      // مثال للتطبيق المستقبلي:
      // const storeSlug = getStoreSlugFromDomain(hostname);
      // if (storeSlug && !currentPath.startsWith(`/store/${storeSlug}`)) {
      //   navigate(`/store/${storeSlug}`, { replace: true });
      // }
    }

    // منع الوصول للمنصة من مسارات المتجر
    if (currentPath.startsWith('/store/')) {
      // تأكد من عدم وجود روابط خارجية للمنصة
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