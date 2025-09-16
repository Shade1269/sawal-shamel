import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-lg px-3 py-2 text-sm shadow-md animate-fade-in",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        
        // Persian Heritage Variants
        luxury: "bg-gradient-luxury text-white shadow-luxury",
        premium: "bg-gradient-premium text-white shadow-elegant",
        persian: "bg-gradient-persian text-white shadow-persian",
        
        // Glass Effect
        glass: "bg-background/95 backdrop-blur-md border border-border text-foreground shadow-glass",
        
        // Status Variants
        success: "bg-status-online text-white shadow-glow",
        warning: "bg-premium text-white shadow-soft",
        error: "bg-destructive text-destructive-foreground shadow-soft",
        info: "bg-accent text-accent-foreground shadow-soft",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface EnhancedTooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  disabled?: boolean
  className?: string
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  children,
  content,
  variant,
  size,
  side = "top",
  align = "center",
  delayDuration = 400,
  disabled = false,
  className,
}) => {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(tooltipVariants({ variant, size }), className)}
            sideOffset={4}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-current" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// Quick Tooltip Component for common use cases
interface QuickTooltipProps {
  text: string
  children: React.ReactNode
  variant?: VariantProps<typeof tooltipVariants>['variant']
}

const QuickTooltip: React.FC<QuickTooltipProps> = ({ 
  text, 
  children, 
  variant = "default" 
}) => {
  return (
    <EnhancedTooltip content={text} variant={variant}>
      {children}
    </EnhancedTooltip>
  )
}

// Info Tooltip with Icon
interface InfoTooltipProps {
  title?: string
  description: string
  children?: React.ReactNode
  variant?: VariantProps<typeof tooltipVariants>['variant']
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  title, 
  description, 
  children,
  variant = "glass" 
}) => {
  const content = (
    <div className="space-y-1 max-w-xs">
      {title && <div className="font-semibold">{title}</div>}
      <div className="text-sm opacity-90">{description}</div>
    </div>
  )

  return (
    <EnhancedTooltip content={content} variant={variant} size="lg">
      {children || (
        <button className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </EnhancedTooltip>
  )
}

export { 
  EnhancedTooltip, 
  QuickTooltip, 
  InfoTooltip,
  tooltipVariants 
}