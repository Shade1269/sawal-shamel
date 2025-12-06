import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Unified Select Component
 * Single source of truth for all dropdown selects
 */

const unifiedSelectTriggerVariants = cva(
  'flex items-center justify-between w-full transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: [
          'bg-white border border-[hsl(20_30%_87%)] text-foreground',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-[3px] focus:ring-primary/10',
          'data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/10',
        ].join(' '),
        glass: [
          'bg-white/80 backdrop-blur-md border border-[hsl(20_30%_87%)]/50 text-foreground',
          'hover:bg-white/90 hover:border-primary/50',
          'focus:border-primary focus:ring-[3px] focus:ring-primary/15',
        ].join(' '),
        elevated: [
          'bg-white border border-[hsl(20_30%_87%)] text-foreground',
          'shadow-[0_2px_8px_hsl(320_42%_25%/0.06)]',
          'hover:shadow-[0_4px_16px_hsl(320_42%_25%/0.1)] hover:border-primary/50',
          'focus:shadow-[0_4px_16px_hsl(320_42%_25%/0.1)] focus:border-primary',
        ].join(' '),
        luxury: [
          'bg-gradient-to-br from-white to-[hsl(20_60%_98%)] border border-[hsl(20_30%_87%)]/50 text-foreground',
          'shadow-[0_4px_20px_hsl(320_42%_25%/0.08)]',
          'hover:shadow-[0_6px_24px_hsl(320_42%_25%/0.12)] hover:border-primary/50',
          'focus:border-primary',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm rounded-md',
        md: 'h-10 px-4 py-2 text-base rounded-lg',
        lg: 'h-12 px-5 py-3 text-lg rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const UnifiedSelect = SelectPrimitive.Root;
const UnifiedSelectGroup = SelectPrimitive.Group;
const UnifiedSelectValue = SelectPrimitive.Value;

interface UnifiedSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof unifiedSelectTriggerVariants> {}

const UnifiedSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  UnifiedSelectTriggerProps
>(({ className, variant, size, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(unifiedSelectTriggerVariants({ variant, size }), className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-[hsl(43_54%_51%)] transition-transform duration-200" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
UnifiedSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const UnifiedSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
UnifiedSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const UnifiedSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
UnifiedSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const UnifiedSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden',
        'rounded-lg border border-[hsl(20_30%_87%)] bg-white',
        'shadow-[0_8px_30px_hsl(320_42%_25%/0.08)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <UnifiedSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <UnifiedSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
UnifiedSelectContent.displayName = SelectPrimitive.Content.displayName;

const UnifiedSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold text-foreground', className)}
    {...props}
  />
));
UnifiedSelectLabel.displayName = SelectPrimitive.Label.displayName;

const UnifiedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center',
      'rounded-md py-2.5 pl-8 pr-3 text-sm outline-none',
      'text-foreground bg-white',
      'hover:bg-[hsl(0_60%_97%)] hover:text-primary',
      'focus:bg-[hsl(0_60%_97%)] focus:text-primary',
      'data-[state=checked]:bg-[hsl(0_62%_86%)] data-[state=checked]:text-primary data-[state=checked]:font-medium',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'transition-colors duration-150',
      // شريط جانبي ذهبي عند الـ hover
      'before:absolute before:right-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l',
      'before:bg-transparent hover:before:bg-[hsl(43_54%_51%)] focus:before:bg-[hsl(43_54%_51%)]',
      'before:transition-colors before:duration-150',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-[hsl(43_54%_51%)]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
UnifiedSelectItem.displayName = SelectPrimitive.Item.displayName;

const UnifiedSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1.5 h-px bg-[hsl(20_30%_87%)]', className)}
    {...props}
  />
));
UnifiedSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  UnifiedSelect,
  UnifiedSelectGroup,
  UnifiedSelectValue,
  UnifiedSelectTrigger,
  UnifiedSelectContent,
  UnifiedSelectLabel,
  UnifiedSelectItem,
  UnifiedSelectSeparator,
  UnifiedSelectScrollUpButton,
  UnifiedSelectScrollDownButton,
  unifiedSelectTriggerVariants,
};
