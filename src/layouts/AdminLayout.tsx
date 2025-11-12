import { SidebarProvider } from "@/components/ui/sidebar"
import { BaseLayout } from './BaseLayout';
import { AdminSidebarModern } from '@/components/navigation';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background" data-admin-layout>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-auto bg-gradient-muted">
            <BaseLayout
              sidebar={<AdminSidebarModern />}
              showHeader={false}
              showSidebar={false}
              contentClassName=""
            />
          </main>
        </div>
        <AdminSidebarModern />
      </div>
    </SidebarProvider>
  )
}