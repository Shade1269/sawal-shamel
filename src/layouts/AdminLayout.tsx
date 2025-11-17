import { SidebarProvider } from "@/components/ui/sidebar"
import { BaseLayout } from './BaseLayout';
import { AdminSidebarModern } from '@/components/navigation';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <BaseLayout
        header={<AdminHeader />}
        sidebar={<AdminSidebarModern />}
        showHeader={true}
        showSidebar={true}
        contentClassName="bg-gradient-muted"
      />
    </SidebarProvider>
  )
}