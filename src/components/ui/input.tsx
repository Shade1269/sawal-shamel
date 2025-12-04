import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl border bg-white text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-anaqati-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-anaqati-border hover:border-primary/50 focus-visible:border-primary",
        luxury: "border-anaqati-accent/30 bg-anaqati-accent/5 focus-visible:ring-anaqati-accent focus-visible:border-anaqati-accent",
        premium: "border-premium/20 bg-premium/5 focus-visible:ring-premium focus-visible:border-premium",
        success: "border-anaqati-success/50 bg-anaqati-success/5 focus-visible:ring-anaqati-success",
        error: "border-anaqati-danger/50 bg-anaqati-danger/5 focus-visible:ring-anaqati-danger",
        warning: "border-anaqati-warning/50 bg-anaqati-warning/5 focus-visible:ring-anaqati-warning",
        glass: "border-white/20 bg-white/5 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-3 py-2 md:text-sm",
        sm: "h-8 px-2 py-1 text-xs rounded-lg",
        lg: "h-12 px-4 py-3 text-base rounded-xl",
        xl: "h-14 px-6 py-4 text-lg rounded-xl",
      },
      state: {
        default: "",
        focused: "ring-2 ring-primary ring-offset-2",
        invalid: "border-anaqati-danger focus-visible:ring-anaqati-danger",
        valid: "border-anaqati-success focus-visible:ring-anaqati-success",
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
