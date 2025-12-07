import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: 'الرئيسية' },
  { href: '/products', icon: Package, label: 'المنتجات' },
  { href: '/affiliates', icon: Users, label: 'الشركاء' },
  { href: '/analytics', icon: BarChart3, label: 'التقارير' },
  { href: '/profile', icon: Settings, label: 'الحساب' }
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-t px-2 py-2 flex justify-around items-center sticky bottom-0 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 rounded-lg min-w-[60px] relative transition-colors",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5 mb-1" />
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-[50px]">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}