import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

/**
 * 📱 شريط التنقل السفلي للموبايل
 *
 * يظهر فقط على الشاشات الصغيرة (أقل من md: 768px)
 * يوفر وصول سريع للصفحات الرئيسية
 */

interface BottomNavProps {
  storeSlug?: string;
  cartCount?: number;
  wishlistCount?: number;
}

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  labelEn: string;
  path: string;
  badge?: number;
  color?: string;
}

export function BottomNav({ storeSlug, cartCount = 0, wishlistCount = 0 }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { direction, language } = useLanguage();

  // تحديد عناصر التنقل
  const navItems: NavItem[] = [
    {
      id: 'home',
      icon: Home,
      label: 'الرئيسية',
      labelEn: 'Home',
      path: storeSlug ? `/${storeSlug}` : '/',
      color: 'text-primary',
    },
    {
      id: 'search',
      icon: Search,
      label: 'بحث',
      labelEn: 'Search',
      path: storeSlug ? `/${storeSlug}` : '/search',
      color: 'text-blue-500',
    },
    {
      id: 'wishlist',
      icon: Heart,
      label: 'المفضلة',
      labelEn: 'Wishlist',
      path: storeSlug ? `/${storeSlug}` : '/wishlist',
      badge: wishlistCount,
      color: 'text-rose-500',
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      label: 'السلة',
      labelEn: 'Cart',
      path: storeSlug ? `/${storeSlug}/cart` : '/cart',
      badge: cartCount,
      color: 'text-green-500',
    },
    {
      id: 'profile',
      icon: User,
      label: 'حسابي',
      labelEn: 'Account',
      path: storeSlug ? `/${storeSlug}/orders` : '/profile',
      color: 'text-purple-500',
    },
  ];

  /**
   * التحقق من تفعيل العنصر
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  /**
   * التنقل لصفحة
   */
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Spacer لمنع المحتوى من الاختفاء تحت الشريط */}
      <div className="h-16 md:hidden" />

      {/* شريط التنقل السفلي */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background/95 backdrop-blur-md border-t border-border',
          'md:hidden', // يخفى على الشاشات الكبيرة
          'safe-area-bottom' // دعم safe area للأجهزة الحديثة
        )}
      >
        <div className="grid grid-cols-5 gap-1 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const label = language === 'ar' ? item.label : item.labelEn;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1',
                  'transition-colors duration-200',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                whileTap={{ scale: 0.95 }}
              >
                {/* الأيقونة */}
                <div className="relative">
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      active && item.color
                    )}
                  />

                  {/* Badge للسلة والمفضلة */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      className={cn(
                        'absolute -top-2 -right-2',
                        'h-4 min-w-4 px-1',
                        'text-[10px] leading-none',
                        'flex items-center justify-center',
                        'bg-primary text-primary-foreground'
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>

                {/* التسمية */}
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    active && 'font-semibold'
                  )}
                >
                  {label}
                </span>

                {/* مؤشر التفعيل */}
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
