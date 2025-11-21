import { useEffect, useRef } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

/**
 * Cosmic Effects - ظواهر كونية خيالية
 * Aurora, Shooting Stars, Black Hole, Solar Flares, Cosmic Dust
 */
export const CosmicEffects = () => {
  const { settings } = useGamingSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  // Shooting Stars
  useEffect(() => {
    if (!settings.isGamingMode || settings.performanceMode === 'low') return;

    const container = containerRef.current;
    if (!container) return;

    const createShootingStar = () => {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.top = `${Math.random() * 30}%`;
      star.style.right = `${Math.random() * 50}%`;
      star.style.animationDuration = `${Math.random() * 1 + 0.5}s`;

      container.appendChild(star);

      setTimeout(() => star.remove(), 2000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createShootingStar();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [settings]);

  // Cosmic Dust
  useEffect(() => {
    if (!settings.isGamingMode || settings.performanceMode === 'low') return;

    const container = containerRef.current;
    if (!container) return;

    const dustCount = settings.performanceMode === 'medium' ? 20 :
                     settings.performanceMode === 'high' ? 40 : 60;

    const createDust = () => {
      const dust = document.createElement('div');
      dust.className = 'cosmic-dust';
      dust.style.left = `${Math.random() * 100}%`;
      dust.style.top = `${Math.random() * 100}%`;
      dust.style.animationDelay = `${Math.random() * 20}s`;
      dust.style.animationDuration = `${Math.random() * 10 + 15}s`;

      container.appendChild(dust);
    };

    for (let i = 0; i < dustCount; i++) {
      createDust();
    }

    return () => {
      const dustParticles = container.querySelectorAll('.cosmic-dust');
      dustParticles.forEach(p => p.remove());
    };
  }, [settings]);

  if (!settings.isGamingMode) return null;

  return (
    <>
      <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }} />

      {/* Aurora Borealis */}
      {settings.performanceMode !== 'low' && (
        <div className="aurora-borealis" />
      )}

      {/* Black Hole (bottom right corner) */}
      {(settings.performanceMode === 'high' || settings.performanceMode === 'ultra') && (
        <div
          className="black-hole"
          style={{
            bottom: '50px',
            right: '50px',
            zIndex: 3,
          }}
        />
      )}
    </>
  );
};
