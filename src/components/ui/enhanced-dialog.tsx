import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-300 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out sm:rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        glass: "bg-background/95 backdrop-blur-md border-white/20 shadow-glass",
        luxury: "bg-gradient-luxury text-white border-luxury/30 shadow-luxury",
        premium: "bg-gradient-premium text-white border-premium/30 shadow-elegant", 
        persian: "bg-gradient-persian text-white border-persian/30 shadow-persian",
        success: "bg-status-online/5 border-status-online/20 text-foreground",
        warning: "bg-premium/5 border-premium/20 text-foreground",
        error: "bg-destructive/5 border-destructive/20 text-foreground",
        info: "bg-accent/5 border-accent/20 text-foreground",
      },
      size: {
        sm: "max-w-sm p-4",
        default: "max-w-lg p-6",
        lg: "max-w-2xl p-6", 
        xl: "max-w-4xl p-8",
        full: "max-w-7xl w-[95vw] h-[95vh] p-6",
        auto: "max-w-fit p-6",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const EnhancedDialog = DialogPrimitive.Root

const EnhancedDialogTrigger = DialogPrimitive.Trigger

const EnhancedDialogPortal = DialogPrimitive.Portal

const EnhancedDialogClose = DialogPrimitive.Close

const EnhancedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    blur?: boolean
  }
>(({ className, blur = true, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      blur && "backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
EnhancedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const EnhancedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & 
    VariantProps<typeof dialogContentVariants> & {
      showClose?: boolean
      closeIcon?: React.ReactNode
    }
>(({ className, children, variant, size, showClose = true, closeIcon, ...props }, ref) => (
  <EnhancedDialogPortal>
    <EnhancedDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
          variant === "luxury" || variant === "premium" || variant === "persian" 
            ? "text-white hover:bg-white/20" 
            : "text-muted-foreground hover:bg-accent"
        )}>
          {closeIcon || <X className="h-4 w-4" />}
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </EnhancedDialogPortal>
))
EnhancedDialogContent.displayName = DialogPrimitive.Content.displayName

const EnhancedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
EnhancedDialogHeader.displayName = "EnhancedDialogHeader"

const EnhancedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2",
      className
    )}
    {...props}
  />
)
EnhancedDialogFooter.displayName = "EnhancedDialogFooter"

const EnhancedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
EnhancedDialogTitle.displayName = DialogPrimitive.Title.displayName

const EnhancedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedDialogDescription.displayName = DialogPrimitive.Description.displayName

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: VariantProps<typeof dialogContentVariants>['variant']
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  children?: React.ReactNode
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel", 
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
  children
}) => {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onOpenChange?.(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  return (
    <EnhancedDialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <EnhancedDialogTrigger asChild>
          {children}
        </EnhancedDialogTrigger>
      )}
      <EnhancedDialogContent variant={variant} size="sm">
        <EnhancedDialogHeader>
          <EnhancedDialogTitle>{title}</EnhancedDialogTitle>
          {description && (
            <EnhancedDialogDescription>{description}</EnhancedDialogDescription>
          )}
        </EnhancedDialogHeader>
        <EnhancedDialogFooter>
          <EnhancedDialogClose asChild>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </button>
          </EnhancedDialogClose>
          <button
            onClick={handleConfirm}
            disabled={isLoading || loading}
            className={cn(
              "px-4 py-2 text-sm rounded-md transition-colors font-medium",
              variant === "error" || variant === "warning"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              (isLoading || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading || loading ? "Loading..." : confirmText}
          </button>
        </EnhancedDialogFooter>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export {
  EnhancedDialog,
  EnhancedDialogPortal,
  EnhancedDialogOverlay,
  EnhancedDialogClose,
  EnhancedDialogTrigger,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogFooter,
  EnhancedDialogTitle,
  EnhancedDialogDescription,
  ConfirmationDialog,
  dialogContentVariants
}