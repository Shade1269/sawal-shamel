import { motion } from 'framer-motion';
import { useGamingSettings, type GamingTheme } from '@/contexts/GamingSettingsContext';
import { Palette, X } from 'lucide-react';
import { useState } from 'react';
import '@/styles/gaming-themes.css';

const themes: { id: GamingTheme; name: string; emoji: string; description: string }[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '🌆',
    description: 'نيون أزرق/وردي - المستقبل'
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    emoji: '🌅',
    description: 'وردي/بنفسجي - غروب'
  },
  {
    id: 'matrix',
    name: 'Matrix',
    emoji: '🟩',
    description: 'أخضر نيون - رموز'
  },
  {
    id: 'retro',
    name: 'Retro',
    emoji: '🕹️',
    description: '8-bit - كلاسيك'
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo',
    emoji: '🗼',
    description: 'ياباني - نيون'
  },
];

export const GamingThemeSwitcher = () => {
  const { settings, setTheme } = useGamingSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (!settings.isGamingMode) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 left-4 z-50 w-14 h-14 rounded-full flex items-center justify-center gaming-glass-card border-2 border-gaming-primary"
        style={{
          boxShadow: 'var(--gaming-glow)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="h-6 w-6" style={{ color: 'var(--gaming-primary)' }} />
        ) : (
          <Palette className="h-6 w-6" style={{ color: 'var(--gaming-primary)' }} />
        )}
      </motion.button>

      {/* Theme Selector Panel */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -400,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-24 left-20 z-50 gaming-theme-selector"
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="text-center mb-2">
            <h3
              className="text-sm font-bold mb-1"
              style={{ color: 'var(--gaming-primary)' }}
            >
              🎨 اختر الثيم
            </h3>
            <p className="text-xs opacity-70">Gaming Theme</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  setTimeout(() => setIsOpen(false), 300);
                }}
                className={`gaming-theme-option ${
                  settings.gamingTheme === theme.id ? 'active' : ''
                }`}
                data-theme={theme.id}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                title={theme.description}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-2xl mb-1">{theme.emoji}</span>
                  <span className="text-[10px] font-bold">{theme.name}</span>
                </div>

                {settings.gamingTheme === theme.id && (
                  <motion.div
                    layoutId="active-theme"
                    className="absolute inset-0 border-2 rounded-12"
                    style={{
                      borderColor: 'var(--gaming-primary)',
                      boxShadow: 'var(--gaming-glow)',
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="text-center mt-2">
            <p className="text-[10px] opacity-60">
              {themes.find(t => t.id === settings.gamingTheme)?.description}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
