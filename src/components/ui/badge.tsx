import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-105",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
        
        // Persian Heritage Variants
        luxury: "border-transparent bg-gradient-luxury text-white shadow-luxury hover:shadow-persian hover:scale-105",
        premium: "border-transparent bg-gradient-premium text-white shadow-elegant hover:shadow-glow",
        persian: "border-transparent bg-gradient-persian text-white shadow-persian hover:scale-105",
        heritage: "border-persian/20 bg-gradient-heritage text-white shadow-heritage",
        
        // Status Variants
        success: "border-transparent bg-status-online text-white hover:bg-status-online/90 hover:shadow-glow",
        warning: "border-transparent bg-premium text-white hover:bg-premium/90",
        error: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        info: "border-transparent bg-accent text-accent-foreground hover:bg-accent/90",
        
        // Style Variants
        glass: "border-white/20 bg-white/10 backdrop-blur-sm text-foreground hover:bg-white/20",
        gradient: "border-transparent bg-gradient-to-r from-primary to-accent text-white hover:scale-105",
        glow: "border-transparent bg-primary text-primary-foreground shadow-glow animate-pulse-glow",
        
        // Size-specific variants
        dot: "h-2 w-2 p-0 rounded-full",
        pill: "rounded-full px-3 py-1",
        square: "rounded-md aspect-square p-1",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-3 py-1 text-sm rounded-lg", 
        xl: "px-4 py-2 text-base rounded-xl font-bold",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce-in",
        glow: "animate-pulse-glow",
        float: "animate-persian-float",
        shimmer: "animate-persian-shimmer",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  closeable?: boolean
  onClose?: () => void
}

function Badge({ className, variant, size, animation, icon, closeable, onClose, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, animation }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {closeable && (
        <button
          onClick={onClose}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { Badge, badgeVariants }
