import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { isSessionValid } from '@/utils/sessionCleanup';

interface StoreRouteGuardProps {
  children: ReactNode;
}

/**
 * يوجه مستخدمي المنصة لصفحاتهم المناسبة عند محاولة دخول المتجر
 * مع السماح لعملاء المتجر بالوصول لصفحات المتجر
 */
export const StoreRouteGuard = ({ children }: StoreRouteGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated: isPlatformAuth, profile } = useFastAuth();
  
  const currentPath = location.pathname;
  const isStorePath = currentPath.startsWith('/store/');
  
  useEffect(() => {
    // فقط إذا مستخدم منصة مصادق يحاول دخول المتجر
    if (isPlatformAuth && profile && isStorePath) {
      // التحقق من وجود جلسة عميل متجر صالحة
      const hasValidCustomerSession = isSessionValid('customer_session');
      
      // إذا لم يكن هناك جلسة عميل متجر صالحة، وجه لصفحة المنصة
      if (!hasValidCustomerSession) {
        const redirectMap: { [key: string]: string } = {
          admin: '/admin/dashboard',
          moderator: '/admin/dashboard',
          affiliate: '/affiliate',
          merchant: '/affiliate',
        };

        const redirectPath = redirectMap[profile.role] || '/';
        navigate(redirectPath, { replace: true });
        return;
      }
    }
  }, [isPlatformAuth, profile, isStorePath, navigate]);

  return <>{children}</>;
};

export default StoreRouteGuard;