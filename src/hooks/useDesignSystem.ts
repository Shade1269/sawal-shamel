/**
 * Design System Hook - للوصول السهل لنظام التصميم
 */
import { 
  roleColors, 
  statusColors, 
  backgroundColors, 
  textColors, 
  iconColors, 
  levelColors,
  buttonVariants,
  gradients,
  shadows,
  getRoleColor,
  getStatusColor, 
  getLevelColor,
  getIconColor
} from '@/utils/designSystem';

export const useDesignSystem = () => {
  return {
    // Color utilities
    colors: {
      role: roleColors,
      status: statusColors,
      background: backgroundColors,
      text: textColors,
      icon: iconColors,
      level: levelColors
    },
    
    // Component styles
    components: {
      button: buttonVariants,
      gradient: gradients,
      shadow: shadows
    },
    
    // Helper functions
    helpers: {
      getRoleColor,
      getStatusColor,
      getLevelColor,
      getIconColor
    },
    
    // Common patterns
    patterns: {
      overlay: 'bg-background/80 backdrop-blur-sm',
      card: 'bg-card border border-border text-card-foreground',
      button: 'bg-primary text-primary-foreground hover:bg-primary/90',
      input: 'bg-background border border-input text-foreground',
      badge: 'bg-secondary text-secondary-foreground',
      success: 'bg-status-online/10 text-status-online',
      error: 'bg-destructive/10 text-destructive',
      warning: 'bg-premium/10 text-premium',
      info: 'bg-accent/10 text-accent-foreground'
    }
  };
};