/**
 * Feature Flags Configuration - المرحلة النهائية
 * Controls gradual rollout and deprecation of legacy systems
 */

export const FEATURE_FLAGS = {
  // ============ CORE UNIFIED SYSTEM FLAGS ============
  USE_UNIFIED_ORDERS: true,     // Master switch for order_hub (SSOT)
  USE_UNIFIED_RETURNS: true,    // Unified returns via order_hub
  USE_UNIFIED_REFUNDS: true,    // Unified refunds via order_hub
  USE_UNIFIED_SHIPMENTS: true,  // Use shipment_tracking (not shipments_tracking)
  USE_UNIFIED_IDENTITY: true,   // Use profiles as SSOT (not user_profiles)
  USE_UNIFIED_CMS: true,        // Use cms_custom_pages as SSOT
  
  // ============ CONTRACT PHASE FLAGS ============
  BLOCK_LEGACY_ORDERS_WRITE: true,      // منع الكتابة في orders القديم
  BLOCK_LEGACY_SIMPLE_ORDERS_WRITE: true, // منع الكتابة في simple_orders
  BLOCK_LEGACY_USER_PROFILES_WRITE: true, // منع الكتابة في user_profiles
  BLOCK_LEGACY_STORE_PAGES_WRITE: true,   // منع الكتابة في store_pages
  BLOCK_LEGACY_SHIPMENTS_TRACKING_WRITE: true, // منع الكتابة في shipments_tracking
  
  // ============ READING STRATEGY ============
  PREFER_LEGACY_READ: false,    // false = read from new tables only
  ENABLE_DUAL_READ: false,      // Read from both and compare (for validation)
  
  // ============ UI/UX FLAGS ============
  SHOW_UNIFIED_DASHBOARD: true,
  SHOW_SOURCE_INDICATOR: true,  // Show data source badges
  SHOW_MIGRATION_STATUS: true,  // Show migration progress indicators
  SHOW_LEGACY_WARNING: true,    // Warn when accessing legacy data
  
  // ============ ADMIN/DEBUG FLAGS ============
  SHOW_MIGRATION_TOOLS: true,
  ENABLE_DATA_VALIDATION: true,
  ENABLE_MONITORING_DASHBOARD: true, // Show real-time metrics
  ENABLE_ROLLBACK_MODE: false,  // Emergency rollback to legacy
  
  // ============ PERFORMANCE FLAGS ============
  USE_MATERIALIZED_VIEWS: false, // Use MVs for analytics (future)
  ENABLE_QUERY_CACHING: true,
  ENABLE_BATCH_OPERATIONS: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag] ?? false;
};

/**
 * Get all enabled features
 */
export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag as FeatureFlag);
};

/**
 * Environment-based overrides (can be extended)
 */
export const getFeatureForEnvironment = (flag: FeatureFlag): boolean => {
  // In development, you might want different defaults
  if (import.meta.env.DEV) {
    // Example: Enable all debug features in dev
    if (flag === 'SHOW_MIGRATION_TOOLS') return true;
    if (flag === 'ENABLE_DATA_VALIDATION') return true;
  }
  
  return isFeatureEnabled(flag);
};
