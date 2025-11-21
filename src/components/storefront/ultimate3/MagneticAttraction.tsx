import { useEffect, useRef, useState } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

/**
 * Magnetic Attraction System
 * نظام الجذب المغناطيسي - المنتجات تنجذب للماوس
 */
export const MagneticAttraction = () => {
  const { settings } = useGamingSettings();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Update CSS variables for heatmap
      document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
    };

    const handleClick = (e: MouseEvent) => {
      // Create ripple effect
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [settings]);

  // Apply magnetic effect to cards
  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) return;

    const cards = document.querySelectorAll('[data-magnetic="true"]');

    const applyMagneticEffect = () => {
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const deltaX = mousePos.x - cardCenterX;
        const deltaY = mousePos.y - cardCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Magnetic range in pixels
        const magneticRange = 200;

        if (distance < magneticRange) {
          const strength = 1 - (distance / magneticRange);
          const moveX = deltaX * strength * 0.3;
          const moveY = deltaY * strength * 0.3;

          (card as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + strength * 0.05})`;
        } else {
          (card as HTMLElement).style.transform = 'translate(0, 0) scale(1)';
        }
      });
    };

    const rafId = requestAnimationFrame(function animate() {
      applyMagneticEffect();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(rafId);
  }, [mousePos, settings]);

  if (!settings.isGamingMode) return null;

  return (
    <>
      {/* Magnetic Field Indicator */}
      <div
        ref={fieldRef}
        className="magnetic-field"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          width: '150px',
          height: '150px',
          zIndex: 9999,
        }}
      />

      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="magnetic-ripple"
          style={{
            left: ripple.x - 100,
            top: ripple.y - 100,
            zIndex: 9999,
          }}
        />
      ))}
    </>
  );
};
