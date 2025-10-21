import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5",
        6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
        auto: "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6", 
        xl: "gap-8",
        "2xl": "gap-12"
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
      cols: 3,
      gap: "md",
      align: "stretch",
      justify: "stretch"
    }
  }
);

export interface EnhancedGridProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  children: React.ReactNode;
  masonry?: boolean;
}

const EnhancedGrid = React.forwardRef<HTMLDivElement, EnhancedGridProps>(
  ({ className, cols, gap, align, justify, masonry, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          gridVariants({ cols, gap, align, justify }),
          masonry && "grid-flow-row-dense",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedGrid.displayName = "EnhancedGrid";

export { EnhancedGrid, gridVariants };