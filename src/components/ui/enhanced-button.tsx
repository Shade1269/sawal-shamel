import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 will-change-transform will-change-filter [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow",
        outline: "border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-soft",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        
        // Persian Heritage Variants
        hero: "bg-gradient-hero text-white hover:shadow-glow hover:scale-105 transition-all duration-500 font-semibold shadow-soft",
        luxury: "bg-gradient-luxury text-white shadow-luxury hover:shadow-persian hover:scale-105 transition-all duration-500 font-bold",
        premium: "bg-gradient-premium text-white shadow-elegant hover:shadow-glow hover:-translate-y-1 transition-all duration-400 font-semibold",
        persian: "bg-gradient-persian text-white shadow-persian hover:shadow-glow hover:scale-105 transition-all duration-400 font-bold",
        commerce: "bg-gradient-commerce text-white shadow-elegant hover:shadow-persian hover:-translate-y-0.5 transition-all duration-300 font-semibold",
        glass: "bg-gradient-glass backdrop-blur-md border border-white/30 text-foreground shadow-glass hover:bg-white/15 transition-all duration-300",
        
        // Status Variants
        success: "bg-status-online text-white hover:bg-status-online/90 hover:shadow-glow",
        warning: "bg-premium text-white hover:bg-premium/90 hover:shadow-glow",
        info: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-soft",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        xl: "h-14 rounded-xl px-10 text-lg font-bold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce-in",
        float: "hover:animate-persian-float",
        glow: "hover:animate-pulse-glow",
        shimmer: "animate-persian-shimmer",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none"
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation, 
    asChild = false, 
    loading = false, 
    loadingText = "Loading...",
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-1">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-1">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants }