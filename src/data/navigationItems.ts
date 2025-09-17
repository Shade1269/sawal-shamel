import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  ShoppingBag,
  MessageSquare,
  Bell,
  CreditCard,
  Truck,
  FileText,
  Shield,
  UserCheck,
  TrendingUp,
  Calendar,
  Database,
  Globe,
  Zap,
  HeartHandshake,
  Smartphone
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ElementType;
  badge?: number;
  description?: string;
  keywords?: string[];
  roles?: string[];
  isVisible?: boolean;
  isActive?: boolean;
  children?: NavigationItem[];
  group?: string;
  order?: number;
}

export const navigationItems: NavigationItem[] = [
  // Main Navigation
  {
    id: 'home',
    title: 'الرئيسية',
    href: '/',
    icon: Home,
    description: 'الصفحة الرئيسية للمنصة',
    keywords: ['رئيسية', 'بداية', 'home'],
    group: 'main',
    order: 1
  },
  {
    id: 'components',
    title: 'المكونات',
    href: '/components',
    icon: Package,
    description: 'مكونات النظام المحسّنة',
    keywords: ['مكونات', 'components'],
    group: 'main',
    order: 2
  },
  {
    id: 'adaptive',
    title: 'التكيفي',
    href: '/adaptive',
    icon: Zap,
    description: 'النظام التكيفي المتقدم',
    keywords: ['تكيفي', 'adaptive'],
    group: 'main',
    order: 3
  },
  {
    id: 'unified',
    title: 'النظام الموحد',
    href: '/unified',
    icon: Globe,
    description: 'النظام الموحد المتكامل',
    keywords: ['موحد', 'unified'],
    group: 'main',
    order: 4
  },
  {
    id: 'mobile-test',
    title: 'اختبار الجوال',
    href: '/mobile-test',
    icon: Smartphone,
    description: 'اختبار نظام التنقل للجوال',
    keywords: ['جوال', 'اختبار', 'mobile'],
    group: 'main',
    order: 5
  },
  {
    id: 'dashboard',
    title: 'لوحة التحكم',
    href: '/dashboard',
    icon: BarChart3,
    description: 'إحصائيات ومراقبة الأداء',
    keywords: ['لوحة', 'تحكم', 'إحصائيات', 'dashboard'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'main',
    order: 2
  },
  
  // E-commerce
  {
    id: 'products',
    title: 'المنتجات',
    href: '/products',
    icon: Package,
    description: 'إدارة المنتجات والكتالوج',
    keywords: ['منتجات', 'كتالوج', 'products'],
    roles: ['admin', 'merchant'],
    group: 'ecommerce',
    order: 1
  },
  {
    id: 'orders',
    title: 'الطلبات',
    href: '/orders',
    icon: ShoppingBag,
    description: 'إدارة ومتابعة الطلبات',
    keywords: ['طلبات', 'orders'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'ecommerce',
    order: 2
  },
  {
    id: 'inventory',
    title: 'المخزون',
    href: '/inventory',
    icon: Database,
    description: 'إدارة المخزون والكميات',
    keywords: ['مخزون', 'كميات', 'inventory'],
    roles: ['admin', 'merchant'],
    group: 'ecommerce',
    order: 3
  },
  
  // Affiliate Program
  {
    id: 'affiliates',
    title: 'الشركاء',
    href: '/affiliates',
    icon: Users,
    description: 'إدارة برنامج الشراكة',
    keywords: ['شركاء', 'أفلييت', 'affiliates'],
    roles: ['admin'],
    group: 'affiliate',
    order: 1
  },
  {
    id: 'commissions',
    title: 'العمولات',
    href: '/commissions',
    icon: CreditCard,
    description: 'تتبع العمولات والأرباح',
    keywords: ['عمولات', 'أرباح', 'commissions'],
    roles: ['affiliate', 'admin'],
    group: 'affiliate',
    order: 2
  },
  {
    id: 'referrals',
    title: 'الإحالات',
    href: '/referrals',
    icon: HeartHandshake,
    description: 'إدارة الإحالات والمكافآت',
    keywords: ['إحالات', 'مكافآت', 'referrals'],
    roles: ['affiliate', 'admin'],
    group: 'affiliate',
    order: 3
  },
  
  // Analytics & Reports
  {
    id: 'analytics',
    title: 'التحليلات',
    href: '/analytics',
    icon: TrendingUp,
    description: 'تحليلات مفصلة للأداء',
    keywords: ['تحليلات', 'تقارير', 'analytics'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'analytics',
    order: 1
  },
  {
    id: 'reports',
    title: 'التقارير',
    href: '/reports',
    icon: FileText,
    description: 'تقارير شاملة للمبيعات',
    keywords: ['تقارير', 'مبيعات', 'reports'],
    roles: ['admin', 'merchant'],
    group: 'analytics',
    order: 2
  },
  
  // Communication
  {
    id: 'messages',
    title: 'الرسائل',
    href: '/messages',
    icon: MessageSquare,
    description: 'نظام الرسائل والإشعارات',
    keywords: ['رسائل', 'تواصل', 'messages'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'communication',
    order: 1
  },
  {
    id: 'notifications',
    title: 'الإشعارات',
    href: '/notifications',
    icon: Bell,
    description: 'إدارة الإشعارات',
    keywords: ['إشعارات', 'تنبيهات', 'notifications'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'communication',
    order: 2
  },
  
  // Operations
  {
    id: 'shipping',
    title: 'الشحن',
    href: '/shipping',
    icon: Truck,
    description: 'إدارة الشحن والتوصيل',
    keywords: ['شحن', 'توصيل', 'shipping'],
    roles: ['admin', 'merchant'],
    group: 'operations',
    order: 1
  },
  {
    id: 'calendar',
    title: 'التقويم',
    href: '/calendar',
    icon: Calendar,
    description: 'جدولة المهام والمواعيد',
    keywords: ['تقويم', 'مواعيد', 'calendar'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'operations',
    order: 2
  },
  
  // Admin Only
  {
    id: 'users',
    title: 'المستخدمين',
    href: '/admin/users',
    icon: UserCheck,
    description: 'إدارة المستخدمين والصلاحيات',
    keywords: ['مستخدمين', 'صلاحيات', 'users'],
    roles: ['admin'],
    group: 'admin',
    order: 1
  },
  {
    id: 'security',
    title: 'الأمان',
    href: '/admin/security',
    icon: Shield,
    description: 'إعدادات الأمان والحماية',
    keywords: ['أمان', 'حماية', 'security'],
    roles: ['admin'],
    group: 'admin',
    order: 2
  },
  {
    id: 'system',
    title: 'النظام',
    href: '/admin/system',
    icon: Zap,
    description: 'إعدادات النظام العامة',
    keywords: ['نظام', 'إعدادات', 'system'],
    roles: ['admin'],
    group: 'admin',
    order: 3
  },
  
  // Public Pages
  {
    id: 'about',
    title: 'عن المنصة',
    href: '/about',
    icon: Globe,
    description: 'معلومات عن المنصة ورؤيتها',
    keywords: ['عن', 'معلومات', 'about'],
    group: 'public',
    order: 1
  },
  
  // Settings - Always at bottom
  {
    id: 'settings',
    title: 'الإعدادات',
    href: '/settings',
    icon: Settings,
    description: 'إعدادات الحساب والمنصة',
    keywords: ['إعدادات', 'حساب', 'settings'],
    roles: ['affiliate', 'admin', 'merchant'],
    group: 'settings',
    order: 1
  }
];

// Helper functions for navigation items
export const getNavigationItemById = (id: string): NavigationItem | undefined => {
  return navigationItems.find(item => item.id === id);
};

export const getNavigationItemsByGroup = (group: string): NavigationItem[] => {
  return navigationItems.filter(item => item.group === group).sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getNavigationItemsByRole = (role: string): NavigationItem[] => {
  return navigationItems.filter(item => !item.roles || item.roles.includes(role));
};

export const searchNavigationItems = (query: string): NavigationItem[] => {
  const searchTerms = query.toLowerCase().split(' ');
  
  return navigationItems.filter(item => {
    const searchableText = [
      item.title,
      item.description,
      ...(item.keywords || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchTerms.every(term => searchableText.includes(term));
  });
};