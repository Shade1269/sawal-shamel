import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Star, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  Eye,
  Download,
  Plus,
  Minus,
  Check,
  X,
  Zap,
  Sparkles
} from 'lucide-react';

const microInteractionVariants = cva(
  "relative transition-all duration-300 ease-persian",
  {
    variants: {
      variant: {
        default: "hover:scale-105",
        bounce: "hover:animate-bounce-gentle",
        pulse: "hover:animate-pulse-slow",
        glow: "hover:animate-glow",
        shake: "hover:animate-shake",
        float: "hover:animate-float",
        persian: "hover:animate-persian-float"
      },
      feedback: {
        none: "",
        ripple: "overflow-hidden",
        glow: "hover:shadow-glow",
        scale: "active:scale-95",
        highlight: "hover:bg-primary/10"
      }
    },
    defaultVariants: {
      variant: "default",
      feedback: "scale"
    }
  }
);

// Like Button with Heart Animation
export interface LikeButtonProps {
  liked?: boolean;
  count?: number;
  onToggle?: (liked: boolean) => void;
  variant?: 'default' | 'luxury' | 'persian';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  liked = false,
  count = 0,
  onToggle,
  variant = 'default',
  size = 'md',
  showCount = true,
  className
}) => {
  const [isLiked, setIsLiked] = useState(liked);
  const [currentCount, setCurrentCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setCurrentCount(prev => newLiked ? prev + 1 : prev - 1);
    setIsAnimating(true);
    onToggle?.(newLiked);

    setTimeout(() => setIsAnimating(false), 600);
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "group relative",
        isAnimating && "animate-bounce-gentle",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Heart 
            className={cn(
              sizeClasses[size],
              "transition-all duration-300",
              isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground group-hover:text-red-400",
              isAnimating && "animate-ping absolute"
            )} 
          />
          {isAnimating && (
            <Heart 
              className={cn(
                sizeClasses[size],
                "fill-red-500 text-red-500 animate-pulse"
              )} 
            />
          )}
        </div>
        
        {showCount && (
          <span className={cn(
            "text-sm font-medium transition-colors duration-200",
            isLiked ? "text-red-500" : "text-muted-foreground"
          )}>
            {currentCount.toLocaleString('ar')}
          </span>
        )}
      </div>

      {/* Floating hearts effect */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "absolute h-3 w-3 fill-red-500 text-red-500 animate-float-up opacity-80",
                i === 0 && "left-0 top-0",
                i === 1 && "left-1/2 top-0 animation-delay-100",
                i === 2 && "right-0 top-0 animation-delay-200"
              )}
              style={{
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      )}
    </Button>
  );
};

// Star Rating with Animation
export interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  onChange,
  readonly = false,
  size = 'md',
  color = 'text-yellow-500',
  className
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (newRating: number) => {
    if (readonly) return;
    setCurrentRating(newRating);
    onChange?.(newRating);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= (hoverRating || currentRating);
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => !readonly && setHoverRating(starRating)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-125 active:scale-110",
              readonly && "cursor-default"
            )}
          >
            <Star 
              className={cn(
                sizeClasses[size],
                "transition-all duration-200",
                isFilled ? `fill-current ${color}` : "text-muted-foreground",
                !readonly && "hover:animate-pulse-gentle"
              )} 
            />
          </button>
        );
      })}
    </div>
  );
};

// Ripple Effect Component
export interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className,
  color = 'rgba(255, 255, 255, 0.5)',
  duration = 600
}) => {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const createRipple = (event: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = {
      id: Date.now(),
      x: x - size / 2,
      y: y - size / 2,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, duration);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseDown={createRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`
          }}
        />
      ))}
    </div>
  );
};

// Floating Action Feedback
export interface FloatingFeedbackProps {
  text: string;
  show: boolean;
  onHide?: () => void;
  variant?: 'success' | 'error' | 'info' | 'warning';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({
  text,
  show,
  onHide,
  variant = 'success',
  position = 'top',
  className
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  const positionClasses = {
    top: '-top-12 left-1/2 -translate-x-1/2',
    bottom: '-bottom-12 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -left-12 -translate-y-1/2',
    right: 'top-1/2 -right-12 -translate-y-1/2'
  };

  const variantClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-black'
  };

  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute z-50 px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap",
        "animate-fade-in transform transition-all duration-300",
        positionClasses[position],
        variantClasses[variant],
        className
      )}
    >
      {text}
      <div className="absolute w-2 h-2 bg-inherit transform rotate-45" 
           style={{
             [position === 'top' ? 'bottom' : position === 'bottom' ? 'top' : position === 'left' ? 'right' : 'left']: '-4px',
             ...(position === 'top' || position === 'bottom' ? { left: '50%', transform: 'translateX(-50%) rotate(45deg)' } : { top: '50%', transform: 'translateY(-50%) rotate(45deg)' })
           }}
      />
    </div>
  );
};

// Hover Card with Micro-interactions
export interface HoverCardProps {
  children: React.ReactNode;
  hoverContent: React.ReactNode;
  delay?: number;
  className?: string;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  hoverContent,
  delay = 300,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 animate-fade-in">
          <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs">
            {hoverContent}
          </div>
        </div>
      )}
    </div>
  );
};

export {
  LikeButton,
  StarRating,
  RippleEffect,
  FloatingFeedback,
  HoverCard,
  microInteractionVariants
};