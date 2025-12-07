import {
  Home,
  Package,
  ShoppingBag,
  Wallet,
  Settings,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/unified/UnifiedSidebar';
import type { MobileNavItem } from '@/components/layout/unified/UnifiedMobileNav';

/**
 * Merchant Navigation Configuration
 */

export const merchantSidebarSections: SidebarSection[] = [
  {
    id: 'main',
    label: 'الرئيسية',
    items: [
      {
        id: 'dashboard',
        label: 'لوحة التحكم',
        icon: Home,
        href: '/merchant',
      },
    ],
    color: 'primary',
  },
  {
    id: 'business',
    label: 'الأعمال',
    items: [
      {
        id: 'products',
        label: 'المنتجات',
        icon: Package,
        href: '/merchant/products',
      },
      {
        id: 'orders',
        label: 'الطلبات',
        icon: ShoppingBag,
        href: '/merchant/orders',
        badge: '5',
      },
      {
        id: 'wallet',
        label: 'المحفظة',
        icon: Wallet,
        href: '/merchant/wallet',
      },
    ],
    color: 'success',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    items: [
      {
        id: 'settings',
        label: 'إعدادات الحساب',
        icon: Settings,
        href: '/merchant/settings',
      },
    ],
    color: 'accent',
  },
];

export const merchantMobileNavItems: MobileNavItem[] = [
  {
    id: 'dashboard',
    label: 'الرئيسية',
    icon: Home,
    href: '/merchant',
  },
  {
    id: 'products',
    label: 'المنتجات',
    icon: Package,
    href: '/merchant/products',
  },
  {
    id: 'orders',
    label: 'الطلبات',
    icon: ShoppingBag,
    href: '/merchant/orders',
    badge: '5',
  },
  {
    id: 'wallet',
    label: 'المحفظة',
    icon: Wallet,
    href: '/merchant/wallet',
  },
];

interface LegacyNavChild {
  id: string;
  title: string;
  icon: typeof Home;
  href: string;
  badge?: string;
}

interface LegacyNavItem {
  id: string;
  title: string;
  icon: typeof Home;
  href: string;
  badge?: string;
  children?: LegacyNavChild[];
}

interface LegacyNavSection {
  id: string;
  title: string;
  color: string;
  items: LegacyNavItem[];
}

// Backward compatibility converter function
function convertToLegacyFormat(sections: SidebarSection[]): LegacyNavSection[] {
  return sections.map(section => ({
    id: section.id,
    title: section.label,
    color: section.color || 'primary',
    items: section.items.map(item => ({
      id: item.id,
      title: item.label,
      icon: item.icon,
      href: item.href,
      badge: item.badge,
      children: item.children?.map(child => ({
        id: child.id,
        title: child.label,
        icon: child.icon,
        href: child.href,
        badge: child.badge,
      })),
    })),
  }));
}

// Export with old name using converter
export const merchantNavigationSections = convertToLegacyFormat(merchantSidebarSections);
