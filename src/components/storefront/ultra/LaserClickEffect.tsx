import { useEffect, useRef, useState } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import '@/styles/ultra-effects.css';

interface LaserBeam {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  length: number;
}

/**
 * Laser Click Effect
 * ليزر يطلع من مكان النقر ويضرب الهدف
 * مع تأثيرات انفجار وأصوات
 */
export const LaserClickEffect = () => {
  const { settings } = useGamingSettings();
  const { playSound } = useSoundEffects();
  const [lasers, setLasers] = useState<LaserBeam[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // فقط للعناصر القابلة للنقر
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('clickable')
      ) {
        const rect = target.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        const clickX = e.clientX;
        const clickY = e.clientY;

        const dx = targetX - clickX;
        const dy = targetY - clickY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        const newLaser: LaserBeam = {
          id: nextIdRef.current++,
          x1: clickX,
          y1: clickY,
          x2: targetX,
          y2: targetY,
          angle,
          length,
        };

        setLasers(prev => [...prev, newLaser]);

        // Play laser sound
        if (settings.enableSoundEffects) {
          playSound('click');
        }

        // إضافة تأثير screen shake
        if (settings.performanceMode !== 'low') {
          document.body.style.animation = 'screen-shake 0.2s ease-out';
          setTimeout(() => {
            document.body.style.animation = '';
          }, 200);
        }

        // حذف الليزر بعد الانتهاء
        setTimeout(() => {
          setLasers(prev => prev.filter(l => l.id !== newLaser.id));
        }, 300);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [settings, playSound]);

  if (!settings.isGamingMode) {
    return null;
  }

  return (
    <>
      {lasers.map(laser => (
        <div key={laser.id}>
          {/* Laser Origin */}
          <div
            className="laser-origin"
            style={{
              left: laser.x1,
              top: laser.y1,
            }}
          />

          {/* Laser Beam */}
          <div
            className="laser-beam"
            style={{
              left: laser.x1,
              top: laser.y1,
              width: laser.length,
              transform: `rotate(${laser.angle}deg)`,
            }}
          />

          {/* Laser Impact */}
          <div
            className="laser-impact"
            style={{
              left: laser.x2 - 10,
              top: laser.y2 - 10,
            }}
          />
        </div>
      ))}

      {/* Screen Shake Animation */}
      <style>{`
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
        }
      `}</style>
    </>
  );
};
