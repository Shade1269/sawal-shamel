import { UnifiedLayout } from '@/components/layout/unified';
import { UnifiedDashboard } from '@/components/unified';
import { merchantSidebarSections, merchantMobileNavItems } from '@/config/navigation/merchantNav';

export default function MerchantDashboardPage() {
  return (
    <UnifiedLayout
      sidebarSections={merchantSidebarSections}
      mobileNavItems={merchantMobileNavItems}
      header={{
        showSearch: true,
        searchPlaceholder: 'بحث في لوحة التاجر...',
        showNotifications: true,
        notificationCount: 5,
        showDarkModeToggle: true,
      }}
    >
      <UnifiedDashboard />
    </UnifiedLayout>
  );
}
