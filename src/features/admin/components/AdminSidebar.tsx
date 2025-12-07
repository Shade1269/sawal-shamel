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
import { BarChart3, ShoppingCart, TrendingUp, Database, Crown, Wallet, CheckCircle, DollarSign, Building2 } from "lucide-react";
import { UnifiedBadge as Badge } from "@/components/design-system";

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
    title: "سحوبات المسوقين",
    url: "/admin/withdrawals",
    icon: Wallet
  },
  {
    title: "سحوبات التجار",
    url: "/admin/merchant-withdrawals",
    icon: Building2
  },
  {
    title: "أرباح المنصة",
    url: "/admin/platform-revenue",
    icon: DollarSign
  },
  {
    title: "موافقة المنتجات",
    url: "/admin/products/approval",
    icon: CheckCircle
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
    
    return `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:scale-[1.02] ${
      isActive 
        ? "gradient-bg-primary text-primary border border-primary/30 font-semibold shadow-glow ring-2 ring-primary/20 backdrop-blur-sm" 
        : "text-muted-foreground gradient-hover-accent hover:text-accent-foreground hover:shadow-md hover:backdrop-blur-sm"
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
                  className={`${getNavClassName(item.url, item.exact)} admin-nav-item`}
                >
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-right">{item.title}</span>
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
                  <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-l border-border gradient-bg-muted backdrop-blur-2xl shadow-2xl shadow-primary/5 admin-sidebar-enhanced">
      <SidebarContent className="px-3 py-6">
        {/* Logo/Header */}
        <div className={`px-3 mb-8 ${isCollapsed ? "text-center" : ""}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-btn-primary flex items-center justify-center shadow-glow ring-2 ring-primary/20">
                <Crown className="h-6 w-6 text-primary-foreground drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl font-black bg-gradient-primary bg-clip-text text-transparent tracking-tight">
                  لوحة الإدارة
                </h2>
                <p className="text-sm text-muted-foreground/80 font-medium">نظام إدارة شامل</p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl gradient-btn-primary flex items-center justify-center mx-auto shadow-glow ring-2 ring-primary/20">
              <Crown className="h-6 w-6 text-primary-foreground drop-shadow-sm" />
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
            <div className="p-4 rounded-2xl gradient-card-success shadow-glow backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse shadow-sm"></div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  النظام يعمل بطلاقة
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-2 font-medium">
                جميع الخدمات متاحة
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}