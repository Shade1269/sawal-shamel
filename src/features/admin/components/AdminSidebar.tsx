import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BarChart3, ShoppingCart, TrendingUp, Database, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mainMenuItems = [
  {
    title: "لوحة الإدارة",
    url: "/admin/dashboard",
    icon: BarChart3,
    exact: true
  }
];

const managementItems = [
  {
    title: "الطلبات",
    url: "/admin/orders",
    icon: ShoppingCart
  },
  {
    title: "المخزون",
    url: "/admin/inventory",
    icon: Database
  },
  {
    title: "إدارة شاملة",
    url: "/admin/management",
    icon: Crown
  }
];

const analyticsItems = [
  {
    title: "التحليلات",
    url: "/admin/analytics",
    icon: TrendingUp
  }
];

const systemItems: any[] = [];
const securityItems: any[] = [];
const configItems: any[] = [];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const getNavClassName = (url: string, exact?: boolean) => {
    const isActive = exact 
      ? location.pathname === url 
      : location.pathname.startsWith(url);
    
    return `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 font-medium shadow-sm" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;
  };

  const MenuSection = ({ 
    title, 
    items
  }: { 
    title: string; 
    items: any[];
  }) => (
    <SidebarGroup>
      <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isCollapsed ? "sr-only" : ""}`}>
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild className="p-0">
                <NavLink 
                  to={item.url} 
                  end={item.exact}
                  className={getNavClassName(item.url, item.exact)}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-accent/50 text-accent-foreground"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="border-r border-border/40 bg-card/30 backdrop-blur-xl">
      <SidebarContent className="px-2 py-4">
        {/* Logo/Header */}
        <div className={`px-3 mb-6 ${isCollapsed ? "text-center" : ""}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  لوحة الإدارة
                </h2>
                <p className="text-xs text-muted-foreground">نظام إدارة شامل</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto">
              <Crown className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Menu Sections */}
        <div className="space-y-4">
          <MenuSection title="الرئيسية" items={mainMenuItems} />
          <MenuSection title="الإدارة" items={managementItems} />
          <MenuSection title="التحليلات" items={analyticsItems} />
          <MenuSection title="النظام" items={systemItems} />
          <MenuSection title="الأمان" items={securityItems} />
          <MenuSection title="الإعدادات" items={configItems} />
        </div>

        {/* Status Indicator */}
        {!isCollapsed && (
          <div className="mt-8 px-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  النظام يعمل بطلاقة
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                جميع الخدمات متاحة
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}