import { useEffect, useState, useMemo } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import '@/styles/ultra-effects.css';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

/**
 * Nebula + Stars Background
 * خلفية سديم فضائي مع نجوم متلألئة
 */
export const NebulaStarsBackground = () => {
  const { settings } = useGamingSettings();
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const lastScrollY = useState(0);

  // Generate stars based on performance mode
  const stars = useMemo(() => {
    const starCount = settings.performanceMode === 'low' ? 30 :
                     settings.performanceMode === 'medium' ? 50 :
                     settings.performanceMode === 'high' ? 80 : 120;

    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }));
  }, [settings.performanceMode]);

  // Detect scroll speed for warp effect
  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) {
      return;
    }

    let lastY = window.scrollY;
    let lastTime = Date.now();

    const handleScroll = () => {
      const currentY = window.scrollY;
      const currentTime = Date.now();
      const deltaY = Math.abs(currentY - lastY);
      const deltaTime = currentTime - lastTime;

      // Calculate scroll speed (pixels per millisecond)
      const speed = deltaY / deltaTime;

      setScrollSpeed(speed);

      lastY = currentY;
      lastTime = currentTime;

      // Reset speed after 100ms
      setTimeout(() => {
        setScrollSpeed(0);
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings]);

  if (!settings.isGamingMode) {
    return null;
  }

  const isWarpSpeed = scrollSpeed > 2; // Fast scrolling

  return (
    <>
      {/* Nebula Background */}
      <div className="nebula-background" />

      {/* Stars Field */}
      <div className="stars-field">
        {stars.map(star => (
          <div
            key={star.id}
            className={isWarpSpeed ? 'star-trail' : 'star'}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: isWarpSpeed ? '100px' : `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: isWarpSpeed ? '0.5s' : `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Warp Speed Effect */}
      {isWarpSpeed && settings.performanceMode !== 'low' && (
        <div className="warp-speed-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="warp-line"
              style={{
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.02}s`,
                width: `${Math.random() * 300 + 100}px`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};
