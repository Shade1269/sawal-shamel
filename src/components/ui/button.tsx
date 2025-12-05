import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:bg-[hsl(320,17%,82%)] disabled:text-[hsl(320,8%,52%)] disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary Button - عنابي ملكي
        default: "bg-anaqati-burgundy text-white hover:bg-anaqati-burgundy-hover active:bg-anaqati-burgundy-active shadow-anaqati hover:shadow-anaqati-hover",
        // Destructive/Danger Button - أحمر
        destructive: "bg-anaqati-danger text-white hover:opacity-90 active:opacity-80",
        // Outline/Secondary Button - شفاف مع إطار عنابي
        outline: "border-2 border-anaqati-burgundy bg-transparent text-anaqati-burgundy hover:bg-anaqati-pink hover:border-anaqati-pink active:bg-anaqati-pink-hover",
        // Secondary Button - زهري بودري
        secondary: "bg-anaqati-pink text-anaqati-burgundy hover:bg-anaqati-pink-hover active:opacity-80",
        // Ghost Button - شفاف
        ghost: "bg-transparent text-foreground hover:bg-[hsl(15,50%,96%)] active:bg-[hsl(15,50%,94%)]",
        // Link Button
        link: "text-primary underline-offset-4 hover:underline",
        // Hero Gradient Button
        hero: "bg-gradient-to-r from-primary to-accent text-white hover:shadow-anaqati-gold transition-all duration-300 font-semibold",
        // Luxury Button - ذهبي
        luxury: "bg-accent text-white shadow-anaqati-gold hover:bg-[hsl(43,54%,45%)] hover:scale-[1.02] transition-all duration-300 font-bold",
        // Premium Button
        premium: "bg-gradient-to-r from-primary via-accent to-primary text-white shadow-soft hover:shadow-anaqati-gold hover:-translate-y-0.5 transition-all duration-300 font-semibold",
        // Persian Button
        persian: "bg-gradient-to-r from-primary to-secondary text-white shadow-anaqati-pink hover:scale-[1.02] transition-all duration-300 font-bold",
        // Commerce Button
        commerce: "bg-primary text-white shadow-elegant hover:bg-[hsl(310,38%,30%)] hover:-translate-y-0.5 transition-all duration-300 font-semibold",
        // Glass Button
        glass: "bg-white/80 backdrop-blur-md border border-border text-foreground shadow-soft hover:bg-white/90 transition-all duration-300",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
