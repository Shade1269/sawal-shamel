import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getResponsiveColumns } from '@/utils/deviceUtils';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const adaptiveGridVariants = cva(
  "grid transition-all duration-300 ease-out",
  {
    variants: {
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4", 
        lg: "gap-6",
        xl: "gap-8"
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch"
      },
      justify: {
        start: "justify-items-start",
        center: "justify-items-center",
        end: "justify-items-end", 
        stretch: "justify-items-stretch"
      }
    },
    defaultVariants: {
      gap: "md",
      align: "stretch",
      justify: "stretch"
    }
  }
);

export interface AdaptiveGridProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof adaptiveGridVariants> {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  maxColumns?: number;
  minItemWidth?: string;
  autoFit?: boolean;
}

export function AdaptiveGrid({ 
  className,
  gap,
  align,
  justify,
  children,
  columns,
  maxColumns = 4,
  minItemWidth = "250px",
  autoFit = false,
  ...props 
}: AdaptiveGridProps) {
  const device = useDeviceDetection();

  // Get responsive columns based on device
  const responsiveColumns = columns || {
    mobile: getResponsiveColumns(device, maxColumns),
    tablet: getResponsiveColumns(device, maxColumns), 
    desktop: maxColumns
  };

  // Generate grid classes
  const gridClasses = cn(
    adaptiveGridVariants({ gap, align, justify }),
    // Auto-fit grid or responsive columns
    autoFit 
      ? `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`
      : [
          `grid-cols-${responsiveColumns.mobile}`,
          `md:grid-cols-${responsiveColumns.tablet}`,
          `lg:grid-cols-${responsiveColumns.desktop}`
        ].join(' '),
    className
  );

  return (
    <div
      className={gridClasses}
      {...props}
    >
      {children}
    </div>
  );
}

// Utility component for grid items
interface AdaptiveGridItemProps {
  children: React.ReactNode;
  span?: {
    mobile?: number;
    tablet?: number; 
    desktop?: number;
  };
  className?: string;
}

export function AdaptiveGridItem({ 
  children, 
  span,
  className 
}: AdaptiveGridItemProps) {
  const spanClasses = span ? [
    span.mobile && `col-span-${span.mobile}`,
    span.tablet && `md:col-span-${span.tablet}`,
    span.desktop && `lg:col-span-${span.desktop}`
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={cn(spanClasses, className)}>
      {children}
    </div>
  );
}