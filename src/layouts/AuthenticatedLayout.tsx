import React from 'react';
import { Home, BarChart3, Wallet, Bell, User } from 'lucide-react';
import { BottomNavMobile } from '@/components/app-shell/BottomNavMobile';
import { useFastAuth } from '@/hooks/useFastAuth';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { profile } = useFastAuth();
  const role = profile?.role;

  // Bottom navigation items for affiliates/marketers
  const bottomNavItems = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/affiliate', label: 'المسوق', icon: BarChart3 },
    { to: '/affiliate/wallet', label: 'المحفظة', icon: Wallet },
    { to: '/notifications', label: 'الإشعارات', icon: Bell },
    { to: '/profile', label: 'حسابي', icon: User },
  ];

  const showBottomNav = role === 'affiliate' || role === 'marketer' || role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24">
        {children}
      </main>
      {showBottomNav && <BottomNavMobile items={bottomNavItems} />}
    </div>
  );
}

export default AuthenticatedLayout;
