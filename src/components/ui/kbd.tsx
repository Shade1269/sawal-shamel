import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
  {
    variants: {
      variant: {
        default: "border-border bg-muted",
        outline: "border-2",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "border-transparent bg-transparent",
      },
      size: {
        default: "h-5 px-1.5 text-[10px]",
        sm: "h-4 px-1 text-[9px]",
        lg: "h-6 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {}

function Kbd({ className, variant, size, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(kbdVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Kbd, kbdVariants }