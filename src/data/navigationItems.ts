import {
  BarChart3,
  Bell,
  Home,
  LogIn,
  Shield,
  ShoppingBag,
  Store,
  Trophy,
  User,
  Users,
  Settings,
  Wallet,
} from "lucide-react";

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
  {
    id: "home",
    title: "الصفحة الرئيسية",
    href: "/",
    icon: Home,
    description: "تعرف على منصة أتلانتس وتجربة الثيمات",
    keywords: ["home", "hero", "theme"],
    group: "public",
    order: 0,
  },
  {
    id: "auth",
    title: "تسجيل الدخول",
    href: "/auth",
    icon: LogIn,
    description: "الدخول إلى لوحة التحكم للمسوقين والمدراء",
    keywords: ["auth", "login", "signin"],
    group: "public",
    order: 1,
  },
  {
    id: "affiliate",
    title: "مركز المسوق",
    href: "/affiliate",
    icon: Store,
    description: "إدارة الأداء والمتجر للمسوقين",
    keywords: ["affiliate", "storefront", "orders"],
    roles: ["affiliate", "marketer", "admin"],
    group: "main",
    order: 2,
    children: [
      {
        id: "affiliate-home",
        title: "الرئيسية",
        href: "/affiliate",
        icon: Home,
        roles: ["affiliate", "marketer", "admin"],
      },
      {
        id: "affiliate-storefront",
        title: "واجهة المتجر",
        href: "/affiliate/storefront",
        icon: Store,
        roles: ["affiliate", "marketer", "admin"],
      },
      {
        id: "affiliate-store-settings",
        title: "إعدادات المتجر",
        href: "/affiliate/store/settings",
        icon: Settings,
        roles: ["affiliate", "marketer", "admin"],
      },
      {
        id: "affiliate-orders",
        title: "الطلبات",
        href: "/affiliate/orders",
        icon: ShoppingBag,
        roles: ["affiliate", "marketer", "admin"],
      },
      {
        id: "affiliate-analytics",
        title: "التحليلات",
        href: "/affiliate/analytics",
        icon: BarChart3,
        roles: ["affiliate", "marketer", "admin"],
      },
      {
        id: "affiliate-wallet",
        title: "المحفظة",
        href: "/affiliate/wallet",
        icon: Wallet,
        roles: ["affiliate", "marketer", "admin"],
      },
    ],
  },
  {
    id: "admin",
    title: "لوحة الإدارة",
    href: "/admin/dashboard",
    icon: Shield,
    description: "إدارة النظام والطلبات والمخزون",
    keywords: ["admin", "dashboard", "inventory"],
    roles: ["admin", "moderator"],
    group: "admin",
    order: 3,
    children: [
      {
        id: "admin-dashboard",
        title: "نظرة عامة",
        href: "/admin/dashboard",
        icon: BarChart3,
        roles: ["admin", "moderator"],
      },
      {
        id: "admin-orders",
        title: "الطلبات",
        href: "/admin/orders",
        icon: ShoppingBag,
        roles: ["admin", "moderator"],
      },
      {
        id: "admin-analytics",
        title: "التحليلات",
        href: "/admin/analytics",
        icon: Users,
        roles: ["admin", "moderator"],
      },
      {
        id: "admin-leaderboard",
        title: "لوحة الترتيب",
        href: "/admin/leaderboard",
        icon: Trophy,
        roles: ["admin", "moderator"],
      },
      {
        id: "admin-customers",
        title: "العملاء",
        href: "/admin/customers",
        icon: Users,
        roles: ["admin", "moderator"],
      },
    ],
  },
  {
    id: "profile",
    title: "حسابي",
    href: "/profile",
    icon: User,
    description: "إدارة بيانات الحساب والتفضيلات الشخصية",
    keywords: ["profile", "account", "settings"],
    roles: ["affiliate", "marketer", "admin"],
    group: "main",
    order: 4,
  },
  {
    id: "notifications",
    title: "مركز الإشعارات",
    href: "/notifications",
    icon: Bell,
    description: "عرض الإشعارات والزمنية لنشاط المتجر",
    keywords: ["notifications", "activity", "alerts"],
    roles: ["affiliate", "marketer", "admin"],
    group: "main",
    order: 5,
  },
  {
    id: "checkout",
    title: "إتمام الطلب",
    href: "/checkout",
    icon: ShoppingBag,
    description: "صفحة عامة لإكمال عملية الشراء",
    keywords: ["checkout", "payment"],
    group: "public",
    order: 6,
  },
  {
    id: "order-confirmation",
    title: "تأكيد الطلب",
    href: "/order/confirmation",
    icon: BarChart3,
    description: "ملخص الطلب بعد الإتمام",
    keywords: ["order", "confirmation"],
    group: "public",
    order: 7,
  },
];

export const getNavigationItemById = (id: string): NavigationItem | undefined => {
  return navigationItems.find((item) => item.id === id);
};

export const getNavigationItemsByGroup = (group: string): NavigationItem[] => {
  return navigationItems
    .filter((item) => item.group === group)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getNavigationItemsByRole = (role: string): NavigationItem[] => {
  return navigationItems.filter((item) => !item.roles || item.roles.includes(role));
};

export const searchNavigationItems = (query: string): NavigationItem[] => {
  const searchTerms = query.toLowerCase().split(" ");

  return navigationItems.filter((item) => {
    const searchableText = [item.title, item.description, ...(item.keywords || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });
};
