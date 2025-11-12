/**
 * Theme Helper Utilities
 * Provides consistent color and styling utilities across the platform
 */

// ============= Color Utilities =============

/**
 * Maps old hardcoded colors to semantic tokens
 */
export const colorMap = {
  // Backgrounds
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  'bg-gray-50': 'bg-muted/50',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-800': 'bg-card',
  'bg-gray-900': 'bg-card',
  
  // Text colors
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  'text-gray-400': 'text-muted-foreground/60',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground/80',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
} as const;

/**
 * Maps hardcoded gradients to semantic gradient classes
 */
export const gradientMap = {
  'from-blue-400 to-blue-600': 'bg-gradient-primary',
  'from-blue-500 to-blue-700': 'bg-gradient-primary',
  'from-purple-400 to-purple-600': 'bg-gradient-premium',
  'from-purple-500 to-purple-700': 'bg-gradient-premium',
  'from-red-500 to-red-700': 'bg-gradient-to-r from-destructive to-destructive/80',
  'from-green-500 to-green-700': 'bg-gradient-persian',
  'from-blue-500 to-purple-600': 'bg-gradient-hero',
} as const;

// ============= Semantic Class Utilities =============

/**
 * Get glass effect classes
 */
export function getGlassClasses(variant: 'default' | 'strong' | 'subtle' = 'default') {
  const variants = {
    default: 'bg-card/90 backdrop-blur-xl border border-border/50',
    strong: 'bg-card/95 backdrop-blur-2xl border border-border',
    subtle: 'bg-card/70 backdrop-blur-lg border border-border/30',
  };
  return variants[variant];
}

/**
 * Get button variant classes using semantic tokens
 */
export function getButtonClasses(variant: 'primary' | 'secondary' | 'destructive' | 'ghost' = 'primary') {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'bg-transparent hover:bg-muted text-foreground',
  };
  return variants[variant];
}

/**
 * Get card variant classes using semantic tokens
 */
export function getCardClasses(variant: 'default' | 'elevated' | 'bordered' = 'default') {
  const variants = {
    default: 'bg-card text-card-foreground border border-border',
    elevated: 'bg-card text-card-foreground shadow-soft',
    bordered: 'bg-card text-card-foreground border-2 border-border',
  };
  return variants[variant];
}

/**
 * Get gradient classes using semantic tokens
 */
export function getGradientClasses(type: 'primary' | 'hero' | 'luxury' | 'premium' | 'persian' | 'commerce' | 'muted' | 'info' | 'success' | 'warning' | 'danger' = 'primary') {
  const gradients = {
    primary: 'bg-gradient-primary',
    hero: 'bg-gradient-hero',
    luxury: 'bg-gradient-luxury',
    premium: 'bg-gradient-premium',
    persian: 'bg-gradient-persian',
    commerce: 'bg-gradient-commerce',
    muted: 'bg-gradient-muted',
    info: 'bg-gradient-info',
    success: 'bg-gradient-success',
    warning: 'bg-gradient-warning',
    danger: 'bg-gradient-danger',
  };
  return gradients[type];
}

/**
 * Get shadow classes using semantic tokens
 */
export function getShadowClasses(type: 'soft' | 'glow' | 'luxury' | 'elegant' | 'glass' = 'soft') {
  const shadows = {
    soft: 'shadow-soft',
    glow: 'shadow-glow',
    luxury: 'shadow-luxury',
    elegant: 'shadow-elegant',
    glass: 'shadow-glass',
  };
  return shadows[type];
}

/**
 * Get status color classes
 */
export function getStatusClasses(status: 'online' | 'offline' | 'success' | 'warning' | 'danger' | 'info') {
  const statusColors = {
    online: 'text-status-online',
    offline: 'text-status-offline',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  };
  return statusColors[status];
}

/**
 * Get badge variant classes
 */
export function getBadgeClasses(variant: 'default' | 'success' | 'warning' | 'danger' | 'info' = 'default') {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-info/10 text-info border border-info/20',
  };
  return variants[variant];
}

/**
 * Get role-based color classes
 */
export function getRoleClasses(role: 'admin' | 'moderator' | 'merchant' | 'affiliate' | 'user') {
  const roleColors = {
    admin: 'bg-destructive/10 text-destructive border border-destructive/20',
    moderator: 'bg-info/10 text-info border border-info/20',
    merchant: 'bg-luxury/10 text-luxury border border-luxury/20',
    affiliate: 'bg-premium/10 text-premium border border-premium/20',
    user: 'bg-muted text-muted-foreground',
  };
  return roleColors[role];
}

/**
 * Get level-based color classes
 */
export function getLevelClasses(level: 'bronze' | 'silver' | 'gold' | 'legendary') {
  const levelColors = {
    bronze: 'bg-bronze/10 text-bronze border border-bronze/20',
    silver: 'bg-muted text-muted-foreground border border-border',
    gold: 'bg-premium/10 text-premium border border-premium/20',
    legendary: 'bg-luxury/10 text-luxury border border-luxury/20',
  };
  return levelColors[level];
}

// ============= Utility Functions =============

/**
 * Combine multiple class names safely
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Replace hardcoded color with semantic token
 */
export function replaceColor(colorClass: string): string {
  return colorMap[colorClass as keyof typeof colorMap] || colorClass;
}

/**
 * Replace hardcoded gradient with semantic gradient
 */
export function replaceGradient(gradientClasses: string): string {
  return gradientMap[gradientClasses as keyof typeof gradientMap] || gradientClasses;
}
