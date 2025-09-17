import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, X, ChevronUp } from 'lucide-react';

const fabVariants = cva(
  "fixed z-50 rounded-full shadow-luxury transition-all duration-300 hover:scale-110 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        luxury: "luxury-effect text-white hover:shadow-luxury",
        persian: "persian-effect text-white hover:shadow-persian",
        glass: "glass-effect backdrop-blur-xl border border-border/30"
      },
      size: {
        sm: "h-12 w-12",
        md: "h-14 w-14",
        lg: "h-16 w-16"
      },
      position: {
        "bottom-right": "bottom-6 right-6",
        "bottom-left": "bottom-6 left-6", 
        "top-right": "top-6 right-6",
        "top-left": "top-6 left-6",
        "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
        "top-center": "top-6 left-1/2 -translate-x-1/2"
      },
      animation: {
        none: "",
        bounce: "animate-bounce-in",
        float: "animate-persian-float",
        pulse: "animate-pulse-glow"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      position: "bottom-right",
      animation: "none"
    }
  }
);

interface FABAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
  variant?: 'default' | 'secondary' | 'luxury' | 'persian' | 'glass';
}

export interface FloatingActionButtonProps 
  extends VariantProps<typeof fabVariants> {
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  actions?: FABAction[];
  tooltip?: string;
  badge?: string | number;
  disabled?: boolean;
  className?: string;
  hideOnScroll?: boolean;
  expandDirection?: 'up' | 'down' | 'left' | 'right';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon = Plus,
  onClick,
  actions = [],
  tooltip,
  badge,
  disabled = false,
  variant,
  size,
  position,
  animation,
  className,
  hideOnScroll = false,
  expandDirection = 'up'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Handle scroll visibility
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hideOnScroll]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Handle main button click
  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      onClick?.();
    }
  };

  // Get action positions based on expand direction
  const getActionStyle = (index: number) => {
    const spacing = size === 'sm' ? 60 : size === 'lg' ? 80 : 70;
    const offset = (index + 1) * spacing;

    const styles = {
      up: { bottom: offset },
      down: { top: offset },
      left: { right: offset },
      right: { left: offset }
    };

    return styles[expandDirection];
  };

  if (!isVisible && hideOnScroll) {
    return null;
  }

  const mainButton = (
    <Button
      ref={fabRef}
      variant="ghost"
      onClick={handleMainClick}
      disabled={disabled}
      className={cn(
        fabVariants({ variant, size, position, animation }),
        !isVisible && "translate-y-20 opacity-0",
        className
      )}
    >
      <div className="relative">
        {actions.length > 0 ? (
          <div className={cn(
            "transition-transform duration-200",
            isExpanded && "rotate-45"
          )}>
            {isExpanded ? <X className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
        ) : (
          <Icon className="h-5 w-5" />
        )}
        
        {badge && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs animate-pulse-glow"
          >
            {badge}
          </Badge>
        )}
      </div>
    </Button>
  );

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Action buttons */}
        {actions.length > 0 && actions.map((action, index) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "fixed z-40 rounded-full shadow-soft transition-all duration-300",
                  size === 'sm' ? "h-10 w-10" : size === 'lg' ? "h-12 w-12" : "h-11 w-11",
                  action.variant === 'luxury' && "luxury-effect text-white",
                  action.variant === 'persian' && "persian-effect text-white",
                  action.variant === 'glass' && "glass-effect backdrop-blur-xl border border-border/30",
                  !action.variant && "bg-background border border-border",
                  position === 'bottom-right' && "right-6",
                  position === 'bottom-left' && "left-6",
                  position === 'top-right' && "right-6",
                  position === 'top-left' && "left-6",
                  position === 'bottom-center' && "left-1/2 -translate-x-1/2",
                  position === 'top-center' && "left-1/2 -translate-x-1/2",
                  position?.includes('bottom') && expandDirection === 'up' && "bottom-6",
                  position?.includes('top') && expandDirection === 'down' && "top-6",
                  isExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
                style={{
                  transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
                  ...getActionStyle(index)
                }}
              >
                <div className="relative">
                  <action.icon className="h-4 w-4" />
                  {action.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="mr-2">
              {action.label}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Main FAB */}
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {mainButton}
            </TooltipTrigger>
            <TooltipContent side="left" className="mr-2">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        ) : (
          mainButton
        )}

        {/* Overlay */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

// Predefined FAB Components
const ScrollToTopFAB: React.FC<{
  showThreshold?: number;
  className?: string;
}> = ({ showThreshold = 200, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showThreshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <FloatingActionButton
      icon={ChevronUp}
      onClick={scrollToTop}
      tooltip="العودة للأعلى"
      variant="glass"
      position="bottom-left"
      animation="float"
      className={className}
    />
  );
};

export { FloatingActionButton, ScrollToTopFAB, fabVariants };