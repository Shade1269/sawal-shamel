import {
  Home,
  Store,
  ShoppingBag,
  LineChart,
  Wallet,
  Settings,
  CreditCard,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/unified/UnifiedSidebar';
import type { MobileNavItem } from '@/components/layout/unified/UnifiedMobileNav';

/**
 * Affiliate Navigation Configuration
 */

export const affiliateSidebarSections: SidebarSection[] = [
  {
    id: 'main',
    label: 'الرئيسية',
    items: [
      {
        id: 'home',
        label: 'لوحة التحكم',
        icon: Home,
        href: '/affiliate',
      },
      {
        id: 'storefront',
        label: 'متجري',
        icon: Store,
        href: '/affiliate/storefront',
      },
    ],
    color: 'primary',
  },
  {
    id: 'business',
    label: 'الأعمال',
    items: [
      {
        id: 'orders',
        label: 'الطلبات',
        icon: ShoppingBag,
        href: '/affiliate/orders',
        badge: '3',
      },
      {
        id: 'analytics',
        label: 'التحليلات',
        icon: LineChart,
        href: '/affiliate/analytics',
      },
      {
        id: 'wallet',
        label: 'المحفظة',
        icon: Wallet,
        href: '/affiliate/wallet',
      },
    ],
    color: 'success',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    items: [
      {
        id: 'store-settings',
        label: 'إعدادات المتجر',
        icon: Settings,
        href: '/affiliate/store/settings',
      },
      {
        id: 'subscription',
        label: 'الاشتراك',
        icon: CreditCard,
        href: '/affiliate/subscription',
      },
    ],
    color: 'accent',
  },
];

export const affiliateMobileNavItems: MobileNavItem[] = [
  {
    id: 'home',
    label: 'الرئيسية',
    icon: Home,
    href: '/affiliate',
  },
  {
    id: 'store',
    label: 'المتجر',
    icon: Store,
    href: '/affiliate/storefront',
  },
  {
    id: 'orders',
    label: 'الطلبات',
    icon: ShoppingBag,
    href: '/affiliate/orders',
    badge: '3',
  },
  {
    id: 'analytics',
    label: 'التحليلات',
    icon: LineChart,
    href: '/affiliate/analytics',
  },
  {
    id: 'wallet',
    label: 'المحفظة',
    icon: Wallet,
    href: '/affiliate/wallet',
  },
];

// Backward compatibility converter function
function convertToLegacyFormat(sections: SidebarSection[]): any[] {
  return sections.map(section => ({
    id: section.id,
    title: section.label,
    color: section.color,
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
export const affiliateNavigationSections = convertToLegacyFormat(affiliateSidebarSections);
