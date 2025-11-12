import React, { useState, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const counterVariants = cva(
  "font-bold transition-all duration-300",
  {
    variants: {
      variant: {
        default: "text-foreground",
        primary: "text-primary",
        accent: "text-accent-foreground",
        luxury: "gradient-text-luxury",
        persian: "text-persian gradient-text-primary",
        gradient: "gradient-text-accent"
      },
      size: {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
        xl: "text-6xl"
      },
      animation: {
        none: "",
        bounce: "animate-bounce-gentle",
        pulse: "animate-pulse-slow",
        glow: "animate-glow",
        float: "animate-float"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      animation: "none"
    }
  }
);

export interface AnimatedCounterProps 
  extends VariantProps<typeof counterVariants> {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  locale?: string;
  formatter?: (value: number) => string;
  onComplete?: () => void;
  trigger?: boolean;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  locale = 'ar',
  formatter,
  onComplete,
  trigger = true,
  variant,
  size,
  animation,
  className
}) => {
  const [current, setCurrent] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const startTimeRef = useRef<number>();
  const animationIdRef = useRef<number>();

  const formatValue = (value: number): string => {
    if (formatter) {
      return formatter(value);
    }

    const rounded = Number(value.toFixed(decimals));
    let formattedValue = rounded.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    // Custom separator if provided
    if (separator !== ',' && locale === 'en') {
      formattedValue = formattedValue.replace(/,/g, separator);
    }

    return `${prefix}${formattedValue}${suffix}`;
  };

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    
    const value = from + (to - from) * easedProgress;
    setCurrent(value);

    if (progress < 1) {
      animationIdRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      onComplete?.();
    }
  };

  const startAnimation = () => {
    setIsAnimating(true);
    startTimeRef.current = undefined;
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const resetAnimation = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    setIsAnimating(false);
    setCurrent(from);
    startTimeRef.current = undefined;
  };

  useEffect(() => {
    if (trigger) {
      startAnimation();
    } else {
      resetAnimation();
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [trigger, to, from, duration]);

  // Intersection Observer for auto-trigger
  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimating) {
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [isAnimating]);

  return (
    <span
      ref={counterRef}
      className={cn(
        counterVariants({ variant, size, animation }),
        isAnimating && "animate-pulse-gentle",
        className
      )}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {formatValue(current)}
    </span>
  );
};

// Specialized Counter Components
const CurrencyCounter: React.FC<Omit<AnimatedCounterProps, 'formatter' | 'prefix'> & {
  currency?: string;
}> = ({ currency = 'ر.س', ...props }) => (
  <AnimatedCounter
    {...props}
    suffix={` ${currency}`}
    formatter={(value) => value.toFixed(2)}
  />
);

const PercentageCounter: React.FC<Omit<AnimatedCounterProps, 'suffix'>> = (props) => (
  <AnimatedCounter
    {...props}
    suffix="%"
    decimals={1}
  />
);

const CompactCounter: React.FC<AnimatedCounterProps> = (props) => (
  <AnimatedCounter
    {...props}
    formatter={(value) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    }}
  />
);

const TimeCounter: React.FC<Omit<AnimatedCounterProps, 'formatter'> & {
  format?: 'seconds' | 'minutes' | 'hours' | 'days';
}> = ({ format = 'seconds', ...props }) => (
  <AnimatedCounter
    {...props}
    formatter={(value) => {
      const units = {
        seconds: 'ث',
        minutes: 'د',
        hours: 'س',
        days: 'يوم'
      };
      return `${Math.floor(value)} ${units[format]}`;
    }}
  />
);

export { 
  AnimatedCounter, 
  CurrencyCounter, 
  PercentageCounter, 
  CompactCounter, 
  TimeCounter,
  counterVariants 
};