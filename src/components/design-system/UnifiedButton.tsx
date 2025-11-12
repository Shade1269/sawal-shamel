import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Unified Button Component
 * Single source of truth for all button styles across the platform
 */

const unifiedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-button font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary Actions
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-glow',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft',
        
        // Special Styles
        luxury: 'gradient-luxury text-luxury-foreground shadow-luxury hover:shadow-luxury hover:scale-105',
        persian: 'gradient-persian text-persian-foreground shadow-persian hover:shadow-persian hover:scale-105',
        premium: 'gradient-premium text-premium-foreground shadow-premium hover:shadow-premium hover:scale-105',
        hero: 'gradient-hero text-primary-foreground shadow-glow hover:shadow-glow hover:scale-105',
        
        // Status Colors
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow-soft',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-soft',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90 shadow-soft',
        
        // Neutral Styles
        outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary/10',
        ghost: 'bg-transparent hover:bg-muted/50 text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        
        // Glass Styles
        glass: 'glass-button text-foreground',
        'glass-primary': 'glass-button text-primary border-primary/30 hover:border-primary/60',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      animation: {
        none: '',
        glow: 'animate-glow-pulse',
        float: 'animate-float',
        scale: 'interactive-scale',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      animation: 'none',
    },
  }
);

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof unifiedButtonVariants> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          unifiedButtonVariants({ variant, size, animation }),
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

export { unifiedButtonVariants };
