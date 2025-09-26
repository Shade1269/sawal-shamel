import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import {
  Package,
  ShoppingCart,
  BarChart3,
  Award,
  Star,
  Crown,
  Home,
  ArrowRight
} from 'lucide-react';

const QuickLinks = () => {
  const { profile } = useFastAuth();
  const navigate = useNavigate();

  // Common navigation links based on user role
  const getNavigationLinks = () => {
    const role = profile?.role;
    
    switch (role) {
      case 'admin':
        return [
          { title: 'لوحة التحكم', route: '/admin/dashboard', icon: Crown, description: 'نظرة عامة على الأداء' },
          { title: 'إدارة الطلبات', route: '/admin/orders', icon: ShoppingCart, description: 'متابعة الطلبات الحالية' },
          { title: 'إدارة المخزون', route: '/admin/inventory', icon: Package, description: 'متابعة توفر المنتجات' },
          { title: 'تحليلات الإدارة', route: '/admin/analytics', icon: BarChart3, description: 'تحليل العوائد والفرق' }
        ];

      case 'affiliate':
      case 'marketer':
      case 'merchant':
        return [
          { title: 'لوحة المسوق', route: '/affiliate', icon: Star, description: 'متابعة الأداء والمهام' },
          { title: 'واجهة المتجر', route: '/affiliate/storefront', icon: Package, description: 'إعدادات العرض والمتجر' },
          { title: 'التحليلات', route: '/affiliate/analytics', icon: Award, description: 'تتبع أرباحك' },
          { title: 'طلبات العملاء', route: '/affiliate/orders', icon: ShoppingCart, description: 'راقب حالة الطلبات' }
        ];

      default: // customer
        return [
          { title: 'الصفحة الرئيسية', route: '/', icon: Home, description: 'استكشف عروض المنصة' },
          { title: 'إتمام الطلب', route: '/checkout', icon: ShoppingCart, description: 'أكمل عملية الشراء' },
          { title: 'تأكيد الطلب', route: '/order/confirmation', icon: Award, description: 'راجع تفاصيل طلبك' }
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