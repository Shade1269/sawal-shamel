import { useEffect, useRef, useState } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

export type WeatherType = 'rain' | 'snow' | 'lightning' | 'heat' | 'clear';

interface WeatherSystemProps {
  weather?: WeatherType;
  autoChange?: boolean;
}

/**
 * Weather System - نظام الطقس الديناميكي
 * Rain, Snow, Lightning, Heat Waves
 */
export const WeatherSystem = ({ weather = 'clear', autoChange = false }: WeatherSystemProps) => {
  const { settings } = useGamingSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherType>(weather);
  const [showLightning, setShowLightning] = useState(false);

  // Auto-change weather every 30 seconds
  useEffect(() => {
    if (!autoChange) return;

    const weathers: WeatherType[] = ['rain', 'snow', 'lightning', 'heat', 'clear'];
    const interval = setInterval(() => {
      const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setCurrentWeather(randomWeather);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoChange]);

  // Rain effect
  useEffect(() => {
    if (!settings.isGamingMode || currentWeather !== 'rain') return;

    const container = containerRef.current;
    if (!container) return;

    const dropCount = settings.performanceMode === 'low' ? 50 :
                     settings.performanceMode === 'medium' ? 100 :
                     settings.performanceMode === 'high' ? 150 : 200;

    const createRainDrop = () => {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
      drop.style.opacity = String(Math.random() * 0.5 + 0.3);

      container.appendChild(drop);

      setTimeout(() => drop.remove(), 1000);
    };

    const interval = setInterval(createRainDrop, 100);

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  }, [settings, currentWeather]);

  // Snow effect
  useEffect(() => {
    if (!settings.isGamingMode || currentWeather !== 'snow') return;

    const container = containerRef.current;
    if (!container) return;

    const snowCount = settings.performanceMode === 'low' ? 30 :
                     settings.performanceMode === 'medium' ? 60 :
                     settings.performanceMode === 'high' ? 100 : 150;

    const createSnowflake = () => {
      const flake = document.createElement('div');
      flake.className = 'snow-particle';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${Math.random() * 3 + 2}s`;
      flake.style.animationDelay = `${Math.random() * 2}s`;
      flake.style.width = `${Math.random() * 8 + 4}px`;
      flake.style.height = flake.style.width;

      container.appendChild(flake);

      setTimeout(() => flake.remove(), 7000);
    };

    for (let i = 0; i < snowCount; i++) {
      setTimeout(() => createSnowflake(), i * 50);
    }

    const interval = setInterval(createSnowflake, 300);

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  }, [settings, currentWeather]);

  // Lightning effect
  useEffect(() => {
    if (!settings.isGamingMode || currentWeather !== 'lightning') return;

    const triggerLightning = () => {
      setShowLightning(true);
      setTimeout(() => setShowLightning(false), 300);
    };

    // Random lightning strikes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerLightning();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentWeather, settings]);

  if (!settings.isGamingMode) return null;

  return (
    <>
      <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }} />

      {/* Heat Wave */}
      {currentWeather === 'heat' && (
        <div className="heat-wave" />
      )}

      {/* Lightning Flash */}
      {showLightning && (
        <div className="lightning-flash" />
      )}
    </>
  );
};
