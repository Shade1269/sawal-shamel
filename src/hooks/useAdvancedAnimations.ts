import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook للرسوم المتحركة المتقدمة والتفاعلية
 */

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}

export interface ParallaxConfig {
  speed?: number;
  offset?: number;
  direction?: 'vertical' | 'horizontal';
}

// Hook للرسوم المتحركة المخصصة
export const useCustomAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // رسوم متحركة مخصصة بـ Web Animations API
  const animate = useCallback((
    keyframes: Keyframe[],
    config: AnimationConfig = {}
  ) => {
    if (!elementRef.current) return null;

    const {
      duration = 1000,
      easing = 'ease-out',
      delay = 0,
      iterations = 1,
      direction = 'normal',
      fillMode = 'both'
    } = config;

    setIsAnimating(true);

    const animation = elementRef.current.animate(keyframes, {
      duration,
      easing,
      delay,
      iterations,
      direction,
      fill: fillMode
    });

    animation.addEventListener('finish', () => {
      setIsAnimating(false);
    });

    return animation;
  }, []);

  // رسوم متحركة للظهور بالتدريج
  const fadeIn = useCallback((config: AnimationConfig = {}) => {
    return animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', ...config });
  }, [animate]);

  // رسوم متحركة للاختفاء بالتدريج
  const fadeOut = useCallback((config: AnimationConfig = {}) => {
    return animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-20px)' }
    ], { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', ...config });
  }, [animate]);

  // رسوم متحركة للتكبير
  const scaleIn = useCallback((config: AnimationConfig = {}) => {
    return animate([
      { transform: 'scale(0.8)', opacity: 0 },
      { transform: 'scale(1.05)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', ...config });
  }, [animate]);

  // رسوم متحركة للانزلاق
  const slideIn = useCallback((direction: 'left' | 'right' | 'up' | 'down' = 'right', config: AnimationConfig = {}) => {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    };

    return animate([
      { transform: transforms[direction], opacity: 0 },
      { transform: 'translate(0, 0)', opacity: 1 }
    ], { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', ...config });
  }, [animate]);

  // رسوم متحركة للدوران
  const spin = useCallback((config: AnimationConfig = {}) => {
    return animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], { duration: 1000, iterations: Infinity, ...config });
  }, [animate]);

  // رسوم متحركة للنبضة
  const pulse = useCallback((config: AnimationConfig = {}) => {
    return animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 0.7 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 1500, iterations: Infinity, ...config });
  }, [animate]);

  return {
    elementRef,
    isAnimating,
    animate,
    fadeIn,
    fadeOut,
    scaleIn,
    slideIn,
    spin,
    pulse
  };
};

// Hook للرسوم المتحركة بنمط Spring Physics
export const useSpringAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  const [springValues, setSpringValues] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });

  // محاكاة فيزياء Spring
  const animateSpring = useCallback((
    targetValues: Partial<typeof springValues>,
    config: SpringConfig = {}
  ) => {
    if (!elementRef.current) return;

    const {
      tension = 300,
      friction = 30,
      mass = 1
    } = config;

    // محاكاة مبسطة لفيزياء Spring
    const duration = Math.sqrt(mass / tension) * 1000;
    const damping = friction / (2 * Math.sqrt(mass * tension));

    setSpringValues(current => ({ ...current, ...targetValues }));

    if (elementRef.current) {
      const element = elementRef.current;
      const animation = element.animate([
        {
          transform: `translate(${springValues.x}px, ${springValues.y}px) scale(${springValues.scale}) rotate(${springValues.rotation}deg)`
        },
        {
          transform: `translate(${targetValues.x || springValues.x}px, ${targetValues.y || springValues.y}px) scale(${targetValues.scale || springValues.scale}) rotate(${targetValues.rotation || springValues.rotation}deg)`
        }
      ], {
        duration,
        easing: `cubic-bezier(${0.25 - damping * 0.1}, ${0.46 + damping * 0.2}, ${0.45 - damping * 0.15}, ${0.94 + damping * 0.1})`,
        fill: 'both'
      });

      return animation;
    }
  }, [springValues]);

  return {
    elementRef,
    springValues,
    animateSpring,
    setSpringValues
  };
};

// Hook للـ Parallax Effect
export const useParallax = (config: ParallaxConfig = {}) => {
  const {
    speed = 0.5,
    offset = 0,
    direction = 'vertical'
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const movement = (scrollY - offset) * speed;

    if (direction === 'vertical') {
      element.style.transform = `translateY(${movement}px)`;
    } else {
      element.style.transform = `translateX(${movement}px)`;
    }
  }, [scrollY, speed, offset, direction]);

  return { elementRef, scrollY };
};

// Hook للرسوم المتحركة عند التمرير
export const useScrollAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  // رسوم متحركة تلقائية عند الظهور
  const animateOnScroll = useCallback((
    animationType: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideLeft' | 'slideRight' = 'fadeIn'
  ) => {
    if (!elementRef.current || !isVisible) return;

    const keyframes: Record<typeof animationType, Keyframe[]> = {
      fadeIn: [
        { opacity: 0, transform: 'translateY(30px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      slideUp: [
        { transform: 'translateY(100%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      scaleIn: [
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      slideLeft: [
        { transform: 'translateX(100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      slideRight: [
        { transform: 'translateX(-100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ]
    };

    const animation = elementRef.current.animate(keyframes[animationType], {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'both'
    });

    return animation;
  }, [isVisible]);

  return {
    elementRef,
    isVisible,
    animateOnScroll
  };
};

// Hook للرسوم المتحركة التفاعلية للماوس
export const useMouseAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // تطبيق تأثير المتابعة للماوس
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const intensity = 0.1; // شدة التأثير

    element.style.transform = `translate(${mousePosition.x * intensity}px, ${mousePosition.y * intensity}px)`;
    element.style.transition = 'transform 0.15s ease-out';
  }, [mousePosition]);

  return {
    elementRef,
    mousePosition
  };
};