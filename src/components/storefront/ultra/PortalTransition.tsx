import { motion, AnimatePresence } from 'framer-motion';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import '@/styles/ultra-effects.css';

interface PortalTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
}

/**
 * Portal Transition Effect
 * انتقال عبر بوابة فضائية بتأثير wormhole
 */
export const PortalTransition = ({ isActive, onComplete }: PortalTransitionProps) => {
  const { settings } = useGamingSettings();
  const { playSound } = useSoundEffects();

  if (!settings.isGamingMode || settings.reducedMotion) {
    return null;
  }

  if (isActive && settings.enableSoundEffects) {
    playSound('notification');
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isActive && (
        <motion.div
          className="portal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Portal Vortex */}
          <div className="portal-vortex" />

          {/* Rotating Rings */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="portal-ring"
              initial={{
                width: 0,
                height: 0,
                opacity: 0,
              }}
              animate={{
                width: `${(i + 1) * 100}px`,
                height: `${(i + 1) * 100}px`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Energy Particles */}
          {settings.performanceMode !== 'low' && (
            <>
              {[...Array(30)].map((_, i) => {
                const angle = (i / 30) * Math.PI * 2;
                const distance = 200;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: 'var(--gaming-neon-blue)',
                      boxShadow: '0 0 10px var(--gaming-neon-blue)',
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, x, x * 2],
                      y: [0, y, y * 2],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.02,
                      ease: 'easeOut',
                    }}
                  />
                );
              })}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook for triggering portal transitions
 */
export const usePortalTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerPortal = (callback?: () => void) => {
    setIsTransitioning(true);

    setTimeout(() => {
      if (callback) callback();
    }, 400); // Mid-transition

    setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // End of transition
  };

  return {
    isTransitioning,
    triggerPortal,
    PortalComponent: () => (
      <PortalTransition
        isActive={isTransitioning}
        onComplete={() => setIsTransitioning(false)}
      />
    ),
  };
};

import { useState } from 'react';
