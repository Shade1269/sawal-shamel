import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';
import { useFastAuth } from '@/hooks/useFastAuth';

interface PlatformRouteGuardProps {
  children: ReactNode;
}

/**
 * يمنع عملاء المتجر من الوصول لصفحات المنصة
 */
export const PlatformRouteGuard = ({ children }: PlatformRouteGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useFastAuth();
  
  // فحص إذا كان هناك عميل متجر مسجل دخول
  const customerSessionKey = 'customer_session';
  const customerSession = typeof window !== 'undefined' ? localStorage.getItem(customerSessionKey) : null;
  
  const currentPath = location.pathname;
  const isPlatformPath = currentPath.startsWith('/admin') || 
                        currentPath.startsWith('/affiliate') || 
                        currentPath.startsWith('/merchant') ||
                        currentPath === '/dashboard' ||
                        (currentPath === '/auth' && !currentPath.includes('/store/'));

  useEffect(() => {
    // إذا كان هناك جلسة عميل متجر ويحاول دخول صفحات المنصة
    if (customerSession && isPlatformPath) {
      // إذا كان مستخدم المنصة مصادقًا، نسمح بالدخول ونزيل تعارض جلسة المتجر
      if (isAuthenticated && profile) {
        try {
          localStorage.removeItem(customerSessionKey);
        } catch {}
        return;
      }
      // غير مصادق كمستخدم منصة → ارجاع للصفحة الرئيسية
      navigate('/', { replace: true });
      return;
    }
  }, [customerSession, isPlatformPath, isAuthenticated, profile, navigate]);

  return <>{children}</>;
};

export default PlatformRouteGuard;