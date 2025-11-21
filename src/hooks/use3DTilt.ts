import { useEffect, useRef, useState } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

/**
 * Custom Hook for 3D Tilt Effect
 * تأثير ميلان ثلاثي الأبعاد للبطاقات
 * يستجيب لحركة الماوس ويعطي تأثير Parallax 3D
 */
export const use3DTilt = (maxTilt: number = 15) => {
  const { settings } = useGamingSettings();
  const elementRef = useRef<HTMLDivElement>(null);
  const [tiltState, setTiltState] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !settings.enable3DTilt || settings.reducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTiltState({
        rotateX,
        rotateY,
        scale: 1.05,
      });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTiltState({
        rotateX: 0,
        rotateY: 0,
        scale: 1,
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt, settings.enable3DTilt, settings.reducedMotion]);

  const tiltStyle = settings.enable3DTilt && !settings.reducedMotion
    ? {
        transform: `perspective(1000px) rotateX(${tiltState.rotateX}deg) rotateY(${tiltState.rotateY}deg) scale(${tiltState.scale})`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
      }
    : {};

  return {
    ref: elementRef,
    style: tiltStyle,
    isHovered,
  };
};
