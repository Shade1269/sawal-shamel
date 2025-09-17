import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const sectionVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "bg-background",
        glass: "glass-effect",
        luxury: "luxury-effect", 
        persian: "persian-effect",
        gradient: "bg-gradient-persian",
        pattern: "bg-pattern-arabesque"
      },
      size: {
        sm: "py-8",
        md: "py-12",
        lg: "py-16", 
        xl: "py-20",
        hero: "py-24 md:py-32"
      },
      spacing: {
        none: "m-0",
        sm: "my-4",
        md: "my-8",
        lg: "my-12",
        xl: "my-16"
      },
      animation: {
        none: "",
        fade: "animate-fade-in",
        slide: "animate-slide-up",
        bounce: "animate-bounce-in",
        float: "animate-persian-float"
      },
      overflow: {
        visible: "overflow-visible",
        hidden: "overflow-hidden",
        auto: "overflow-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md", 
      spacing: "md",
      animation: "none",
      overflow: "visible"
    }
  }
);

export interface EnhancedSectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const EnhancedSection = React.forwardRef<HTMLElement, EnhancedSectionProps>(
  ({ className, variant, size, spacing, animation, overflow, fullWidth, children, ...props }, ref) => {
    return (
      <section
        className={cn(
          sectionVariants({ variant, size, spacing, animation, overflow }),
          fullWidth && "w-full",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </section>
    );
  }
);
EnhancedSection.displayName = "EnhancedSection";

export { EnhancedSection, sectionVariants };