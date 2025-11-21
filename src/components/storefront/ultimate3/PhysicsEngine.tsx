import { useEffect, useRef } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

/**
 * Physics Engine - محرك الفيزياء
 * Gravity, Bounce, Collision Detection
 */
export const usePhysicsEngine = () => {
  const { settings } = useGamingSettings();

  const enableGravity = () => {
    if (!settings.isGamingMode || settings.performanceMode === 'low') return;

    const cards = document.querySelectorAll('[data-physics="true"]');

    cards.forEach((card, index) => {
      setTimeout(() => {
        (card as HTMLElement).classList.add('physics-card', 'falling');

        setTimeout(() => {
          (card as HTMLElement).classList.remove('falling');
        }, 1000);
      }, index * 100);
    });
  };

  const triggerBounce = (element: HTMLElement) => {
    if (!settings.isGamingMode) return;

    element.classList.add('bouncing');
    setTimeout(() => {
      element.classList.remove('bouncing');
    }, 600);
  };

  const applySpring = (element: HTMLElement) => {
    if (!settings.isGamingMode) return;

    element.classList.add('spring-element');
    setTimeout(() => {
      element.classList.remove('spring-element');
    }, 800);
  };

  return {
    enableGravity,
    triggerBounce,
    applySpring,
  };
};

/**
 * Floating Cards with Physics
 */
export const PhysicsFloatingCards = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useGamingSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.isGamingMode || settings.performanceMode === 'low') return;

    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('[data-physics="true"]');

    const handleMouseEnter = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      card.classList.add('bouncing');
    };

    const handleMouseLeave = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      setTimeout(() => {
        card.classList.remove('bouncing');
      }, 600);
    };

    cards.forEach(card => {
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [settings]);

  if (!settings.isGamingMode) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="gravity-container">
      {children}
    </div>
  );
};
