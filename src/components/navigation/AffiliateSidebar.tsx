import { ModernSidebar } from './ModernSidebar';
import { affiliateNavigationSections } from '@/config/navigation/affiliateNav';

export function AffiliateSidebar() {
  return <ModernSidebar navigationSections={affiliateNavigationSections} />;
}