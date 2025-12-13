import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  Store,
  Wallet,
  ArrowLeft
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  color: 'primary' | 'accent' | 'success' | 'info' | 'warning';
}

const colorStyles = {
  primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40',
  accent: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 hover:border-accent/40',
  success: 'bg-success/10 text-success border-success/20 hover:bg-success/20 hover:border-success/40',
  info: 'bg-info/10 text-info border-info/20 hover:bg-info/20 hover:border-info/40',
  warning: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:border-warning/40',
};

const defaultActions: QuickAction[] = [
  {
    title: 'إدارة المنتجات',
    description: 'إضافة وتعديل المنتجات',
    icon: <Package className="h-5 w-5" />,
    href: '/affiliate/store/settings?tab=products',
    color: 'primary',
  },
  {
    title: 'الطلبات',
    description: 'متابعة طلبات العملاء',
    icon: <ShoppingBag className="h-5 w-5" />,
    href: '/affiliate/orders',
    color: 'success',
  },
  {
    title: 'التحليلات',
    description: 'تقارير الأداء والمبيعات',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/affiliate/analytics',
    color: 'info',
  },
  {
    title: 'واجهة المتجر',
    description: 'معاينة متجرك',
    icon: <Store className="h-5 w-5" />,
    href: '/affiliate/storefront',
    color: 'accent',
  },
  {
    title: 'المحفظة',
    description: 'الأرباح والسحب',
    icon: <Wallet className="h-5 w-5" />,
    href: '/affiliate/wallet',
    color: 'warning',
  },
  {
    title: 'الإعدادات',
    description: 'إعدادات المتجر',
    icon: <Settings className="h-5 w-5" />,
    href: '/affiliate/store/settings',
    color: 'primary',
  },
];

interface QuickActionsGridProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActionsGrid({ 
  actions = defaultActions, 
  className 
}: QuickActionsGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground">إجراءات سريعة</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className={cn(
              "group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
              "hover:shadow-md hover:-translate-y-1",
              colorStyles[action.color]
            )}
          >
            <div className="p-2 rounded-lg bg-background/50">
              {action.icon}
            </div>
            <div className="text-center">
              <p className="font-medium text-sm text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground hidden md:block">{action.description}</p>
            </div>
            
            {/* Hover arrow */}
            <ArrowLeft className="absolute top-2 left-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
