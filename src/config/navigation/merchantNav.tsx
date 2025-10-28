import {
  Home,
  Package,
  ShoppingCart,
  Wallet
} from 'lucide-react';

export const merchantNavigationSections = [
  {
    id: 'main',
    title: 'الرئيسية',
    icon: <Home className="h-4 w-4" />,
    items: [
      {
        id: 'dashboard',
        title: 'لوحة التحكم',
        href: '/merchant',
        icon: Home,
      },
    ],
  },
  {
    id: 'products',
    title: 'المنتجات',
    icon: <Package className="h-4 w-4" />,
    color: '221 83% 53%',
    items: [
      {
        id: 'products-list',
        title: 'إدارة المنتجات',
        href: '/merchant/products',
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
        href: '/merchant/orders',
        icon: ShoppingCart,
        color: '262 83% 58%',
      },
    ],
  },
  {
    id: 'wallet',
    title: 'المحفظة المالية',
    icon: <Wallet className="h-4 w-4" />,
    color: '142 76% 36%',
    items: [
      {
        id: 'wallet-overview',
        title: 'المحفظة',
        href: '/merchant/wallet',
        icon: Wallet,
        color: '142 76% 36%',
      },
    ],
  },
];