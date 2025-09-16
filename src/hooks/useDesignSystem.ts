/**
 * Enhanced Design System Hook - للوصول السهل لنظام التصميم المطور
 * Version 2.0 - Complete Design System Access
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
  interactive,
  spacing,
  layout,
  typography,
  responsive,
  getRoleColor,
  getStatusColor, 
  getLevelColor,
  getIconColor,
  getInteractiveClasses,
  getLayoutClasses,
  getTypographyClasses,
  combineClasses
} from '@/utils/designSystem';

export const useDesignSystem = () => {
  return {
    // Color System
    colors: {
      role: roleColors,
      status: statusColors,
      background: backgroundColors,
      text: textColors,
      icon: iconColors,
      level: levelColors
    },
    
    // Component Styles
    components: {
      button: buttonVariants,
      gradient: gradients,
      shadow: shadows
    },
    
    // Interaction System
    interactive,
    
    // Layout System
    layout,
    spacing,
    
    // Typography System
    typography,
    
    // Responsive System
    responsive,
    
    // Helper Functions
    helpers: {
      getRoleColor,
      getStatusColor,
      getLevelColor,
      getIconColor,
      getInteractiveClasses,
      getLayoutClasses,
      getTypographyClasses,
      combineClasses
    },
    
    // Enhanced Common Patterns
    patterns: {
      // Basic UI Patterns
      overlay: 'bg-background/80 backdrop-blur-sm border border-border/50',
      card: 'bg-card border border-border rounded-lg shadow-soft hover:shadow-glow transition-all duration-300',
      cardHover: 'bg-card border border-border rounded-lg shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300',
      button: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2',
      input: 'bg-background border border-input rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200',
      
      // Status Patterns
      badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      success: 'bg-status-online/10 text-status-online border border-status-online/20',
      error: 'bg-destructive/10 text-destructive border border-destructive/20',
      warning: 'bg-premium/10 text-premium border border-premium/20',
      info: 'bg-accent/10 text-accent-foreground border border-accent/20',
      
      // Loading Patterns
      loading: 'animate-pulse bg-muted rounded',
      skeleton: 'animate-pulse bg-muted/50 rounded',
      shimmer: 'bg-gradient-to-r from-muted via-muted/50 to-muted bg-size-200 animate-persian-shimmer',
      
      // Interactive Patterns  
      clickable: 'cursor-pointer select-none hover:scale-105 active:scale-95 transition-transform duration-200',
      hoverable: 'hover:bg-accent/50 hover:text-accent-foreground transition-colors duration-200',
      focusable: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      
      // Layout Patterns
      section: 'py-12 md:py-16 lg:py-20',
      container: 'container mx-auto px-4 sm:px-6 lg:px-8',
      grid: 'grid gap-6 md:gap-8',
      flex: 'flex items-center gap-4',
      
      // Persian Heritage Patterns
      luxury: 'bg-gradient-luxury text-white shadow-luxury hover:shadow-persian transition-all duration-500',
      heritage: 'bg-gradient-heritage border border-persian/20 shadow-heritage',
      glass: 'bg-gradient-glass backdrop-blur-md border border-white/20 shadow-glass',
      persian: 'bg-gradient-persian text-white shadow-persian hover:scale-105 transition-all duration-400'
    },
    
    // Animation Utilities
    animations: {
      enter: 'animate-fade-in',
      exit: 'animate-fade-out', 
      bounce: 'animate-bounce-in',
      slide: 'animate-slide-in-up',
      scale: 'animate-scale-in',
      glow: 'animate-pulse-glow',
      persian: 'animate-persian-glow',
      float: 'animate-persian-float',
      shimmer: 'animate-persian-shimmer'
    }
  };
};