import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Unified Input Component
 * Consistent input styling across the platform
 */

const unifiedInputVariants = cva(
  "flex w-full rounded-md border bg-background text-foreground transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost: "border-transparent bg-transparent hover:bg-accent/5",
        filled: "border-transparent bg-muted/50 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
      inputSize: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface UnifiedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof unifiedInputVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    type, 
    isLoading,
    leftIcon,
    rightIcon,
    error,
    helperText,
    disabled,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? "error" : variant;

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              unifiedInputVariants({ variant: finalVariant, inputSize }),
              leftIcon && "pl-10",
              (rightIcon || isLoading) && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
          />
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isLoading && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
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

UnifiedInput.displayName = "UnifiedInput";

export { UnifiedInput, unifiedInputVariants };
