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
  Settings,
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
    title: "مركز المسوق",
    url: "/affiliate",
    icon: Store,
    roles: ["affiliate", "marketer", "admin"],
    children: [
      { title: "الرئيسية", url: "/affiliate", icon: Home, roles: ["affiliate", "marketer", "admin"] },
      { title: "واجهة المتجر", url: "/affiliate/storefront", icon: Store, roles: ["affiliate", "marketer", "admin"] },
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