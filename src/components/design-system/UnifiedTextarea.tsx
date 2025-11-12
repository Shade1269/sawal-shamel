import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Unified Textarea Component
 * Consistent textarea styling across the platform
 */

const unifiedTextareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost: "border-transparent bg-transparent hover:bg-accent/5",
        filled: "border-transparent bg-muted/50 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring",
        error: "border-destructive focus-visible:ring-destructive",
      },
      textareaSize: {
        sm: "px-3 py-2 text-sm min-h-[60px]",
        default: "px-3 py-2 min-h-[80px]",
        lg: "px-4 py-3 text-lg min-h-[120px]",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "default",
    },
  }
);

export interface UnifiedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof unifiedTextareaVariants> {
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const UnifiedTextarea = React.forwardRef<HTMLTextAreaElement, UnifiedTextareaProps>(
  ({ 
    className, 
    variant, 
    textareaSize,
    error,
    helperText,
    maxLength,
    showCount = false,
    value,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? "error" : variant;
    const currentLength = value ? String(value).length : 0;

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <textarea
            className={cn(
              unifiedTextareaVariants({ variant: finalVariant, textareaSize }),
              showCount && maxLength && "pb-8",
              className
            )}
            ref={ref}
            maxLength={maxLength}
            value={value}
            {...props}
          />
          
          {showCount && maxLength && (
            <div className="absolute bottom-2 left-3 text-xs text-muted-foreground">
              {currentLength} / {maxLength}
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

UnifiedTextarea.displayName = "UnifiedTextarea";

export { UnifiedTextarea, unifiedTextareaVariants };
