import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const breadcrumbVariants = cva(
  "flex items-center text-sm font-medium",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        luxury: "text-luxury-foreground",
        persian: "text-persian-foreground", 
        glass: "text-foreground/80"
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface EnhancedBreadcrumbProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
}

const EnhancedBreadcrumb = React.forwardRef<HTMLElement, EnhancedBreadcrumbProps>(
  ({ className, variant, size, items, showHome = true, separator, ...props }, ref) => {
    const Separator = separator || <ChevronLeft className="h-4 w-4 mx-2 text-muted-foreground" />;
    
    const allItems = showHome 
      ? [{ label: 'الرئيسية', href: '/', icon: <Home className="h-4 w-4" /> }, ...items]
      : items;

    return (
      <nav
        className={cn("flex items-center space-x-1 rtl:space-x-reverse", className)}
        aria-label="Breadcrumb"
        ref={ref}
        {...props}
      >
        <ol className="inline-flex items-center">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            
            return (
              <li key={index} className="inline-flex items-center">
                {index > 0 && Separator}
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={cn(
                      breadcrumbVariants({ variant, size }),
                      "hover:text-primary transition-colors inline-flex items-center gap-1"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      breadcrumbVariants({ variant, size }),
                      isLast && "text-foreground font-semibold",
                      "inline-flex items-center gap-1"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.icon}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
EnhancedBreadcrumb.displayName = "EnhancedBreadcrumb";

export { EnhancedBreadcrumb, breadcrumbVariants };