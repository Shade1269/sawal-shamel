import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';

interface StoreRouteGuardProps {
  children: ReactNode;
}

/**
 * يمنع مستخدمي المنصة من الوصول لصفحات المتجر
 * ويمنع العملاء من الوصول لصفحات المنصة
 */
export const StoreRouteGuard = ({ children }: StoreRouteGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated: isPlatformAuth, profile } = useFastAuth();
  
  const currentPath = location.pathname;
  const isStorePath = currentPath.startsWith('/store/');
  const isPlatformPath = currentPath.startsWith('/admin') || 
                        currentPath.startsWith('/affiliate') || 
                        currentPath.startsWith('/merchant') ||
                        currentPath === '/dashboard' ||
                        currentPath === '/auth';

  useEffect(() => {
    // إذا مستخدم منصة يحاول دخول المتجر
    if (isPlatformAuth && profile && isStorePath) {
      // توجيه لصفحة المنصة المناسبة
      const redirectMap: { [key: string]: string } = {
        'admin': '/admin',
        'affiliate': '/affiliate',
        'merchant': '/merchant',
      };
      
      const redirectPath = redirectMap[profile.role] || '/dashboard';
      navigate(redirectPath, { replace: true });
      return;
    }

    // منع الوصول المباشر لصفحات المنصة من مستخدمي المتجر
    // (سيتم التعامل مع هذا في PlatformRouteGuard)
    
  }, [isPlatformAuth, profile, isStorePath, isPlatformPath, navigate]);

  return <>{children}</>;
};

export default StoreRouteGuard;