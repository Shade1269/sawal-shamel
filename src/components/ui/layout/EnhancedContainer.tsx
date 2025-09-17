import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const containerVariants = cva(
  "w-full mx-auto px-4 sm:px-6 lg:px-8",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        md: "max-w-4xl", 
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-none",
        content: "max-w-3xl"
      },
      spacing: {
        none: "p-0",
        sm: "py-4",
        md: "py-8", 
        lg: "py-12",
        xl: "py-16"
      },
      background: {
        none: "",
        subtle: "bg-background/50",
        glass: "glass-effect",
        luxury: "luxury-effect",
        persian: "persian-effect"
      }
    },
    defaultVariants: {
      size: "lg",
      spacing: "md",
      background: "none"
    }
  }
);

export interface EnhancedContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  children: React.ReactNode;
}

const EnhancedContainer = React.forwardRef<HTMLDivElement, EnhancedContainerProps>(
  ({ className, size, spacing, background, children, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ size, spacing, background }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedContainer.displayName = "EnhancedContainer";

export { EnhancedContainer, containerVariants };