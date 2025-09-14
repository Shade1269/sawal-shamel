import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';

interface PlatformRouteGuardProps {
  children: ReactNode;
}

/**
 * يمنع عملاء المتجر من الوصول لصفحات المنصة
 */
export const PlatformRouteGuard = ({ children }: PlatformRouteGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // فحص إذا كان هناك عميل متجر مسجل دخول
  const customerSessionKey = 'customer_session';
  const customerSession = localStorage.getItem(customerSessionKey);
  
  const currentPath = location.pathname;
  const isPlatformPath = currentPath.startsWith('/admin') || 
                        currentPath.startsWith('/affiliate') || 
                        currentPath.startsWith('/merchant') ||
                        currentPath === '/dashboard' ||
                        (currentPath === '/auth' && !currentPath.includes('/store/'));

  useEffect(() => {
    // إذا عميل متجر يحاول دخول المنصة
    if (customerSession && isPlatformPath) {
      // توجيه للصفحة الرئيسية
      navigate('/', { replace: true });
      return;
    }
  }, [customerSession, isPlatformPath, navigate]);

  return <>{children}</>;
};

export default PlatformRouteGuard;