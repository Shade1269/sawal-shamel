import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Unified Button Component
 * Single source of truth for all button styles across the platform
 */

const unifiedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[hsl(320,17%,82%)] disabled:text-[hsl(320,8%,52%)] disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Primary - عنابي ملكي
        primary: 'bg-primary text-primary-foreground hover:bg-[hsl(310,38%,30%)] active:bg-[hsl(323,57%,16%)] shadow-anaqati hover:shadow-anaqati-hover',
        // Secondary - زهري بودري
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[hsl(0,50%,80%)] active:bg-[hsl(0,50%,75%)] shadow-anaqati-pink',
        
        // Outline - شفاف مع إطار
        outline: 'border-2 border-primary bg-transparent text-primary hover:bg-secondary hover:border-secondary active:bg-secondary/80',
        // Ghost - شفاف
        ghost: 'bg-transparent text-foreground hover:bg-[hsl(15,50%,96%)] active:bg-[hsl(15,50%,94%)]',
        // Link
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
        
        // Luxury - ذهبي
        luxury: 'bg-accent text-white shadow-anaqati-gold hover:bg-[hsl(43,54%,45%)] hover:scale-[1.02]',
        // Persian - تدرج عنابي-زهري
        persian: 'bg-gradient-to-r from-primary to-secondary text-white shadow-anaqati-pink hover:scale-[1.02]',
        // Premium - تدرج ذهبي
        premium: 'bg-gradient-to-r from-primary via-accent to-primary text-white shadow-anaqati-gold hover:-translate-y-0.5',
        // Hero - تدرج كامل
        hero: 'bg-gradient-to-r from-primary to-accent text-white shadow-anaqati-gold hover:scale-[1.02]',
        
        // Status Colors
        success: 'bg-success text-white hover:bg-success/90 shadow-soft',
        warning: 'bg-warning text-white hover:bg-warning/90 shadow-soft',
        danger: 'bg-danger text-white hover:bg-danger/90 shadow-soft',
        
        // Glass
        glass: 'bg-white/80 backdrop-blur-md border border-border text-foreground shadow-soft hover:bg-white/90',
        'glass-primary': 'bg-white/80 backdrop-blur-md border-2 border-primary/30 text-primary hover:border-primary/60 hover:bg-white/90',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10 p-0 rounded-lg',
        'icon-sm': 'h-8 w-8 p-0 rounded-lg',
        'icon-lg': 'h-12 w-12 p-0 rounded-lg',
      },
      animation: {
        none: '',
        glow: 'hover:shadow-anaqati-gold',
        float: 'hover:-translate-y-1',
        scale: 'hover:scale-[1.02]',
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
