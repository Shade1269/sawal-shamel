import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const enhancedCardVariants = cva(
  "rounded-xl border shadow-soft transition-all duration-300 will-change-transform will-change-filter",
  {
    variants: {
      variant: {
        // Light-first defaults with dark overrides for clarity
        default: "bg-white/95 text-foreground border-slate-200 shadow-lg backdrop-blur-sm dark:bg-card/90 dark:text-card-foreground dark:border-border/60",
        outline: "border-2 border-border bg-transparent",
        filled: "bg-muted border-transparent",
        gradient: "gradient-card-primary border-border/40",
        
        // Persian Heritage Variants
        luxury: "bg-gradient-luxury text-white border-luxury/30 shadow-luxury",
        premium: "bg-gradient-premium text-white border-premium/30 shadow-elegant",
        persian: "bg-gradient-persian text-white border-persian/30 shadow-persian",
        heritage: "bg-gradient-heritage border-persian/30 shadow-heritage",
        // Glass: bright in light, dark translucent in dark
        glass: "backdrop-blur-md shadow-lg bg-white/92 border-slate-200 text-slate-900 dark:bg-slate-900/60 dark:border-slate-700/60 dark:text-slate-100 dark:shadow-glass",
        
        // Status Variants
        success: "bg-status-online/5 border-status-online/20 text-foreground",
        warning: "bg-premium/5 border-premium/20 text-foreground", 
        error: "bg-destructive/5 border-destructive/20 text-foreground",
        info: "bg-accent/5 border-accent/20 text-foreground",
      },
      size: {
        sm: "p-4",
        md: "p-6", 
        lg: "p-8",
        xl: "p-10"
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-glow",
        glow: "hover:shadow-glow",
        scale: "hover:scale-[1.02]",
        persian: "hover:shadow-persian hover:scale-[1.03]",
        luxury: "hover:shadow-luxury hover:-translate-y-2"
      },
      clickable: {
        true: "cursor-pointer select-none active:scale-95",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: "none", 
      clickable: false
    },
  }
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  asChild?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, hover, clickable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(enhancedCardVariants({ variant, size, hover, clickable, className }))}
      {...props}
    />
  )
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("flex-1", className)} 
    {...props} 
  />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent,
  enhancedCardVariants
}