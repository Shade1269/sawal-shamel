import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Store, Package, ShoppingBag, DollarSign, BarChart3 } from 'lucide-react';

const navigation = [
  { name: 'نظرة عامة', href: '/dashboard', icon: BarChart3 },
  { name: 'المنتجات', href: '/dashboard/products', icon: Package },
  { name: 'الطلبات', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'العمولات', href: '/dashboard/commissions', icon: DollarSign },
];

export default function AffiliateDashboardLayout() {
  const location = useLocation();

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