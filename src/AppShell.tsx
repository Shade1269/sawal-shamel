import type { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[linear-gradient(180deg,#0B1215,#0E1418)] text-foreground">
      <Navbar />
      <main className="pb-24">{children}</main>
      <MobileNav />
    </div>
  );
}
