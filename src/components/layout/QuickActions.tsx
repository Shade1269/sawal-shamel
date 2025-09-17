import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  FileText,
  Gift,
  Settings,
  Zap,
  Globe,
  Edit3,
  TrendingUp,
  DollarSign,
  Crown,
  Store,
  Star,
  Target,
  Layout,
  Database,
  Truck,
  Shield,
  Eye,
  HelpCircle
} from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: any;
  category: string;
  shortcut?: string;
  badge?: string;
  roles?: string[];
}

const quickActions: QuickAction[] = [
  // إجراءات سريعة عامة
  {
    id: "search-products",
    title: "البحث عن المنتجات",
    description: "البحث في جميع المنتجات المتاحة",
    url: "/products-browser",
    icon: Search,
    category: "عام",
    shortcut: "⌘K",
    roles: ["affiliate"]
  },
  {
    id: "add-product",
    title: "إضافة منتج جديد",
    description: "إضافة منتج جديد للمتجر",
    url: "/dashboard/products?action=add",
    icon: Plus,
    category: "المنتجات",
    roles: ["affiliate", "merchant", "admin"]
  },
  {
    id: "view-cart",
    title: "عرض السلة",
    description: "عرض المنتجات في السلة",
    url: "/cart",
    icon: ShoppingCart,
    category: "التسوق"
  },
  {
    id: "track-orders",
    title: "تتبع الطلبات",
    description: "تتبع حالة الطلبات الحالية",
    url: "/dashboard/orders",
    icon: Package,
    category: "الطلبات",
    roles: ["affiliate", "merchant", "admin"]
  },

  // إجراءات التسويق
  {
    id: "create-campaign",
    title: "إنشاء حملة ترويجية",
    description: "إنشاء حملة تسويقية جديدة",
    url: "/promotions?action=create",
    icon: Gift,
    category: "التسويق",
    roles: ["affiliate", "merchant", "admin"]
  },
  {
    id: "advanced-marketing",
    title: "التسويق المتقدم",
    description: "أدوات التسويق المتقدمة والذكية",
    url: "/advanced-marketing",
    icon: Target,
    category: "التسويق",
    roles: ["affiliate", "merchant", "admin"]
  },
  {
    id: "create-banner",
    title: "إنشاء بانر إعلاني",
    description: "تصميم بانر إعلاني جديد",
    url: "/banner-management",
    icon: Globe,
    category: "التسويق",
    roles: ["affiliate", "merchant", "admin"]
  },

  // إدارة المحتوى
  {
    id: "page-builder",
    title: "بناء صفحة جديدة",
    description: "إنشاء صفحة باستخدام منشئ الصفحات المرئي",
    url: "/page-builder",
    icon: Layout,
    category: "المحتوى",
    roles: ["affiliate", "merchant", "admin"]
  },
  {
    id: "content-management",
    title: "إدارة المحتوى",
    description: "إدارة وتحرير محتوى الموقع",
    url: "/content-management",
    icon: Edit3,
    category: "المحتوى",
    roles: ["affiliate", "merchant", "admin"]
  },
  {
    id: "theme-studio",
    title: "استوديو الثيمات",
    description: "تخصيص شكل ومظهر المتجر",
    url: "/theme-studio",
    icon: Zap,
    category: "المحتوى",
    roles: ["affiliate", "admin"]
  },

  // التحليلات والتقارير
  {
    id: "analytics",
    title: "التحليلات",
    description: "عرض تحليلات الأداء والمبيعات",
    url: "/analytics",
    icon: BarChart3,
    category: "التحليلات",
    roles: ["merchant", "admin"]
  },
  {
    id: "sales-reports",
    title: "تقارير المبيعات",
    description: "تقارير مفصلة عن المبيعات",
    url: "/sales-reports",
    icon: TrendingUp,
    category: "التحليلات",
    roles: ["merchant", "admin"]
  },

  // المدفوعات
  {
    id: "payments",
    title: "المدفوعات",
    description: "إدارة المدفوعات والفوترة",
    url: "/payments",
    icon: DollarSign,
    category: "المالية",
    roles: ["merchant", "admin"]
  },
  {
    id: "invoices",
    title: "الفواتير",
    description: "إدارة الفواتير والإيصالات",
    url: "/invoices",
    icon: FileText,
    category: "المالية",
    roles: ["merchant", "admin"]
  },

  // الإدارة
  {
    id: "admin-panel",
    title: "لوحة الإدارة",
    description: "الوصول إلى لوحة التحكم الإدارية",
    url: "/admin",
    icon: Crown,
    category: "الإدارة",
    roles: ["admin"]
  },
  {
    id: "user-management",
    title: "إدارة المستخدمين",
    description: "إدارة حسابات المستخدمين",
    url: "/admin/users",
    icon: Users,
    category: "الإدارة",
    roles: ["admin"]
  },
  {
    id: "security",
    title: "الأمان",
    description: "مراقبة أمان النظام",
    url: "/security",
    icon: Shield,
    category: "الإدارة",
    roles: ["admin"]
  },

  // المساعدة والدعم
  {
    id: "help-center",
    title: "مركز المساعدة",
    description: "الحصول على المساعدة والدعم",
    url: "/help",
    icon: HelpCircle,
    category: "المساعدة"
  }
];

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { profile } = useFastAuth();

  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const hasPermission = !action.roles || action.roles.includes(profile?.role || "");
    
    return matchesSearch && hasPermission;
  });

  const categories = [...new Set(filteredActions.map(action => action.category))];

  const handleActionClick = (action: QuickAction) => {
    navigate(action.url);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="h-4 w-4" />
          إجراءات سريعة
          <Badge variant="secondary" className="text-xs">⌘J</Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-xl font-bold">الإجراءات السريعة</DialogTitle>
          <DialogDescription>
            ابحث عن الإجراءات أو انتقل بسرعة إلى أي صفحة في النظام
          </DialogDescription>
        </DialogHeader>

        <Command className="border-0">
          <div className="px-4 pb-4">
            <CommandInput
              placeholder="ابحث عن إجراء أو صفحة..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
            />
          </div>
          
          <CommandList className="max-h-96 overflow-auto">
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-4">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
              </div>
            </CommandEmpty>

            {categories.map(category => {
              const categoryActions = filteredActions.filter(action => action.category === category);
              
              if (categoryActions.length === 0) return null;

              return (
                <CommandGroup key={category} heading={category}>
                  {categoryActions.map(action => (
                    <CommandItem
                      key={action.id}
                      onSelect={() => handleActionClick(action)}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                        <action.icon className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{action.title}</span>
                          {action.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {action.badge}
                            </Badge>
                          )}
                          {action.shortcut && (
                            <Badge variant="outline" className="text-xs">
                              {action.shortcut}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Hook لاستخدام الإجراءات السريعة عبر لوحة المفاتيح
export function useQuickActionsShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ⌘J أو Ctrl+J لفتح الإجراءات السريعة
      if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
        event.preventDefault();
        // يمكن تنفيذ فتح modal هنا
      }

      // ⌘K أو Ctrl+K للبحث السريع
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        navigate('/products-browser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}