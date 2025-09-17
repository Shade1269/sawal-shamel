import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store, Package, ShoppingBag, DollarSign, BarChart3, Palette, Gift, Target, FileText, Layout } from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';

export default function AffiliateDashboardLayout() {
  const location = useLocation();
  const { profile } = useFastAuth();

  // جلب المتاجر الخاصة بالمسوق
  const { data: stores } = useQuery({
    queryKey: ['affiliate-stores', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('id, store_name')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const primaryStore = stores?.[0];
  
  const navigation = [
    { name: 'نظرة عامة', href: '/dashboard', icon: BarChart3 },
    { name: 'المنتجات', href: '/dashboard/products', icon: Package },
    { name: 'الطلبات', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'العمولات', href: '/dashboard/commissions', icon: DollarSign },
    { name: 'الحملات الترويجية', href: '/promotions', icon: Gift },
    { name: 'التسويق المتقدم', href: '/advanced-marketing', icon: Target },
    { name: 'إدارة المحتوى', href: '/content-management', icon: FileText },
    { name: 'منشئ الصفحات', href: '/page-builder', icon: Layout },
    ...(primaryStore ? [{
      name: 'ثيمات المتجر', 
      href: `/store-themes/${primaryStore.id}`, 
      icon: Palette 
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">لوحة المسوق</h1>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}