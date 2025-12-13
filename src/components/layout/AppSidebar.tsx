import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Home,
  ShoppingBag,
  Shield,
  Store,
  Users,
  Package,
} from "lucide-react";
import { Settings } from "lucide-react";

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
    title: "مركز المسوق",
    url: "/affiliate",
    icon: Store,
    roles: ["affiliate", "marketer", "admin"],
    children: [
      { title: "الرئيسية", url: "/affiliate", icon: Home, roles: ["affiliate", "marketer", "admin"] },
      { title: "واجهة المتجر", url: "/affiliate/storefront", icon: Store, roles: ["affiliate", "marketer", "admin"] },
      { title: "إدارة المنتجات", url: "/affiliate/store/settings?tab=products", icon: Package, roles: ["affiliate", "marketer", "admin"] },
      { title: "الطلبات", url: "/affiliate/orders", icon: ShoppingBag, roles: ["affiliate", "marketer", "admin"] },
      { title: "التحليلات", url: "/affiliate/analytics", icon: BarChart3, roles: ["affiliate", "marketer", "admin"] },
    ],
  },
  {
    title: "لوحة الإدارة",
    url: "/admin",
    icon: Shield,
    roles: ["admin", "moderator"],
    children: [
      { title: "نظرة عامة", url: "/admin/dashboard", icon: BarChart3, roles: ["admin", "moderator"] },
      { title: "الطلبات", url: "/admin/orders", icon: ShoppingBag, roles: ["admin", "moderator"] },
      { title: "المخزون", url: "/admin/inventory", icon: Store, roles: ["admin", "moderator"] },
      { title: "التحليلات", url: "/admin/analytics", icon: Users, roles: ["admin", "moderator"] },
      { title: "إدارة شاملة", url: "/admin/management", icon: Settings, roles: ["admin"] },
    ],
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

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} border-l transition-all duration-300 bg-gradient-to-b from-card to-card/95`}
      collapsible="icon"
    >
      <SidebarContent className="py-4 px-2">
        {/* Logo/Brand Section */}
        {!isCollapsed && (
          <div className="px-3 py-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">أتلانتس</h2>
                <p className="text-xs text-muted-foreground">منصة الأفيليت</p>
              </div>
            </div>
          </div>
        )}

        {navigationItems.map((item) => {
          if (!shouldShowItem(item)) return null;

          const isExpanded = expandedGroups.includes(item.title) || hasActiveChild(item);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <SidebarGroup key={item.title} className="mb-2">
              {hasChildren ? (
                <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(item.title)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className={`w-full justify-between rounded-xl transition-all duration-200 ${
                        hasActiveChild(item) 
                          ? "bg-primary/10 text-primary border-r-2 border-primary shadow-sm" 
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          hasActiveChild(item) ? 'bg-primary/20' : 'bg-muted/50'
                        }`}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                        </div>
                        {!isCollapsed && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="animate-accordion-down">
                    <SidebarMenuSub className="mr-4 mt-1 space-y-1 border-r border-border/50">
                      {item.children?.map((child) => {
                        if (!shouldShowItem(child)) return null;
                        
                        return (
                          <SidebarMenuSubItem key={child.url}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={child.url}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-primary/15 text-primary font-medium shadow-sm"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  }`
                                }
                              >
                                <child.icon className="h-4 w-4 flex-shrink-0" />
                                {!isCollapsed && (
                                  <>
                                    <span>{child.title}</span>
                                    {child.badge && (
                                      <Badge variant="secondary" className="text-xs mr-auto bg-accent/20 text-accent">
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
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium border-r-2 border-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`
                        }
                      >
                        <div className="p-1.5 rounded-lg bg-muted/50">
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                        </div>
                        {!isCollapsed && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs mr-auto bg-accent/20 text-accent">
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

        {/* Help Section with improved styling */}
        <SidebarGroup className="mt-auto pt-4 border-t border-border/50">
          <SidebarGroupLabel className="text-xs text-muted-foreground/70 px-3">المساعدة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/help"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="p-1.5 rounded-lg bg-muted/50">
                      <HelpCircle className="h-4 w-4" />
                    </div>
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