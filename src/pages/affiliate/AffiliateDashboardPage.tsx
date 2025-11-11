import { UnifiedLayout } from '@/components/layout/unified';
import { UnifiedDashboard } from '@/components/unified';
import { affiliateSidebarSections, affiliateMobileNavItems } from '@/config/navigation/affiliateNav';

export default function AffiliateDashboardPage() {
  return (
    <UnifiedLayout
      sidebarSections={affiliateSidebarSections}
      mobileNavItems={affiliateMobileNavItems}
      header={{
        showSearch: true,
        searchPlaceholder: 'بحث في لوحة المسوق...',
        showNotifications: true,
        notificationCount: 3,
        showDarkModeToggle: true,
      }}
    >
      <UnifiedDashboard />
    </UnifiedLayout>
  );
}
