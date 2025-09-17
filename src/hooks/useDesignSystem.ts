/**
 * Enhanced Design System Hook v3.2
 * Version 3.2 - Complete Design System Access + Interactive Components System
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
      
      // Advanced v3.2 Interactive Patterns
      aiSearch: 'bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg hover:shadow-glow transition-all duration-300',
      smartForm: 'bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-soft focus-within:shadow-glow transition-all duration-300',
      performanceGood: 'bg-status-online/10 text-status-online border border-status-online/20 rounded-md px-2 py-1',
      performanceWarning: 'bg-premium/10 text-premium border border-premium/20 rounded-md px-2 py-1',
      performanceCritical: 'bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-2 py-1',
      
      // Animation Containers
      springAnimation: 'transform-gpu will-change-transform transition-transform duration-500 ease-out',
      parallaxContainer: 'transform-gpu will-change-transform',
      scrollTrigger: 'opacity-0 translate-y-8 transition-all duration-700 ease-out data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0',
      
      // Persian Heritage v3.2 Enhanced Patterns
      glass: 'bg-gradient-glass backdrop-blur-md border border-white/20 shadow-glass',
      luxuryCard: 'bg-gradient-luxury text-luxury-foreground border border-luxury/20 shadow-luxury backdrop-blur-md rounded-xl hover:shadow-persian hover:scale-105 transition-all duration-500',
      heritageButton: 'bg-gradient-heritage text-white shadow-heritage hover:shadow-luxury border border-persian/30 rounded-lg px-6 py-3 font-semibold transition-all duration-400',
      glassPanel: 'bg-gradient-glass backdrop-blur-xl border border-white/20 shadow-glass rounded-2xl p-6 hover:border-white/30 transition-all duration-300',
      persianAccent: 'bg-gradient-persian text-white shadow-persian rounded-lg hover:shadow-heritage hover:scale-105 transition-all duration-400'
    },
    
    // Animation Utilities v3.2 Enhanced
    animations: {
      // Basic Animations
      enter: 'animate-fade-in',
      exit: 'animate-fade-out', 
      bounce: 'animate-bounce-in',
      slide: 'animate-slide-in-up',
      scale: 'animate-scale-in',
      
      // Advanced Animations v3.2
      spring: 'transform-gpu transition-spring duration-700 ease-spring',
      parallax: 'transform-gpu will-change-transform',
      morphing: 'transition-all duration-500 ease-out will-change-transform',
      
      // Interactive Animations
      hover: 'hover:scale-105 hover:shadow-glow transition-all duration-300 ease-out',
      press: 'active:scale-95 transition-transform duration-150 ease-out',
      focus: 'focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200',
      
      // Status Animations
      loading: 'animate-pulse',
      success: 'animate-bounce-in text-status-online',
      error: 'animate-shake text-destructive',
      warning: 'animate-pulse text-premium',
      
      // Persian Heritage Animations v3.2
      glow: 'animate-pulse-glow',
      persian: 'animate-persian-glow',
      float: 'animate-persian-float',
      shimmer: 'animate-persian-shimmer',
      heritage: 'animate-heritage-pulse',
      luxury: 'animate-luxury-glow'
    },
    
    // v3.2 Performance Utilities
    performance: {
      gpu: 'transform-gpu',
      willChange: 'will-change-transform',
      optimized: 'transform-gpu will-change-transform backface-visibility-hidden',
      smooth: 'transition-all duration-300 ease-out',
      fast: 'transition-all duration-150 ease-out',
      slow: 'transition-all duration-700 ease-out'
    }
  };
};