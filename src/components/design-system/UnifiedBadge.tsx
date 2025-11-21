import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Unified Badge Component
 * Single source of truth for all badges and status indicators
 */

const unifiedBadgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary/10 text-secondary-foreground border border-secondary/20',
        success: 'bg-status-online/10 text-status-online border border-status-online/20',
        warning: 'bg-premium/10 text-premium border border-premium/20',
        error: 'bg-destructive/10 text-destructive border border-destructive/20',
        info: 'bg-accent/10 text-accent-foreground border border-accent/20',
        glass: 'bg-background/50 backdrop-blur-md text-foreground border border-border/50',
        luxury: 'bg-gradient-luxury text-luxury-foreground border border-luxury/20 shadow-luxury',
        persian: 'bg-gradient-persian text-white border border-persian/30 shadow-persian',
        outline: 'bg-transparent text-foreground border border-border hover:bg-accent/10',
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        md: 'text-sm px-2.5 py-1 rounded-lg',
        lg: 'text-base px-3 py-1.5 rounded-lg',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        glow: 'animate-pulse-glow',
        bounce: 'animate-bounce-in',
        shimmer: 'animate-persian-shimmer',
      },
      interactive: {
        none: '',
        hover: 'hover:scale-105 hover:shadow-glow cursor-pointer',
        active: 'hover:scale-105 active:scale-95 hover:shadow-glow cursor-pointer',
      },
      pill: {
        true: 'rounded-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animation: 'none',
      interactive: 'none',
      pill: false,
    },
  }
);

export interface UnifiedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof unifiedBadgeVariants> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
  removable?: boolean;
  onRemove?: () => void;
}

export const UnifiedBadge = React.forwardRef<HTMLDivElement, UnifiedBadgeProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      interactive,
      pill,
      leadingIcon,
      trailingIcon,
      dot,
      dotColor,
      removable,
      onRemove,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          unifiedBadgeVariants({ variant, size, animation, interactive, pill }),
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Dot Indicator */}
        {dot && (
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: dotColor || 'currentColor' }}
          />
        )}

        {/* Leading Icon */}
        {leadingIcon && (
          <span className="flex-shrink-0">{leadingIcon}</span>
        )}

        {/* Content */}
        <span className="whitespace-nowrap">{children}</span>

        {/* Trailing Icon */}
        {trailingIcon && (
          <span className="flex-shrink-0">{trailingIcon}</span>
        )}

        {/* Remove Button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="flex-shrink-0 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

UnifiedBadge.displayName = 'UnifiedBadge';

export { unifiedBadgeVariants };
