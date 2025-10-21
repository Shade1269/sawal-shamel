import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info, Clock, Loader2 } from 'lucide-react';

const statusVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
  {
    variants: {
      status: {
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20", 
        error: "bg-error/10 text-error border border-error/20",
        info: "bg-info/10 text-info border border-info/20",
        pending: "bg-muted/50 text-muted-foreground border border-muted",
        loading: "bg-primary/10 text-primary border border-primary/20"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base"
      },
      variant: {
        default: "",
        filled: "",
        outline: "bg-transparent",
        glass: "backdrop-blur-sm bg-background/50"
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        glow: "animate-pulse-glow",
        bounce: "animate-bounce"
      }
    },
    compoundVariants: [
      {
        status: "success",
        variant: "filled",
        class: "bg-success text-success-foreground border-success"
      },
      {
        status: "error", 
        variant: "filled",
        class: "bg-error text-error-foreground border-error"
      },
      {
        status: "warning",
        variant: "filled", 
        class: "bg-warning text-warning-foreground border-warning"
      },
      {
        status: "info",
        variant: "filled",
        class: "bg-info text-info-foreground border-info"
      }
    ],
    defaultVariants: {
      status: "info",
      size: "md",
      variant: "default",
      animation: "none"
    }
  }
);

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  pending: Clock,
  loading: Loader2
};

export interface EnhancedStatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  children?: React.ReactNode;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

const EnhancedStatusIndicator = React.forwardRef<HTMLDivElement, EnhancedStatusIndicatorProps>(
  ({ className, status = "info", size, variant, animation, children, showIcon = true, icon, ...props }, ref) => {
    const IconComponent = status && statusIcons[status];
    const isLoading = status === "loading";
    
    return (
      <div
        className={cn(statusVariants({ status, size, variant, animation }), className)}
        ref={ref}
        {...props}
      >
        {showIcon && (
          <>
            {icon || (IconComponent && (
              <IconComponent 
                className={cn(
                  "h-4 w-4",
                  size === "sm" && "h-3 w-3",
                  size === "lg" && "h-5 w-5",
                  isLoading && "animate-spin"
                )} 
              />
            ))}
          </>
        )}
        {children}
      </div>
    );
  }
);
EnhancedStatusIndicator.displayName = "EnhancedStatusIndicator";

export { EnhancedStatusIndicator, statusVariants };