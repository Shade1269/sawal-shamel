import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Unified Card Component
 * Single source of truth for all card styles across the platform
 */

const unifiedCardVariants = cva(
  'rounded-card overflow-hidden transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border border-border shadow-card',
        glass: 'glass-card text-foreground',
        'glass-strong': 'glass-card-strong text-foreground',
        luxury: 'gradient-luxury text-luxury-foreground shadow-luxury',
        persian: 'gradient-persian text-persian-foreground shadow-persian',
        premium: 'gradient-premium text-premium-foreground shadow-premium',
        elegant: 'bg-card/95 backdrop-blur-sm text-card-foreground border border-border/50 shadow-elegant',
        flat: 'bg-muted/30 text-foreground border-none',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'interactive-lift cursor-pointer',
        glow: 'interactive-glow cursor-pointer',
        scale: 'interactive-scale cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
);

export interface UnifiedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof unifiedCardVariants> {
  clickable?: boolean;
}

export const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ className, variant, padding, hover, clickable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          unifiedCardVariants({ variant, padding, hover: clickable ? hover || 'lift' : hover }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UnifiedCard.displayName = 'UnifiedCard';

export const UnifiedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
));
UnifiedCardHeader.displayName = 'UnifiedCardHeader';

export const UnifiedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-bold heading-ar tracking-tight', className)}
    {...props}
  />
));
UnifiedCardTitle.displayName = 'UnifiedCardTitle';

export const UnifiedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm elegant-text text-muted-foreground', className)}
    {...props}
  />
));
UnifiedCardDescription.displayName = 'UnifiedCardDescription';

export const UnifiedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
UnifiedCardContent.displayName = 'UnifiedCardContent';

export const UnifiedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-border/50', className)}
    {...props}
  />
));
UnifiedCardFooter.displayName = 'UnifiedCardFooter';

export { unifiedCardVariants };
