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
                          currentPath.startsWith('/affiliate');
  
  // الصفحات العامة المسموحة للجميع
  const isPublicPath = currentPath === '/' ||
                      currentPath === '/auth' ||
                      currentPath === '/auth/reset' ||
                      currentPath === '/auth/callback';

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
        // إذا كانت بيانات الجلسة فاسدة، حاول حذفها بأمان
        try {
          if (typeof window !== 'undefined') {
            window.localStorage?.removeItem('customer_session');
          }
        } catch {
          // ignore storage errors (Safari Private Mode)
        }
        setHasValidCustomerSession(false);
      }
    };

    checkCustomerSession();
  }, [currentPath]);

  useEffect(() => {
    // فقط إذا كان المستخدم يحاول الدخول للصفحات المحمية
    // وليس لديه حساب منصة مصادق
    if (isRestrictedPath && hasValidCustomerSession && !isAuthenticated) {
      // عميل متجر يحاول دخول صفحات المنصة المحمية → ارجاع للصفحة الرئيسية
      navigate('/', { replace: true });
      return;
    }
    
    // إذا كان مستخدم المنصة مصادقًا ويحاول دخول صفحة محمية
    // أزل أي تعارض مع جلسة متجر قديمة
    if (isRestrictedPath && isAuthenticated && profile && hasValidCustomerSession) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage?.removeItem('customer_session');
        }
        setHasValidCustomerSession(false);
      } catch (error) {
        console.warn('Could not remove customer session:', error);
      }
    }
  }, [hasValidCustomerSession, isRestrictedPath, isAuthenticated, profile, navigate]);

  return <>{children}</>;
};

export default PlatformRouteGuard;