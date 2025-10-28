import { ModernSidebar } from './ModernSidebar';
import { adminNavigationSections } from '@/config/navigation/adminNav';

export function AdminSidebarModern() {
  return <ModernSidebar navigationSections={adminNavigationSections} />;
}