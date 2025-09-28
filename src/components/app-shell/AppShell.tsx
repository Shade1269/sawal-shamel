import React from 'react';
import {
  BarChart3,
  CreditCard,
  Bell,
  GaugeCircle,
  Home,
  LayoutDashboard,
  LineChart,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trophy,
  UserCircle,
} from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import type { FastUserProfile } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import type { UserActivity, UserShop } from '@/hooks/useUnifiedUserData';
import { SkipToContent } from './SkipToContent';
import { Header } from './Header';
import { SidebarDesktop, type SidebarNavGroup } from './SidebarDesktop';
import { BottomNavMobile, type BottomNavItem } from './BottomNavMobile';
import { PageTitle } from './PageTitle';
import { Modal } from '@/ui/Modal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import useInbox from '@/hooks/useInbox';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export type ShellRole = 'admin' | 'affiliate' | 'marketer' | 'guest';

export interface AppShellProps {
  children: React.ReactNode;
  pageActions?: React.ReactNode;
  roleOverride?: ShellRole;
  fastAuthOverride?: {
    profile?: Partial<FastUserProfile> | null;
    user?: { email?: string | null } | null;
    signOut?: () => void | Promise<void>;
  };
  userDataOverride?: {
    userShop?: Partial<UserShop> | null;
    userActivities?: UserActivity[] | null;
    userStatistics?: Record<string, number> | null;
  };
  inboxOverride?: {
    unreadCount?: number;
  };
}

const createPrefetchers = () => {
  const map = new Map<string, () => void>();
  const register = (key: string, loader: () => Promise<unknown>) => {
    let loaded = false;
    map.set(key, () => {
      if (loaded) return;
      loaded = true;
      void loader();
    });
  };

  register('/', () => import('@/pages/Index'));
  register('/profile', () => import('@/pages/profile'));
  register('/notifications', () => import('@/pages/notifications'));
  register('/storefront', () => import('@/pages/AffiliateStoreFront'));
  register('public-store', () => import('@/pages/PublicStorefront'));
  register('/affiliate', () => import('@/pages/home/MarketerHome'));
  register('/affiliate/orders', () => import('@/pages/unified/UnifiedOrdersPage'));
  register('/affiliate/analytics', () => import('@/pages/affiliate/AffiliateCommissionsPage'));
  register('/admin/dashboard', () => import('@/pages/home/AdminHome'));
  register('/admin/orders', () => import('@/pages/admin/AdminOrders'));
  register('/admin/analytics', () => import('@/pages/admin/AdminAnalytics'));
  register('/admin/customers', () => import('@/pages/admin/AdminCustomers'));
  register('/checkout', () => import('@/pages/CheckoutPage'));

  return map;
};

