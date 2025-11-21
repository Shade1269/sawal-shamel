import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { use3DTilt } from '@/hooks/use3DTilt';
import '@/styles/ultra-effects.css';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  enableQuantumGlitch?: boolean;
  enableEnergyShield?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

/**
 * Holographic Card
 * بطاقة بتأثير هولوغرافي خرافي
 * مع chromatic aberration و 3D tilt
 */
export const HolographicCard = ({
  children,
  className = '',
  enableQuantumGlitch = false,
  enableEnergyShield = true,
  intensity = 'high',
}: HolographicCardProps) => {
  const { settings } = useGamingSettings();
  const { ref: tiltRef, style: tiltStyle, isHovered } = use3DTilt(20);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || settings.reducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  if (!settings.isGamingMode) {
    return <div className={className}>{children}</div>;
  }

  const shouldAnimate = settings.performanceMode !== 'low' && !settings.reducedMotion;

  return (
    <motion.div
      ref={el => {
        cardRef.current = el;
        if (tiltRef) (tiltRef as any).current = el;
      }}
      className={`
        holographic-card
        ${enableQuantumGlitch && shouldAnimate ? 'quantum-glitch' : ''}
        ${enableEnergyShield && shouldAnimate ? 'energy-shield' : ''}
        ultra-accelerated
        ${className}
      `}
      style={{
        ...tiltStyle,
        '--mouse-x': `${mousePosition.x}%`,
        '--mouse-y': `${mousePosition.y}%`,
      } as any}
      onMouseMove={handleMouseMove}
      whileHover={
        shouldAnimate
          ? {
              scale: 1.02,
              transition: { duration: 0.3 },
            }
          : undefined
      }
    >
      {/* Holographic Overlay */}
      {shouldAnimate && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(
              circle at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(0, 240, 255, 0.3) 0%,
              rgba(168, 85, 247, 0.2) 30%,
              transparent 60%
            )`,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* Rainbow Prism Effect */}
      {shouldAnimate && intensity !== 'low' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `linear-gradient(
              ${Math.atan2(mousePosition.y - 50, mousePosition.x - 50) * (180 / Math.PI)}deg,
              rgba(255, 0, 0, 0.2),
              rgba(255, 127, 0, 0.2),
              rgba(255, 255, 0, 0.2),
              rgba(0, 255, 0, 0.2),
              rgba(0, 0, 255, 0.2),
              rgba(75, 0, 130, 0.2),
              rgba(148, 0, 211, 0.2)
            )`,
            mixBlendMode: 'color-dodge',
            transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
          }}
        />
      )}

      {/* Hexagonal Shield (on hover) */}
      {enableEnergyShield && isHovered && shouldAnimate && (
        <motion.div
          className="hex-shield"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Chromatic Aberration Edge */}
      {shouldAnimate && intensity === 'high' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'linear-gradient(90deg, #ff0000 0%, transparent 10%, transparent 90%, #00ffff 100%)',
              mixBlendMode: 'screen',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'linear-gradient(0deg, #00ff00 0%, transparent 10%, transparent 90%, #ff00ff 100%)',
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}
    </motion.div>
  );
};
