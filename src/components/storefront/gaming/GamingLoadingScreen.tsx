import { motion } from 'framer-motion';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { Zap, Sparkles } from 'lucide-react';

const loadingMessages = [
  'جاري تحميل المنتجات الأسطورية...',
  'Preparing your shopping adventure...',
  'Loading epic deals...',
  'تجهيز العروض الخيالية...',
  'Initializing gaming mode...',
  'بحث عن الكنوز...',
];

export const GamingLoadingScreen = () => {
  const { settings } = useGamingSettings();
  const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  if (!settings.isGamingMode) {
    // Fallback to standard loader
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="gaming-loader" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* Animated Logo */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--gaming-gradient-1)',
            boxShadow: 'var(--gaming-glow)',
          }}
        >
          <Zap className="h-12 w-12 text-white" />
        </div>

        {/* Orbiting particles */}
        {[0, 120, 240].map((rotation, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
            style={{
              background: i === 0 ? 'var(--gaming-primary)' :
                         i === 1 ? 'var(--gaming-secondary)' :
                         'var(--gaming-accent)',
              boxShadow: `0 0 10px currentColor`,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.2,
            }}
            style={{
              transformOrigin: '0 0',
              transform: `rotate(${rotation}deg) translateX(60px)`,
            }}
          />
        ))}
      </motion.div>

      {/* Progress Bar */}
      <div className="w-64 h-3 gaming-glass-card overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            background: 'var(--gaming-gradient-1)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Loading Message */}
      <motion.p
        className="text-lg font-bold"
        style={{ color: 'var(--gaming-primary)' }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <Sparkles className="inline h-5 w-5 mr-2" />
        {randomMessage}
      </motion.p>
    </div>
  );
};
