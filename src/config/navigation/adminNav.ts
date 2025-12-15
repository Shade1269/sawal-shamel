import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Users,
  Package,
  Truck,
  DollarSign,
  Settings,
  FileText,
  Trophy,
  Brain,
  Activity,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/unified/UnifiedSidebar';
import type { MobileNavItem } from '@/components/layout/unified/UnifiedMobileNav';

/**
 * Admin Navigation Configuration
 */

export const adminSidebarSections: SidebarSection[] = [
  {
    id: 'main',
    label: 'الرئيسية',
    items: [
      {
        id: 'dashboard',
        label: 'لوحة التحكم',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
      },
      {
        id: 'orders',
        label: 'الطلبات',
        icon: ShoppingBag,
        href: '/admin/orders',
        badge: '12',
      },
      {
        id: 'analytics',
        label: 'التحليلات',
        icon: BarChart3,
        href: '/admin/analytics',
      },
    ],
    color: 'primary',
  },
  {
    id: 'project-brain',
    label: 'عقل المشروع',
    items: [
      {
        id: 'brain-dashboard',
        label: 'لوحة العقل',
        icon: Brain,
        href: '/admin/project-brain',
      },
      {
        id: 'project-health',
        label: 'صحة المشروع',
        icon: Activity,
        href: '/admin/project-health',
      },
    ],
    color: 'accent',
  },
  {
    id: 'users',
    label: 'المستخدمون',
    items: [
      {
        id: 'customers',
        label: 'العملاء',
        icon: Users,
        href: '/admin/customers',
      },
      {
        id: 'leaderboard',
        label: 'لوحة الشرف',
        icon: Trophy,
        href: '/admin/leaderboard',
      },
    ],
    color: 'success',
  },
  {
    id: 'inventory',
    label: 'المخزون',
    items: [
      {
        id: 'products',
        label: 'المنتجات',
        icon: Package,
        href: '/admin/inventory',
      },
      {
        id: 'shipping',
        label: 'الشحن',
        icon: Truck,
        href: '/admin/shipping',
      },
      {
        id: 'returns',
        label: 'المرتجعات',
        icon: FileText,
        href: '/admin/returns',
        badge: '5',
      },
    ],
    color: 'warning',
  },
  {
    id: 'finance',
    label: 'المالية',
    items: [
      {
        id: 'withdrawals',
        label: 'السحوبات',
        icon: DollarSign,
        href: '/admin/withdrawals',
        badge: '8',
      },
      {
        id: 'merchant-withdrawals',
        label: 'سحوبات التجار',
        icon: DollarSign,
        href: '/admin/merchant-withdrawals',
      },
      {
        id: 'platform-revenue',
        label: 'إيرادات المنصة',
        icon: BarChart3,
        href: '/admin/platform-revenue',
      },
    ],
    color: 'accent',
  },
  {
    id: 'settings',
    label: 'الإدارة',
    items: [
      {
        id: 'management',
        label: 'إدارة النظام',
        icon: Settings,
        href: '/admin/management',
      },
    ],
    color: 'accent',
  },
];

export const adminMobileNavItems: MobileNavItem[] = [
  {
    id: 'dashboard',
    label: 'الرئيسية',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    id: 'orders',
    label: 'الطلبات',
    icon: ShoppingBag,
    href: '/admin/orders',
    badge: '12',
  },
  {
    id: 'analytics',
    label: 'التحليلات',
    icon: BarChart3,
    href: '/admin/analytics',
  },
  {
    id: 'customers',
    label: 'العملاء',
    icon: Users,
    href: '/admin/customers',
  },
  {
    id: 'settings',
    label: 'الإدارة',
    icon: Settings,
    href: '/admin/management',
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
export const adminNavigationSections = convertToLegacyFormat(adminSidebarSections);
