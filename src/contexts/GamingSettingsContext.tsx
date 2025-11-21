import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Gaming Settings Context
 * مركز التحكم المركزي لكل features الـ Gaming Mode
 * كل feature يمكن تفعيله/تعطيله بشكل منفصل
 */

export type GamingTheme = 'cyberpunk' | 'synthwave' | 'matrix' | 'retro' | 'neon-tokyo';
export type PerformanceMode = 'low' | 'medium' | 'high' | 'ultra';

export interface GamingSettings {
  // Main Toggle
  isGamingMode: boolean;

  // Theme
  gamingTheme: GamingTheme;

  // Performance
  performanceMode: PerformanceMode;

  // Visual Effects
  enableMouseTrail: boolean;
  enable3DTilt: boolean;
  enableParticles: boolean;
  enableScanLines: boolean;
  enableGridBackground: boolean;
  enableParallax: boolean;
  enableGlowEffects: boolean;

  // Audio
  enableSoundEffects: boolean;
  soundVolume: number; // 0-100

  // Gamification
  enableAchievements: boolean;
  enableComboSystem: boolean;
  enableRaritySystem: boolean;
  enableXPSystem: boolean;

  // Notifications
  enableGamingNotifications: boolean;

  // Ultra Effects (Sci-Fi)
  enableHolographic: boolean;
  enableLaserClicks: boolean;
  enableNebulaBackground: boolean;
  enablePortalTransitions: boolean;
  enableQuantumGlitch: boolean;
  enableEnergyShield: boolean;
  enableWarpSpeed: boolean;

  // Advanced
  enableAnimations: boolean;
  reducedMotion: boolean;
}

interface GamingSettingsContextType {
  settings: GamingSettings;
  updateSetting: <K extends keyof GamingSettings>(key: K, value: GamingSettings[K]) => void;
  toggleGamingMode: () => void;
  setTheme: (theme: GamingTheme) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
  resetToDefaults: () => void;
}

const defaultSettings: GamingSettings = {
  // Main
  isGamingMode: true,

  // Theme
  gamingTheme: 'cyberpunk',

  // Performance - Default to 'high' for best experience
  performanceMode: 'high',

  // Visual Effects - All enabled by default
  enableMouseTrail: true,
  enable3DTilt: true,
  enableParticles: true,
  enableScanLines: true,
  enableGridBackground: true,
  enableParallax: true,
  enableGlowEffects: true,

  // Audio - Disabled by default (user preference)
  enableSoundEffects: false,
  soundVolume: 50,

  // Gamification - All enabled
  enableAchievements: true,
  enableComboSystem: true,
  enableRaritySystem: true,
  enableXPSystem: true,

  // Notifications
  enableGamingNotifications: true,

  // Ultra Effects - All enabled by default for WOW factor!
  enableHolographic: true,
  enableLaserClicks: true,
  enableNebulaBackground: true,
  enablePortalTransitions: true,
  enableQuantumGlitch: false, // قد يكون مزعج للبعض
  enableEnergyShield: true,
  enableWarpSpeed: true,

  // Advanced
  enableAnimations: true,
  reducedMotion: false,
};

const GamingSettingsContext = createContext<GamingSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'atlantis-gaming-settings';

export const GamingSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GamingSettings>(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load gaming settings:', error);
    }
    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save gaming settings:', error);
    }
  }, [settings]);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        updateSetting('reducedMotion', true);
        updateSetting('enableAnimations', false);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-adjust performance based on device
  useEffect(() => {
    const adjustPerformance = () => {
      // Check device capabilities
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;

      if (isMobile || isLowEndDevice) {
        // Lower settings for mobile/low-end devices
        setSettings(prev => ({
          ...prev,
          performanceMode: 'medium',
          enableParticles: false,
          enableParallax: false,
          enable3DTilt: false,
        }));
      }
    };

    adjustPerformance();
  }, []);

  const updateSetting = <K extends keyof GamingSettings>(
    key: K,
    value: GamingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleGamingMode = () => {
    setSettings(prev => ({ ...prev, isGamingMode: !prev.isGamingMode }));
  };

  const setTheme = (theme: GamingTheme) => {
    setSettings(prev => ({ ...prev, gamingTheme: theme }));
  };

  const setPerformanceMode = (mode: PerformanceMode) => {
    setSettings(prev => {
      const newSettings = { ...prev, performanceMode: mode };

      // Auto-adjust features based on performance mode
      switch (mode) {
        case 'low':
          return {
            ...newSettings,
            enableParticles: false,
            enableScanLines: false,
            enableParallax: false,
            enable3DTilt: false,
            enableMouseTrail: false,
          };
        case 'medium':
          return {
            ...newSettings,
            enableParticles: true,
            enableScanLines: true,
            enableParallax: false,
            enable3DTilt: false,
            enableMouseTrail: true,
          };
        case 'high':
          return {
            ...newSettings,
            enableParticles: true,
            enableScanLines: true,
            enableParallax: true,
            enable3DTilt: true,
            enableMouseTrail: true,
          };
        case 'ultra':
          return {
            ...newSettings,
            enableParticles: true,
            enableScanLines: true,
            enableParallax: true,
            enable3DTilt: true,
            enableMouseTrail: true,
            enableGlowEffects: true,
          };
        default:
          return newSettings;
      }
    });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const value: GamingSettingsContextType = {
    settings,
    updateSetting,
    toggleGamingMode,
    setTheme,
    setPerformanceMode,
    resetToDefaults,
  };

  return (
    <GamingSettingsContext.Provider value={value}>
      {children}
    </GamingSettingsContext.Provider>
  );
};

export const useGamingSettings = () => {
  const context = useContext(GamingSettingsContext);
  if (!context) {
    throw new Error('useGamingSettings must be used within GamingSettingsProvider');
  }
  return context;
};

// Helper hooks for specific features
export const useGamingMode = () => {
  const { settings, toggleGamingMode } = useGamingSettings();
  return {
    isGamingMode: settings.isGamingMode,
    toggle: toggleGamingMode,
  };
};

export const useGamingTheme = () => {
  const { settings, setTheme } = useGamingSettings();
  return {
    theme: settings.gamingTheme,
    setTheme,
  };
};

export const usePerformanceSettings = () => {
  const { settings, setPerformanceMode } = useGamingSettings();
  return {
    mode: settings.performanceMode,
    setMode: setPerformanceMode,
  };
};
