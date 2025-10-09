/**
 * Feature Flags Configuration
 * Controls gradual rollout of unified order system
 */

export const FEATURE_FLAGS = {
  // Core unified system flags
  USE_UNIFIED_ORDERS: true, // Master switch for order_hub
  USE_UNIFIED_RETURNS: true, // Use unified returns system
  USE_UNIFIED_REFUNDS: true, // Use unified refunds system
  USE_UNIFIED_SHIPMENTS: true, // Use unified shipments system
  
  // UI feature flags
  SHOW_UNIFIED_DASHBOARD: true, // Show unified dashboard views
  SHOW_SOURCE_INDICATOR: true, // Show order source (ecommerce/simple/manual)
  
  // Data migration flags
  ENABLE_DUAL_WRITE: false, // Write to both old and new tables (for migration)
  PREFER_LEGACY_READ: false, // Read from legacy tables when available
  
  // Admin/Debug flags
  SHOW_MIGRATION_TOOLS: true, // Show data migration tools in admin
  ENABLE_DATA_VALIDATION: true, // Run validation checks
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
