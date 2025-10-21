import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const formItemVariants = cva(
  "space-y-2",
  {
    variants: {
      variant: {
        default: "",
        compact: "space-y-1",
        spaced: "space-y-4",
      },
      state: {
        default: "",
        error: "[&_input]:border-destructive [&_textarea]:border-destructive",
        success: "[&_input]:border-status-online [&_textarea]:border-status-online",
        warning: "[&_input]:border-premium [&_textarea]:border-premium",
      }
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

const EnhancedForm = FormProvider

const useEnhancedFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useEnhancedFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const EnhancedFormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const EnhancedFormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof formItemVariants> & {
    required?: boolean
  }
>(({ className, variant, state, required, children, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div 
        ref={ref} 
        className={cn(formItemVariants({ variant, state }), className)} 
        {...props} 
      >
        {children}
        {required && (
          <Badge variant="error" size="sm" className="ml-1">
            Required
          </Badge>
        )}
      </div>
    </FormItemContext.Provider>
  )
})
EnhancedFormItem.displayName = "EnhancedFormItem"

const EnhancedFormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & {
    required?: boolean
    optional?: boolean
    tooltip?: string
  }
>(({ className, required, optional, tooltip, children, ...props }, ref) => {
  const { error, formItemId } = useEnhancedFormField()

  return (
    <Label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="text-muted-foreground text-xs">(optional)</span>}
        {tooltip && (
          <div className="group relative">
            <svg className="h-3 w-3 text-muted-foreground cursor-help" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-background border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 max-w-xs">
              {tooltip}
            </div>
          </div>
        )}
      </div>
    </Label>
  )
})
EnhancedFormLabel.displayName = "EnhancedFormLabel"

const EnhancedFormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useEnhancedFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
EnhancedFormControl.displayName = "EnhancedFormControl"

const EnhancedFormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: "default" | "muted" | "subtle"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const { formDescriptionId } = useEnhancedFormField()

  const variantClasses = {
    default: "text-sm text-muted-foreground",
    muted: "text-xs text-muted-foreground/70",
    subtle: "text-xs text-muted-foreground/50"
  }

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
})
EnhancedFormDescription.displayName = "EnhancedFormDescription"

const EnhancedFormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: "error" | "success" | "warning" | "info"
  }
>(({ className, children, variant, ...props }, ref) => {
  const { error, formMessageId } = useEnhancedFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  const variantClasses = {
    error: "text-destructive",
    success: "text-status-online", 
    warning: "text-premium",
    info: "text-accent"
  }

  const finalVariant = variant || (error ? "error" : "info")

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-sm font-medium animate-fade-in",
        variantClasses[finalVariant],
        className
      )}
      {...props}
    >
      {body}
    </p>
  )
})
EnhancedFormMessage.displayName = "EnhancedFormMessage"

// Enhanced Input Field Component
interface EnhancedInputFieldProps {
  name: string
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  optional?: boolean
  tooltip?: string
  description?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  className?: string
}

const EnhancedInputField: React.FC<EnhancedInputFieldProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  required,
  optional,
  tooltip,
  description,
  leftIcon,
  rightIcon,
  loading,
  className
}) => {
  return (
    <EnhancedFormField
      name={name}
      render={({ field }) => (
        <EnhancedFormItem required={required} className={className}>
          {label && (
            <EnhancedFormLabel 
              required={required} 
              optional={optional}
              tooltip={tooltip}
            >
              {label}
            </EnhancedFormLabel>
          )}
          <EnhancedFormControl>
            <Input
              type={type}
              placeholder={placeholder}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
              loading={loading}
              {...field}
            />
          </EnhancedFormControl>
          {description && (
            <EnhancedFormDescription>
              {description}
            </EnhancedFormDescription>
          )}
          <EnhancedFormMessage />
        </EnhancedFormItem>
      )}
    />
  )
}

export {
  useEnhancedFormField,
  EnhancedForm,
  EnhancedFormItem,
  EnhancedFormLabel,
  EnhancedFormControl,
  EnhancedFormDescription,
  EnhancedFormMessage,
  EnhancedFormField,
  EnhancedInputField,
  formItemVariants,
}