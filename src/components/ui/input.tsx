import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input hover:border-primary/50",
        luxury: "border-luxury/20 bg-luxury/5 focus-visible:ring-luxury focus-visible:border-luxury",
        premium: "border-premium/20 bg-premium/5 focus-visible:ring-premium focus-visible:border-premium",
        success: "border-status-online/50 bg-status-online/5 focus-visible:ring-status-online",
        error: "border-destructive/50 bg-destructive/5 focus-visible:ring-destructive",
        warning: "border-premium/50 bg-premium/5 focus-visible:ring-premium",
        glass: "border-white/20 bg-white/5 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-3 py-2 md:text-sm",
        sm: "h-8 px-2 py-1 text-xs rounded",
        lg: "h-12 px-4 py-3 text-base rounded-lg",
        xl: "h-14 px-6 py-4 text-lg rounded-xl",
      },
      state: {
        default: "",
        focused: "ring-2 ring-primary ring-offset-2",
        invalid: "border-destructive focus-visible:ring-destructive",
        valid: "border-status-online focus-visible:ring-status-online",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, state, leftIcon, rightIcon, loading, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size, state }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
