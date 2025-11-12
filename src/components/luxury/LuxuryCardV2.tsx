import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const luxuryCardVariants = cva(
  "rounded-2xl transition-all duration-500",
  {
    variants: {
      variant: {
        default: "border border-red-600/15 bg-gradient-to-br from-slate-900/98 via-slate-900/96 to-slate-800/98 backdrop-blur-sm shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-red-600/15 hover:border-red-600/25",
        
        glass: "border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-800/70 backdrop-blur-md shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-white/10",
        
        glow: "border border-red-600/20 bg-gradient-to-br from-slate-900/98 via-slate-900/96 to-slate-800/98 backdrop-blur-sm shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 animate-ferrari-glow",
        
        metallic: "border border-slate-600/20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-slate-600/20",
        
        solid: "border border-slate-700/80 bg-slate-900 shadow-lg hover:shadow-xl hover:shadow-black/50"
      },
      size: {
        sm: "p-5",
        md: "p-7",
        lg: "p-9",
        xl: "p-12"
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.01]",
        glow: "hover:shadow-red-600/35",
        both: "hover:-translate-y-1 hover:scale-[1.01]"
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
          transition={{ duration: 0.5 }}
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
    className={cn("flex flex-col space-y-3 pb-5", className)}
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
    className={cn("flex items-center pt-5", className)}
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
