import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

/**
 * Gaming Mouse Trail Effect
 * تأثير نيون يتبع حركة الماوس بألوان RGB
 * يمكن تعطيله من GamingSettings
 */
export const GamingMouseTrail = () => {
  const { settings } = useGamingSettings();
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const nextIdRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Don't render if disabled or gaming mode is off
    if (!settings.isGamingMode || !settings.enableMouseTrail || settings.reducedMotion) {
      return;
    }

    const colors = [
      '#00f0ff', // neon blue
      '#ff006e', // neon pink
      '#a855f7', // neon purple
      '#39ff14', // neon green
      '#ff9500', // neon orange
    ];

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      // Throttle based on performance mode
      const throttleMs = settings.performanceMode === 'low' ? 100 :
                        settings.performanceMode === 'medium' ? 50 :
                        settings.performanceMode === 'high' ? 30 : 16;

      if (now - lastTimeRef.current < throttleMs) {
        return;
      }

      lastTimeRef.current = now;

      const newParticle: TrailParticle = {
        id: nextIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
      };

      setParticles(prev => {
        // Limit particles based on performance
        const maxParticles = settings.performanceMode === 'low' ? 10 :
                           settings.performanceMode === 'medium' ? 20 :
                           settings.performanceMode === 'high' ? 30 : 50;

        const updated = [...prev, newParticle];
        return updated.slice(-maxParticles);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [settings]);

  // Auto-cleanup old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        if (prev.length === 0) return prev;
        return prev.slice(1); // Remove oldest
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!settings.isGamingMode || !settings.enableMouseTrail) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {particles.map((particle, index) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              scale: 0,
              opacity: 0,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: settings.performanceMode === 'low' ? 0.3 : 0.5,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: particle.color,
              boxShadow: settings.enableGlowEffects
                ? `0 0 ${particle.size * 2}px ${particle.color}`
                : 'none',
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
