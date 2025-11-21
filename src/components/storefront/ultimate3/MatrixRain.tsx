import { useEffect, useRef } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

/**
 * Matrix Digital Rain Effect
 * تأثير المطر الرقمي من The Matrix
 */
export const MatrixRain = () => {
  const { settings } = useGamingSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const columnCount = settings.performanceMode === 'low' ? 20 :
                       settings.performanceMode === 'medium' ? 40 :
                       settings.performanceMode === 'high' ? 60 : 80;

    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const createColumn = () => {
      const column = document.createElement('div');
      column.className = 'matrix-rain-column';
      column.style.left = `${Math.random() * 100}%`;
      column.style.animationDuration = `${Math.random() * 3 + 2}s`;
      column.style.animationDelay = `${Math.random() * 2}s`;

      // Generate random characters
      let text = '';
      const charCount = Math.floor(Math.random() * 20) + 10;
      for (let i = 0; i < charCount; i++) {
        text += characters[Math.floor(Math.random() * characters.length)] + '\n';
      }
      column.textContent = text;

      container.appendChild(column);

      // Remove after animation
      setTimeout(() => {
        column.remove();
      }, 5000);
    };

    // Create initial columns
    for (let i = 0; i < columnCount; i++) {
      setTimeout(() => createColumn(), i * 100);
    }

    // Keep creating new columns
    const interval = setInterval(createColumn, 300);

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  }, [settings]);

  if (!settings.isGamingMode) return null;

  return <div ref={containerRef} className="matrix-rain" />;
};
