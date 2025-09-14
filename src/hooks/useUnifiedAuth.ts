import { useFastAuth } from './useFastAuth';

/**
 * Unified Auth Hook - يوحد جميع أنظمة المصادقة في واجهة واحدة
 * يحل محل SupabaseAuthContext مع الحفاظ على نفس الـ API
 */
export const useUnifiedAuth = () => {
  const {
    user,
    session, 
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated,
    isActive,
    hasRole,
    refreshProfile,
    clearCache,
    // Role flags
    isAdmin,
    isMerchant,
    isAffiliate,
    isCustomer,
    isModerator,
    // Permission flags
    canModerate,
    canManageUsers,
    canCreateShops,
    canViewAnalytics
  } = useFastAuth();

  return {
    // Core auth state (SupabaseAuthContext compatible)
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    
    // Enhanced features
    profile,
    updateProfile,
    isAuthenticated,
    isActive,
    hasRole,
    refreshProfile,
    clearCache,
    
    // Role checks
    isAdmin,
    isMerchant,
    isAffiliate,
    isCustomer,
    isModerator,
    
    // Permissions
    canModerate,
    canManageUsers,
    canCreateShops,
    canViewAnalytics
  };
};

// Legacy compatibility - exports the same interface as SupabaseAuthContext
export const useSupabaseAuth = useUnifiedAuth;