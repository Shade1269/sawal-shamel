import { UnifiedLayout } from '@/components/layout/unified';
import { UnifiedDashboard } from '@/components/unified';
import { adminSidebarSections, adminMobileNavItems } from '@/config/navigation/adminNav';

export default function AdminDashboardPage() {
  return (
    <UnifiedLayout
      sidebarSections={adminSidebarSections}
      mobileNavItems={adminMobileNavItems}
      header={{
        showSearch: true,
        searchPlaceholder: 'بحث في لوحة الإدارة...',
        showNotifications: true,
        notificationCount: 5,
        showDarkModeToggle: true,
      }}
    >
      <UnifiedDashboard />
    </UnifiedLayout>
  );
}