export const AppShell: React.FC<AppShellProps> = ({
  children,
  pageActions,
  roleOverride,
  fastAuthOverride,
  userDataOverride,
  inboxOverride,
}) => {
  const fastAuth = fastAuthOverride
    ? {
        profile: fastAuthOverride.profile ?? null,
        user: fastAuthOverride.user ?? null,
        signOut: fastAuthOverride.signOut ?? (() => {}),
      }
    : useFastAuth();

  const userData = userDataOverride
    ? {
        userShop: userDataOverride.userShop ?? null,
        userActivities: userDataOverride.userActivities ?? [],
        userStatistics: userDataOverride.userStatistics ?? {},
      }
    : useUserDataContext();

  const profile = fastAuth.profile;
  const user = fastAuth.user;
  const signOut = fastAuth.signOut;
  const userShop = userData.userShop;
  const userActivities = userData.userActivities;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const prefetchersRef = React.useRef<Map<string, () => void>>();
  const reduceMotion = usePrefersReducedMotion();
  const inbox = useInbox({ namespace: profile?.id ?? profile?.auth_user_id ?? 'guest' });
  const { isOnline } = useNetworkStatus();

  if (!prefetchersRef.current) {
    prefetchersRef.current = createPrefetchers();
  }

  const role: ShellRole = (roleOverride ?? (profile?.role as ShellRole) ?? 'guest');
  const notificationsCount = inboxOverride?.unreadCount ?? inbox.unreadCount ?? (userActivities?.length ?? 0);
  const ordersCount = userShop?.total_orders ?? 0;
  const inventoryCount = userShop?.total_products ?? 0;
  const storeSlug = userShop?.slug;

  const getPrefetch = React.useCallback(
    (key: string) => prefetchersRef.current?.get(key) ?? (() => {}),
    []
  );

  const adminGroups: SidebarNavGroup[] = React.useMemo(() => {
    return [
      {
        id: 'overview',
        title: 'نظرة عامة',
        items: [
          {
            to: '/admin/dashboard',
            label: 'لوحة القيادة',
            description: 'مؤشرات الأداء الحية',
            icon: LayoutDashboard,
            badge: notificationsCount > 9 ? 9 : notificationsCount,
            onPrefetch: getPrefetch('/admin/dashboard'),
          },
          {
            to: '/admin/analytics',
            label: 'تحليلات متقدمة',
            description: 'تقارير النمو والمبيعات',
            icon: LineChart,
            onPrefetch: getPrefetch('/admin/analytics'),
          },
        ],
      },
      {
        id: 'orders',
        title: 'الطلبات',
        items: [
          {
            to: '/admin/orders',
            label: 'إدارة الطلبات',
            description: 'المعالجة والمتابعة اليومية',
            icon: ShoppingBag,
            badge: ordersCount > 9 ? 9 : ordersCount,
            onPrefetch: getPrefetch('/admin/orders'),
          },
        ],
      },
      {
        id: 'inventory',
        title: 'المخزون والمنتجات',
        items: [
          {
            to: '/admin/inventory',
            label: 'مراقبة المخزون',
            description: 'تتبع التوفر والمستودعات',
            icon: Package,
            badge: inventoryCount > 9 ? 9 : inventoryCount,
            onPrefetch: getPrefetch('/admin/inventory'),
          },
        ],
      },
      {
        id: 'payments',
        title: 'المدفوعات',
        items: [
          {
            to: '/admin/analytics',
            label: 'تسوية المدفوعات',
            description: 'سجلات الإيرادات اليومية',
            icon: CreditCard,
            isActive: (pathname) => pathname.startsWith('/admin/analytics'),
            onPrefetch: getPrefetch('/admin/analytics'),
          },
        ],
      },
      {
        id: 'settings',
        title: 'الإعدادات',
        items: [
          {
            to: '/profile',
            label: 'حساب الإدارة',
            description: 'إعدادات المستخدم الشخصية',
            icon: Settings,
            onPrefetch: getPrefetch('/profile'),
          },
          {
            to: '/notifications',
            label: 'الإشعارات والنشاط',
            description: 'تابع التنبيهات والزمنية الخاصة بالفريق',
            icon: Bell,
            onPrefetch: getPrefetch('/notifications'),
          },
        ],
      },
    ];
  }, [getPrefetch, inventoryCount, notificationsCount, ordersCount]);

  const affiliateGroups: SidebarNavGroup[] = React.useMemo(() => {
    return [
      {
        id: 'overview',
        title: 'نظرة عامة',
        items: [
          {
            to: '/affiliate',
            label: 'لوحة الأداء',
            description: 'ملخص العمولات والنشاط',
            icon: GaugeCircle,
            onPrefetch: getPrefetch('/affiliate'),
          },
          {
            to: '/affiliate/analytics',
            label: 'التحليلات',
            description: 'إحصائيات دقيقة ومقارنات',
            icon: BarChart3,
            onPrefetch: getPrefetch('/affiliate/analytics'),
          },
        ],
      },
      {
        id: 'orders',
        title: 'الطلبات والمتابعات',
        items: [
          {
            to: '/affiliate/orders',
            label: 'طلبات العملاء',
            description: 'متابعة التحويلات الناجحة',
            icon: ShoppingCart,
            badge: ordersCount > 9 ? 9 : ordersCount,
            onPrefetch: getPrefetch('/affiliate/orders'),
          },
        ],
      },
      {
        id: 'inventory',
        title: 'المتجر والمنتجات',
        items: [
          {
            to: '/affiliate/store/setup',
            label: 'إعدادات المتجر',
            description: 'إنشاء وتخصيص متجرك الخاص',
            icon: Store,
            badge: inventoryCount > 9 ? 9 : inventoryCount,
            onPrefetch: getPrefetch('/affiliate/home'),
          },
        ],
      },
      {
        id: 'leaderboard',
        title: 'لوحة المتصدرين',
        items: [
          {
            to: '/affiliate/analytics#leaderboard',
            label: 'الترتيب الشهري',
            description: 'قارن أداءك مع المسوقين',
            icon: Trophy,
            isActive: (pathname) => pathname.startsWith('/affiliate/analytics'),
            onPrefetch: getPrefetch('/affiliate/analytics'),
          },
        ],
      },
      {
        id: 'payments',
        title: 'المدفوعات',
        items: [
          {
            to: '/affiliate/analytics#payouts',
            label: 'عمولات مستحقة',
            description: 'تتبع المدفوعات والتسويات',
            icon: LineChart,
            isActive: (pathname) => pathname.startsWith('/affiliate/analytics'),
            onPrefetch: getPrefetch('/affiliate/analytics'),
          },
        ],
      },
      {
        id: 'settings',
        title: 'الإعدادات',
        items: [
          {
            to: '/profile',
            label: 'الملف الشخصي',
            description: 'إدارة بيانات الحساب',
            icon: Settings,
            onPrefetch: getPrefetch('/profile'),
          },
          {
            to: '/notifications',
            label: 'مركز الإشعارات',
            description: 'تنبيهات الأداء وتاريخ النشاط',
            icon: Bell,
            onPrefetch: getPrefetch('/notifications'),
          },
        ],
      },
    ];
  }, [getPrefetch, inventoryCount, ordersCount]);

  const sidebarGroups = React.useMemo<SidebarNavGroup[]>(() => {
    if (role === 'admin') return adminGroups;
    if (role === 'affiliate' || role === 'marketer') return affiliateGroups;
    return [
      {
        id: 'public',
        title: 'التنقل العام',
        items: [
          {
            to: '/',
            label: 'الرئيسية',
            description: 'اكتشف منصة أناقتي',
            icon: Home,
            onPrefetch: getPrefetch('/'),
          },
          {
            to: '/checkout',
            label: 'الدفع',
            description: 'إتمام الطلبات العامة',
            icon: CreditCard,
            onPrefetch: getPrefetch('/checkout'),
          },
        ],
      },
    ];
  }, [adminGroups, affiliateGroups, getPrefetch, role]);

  const bottomNavItems = React.useMemo<BottomNavItem[]>(() => {
    const items: BottomNavItem[] = [
      {
        to: '/',
        label: 'الرئيسية',
        icon: Home,
        onPrefetch: getPrefetch('/'),
      },
    ];

    if (storeSlug) {
      items.push({
        to: `/${storeSlug}`,
        label: 'متجري',
        icon: Store,
        onPrefetch: getPrefetch('public-store'),
      });
    }

    if (role === 'affiliate' || role === 'marketer') {
      items.push({
        to: '/affiliate',
        label: 'المسوق',
        icon: GaugeCircle,
        onPrefetch: getPrefetch('/affiliate'),
      });
    }

    if (role === 'admin') {
      items.push({
        to: '/admin/dashboard',
        label: 'الإدارة',
        icon: LayoutDashboard,
        onPrefetch: getPrefetch('/admin/dashboard'),
      });
    }

    items.push({
      to: '/notifications',
      label: 'الإشعارات',
      icon: Bell,
      badge: notificationsCount > 9 ? 9 : notificationsCount,
      onPrefetch: getPrefetch('/notifications'),
    });

    items.push({
      to: '/profile',
      label: 'حسابي',
      icon: UserCircle,
      onPrefetch: getPrefetch('/profile'),
    });

    return items;
  }, [getPrefetch, notificationsCount, role, storeSlug]);

  const direction = typeof document !== 'undefined' ? document.documentElement.dir || 'rtl' : 'rtl';
  const motionClass = reduceMotion ? 'transition-none' : 'transition-all duration-300';

  return (
    <div
      dir={direction}
      className="relative min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)]"
      data-component="app-shell"
    >
      <SkipToContent />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarDesktop groups={sidebarGroups} />

        <div className="flex min-h-screen w-full flex-1 flex-col bg-gradient-to-br from-[color:var(--glass-bg)]/20 via-transparent to-[color:var(--glass-bg-strong, var(--surface-2))]/10 px-4 pb-24 pt-4 md:px-6 lg:pb-8">
          <Header
            notificationsCount={notificationsCount}
            onToggleSidebar={() => setDrawerOpen(true)}
            userName={profile?.full_name || user?.email || 'ضيف'}
            userEmail={profile?.email || user?.email || undefined}
            userRole={role === 'admin' ? 'مدير النظام' : role === 'affiliate' || role === 'marketer' ? 'مسوق' : 'زائر'}
            onSignOut={() => { signOut(); }}
            isOffline={!isOnline}
          />

          <main
            id="content"
            tabIndex={-1}
            className={`mt-4 flex-1 focus:outline-none ${motionClass}`}
          >
            <PageTitle actions={pageActions} />
            <section className="space-y-6 pb-12">
              {children}
            </section>
          </main>
        </div>
      </div>

      <BottomNavMobile items={bottomNavItems} />

      <Modal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="h-full max-h-full w-full max-w-xs translate-x-0 overflow-y-auto rounded-none border-0 bg-[color:var(--glass-bg)]/95 px-0 py-6 text-[color:var(--glass-fg)] shadow-[var(--shadow-glass-strong)] backdrop-blur-2xl lg:hidden"
        closeOnOverlay
        showCloseButton
        size="lg"
      >
        <SidebarDesktop
          groups={sidebarGroups}
          onClose={() => setDrawerOpen(false)}
          className="!flex h-full min-w-full max-w-full border-none bg-transparent px-4"
        />
      </Modal>
    </div>
  );
};

AppShell.displayName = 'AppShell';

export default AppShell;
