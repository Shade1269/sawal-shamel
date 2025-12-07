import * as React from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDesignSystem } from "@/hooks/useDesignSystem"

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "primary" | "luxury" | "persian"
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  className
}) => {
  const { patterns: _patterns } = useDesignSystem()
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  const variantClasses = {
    default: "text-primary",
    primary: "text-primary animate-pulse-glow",
    luxury: "text-luxury animate-persian-glow",
    persian: "text-persian animate-persian-shimmer"
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  )
}

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  variant?: "default" | "luxury" | "glass"
  children: React.ReactNode
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Loading...",
  variant = "default",
  children
}) => {
  const { patterns } = useDesignSystem()

  const overlayVariants = {
    default: "bg-background/80 backdrop-blur-sm",
    luxury: "bg-gradient-luxury/20 backdrop-blur-md",
    glass: patterns.glass
  }

  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center",
          overlayVariants[variant],
          "animate-fade-in"
        )}>
          <LoadingSpinner 
            size="lg" 
            variant={variant === "luxury" ? "luxury" : "primary"} 
          />
          {text && (
            <p className="mt-4 text-sm font-medium text-foreground animate-pulse">
              {text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "avatar" | "image" | "card"
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  const { patterns } = useDesignSystem()

  const variantClasses = {
    default: "h-4 w-full rounded",
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full",
    image: "aspect-video w-full rounded-lg",
    card: "h-48 w-full rounded-lg"
  }

  return (
    <div
      className={cn(
        patterns.skeleton,
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

// Loading Card Component
interface LoadingCardProps {
  lines?: number
  showAvatar?: boolean
  showImage?: boolean
  className?: string
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  showImage = false,
  className
}) => {
  const { patterns } = useDesignSystem()

  return (
    <div className={cn(patterns.card, "animate-fade-in", className)}>
      {showImage && <Skeleton variant="image" className="mb-4" />}
      
      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Skeleton variant="avatar" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "h-4",
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading State with Retry
interface LoadingStateProps {
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  emptyComponent: _emptyComponent
}) => {
  const { patterns, helpers: _helpers } = useDesignSystem()

  if (error) {
    return (
      <div className={cn(
        patterns.card,
        patterns.error,
        "text-center animate-fade-in"
      )}>
        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              patterns.button,
              "text-sm px-4 py-2 rounded-lg"
            )}
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return loadingComponent || (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingCard key={i} showAvatar lines={2} />
        ))}
      </div>
    )
  }

  return <>{children}</>
}

// Export all components
export {
  LoadingSpinner as Spinner,
  LoadingOverlay as Overlay,
  LoadingCard as Card,
  LoadingState as State
}