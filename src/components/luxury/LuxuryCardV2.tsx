import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const luxuryCardVariants = cva(
  "rounded-2xl transition-all duration-500",
  {
    variants: {
      variant: {
        default: "border-2 border-red-600/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_rgba(196,30,58,0.25),0_0_24px_rgba(196,30,58,0.15)] hover:border-red-600/35",
        
        glass: "border-2 border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-800/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_12px_48px_rgba(255,255,255,0.1)]",
        
        glow: "border-2 border-red-600/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/95 backdrop-blur-xl shadow-[0_0_32px_rgba(196,30,58,0.4),0_0_64px_rgba(196,30,58,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_48px_rgba(196,30,58,0.6),0_0_96px_rgba(196,30,58,0.3)] animate-ferrari-glow",
        
        metallic: "border-2 border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_rgba(192,197,206,0.2)] [&::before]:animate-metallic-shimmer",
        
        solid: "border-2 border-slate-700 bg-slate-900 shadow-2xl hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)]"
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10"
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-2",
        scale: "hover:scale-[1.02]",
        glow: "hover:shadow-[0_0_32px_rgba(196,30,58,0.6)]",
        both: "hover:-translate-y-2 hover:scale-[1.02]"
      },
      animated: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: "lift",
      animated: true
    }
  }
);

export interface LuxuryCardV2Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof luxuryCardVariants> {
  asChild?: boolean;
}

const LuxuryCardV2 = React.forwardRef<HTMLDivElement, LuxuryCardV2Props>(
  ({ className, variant, size, hover, animated, children, ...props }, ref) => {
    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(luxuryCardVariants({ variant, size, hover }), className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(luxuryCardVariants({ variant, size, hover }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LuxuryCardV2.displayName = "LuxuryCardV2";

const LuxuryCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 pb-4", className)}
    {...props}
  />
));
LuxuryCardHeader.displayName = "LuxuryCardHeader";

const LuxuryCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
));
LuxuryCardTitle.displayName = "LuxuryCardTitle";

const LuxuryCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-300", className)}
    {...props}
  />
));
LuxuryCardDescription.displayName = "LuxuryCardDescription";

const LuxuryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1", className)} {...props} />
));
LuxuryCardContent.displayName = "LuxuryCardContent";

const LuxuryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
LuxuryCardFooter.displayName = "LuxuryCardFooter";

export {
  LuxuryCardV2,
  LuxuryCardHeader,
  LuxuryCardTitle,
  LuxuryCardDescription,
  LuxuryCardContent,
  LuxuryCardFooter,
  luxuryCardVariants
};
