import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * Unified Select Component
 * Consistent select styling across the platform
 */

const unifiedSelectVariants = cva(
  "flex w-full items-center justify-between rounded-md border bg-background text-foreground transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost: "border-transparent bg-transparent hover:bg-accent/5",
        filled: "border-transparent bg-muted/50 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring",
        error: "border-destructive focus-visible:ring-destructive",
      },
      selectSize: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      selectSize: "default",
    },
  }
);

export interface UnifiedSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof unifiedSelectVariants> {
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

const UnifiedSelect = React.forwardRef<HTMLSelectElement, UnifiedSelectProps>(
  ({ 
    className, 
    variant, 
    selectSize,
    error,
    helperText,
    leftIcon,
    children,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? "error" : variant;

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          
          <select
            className={cn(
              unifiedSelectVariants({ variant: finalVariant, selectSize }),
              leftIcon && "pl-10",
              "pr-10", // Always add right padding for chevron
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            "text-sm",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

UnifiedSelect.displayName = "UnifiedSelect";

export { UnifiedSelect, unifiedSelectVariants };
