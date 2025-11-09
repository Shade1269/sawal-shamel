// Enhanced Hooks System v4.1
// نظام الـ Hooks المطور - النسخة الرابعة المحسّنة

// Device Detection Hooks - NEW v4.2
export { 
  useDeviceDetection, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  useHasTouch,
  type DeviceInfo 
} from './useDeviceDetection';

// Core Hooks
export { useDesignSystem } from './useDesignSystem';
export { useResponsiveLayout, useResponsiveColumns, useResponsiveSpacing } from './useResponsiveLayout';
export { useVirtualization, useInfiniteVirtualization } from './useVirtualization';
export { useSmartNavigation } from './useSmartNavigation';

// Performance & Optimization Hooks v3.2
export { usePerformanceMonitoring } from './usePerformanceMonitoring';
// useOptimizedAuth removed - use useFastAuth directly
export { useOptimizedAtlantis } from './useOptimizedAtlantis';

// Advanced Animation Hooks v3.2
export { 
  useCustomAnimation,
  useSpringAnimation, 
  useParallax,
  useScrollAnimation,
  useMouseAnimation
} from './useAdvancedAnimations';

// AI-Powered Hooks v3.2
export { 
  useSmartSearch,
  useContentGeneration,
  useSmartForm
} from './useAIComponents';

// Smart Analytics Hooks v4.1
export { useSmartAnalytics } from './useSmartAnalytics';
export { useSmartRecommendations } from './useSmartRecommendations';

// New v3.3 Advanced Hooks
export { useSecurityMonitoring } from './useSecurityMonitoring';
export { useAdvancedNotifications } from './useAdvancedNotifications';

// Existing Business Logic Hooks
export { useAtlantisChat } from './useAtlantisChat';
export { useAtlantisNotifications } from './useAtlantisNotifications';
export { useAtlantisSystem } from './useAtlantisSystem';
export { useAffiliateCommissions } from './useAffiliateCommissions';
export { useAffiliateOrders } from './useAffiliateOrders';
export { useAffiliateStore } from './useAffiliateStore';
export { useAutoMigration } from './useAutoMigration';
export { useCustomerAuth } from './useCustomerAuth';
export { useExecutiveAnalytics } from './useExecutiveAnalytics';
export { useFastAuth } from './useFastAuth';
export { useFirebaseUserData } from './useFirebaseUserData';
export { useFirestoreUserData } from './useFirestoreUserData';
export { useInventoryManagement } from './useInventoryManagement';
export { useInvoiceManagement } from './useInvoiceManagement';
export { useIsolatedStoreCart } from './useIsolatedStoreCart';
export { useNavigationShortcuts } from './useNavigationShortcuts';
export { useNotifications } from './useNotifications';
// useOptimizedDataFetch removed - functionality moved to useFastAuth
export { usePaymentGateways } from './usePaymentGateways';
// usePerformanceOptimized removed - not needed
export { useProductImages } from './useProductManagement';
export { usePublicStorefront } from './usePublicStorefront';
export { useRealInventoryManagement } from './useRealInventoryManagement';
export { useRealTimeChat } from './useRealTimeChat';
export { useSecurityManagement } from './useSecurityManagement';
export { useShipmentTracking } from './useShipmentTracking';
export { useShippingManagement } from './useShippingManagement';
export { useShoppingCart } from './useShoppingCart';
export { useStoreSettings } from './useStoreSettings';
export { useStoreThemes } from './useStoreThemes';
export { useStorefrontCart } from './useStorefrontCart';
export { useStorefrontOtp } from './useStorefrontOtp';
export { useStorefrontSession } from './useStorefrontSession';
export { useSupabaseUserData } from './useSupabaseUserData';
export { useUnifiedAuth } from './useUnifiedAuth';
export { useUnifiedOrders } from './useUnifiedOrders';
export { useUnifiedUserData } from './useUnifiedUserData';
export { useUserData } from './useUserData';
export { useUserRoles } from './useUserRoles';

// Version Info
export const HOOKS_SYSTEM_VERSION = '4.1.0';
export const RELEASE_DATE = '2024-12-17';
