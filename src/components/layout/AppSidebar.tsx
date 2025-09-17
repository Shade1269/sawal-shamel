import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Crown,
  Store,
  Star,
  Gift,
  Palette,
  FileText,
  DollarSign,
  Truck,
  MessageSquare,
  Shield,
  Eye,
  Layout,
  PaintBucket,
  Zap,
  Edit3,
  Globe,
  TrendingUp,
  Target,
  Database,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useFastAuth } from "@/hooks/useFastAuth";

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  children?: NavigationItem[];
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "لوحة التحكم",
    url: "/dashboard",
    icon: BarChart3,
    roles: ["affiliate", "merchant", "admin"],
    children: [
      { title: "نظرة عامة", url: "/dashboard", icon: Eye },
      { title: "المنتجات", url: "/dashboard/products", icon: Package },
      { title: "الطلبات", url: "/dashboard/orders", icon: ShoppingCart },
      { title: "العمولات", url: "/dashboard/commissions", icon: DollarSign },
    ]
  },
  {
    title: "التجارة الإلكترونية",
    url: "/ecommerce",
    icon: ShoppingCart,
    children: [
      { title: "المنتجات", url: "/products", icon: Package },
      { title: "متصفح المنتجات", url: "/products-browser", icon: Search, roles: ["affiliate"] },
      { title: "السلة", url: "/cart", icon: ShoppingCart },
      { title: "الطلبات", url: "/orders", icon: FileText },
      { title: "تتبع الطلبات", url: "/track-order", icon: Truck },
    ]
  },
  {
    title: "التسويق والترويج",
    url: "/marketing",
    icon: TrendingUp,
    roles: ["affiliate", "merchant", "admin"],
    children: [
      { title: "الحملات الترويجية", url: "/promotions", icon: Gift },
      { title: "التسويق المتقدم", url: "/advanced-marketing", icon: Target },
      { title: "إدارة البانرات", url: "/banner-management", icon: Globe },
      { title: "لوحة التسويق", url: "/marketing-dashboard", icon: BarChart3 },
    ]
  },
  {
    title: "إدارة المحتوى",
    url: "/content",
    icon: Edit3,
    roles: ["affiliate", "merchant", "admin"],
    children: [
      { title: "إدارة المحتوى", url: "/content-management", icon: FileText },
      { title: "بناء الصفحات", url: "/page-builder", icon: Layout },
      { title: "إدارة CMS", url: "/cms-management", icon: Database },
      { title: "استوديو الثيمات", url: "/theme-studio", icon: PaintBucket },
    ]
  },
  {
    title: "المدفوعات والمالية",
    url: "/finance",
    icon: DollarSign,
    roles: ["merchant", "admin"],
    children: [
      { title: "لوحة المدفوعات", url: "/payments", icon: DollarSign },
      { title: "إدارة الفواتير", url: "/invoices", icon: FileText },
      { title: "بوابات الدفع", url: "/payment-gateways", icon: Zap },
      { title: "المرتجعات", url: "/refunds", icon: Package },
    ]
  },
  {
    title: "الإدارة",
    url: "/admin",
    icon: Crown,
    roles: ["admin"],
    children: [
      { title: "لوحة الإدارة", url: "/admin", icon: Shield },
      { title: "المستخدمين", url: "/admin/users", icon: Users },
      { title: "التقارير", url: "/admin/analytics", icon: BarChart3 },
      { title: "الصلاحيات", url: "/admin/permissions", icon: Shield },
      { title: "الأنشطة", url: "/admin/activity", icon: Eye },
      { title: "إدارة الطلبات", url: "/admin/orders", icon: ShoppingCart },
    ]
  },
  {
    title: "الأنظمة المتقدمة",
    url: "/advanced",
    icon: Zap,
    roles: ["admin", "merchant"],
    children: [
      { title: "المخزون", url: "/inventory", icon: Package },
      { title: "الشحن", url: "/shipment-management", icon: Truck },
      { title: "المراقبة", url: "/monitoring", icon: Eye },
      { title: "الأمان", url: "/security", icon: Shield },
      { title: "تحسين محركات البحث", url: "/seo", icon: Search },
      { title: "نظام أتلانتس", url: "/atlantis", icon: MessageSquare },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useFastAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const hasActiveChild = (item: NavigationItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.url));
  };

  const shouldShowItem = (item: NavigationItem) => {
    if (!item.roles) return true;
    return item.roles.includes(profile?.role || "");
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} border-r transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="py-4">
        {navigationItems.map((item) => {
          if (!shouldShowItem(item)) return null;

          const isExpanded = expandedGroups.includes(item.title) || hasActiveChild(item);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <SidebarGroup key={item.title}>
              {hasChildren ? (
                <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(item.title)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`w-full justify-between ${getNavClassName(item.url)}`}>
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children?.map((child) => {
                        if (!shouldShowItem(child)) return null;
                        
                        return (
                          <SidebarMenuSubItem key={child.url}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={child.url}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                    isActive
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  }`
                                }
                              >
                                <child.icon className="h-4 w-4 flex-shrink-0" />
                                {!isCollapsed && (
                                  <>
                                    <span>{child.title}</span>
                                    {child.badge && (
                                      <Badge variant="secondary" className="text-xs ml-auto">
                                        {child.badge}
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              )}
            </SidebarGroup>
          );
        })}

        {/* Help Section */}
        <SidebarGroup>
          <SidebarGroupLabel>المساعدة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/help"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <HelpCircle className="h-4 w-4" />
                    {!isCollapsed && <span>المساعدة</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}