import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';
import { useFastAuth } from '@/hooks/useFastAuth';

interface PlatformRouteGuardProps {
  children: ReactNode;
}

/**
 * يمنع عملاء المتجر النشطين من الوصول لصفحات المنصة
 * مع السماح للجميع بالوصول للصفحات العامة وتسجيل الدخول
 */
export const PlatformRouteGuard = ({ children }: PlatformRouteGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useFastAuth();
  const [hasValidCustomerSession, setHasValidCustomerSession] = useState(false);
  
  const currentPath = location.pathname;
  
  // الصفحات المحمية من عملاء المتجر (الصفحات الداخلية فقط)
  const isRestrictedPath = currentPath.startsWith('/admin') || 
                          currentPath.startsWith('/affiliate') || 
                          currentPath.startsWith('/merchant') ||
                          currentPath.startsWith('/dashboard');
  
  // الصفحات العامة المسموحة للجميع
  const isPublicPath = currentPath === '/' || 
                      currentPath === '/auth' || 
                      currentPath === '/login' || 
                      currentPath === '/signup' ||
                      currentPath === '/about' ||
                      currentPath === '/products' ||
                      currentPath === '/create-admin';

  useEffect(() => {
    // التحقق من وجود جلسة عميل متجر صالحة
    const checkCustomerSession = () => {
      try {
        const customerSessionKey = 'customer_session';
        const customerSession = localStorage.getItem(customerSessionKey);
        
        if (customerSession) {
          const sessionData = JSON.parse(customerSession);
          const currentTime = Date.now();
          const sessionExpiry = sessionData.expiresAt || 0;
          
          // إذا كانت الجلسة منتهية، احذفها
          if (currentTime > sessionExpiry) {
            localStorage.removeItem(customerSessionKey);
            setHasValidCustomerSession(false);
            return;
          }
          
          setHasValidCustomerSession(true);
        } else {
          setHasValidCustomerSession(false);
        }
      } catch (error) {
        // إذا كانت بيانات الجلسة فاسدة، احذفها
        localStorage.removeItem('customer_session');
        setHasValidCustomerSession(false);
      }
    };

    checkCustomerSession();
  }, [currentPath]);

  useEffect(() => {
    // فقط إذا كان المستخدم يحاول الدخول للصفحات المحمية
    if (isRestrictedPath && hasValidCustomerSession) {
      // إذا كان مستخدم المنصة مصادقًا، أزل تعارض جلسة المتجر
      if (isAuthenticated && profile) {
        try {
          localStorage.removeItem('customer_session');
          setHasValidCustomerSession(false);
        } catch (error) {
          console.warn('Could not remove customer session:', error);
        }
        return;
      }
      
      // عميل متجر يحاول دخول صفحات المنصة المحمية → ارجاع للصفحة الرئيسية
      navigate('/', { replace: true });
      return;
    }
  }, [hasValidCustomerSession, isRestrictedPath, isAuthenticated, profile, navigate]);

  return <>{children}</>;
};

export default PlatformRouteGuard;