import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const enhancedCardVariants = cva(
  "rounded-lg border shadow-soft transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        outline: "border-2 border-border bg-transparent",
        filled: "bg-muted border-transparent",
        gradient: "bg-gradient-to-br from-card to-muted border-border/50",
        
        // Persian Heritage Variants
        luxury: "bg-gradient-luxury text-white border-luxury/20 shadow-luxury",
        premium: "bg-gradient-premium text-white border-premium/20 shadow-elegant",
        persian: "bg-gradient-persian text-white border-persian/20 shadow-persian",
        heritage: "bg-gradient-heritage border-persian/30 shadow-heritage",
        glass: "bg-gradient-glass backdrop-blur-md border-white/20 shadow-glass",
        
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
        persian: "hover:shadow-persian hover:scale-105",
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