import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getContainerSpacing } from '@/utils/deviceUtils';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const adaptiveContainerVariants = cva(
  "w-full transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-background",
        card: "bg-card border rounded-lg shadow-sm",
        glass: "bg-card/80 backdrop-blur-sm border rounded-lg",
        minimal: "bg-transparent"
      },
      fullWidth: {
        true: "w-full",
        false: "max-w-screen-xl mx-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      fullWidth: false
    }
  }
);

export interface AdaptiveContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof adaptiveContainerVariants> {
  children: React.ReactNode;
  centerContent?: boolean;
  scrollable?: boolean;
}

export function AdaptiveContainer({ 
  className,
  variant,
  fullWidth,
  children,
  centerContent = false,
  scrollable = false,
  ...props 
}: AdaptiveContainerProps) {
  const device = useDeviceDetection();
  const containerSpacing = getContainerSpacing(device);

  return (
    <div
      className={cn(
        adaptiveContainerVariants({ variant, fullWidth }),
        containerSpacing.padding,
        centerContent && "flex items-center justify-center",
        scrollable && "overflow-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}