import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';

/**
 * Unified Input Component
 * Single source of truth for all input fields
 */

const unifiedInputVariants = cva(
  'w-full transition-all duration-300 outline-none',
  {
    variants: {
      variant: {
        default: 'bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
        glass: 'bg-background/50 backdrop-blur-md border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-background/80',
        elevated: 'bg-card border border-border text-foreground placeholder:text-muted-foreground shadow-soft hover:shadow-glow focus:shadow-glow focus:border-primary',
        minimal: 'bg-transparent border-b-2 border-border text-foreground placeholder:text-muted-foreground focus:border-primary rounded-none px-0',
        luxury: 'bg-gradient-to-br from-background to-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-luxury',
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm rounded-md',
        md: 'h-10 px-4 py-2 text-base rounded-lg',
        lg: 'h-12 px-5 py-3 text-lg rounded-lg',
      },
      state: {
        default: '',
        error: 'border-destructive focus:ring-destructive/20 focus:border-destructive',
        success: 'border-status-online focus:ring-status-online/20 focus:border-status-online',
        warning: 'border-premium focus:ring-premium/20 focus:border-premium',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export interface UnifiedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof unifiedInputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  errorMessage?: string;
  successMessage?: string;
  helperText?: string;
}

export const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  (
    {
      className,
      variant,
      size,
      state: stateProp,
      leftIcon,
      rightIcon,
      loading,
      clearable,
      onClear,
      errorMessage,
      successMessage,
      helperText,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = props.value && String(props.value).length > 0;

    // Determine state based on messages
    const state = stateProp || (errorMessage ? 'error' : successMessage ? 'success' : 'default');

    const message = errorMessage || successMessage || helperText;

    return (
      <div className="w-full space-y-1.5">
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            disabled={disabled || loading}
            className={cn(
              unifiedInputVariants({ variant, size, state }),
              leftIcon && 'pl-10',
              (rightIcon || loading || (clearable && hasValue)) && 'pr-10',
              disabled && 'opacity-50 cursor-not-allowed',
              isFocused && 'animate-fade-in',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            )}

            {!loading && clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!loading && rightIcon && (
              <div className="text-muted-foreground">{rightIcon}</div>
            )}
          </div>
        </div>

        {/* Helper/Error/Success Message */}
        {message && (
          <p
            className={cn(
              'text-xs animate-fade-in',
              state === 'error' && 'text-destructive',
              state === 'success' && 'text-status-online',
              state === 'default' && 'text-muted-foreground'
            )}
          >
            {message}
          </p>
        )}
      </div>
    );
  }
);

UnifiedInput.displayName = 'UnifiedInput';

export { unifiedInputVariants };
