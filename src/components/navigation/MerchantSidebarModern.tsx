import { ModernSidebar } from './ModernSidebar';
import { merchantNavigationSections } from '@/config/navigation/merchantNav';

export function MerchantSidebarModern() {
  return <ModernSidebar navigationSections={merchantNavigationSections} />;
}