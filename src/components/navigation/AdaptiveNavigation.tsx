
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useSmartNavigation } from './SmartNavigationProvider';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { TabletDrawerNavigation } from './TabletDrawerNavigation';
import { DesktopSidebarNavigation } from './DesktopSidebarNavigation';
import { NavigationShortcuts } from './NavigationShortcuts';
import { NavigationSearch } from './NavigationSearch';
import { DeviceAware } from '@/components/layout/DeviceAware';

interface AdaptiveNavigationProps {
  className?: string;
  showSearch?: boolean;
  showShortcuts?: boolean;
}

export function AdaptiveNavigation({ 
  className,
  showSearch = true,
  showShortcuts = true 
}: AdaptiveNavigationProps) {
  const device = useDeviceDetection();
  const { } = useSmartNavigation();

  return (
    <div className={className}>
      {/* Navigation Search - Show on all devices when open */}
      {showSearch && <NavigationSearch />}
      
      {/* Keyboard Shortcuts - Desktop only */}
      {showShortcuts && device.isDesktop && <NavigationShortcuts />}
      
      {/* Device-Specific Navigation */}
      <DeviceAware showOn={['mobile']}>
        <MobileBottomNavigation />
      </DeviceAware>
      
      <DeviceAware showOn={['tablet']}>
        <TabletDrawerNavigation />
      </DeviceAware>
      
      <DeviceAware showOn={['desktop']}>
        <DesktopSidebarNavigation />
      </DeviceAware>
    </div>
  );
}

export default AdaptiveNavigation;