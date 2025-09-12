import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  Shield,
  Package,
  MessageSquare,
  Bell,
  FileText,
  CreditCard,
  Globe,
  Zap,
  Crown,
  Activity,
  Share2
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const adminNavItems = [
  {
    title: "نظرة عامة",
    items: [
      { 
        title: "لوحة التحكم", 
        url: "/admin", 
        icon: LayoutDashboard,
        description: "الصفحة الرئيسية للإدارة"
      },
      { 
        title: "الإحصائيات", 
        url: "/admin/analytics", 
        icon: BarChart3,
        badge: "جديد"
      },
      { 
        title: "التقارير", 
        url: "/admin/reports", 
        icon: FileText 
      }
    ]
  },
  {
    title: "إدارة المستخدمين",
    items: [
      { 
        title: "المستخدمون", 
        url: "/admin/users", 
        icon: Users 
      },
      { 
        title: "الصلاحيات", 
        url: "/admin/permissions", 
        icon: Shield 
      },
      { 
        title: "سجل النشاط", 
        url: "/admin/activity", 
        icon: Activity 
      }
    ]
  },
  {
    title: "إدارة المتاجر",
    items: [
      { 
        title: "المتاجر", 
        url: "/admin/stores", 
        icon: Store 
      },
      { 
        title: "المنتجات", 
        url: "/admin/products", 
        icon: Package 
      },
      { 
        title: "الطلبات", 
        url: "/admin/orders", 
        icon: ShoppingCart 
      },
      { 
        title: "المدفوعات", 
        url: "/admin/payments", 
        icon: CreditCard 
      }
    ]
  },
  {
    title: "التسويق والعمولات",
    items: [
      { 
        title: "نظام التسويق المتكامل", 
        url: "/admin/marketing", 
        icon: Share2,
        badge: "جديد"
      },
      { 
        title: "المسوقون", 
        url: "/admin/affiliates", 
        icon: Users 
      },
      { 
        title: "العمولات", 
        url: "/admin/commissions", 
        icon: Crown 
      }
    ]
  },
  {
    title: "التواصل",
    items: [
      { 
        title: "الرسائل", 
        url: "/admin/messages", 
        icon: MessageSquare 
      },
      { 
        title: "الإشعارات", 
        url: "/admin/notifications", 
        icon: Bell 
      }
    ]
  },
  {
    title: "الإعدادات",
    items: [
      { 
        title: "إعدادات عامة", 
        url: "/admin/settings", 
        icon: Settings 
      },
      { 
        title: "إعدادات الموقع", 
        url: "/admin/site-settings", 
        icon: Globe 
      }
    ]
  }
]

export function AdminSidebar() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin"
    }
    return location.pathname.startsWith(path)
  }
  
  const getNavCls = (path: string) =>
    isActive(path) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">لوحة الإدارة</h2>
            <p className="text-xs text-muted-foreground">نظام الإدارة المتقدم</p>
          </div>
        </div>
      </div>

      <SidebarContent>
        {adminNavItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 py-2">
              {section.title}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(item.url)}`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer */}
      <div className="mt-auto p-4 border-t">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  )
}