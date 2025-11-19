import {
  Home,
  Store,
  Wallet,
  ShoppingCart,
  BarChart3,
  Settings,
  Package,
  CreditCard,
  Tag,
  TrendingUp,
  ExternalLink,
  Search
} from 'lucide-react';

export const affiliateNavigationSections = [
  {
    id: 'main',
    title: 'الرئيسية',
    icon: <Home className="h-4 w-4" />,
    items: [
      {
        id: 'dashboard',
        title: 'لوحة التحكم',
        href: '/affiliate',
        icon: Home,
      },
    ],
  },
  {
    id: 'store',
    title: 'المتجر',
    icon: <Store className="h-4 w-4" />,
    color: '221 83% 53%',
    items: [
      {
        id: 'storefront',
        title: 'واجهة المتجر',
        href: '/affiliate/storefront',
        icon: Store,
        color: '221 83% 53%',
      },
      {
        id: 'products-browser',
        title: 'تصفح المنتجات',
        href: '/products',
        icon: Search,
        color: '221 83% 53%',
      },
      {
        id: 'store-settings',
        title: 'إعدادات المتجر',
        href: '/affiliate/store/settings',
        icon: Settings,
        color: '221 83% 53%',
      },
      {
        id: 'coupons',
        title: 'الكوبونات والعروض',
        href: '/affiliate/store/settings?tab=coupons',
        icon: Tag,
        color: '221 83% 53%',
      },
      {
        id: 'store-setup',
        title: 'إعداد المتجر',
        href: '/affiliate/store/setup',
        icon: Package,
        color: '221 83% 53%',
      },
    ],
  },
  {
    id: 'orders',
    title: 'الطلبات',
    icon: <ShoppingCart className="h-4 w-4" />,
    color: '262 83% 58%',
    items: [
      {
        id: 'orders-list',
        title: 'قائمة الطلبات',
        href: '/affiliate/orders',
        icon: ShoppingCart,
        color: '262 83% 58%',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'التحليلات والأداء',
    icon: <BarChart3 className="h-4 w-4" />,
    color: '24 95% 53%',
    items: [
      {
        id: 'analytics-commissions',
        title: 'تحليلات العمولات',
        href: '/affiliate/analytics',
        icon: BarChart3,
        color: '24 95% 53%',
      },
      {
        id: 'performance',
        title: 'الأداء والإحصائيات',
        href: '/affiliate',
        icon: TrendingUp,
        color: '24 95% 53%',
      },
    ],
  },
  {
    id: 'wallet',
    title: 'المحفظة',
    icon: <Wallet className="h-4 w-4" />,
    color: '142 76% 36%',
    items: [
      {
        id: 'wallet-overview',
        title: 'نظرة عامة',
        href: '/affiliate/wallet',
        icon: Wallet,
        color: '142 76% 36%',
      },
    ],
  },
  {
    id: 'subscription',
    title: 'الاشتراك',
    icon: <CreditCard className="h-4 w-4" />,
    color: '271 91% 65%',
    items: [
      {
        id: 'subscription-manage',
        title: 'اشتراك المنصة',
        href: '/affiliate/subscription',
        icon: CreditCard,
        color: '271 91% 65%',
      },
    ],
  },
];