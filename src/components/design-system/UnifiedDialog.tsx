import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * Unified Dialog Component
 * Single source of truth for all modal dialogs
 */

const unifiedDialogVariants = cva(
  'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-h-[85vh] overflow-y-auto',
  {
    variants: {
      variant: {
        default: 'bg-background border border-border shadow-2xl',
        glass: 'bg-background/80 backdrop-blur-xl border border-border/50 shadow-glass',
        luxury: 'bg-gradient-luxury border border-luxury/20 shadow-luxury',
        elevated: 'bg-card shadow-persian',
      },
      size: {
        sm: 'max-w-sm rounded-lg',
        md: 'max-w-md rounded-xl',
        lg: 'max-w-2xl rounded-xl',
        xl: 'max-w-4xl rounded-2xl',
        full: 'max-w-[95vw] max-h-[95vh] rounded-2xl',
      },
      animation: {
        fade: 'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        scale: 'data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out',
        slide: 'data-[state=open]:animate-slide-in-up data-[state=closed]:animate-fade-out',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animation: 'scale',
    },
  }
);

const UnifiedDialog = DialogPrimitive.Root;
const UnifiedDialogTrigger = DialogPrimitive.Trigger;
const UnifiedDialogPortal = DialogPrimitive.Portal;
const UnifiedDialogClose = DialogPrimitive.Close;

const UnifiedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
      'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      className
    )}
    {...props}
  />
));
UnifiedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface UnifiedDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof unifiedDialogVariants> {
  showClose?: boolean;
}

const UnifiedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  UnifiedDialogContentProps
>(({ className, variant, size, animation, showClose = true, children, ...props }, ref) => (
  <UnifiedDialogPortal>
    <UnifiedDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(unifiedDialogVariants({ variant, size, animation }), className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-5 w-5" />
          <span className="sr-only">إغلاق</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </UnifiedDialogPortal>
));
UnifiedDialogContent.displayName = DialogPrimitive.Content.displayName;

const UnifiedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-2 text-right p-6 pb-4', className)}
    {...props}
  />
);
UnifiedDialogHeader.displayName = 'UnifiedDialogHeader';

const UnifiedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-row-reverse items-center gap-3 p-6 pt-4 border-t border-border',
      className
    )}
    {...props}
  />
);
UnifiedDialogFooter.displayName = 'UnifiedDialogFooter';

const UnifiedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-2xl font-bold text-foreground text-right', className)}
    {...props}
  />
));
UnifiedDialogTitle.displayName = DialogPrimitive.Title.displayName;

const UnifiedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground text-right', className)}
    {...props}
  />
));
UnifiedDialogDescription.displayName = DialogPrimitive.Description.displayName;

const UnifiedDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4', className)} {...props} />
);
UnifiedDialogBody.displayName = 'UnifiedDialogBody';

export {
  UnifiedDialog,
  UnifiedDialogTrigger,
  UnifiedDialogContent,
  UnifiedDialogHeader,
  UnifiedDialogFooter,
  UnifiedDialogTitle,
  UnifiedDialogDescription,
  UnifiedDialogBody,
  UnifiedDialogClose,
  unifiedDialogVariants,
};
