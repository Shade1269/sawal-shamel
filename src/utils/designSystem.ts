/**
 * Enhanced Design System Utilities - نظام التصميم الموحد المطور
 * Version 2.0 - Persian Luxury Heritage Theme
 * يوفر ألوان وأنماط وحركات متسقة مع نظام التصميم الفارسي المحسن
 */

// Role Colors - ألوان الأدوار 
export const roleColors = {
  admin: 'bg-destructive/10 text-destructive',
  moderator: 'bg-accent/10 text-accent-foreground', 
  member: 'bg-muted text-muted-foreground',
  merchant: 'bg-luxury/10 text-luxury-foreground',
  affiliate: 'bg-premium/10 text-premium-foreground',
  customer: 'bg-secondary/10 text-secondary-foreground'
} as const;

// Status Colors - ألوان الحالة
export const statusColors = {
  online: 'text-status-online',
  offline: 'text-status-offline',
  active: 'text-accent',
  inactive: 'text-muted-foreground',
  success: 'text-status-online',
  error: 'text-destructive',
  warning: 'text-premium',
  info: 'text-accent'
} as const;

// Background Colors - ألوان الخلفية
export const backgroundColors = {
  primary: 'bg-primary',
  secondary: 'bg-secondary', 
  accent: 'bg-accent',
  muted: 'bg-muted',
  card: 'bg-card',
  overlay: 'bg-background/80',
  success: 'bg-status-online/10',
  error: 'bg-destructive/10',
  warning: 'bg-premium/10',
  info: 'bg-accent/10'
} as const;

// Text Colors - ألوان النصوص
export const textColors = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  accent: 'text-accent-foreground', 
  muted: 'text-muted-foreground',
  foreground: 'text-foreground',
  card: 'text-card-foreground',
  white: 'text-primary-foreground', // بدلاً من text-white
  dark: 'text-foreground' // بدلاً من text-black
} as const;

// Icon Colors - ألوان الأيقونات  
export const iconColors = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  accent: 'text-accent',
  muted: 'text-muted-foreground',
  success: 'text-status-online',
  error: 'text-destructive',
  warning: 'text-premium',
  info: 'text-turquoise'
} as const;

// Level Colors - ألوان المستويات
export const levelColors = {
  bronze: {
    bg: 'bg-bronze/10',
    text: 'text-bronze-foreground',
    border: 'border-bronze/20',
    gradient: 'from-bronze to-bronze-foreground'
  },
  silver: {
    bg: 'bg-muted',
    text: 'text-muted-foreground', 
    border: 'border-muted-foreground/20',
    gradient: 'from-muted to-muted-foreground'
  },
  gold: {
    bg: 'bg-premium/10',
    text: 'text-premium-foreground',
    border: 'border-premium/20', 
    gradient: 'from-premium to-premium-foreground'
  },
  legendary: {
    bg: 'bg-luxury/10',
    text: 'text-luxury-foreground',
    border: 'border-luxury/20',
    gradient: 'from-luxury to-luxury-foreground'
  }
} as const;

// Button Variants - أشكال الأزرار
export const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline'
} as const;

// Persian Theme Gradients - التدرجات الفارسية
export const gradients = {
  primary: 'bg-gradient-primary',
  hero: 'bg-gradient-hero', 
  luxury: 'bg-gradient-luxury',
  premium: 'bg-gradient-premium',
  persian: 'bg-gradient-persian',
  commerce: 'bg-gradient-commerce',
  heritage: 'bg-gradient-heritage',
  glass: 'bg-gradient-glass'
} as const;

// Shadows - الظلال
export const shadows = {
  soft: 'shadow-soft',
  glow: 'shadow-glow',
  luxury: 'shadow-luxury', 
  glass: 'shadow-glass',
  elegant: 'shadow-elegant',
  persian: 'shadow-persian',
  heritage: 'shadow-heritage'
} as const;

// Interactive Elements - العناصر التفاعلية
export const interactive = {
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    glow: 'hover:shadow-glow transition-shadow duration-300',
    lift: 'hover:-translate-y-1 transition-transform duration-200',
    brightness: 'hover:brightness-110 transition-all duration-200'
  },
  focus: {
    ring: 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
    outline: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    glow: 'focus:shadow-glow transition-shadow duration-200'
  },
  active: {
    scale: 'active:scale-95 transition-transform duration-100',
    press: 'active:translate-y-0.5 transition-transform duration-100'
  }
} as const;

// Spacing System - نظام المسافات
export const spacing = {
  none: 'space-y-0',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  '2xl': 'space-y-12',
  '3xl': 'space-y-16'
} as const;

// Layout Patterns - أنماط التخطيط
export const layout = {
  container: 'container mx-auto px-4',
  section: 'py-12 md:py-16 lg:py-20',
  card: 'bg-card border border-border rounded-lg p-6 shadow-soft',
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 md:grid-cols-2',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center'
  }
} as const;

// Typography Scale - مقياس الطباعة
export const typography = {
  display: {
    '4xl': 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    '3xl': 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
    '2xl': 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight',
    xl: 'text-xl md:text-2xl lg:text-3xl font-bold tracking-tight'
  },
  heading: {
    h1: 'text-3xl md:text-4xl font-bold tracking-tight',
    h2: 'text-2xl md:text-3xl font-semibold tracking-tight',
    h3: 'text-xl md:text-2xl font-semibold tracking-tight',
    h4: 'text-lg md:text-xl font-semibold',
    h5: 'text-base md:text-lg font-semibold',
    h6: 'text-sm md:text-base font-semibold'
  },
  body: {
    lg: 'text-lg leading-relaxed',
    md: 'text-base leading-relaxed',
    sm: 'text-sm leading-relaxed',
    xs: 'text-xs leading-relaxed'
  },
  special: {
    lead: 'text-lg md:text-xl leading-relaxed text-muted-foreground',
    caption: 'text-xs text-muted-foreground',
    overline: 'text-xs font-medium uppercase tracking-wider',
    code: 'font-mono text-sm bg-muted px-1.5 py-0.5 rounded'
  }
} as const;

// Enhanced Responsive Breakpoints Helper
export const responsive = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)', 
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)'
} as const;

// Helper Functions - دوال مساعدة محسنة

export const getRoleColor = (role: keyof typeof roleColors) => {
  return roleColors[role] || roleColors.member;
};

export const getStatusColor = (status: keyof typeof statusColors) => {
  return statusColors[status] || statusColors.inactive;
};

export const getLevelColor = (level: keyof typeof levelColors) => {
  return levelColors[level] || levelColors.bronze;
};

export const getIconColor = (type: keyof typeof iconColors) => {
  return iconColors[type] || iconColors.muted;
};

// New Helper Functions
export const getInteractiveClasses = (type: 'hover' | 'focus' | 'active' = 'hover') => {
  return interactive[type];
};

export const getLayoutClasses = (pattern: keyof typeof layout) => {
  return layout[pattern];
};

export const getTypographyClasses = (variant: string, size: string) => {
  const variantObj = typography[variant as keyof typeof typography];
  if (typeof variantObj === 'object') {
    return (variantObj as any)[size] || '';
  }
  return '';
};

export const combineClasses = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};