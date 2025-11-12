import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const responsiveLayoutVariants = cva(
  "w-full transition-all duration-300 ease-persian",
  {
    variants: {
      variant: {
        default: "bg-background",
        // Make glass bright in light mode and keep translucent dark in dark mode
        glass: "glass-effect bg-white/80 border border-slate-200/60 shadow-lg dark:border-border/30 dark:bg-transparent",
        luxury: "luxury-effect",
        persian: "persian-effect"
      },
      spacing: {
        none: "p-0",
        sm: "p-2 md:p-4",
        md: "p-4 md:p-6",
        lg: "p-6 md:p-8",
        xl: "p-8 md:p-12"
      },
      breakpoint: {
        mobile: "block md:hidden",
        tablet: "hidden md:block lg:hidden",
        desktop: "hidden lg:block",
        all: "block"
      }
    },
    defaultVariants: {
      variant: "default",
      spacing: "md",
      breakpoint: "all"
    }
  }
);

interface ResponsiveColumnProps {
  children: React.ReactNode;
  span?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  offset?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  order?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

const ResponsiveColumn: React.FC<ResponsiveColumnProps> = ({
  children,
  span = { mobile: 12, tablet: 6, desktop: 4 },
  offset = {},
  order = {},
  className
}) => {
  const spanClasses = [
    span.mobile && `col-span-${span.mobile}`,
    span.tablet && `md:col-span-${span.tablet}`,
    span.desktop && `lg:col-span-${span.desktop}`
  ].filter(Boolean).join(' ');

  const offsetClasses = [
    offset.mobile && `col-start-${offset.mobile + 1}`,
    offset.tablet && `md:col-start-${offset.tablet + 1}`,
    offset.desktop && `lg:col-start-${offset.desktop + 1}`
  ].filter(Boolean).join(' ');

  const orderClasses = [
    order.mobile && `order-${order.mobile}`,
    order.tablet && `md:order-${order.tablet}`,
    order.desktop && `lg:order-${order.desktop}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(spanClasses, offsetClasses, orderClasses, className)}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  className
}) => {
  const gridClasses = [
    `grid`,
    columns.mobile && `grid-cols-${columns.mobile}`,
    columns.tablet && `md:grid-cols-${columns.tablet}`,
    columns.desktop && `lg:grid-cols-${columns.desktop}`,
    gap.mobile && `gap-${gap.mobile}`,
    gap.tablet && `md:gap-${gap.tablet}`,
    gap.desktop && `lg:gap-${gap.desktop}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};

export interface ResponsiveLayoutProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof responsiveLayoutVariants> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
}

const ResponsiveLayout = React.forwardRef<HTMLDivElement, ResponsiveLayoutProps>(
  ({ 
    className,
    variant,
    spacing,
    breakpoint,
    children,
    maxWidth = 'lg',
    centerContent = true,
    stickyHeader = false,
    stickyFooter = false,
    ...props 
  }, ref) => {
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile();
    const isTablet = !isMobile; // Simplified for now

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <div className="animate-pulse bg-muted h-screen" />;
    }

    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
      full: 'max-w-none'
    };

    return (
      <div
        className={cn(
          responsiveLayoutVariants({ variant, spacing, breakpoint }),
          maxWidthClasses[maxWidth],
          centerContent && 'mx-auto',
          'min-h-screen flex flex-col',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Responsive Content */}
        <div className="flex-1 w-full">
          {children}
        </div>

        {/* Development Helper - Show current breakpoint */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-50 px-2 py-1 bg-black/80 text-white text-xs rounded">
            {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
          </div>
        )}
      </div>
    );
  }
);
ResponsiveLayout.displayName = "ResponsiveLayout";

// Responsive Show/Hide Components
const ShowOnMobile: React.FC<{ children: React.ReactNode; className?: string }> = 
  ({ children, className }) => (
    <div className={cn("block md:hidden", className)}>{children}</div>
  );

const ShowOnTablet: React.FC<{ children: React.ReactNode; className?: string }> = 
  ({ children, className }) => (
    <div className={cn("hidden md:block lg:hidden", className)}>{children}</div>
  );

const ShowOnDesktop: React.FC<{ children: React.ReactNode; className?: string }> = 
  ({ children, className }) => (
    <div className={cn("hidden lg:block", className)}>{children}</div>
  );

const HideOnMobile: React.FC<{ children: React.ReactNode; className?: string }> = 
  ({ children, className }) => (
    <div className={cn("hidden md:block", className)}>{children}</div>
  );

export { 
  ResponsiveLayout, 
  ResponsiveGrid, 
  ResponsiveColumn,
  ShowOnMobile,
  ShowOnTablet, 
  ShowOnDesktop,
  HideOnMobile,
  responsiveLayoutVariants 
};