import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getFormSpacing, getTouchFriendlySize } from '@/utils/deviceUtils';
import { cn } from '@/lib/utils';

interface AdaptiveFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function AdaptiveForm({ 
  children, 
  className,
  onSubmit 
}: AdaptiveFormProps) {
  const device = useDeviceDetection();
  const formSpacing = getFormSpacing(device);

  return (
    <form 
      className={cn(formSpacing.fieldSpacing, className)}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}

interface AdaptiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function AdaptiveInput({
  label,
  error,
  helperText,
  className,
  ...props
}: AdaptiveInputProps) {
  const device = useDeviceDetection();
  const formSpacing = getFormSpacing(device);
  const touchSize = getTouchFriendlySize(device);

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className={cn(
            "text-sm font-medium text-foreground",
            formSpacing.labelSpacing
          )}
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <input
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          formSpacing.inputHeight,
          formSpacing.inputPadding,
          touchSize.fontSize,
          error && "border-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
}