import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Share2, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  Store,
  Award,
  Star,
  Crown,
  ArrowRight
} from 'lucide-react';

const QuickLinks = () => {
  const { profile } = useAuthContext();
  const navigate = useNavigate();

  // Common navigation links based on user role
  const getNavigationLinks = () => {
    const role = profile?.role;
    
    switch (role) {
      case 'admin':
        return [
          { title: 'لوحة الإدارة', route: '/admin', icon: Crown, description: 'إدارة شاملة للنظام' },
          { title: 'نظام التسويق', route: '/admin/marketing', icon: Share2, description: 'إدارة الحملات التسويقية' },
          { title: 'المستخدمون', route: '/admin/users', icon: Users, description: 'إدارة المستخدمين' },
          { title: 'الإحصائيات', route: '/admin/analytics', icon: BarChart3, description: 'تقارير مفصلة' }
        ];
      
      case 'merchant':
        return [
          { title: 'لوحة التاجر', route: '/merchant', icon: Store, description: 'إدارة متجرك' },
          { title: 'المنتجات', route: '/products', icon: Package, description: 'إضافة وإدارة المنتجات' },
          { title: 'نظام التسويق', route: '/admin/marketing', icon: Share2, description: 'أدوات التسويق والترويج' },
          { title: 'المدفوعات', route: '/payments', icon: Award, description: 'إدارة المدفوعات' }
        ];
      
      case 'affiliate':
        return [
          { title: 'متجري', route: '/affiliate', icon: Star, description: 'متجر الأفيليت الخاص بك' },
          { title: 'المنتجات', route: '/products', icon: Package, description: 'تصفح المنتجات للتسويق' },
          { title: 'أدوات التسويق', route: '/admin/marketing', icon: Share2, description: 'حملات ووسائل التواصل' },
          { title: 'العمولات', route: '/affiliate', icon: Award, description: 'تتبع أرباحك' }
        ];
      
      default: // customer
        return [
          { title: 'المنتجات', route: '/products', icon: Package, description: 'تصفح وتسوق المنتجات' },
          { title: 'طلباتي', route: '/profile', icon: ShoppingCart, description: 'تتبع طلباتك' },
          { title: 'الملف الشخصي', route: '/profile', icon: Settings, description: 'إدارة بياناتك' }
        ];
    }
  };

  const navigationLinks = getNavigationLinks();

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          الوصول السريع
        </CardTitle>
        <CardDescription>
          الانتقال المباشر للصفحات الرئيسية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {navigationLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex-col gap-2 hover:bg-primary/10 hover:border-primary/20"
                onClick={() => navigate(link.route)}
              >
                <Icon className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="text-xs font-medium">{link.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                    {link.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinks;