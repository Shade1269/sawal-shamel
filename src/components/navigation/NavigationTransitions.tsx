import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavigationTransitionsProps {
  children: React.ReactNode;
  className?: string;
  transition?: 'slide' | 'fade' | 'scale' | 'persian' | 'none';
  duration?: number;
}

const NavigationTransitions: React.FC<NavigationTransitionsProps> = ({
  children,
  className,
  transition = 'persian',
  duration = 150
}) => {
  const location = useLocation();
  const prevLocation = React.useRef(location);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Only animate if location actually changed
    if (prevLocation.current.pathname !== location.pathname) {
      const container = containerRef.current;
      if (!container || transition === 'none') return;

      // Add exit animation class
      container.classList.add('page-exit');
      
      // Wait for exit animation, then add enter animation
      setTimeout(() => {
        container.classList.remove('page-exit');
        container.classList.add('page-enter');
        
        // Remove enter class after animation completes
        setTimeout(() => {
          container.classList.remove('page-enter');
        }, duration);
      }, duration / 2);

      prevLocation.current = location;
    }
  }, [location, transition, duration]);

  const transitionClasses = {
    slide: 'transition-slide',
    fade: 'transition-fade', 
    scale: 'transition-scale',
    persian: 'transition-persian',
    none: ''
  };

  return (
    <>
      <style>{`
        /* Slide Transition */
        .transition-slide.page-exit {
          transform: translateX(-20px);
          opacity: 0.7;
          transition: all ${duration / 2}ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .transition-slide.page-enter {
          transform: translateX(20px);
          opacity: 0;
          animation: slideEnter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes slideEnter {
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Fade Transition */
        .transition-fade.page-exit {
          opacity: 0.7;
          transition: opacity ${duration / 2}ms ease-out;
        }
        
        .transition-fade.page-enter {
          opacity: 0;
          animation: fadeEnter ${duration}ms ease-out forwards;
        }
        
        @keyframes fadeEnter {
          to {
            opacity: 1;
          }
        }

        /* Scale Transition */
        .transition-scale.page-exit {
          transform: scale(0.98);
          opacity: 0.8;
          transition: all ${duration / 2}ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .transition-scale.page-enter {
          transform: scale(1.02);
          opacity: 0;
          animation: scaleEnter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes scaleEnter {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Persian Heritage Transition */
        .transition-persian.page-exit {
          transform: translateY(-10px) scale(0.98);
          opacity: 0.6;
          filter: blur(1px);
          transition: all ${duration / 2}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .transition-persian.page-enter {
          transform: translateY(15px) scale(1.01);
          opacity: 0;
          filter: blur(2px);
          animation: persianEnter ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes persianEnter {
          50% {
            transform: translateY(-2px) scale(1);
            opacity: 0.8;
            filter: blur(0.5px);
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className={cn(
          'w-full h-full',
          transitionClasses[transition],
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

export { NavigationTransitions };