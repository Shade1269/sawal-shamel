import { motion } from 'framer-motion';
import { UnifiedBadge } from '@/components/design-system';
import { Activity } from 'lucide-react';

interface HomeHeroProps {
  isDarkMode: boolean;
}

export const HomeHero = ({ isDarkMode }: HomeHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <div className="flex items-center justify-center mb-8">
        <div className="glass-button-strong px-6 py-3 rounded-full shadow-glow animate-pulse premium-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer"></div>
          <span className="relative z-10 text-sm font-bold">🚀 منصة حية مع بيانات حقيقية</span>
        </div>
      </div>

      <h1 className={`text-6xl md:text-8xl font-black mb-6 heading-ar tracking-tight leading-tight ${
        isDarkMode
          ? 'gradient-text-hero'
          : 'text-slate-900 drop-shadow-[0_2px_8px_rgba(15,23,42,0.15)]'
      }`}>
        منصة أتلانتس
        <br />
        <span className={`text-5xl md:text-6xl font-extrabold ${
          isDarkMode
            ? 'gradient-text-luxury'
            : 'text-slate-800 drop-shadow-[0_2px_6px_rgba(15,23,42,0.1)]'
        }`}>
          للتجارة الإلكترونية
        </span>
      </h1>

      <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto leading-relaxed elegant-text text-muted-foreground/90">
        استكشف عالم التسوق الفاخر مع تجربة تجارة إلكترونية لا مثيل لها
      </p>

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground/70">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="premium-text">نشط الآن</span>
        </div>
        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="premium-text">152+ منتج</span>
        </div>
        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-premium rounded-full"></div>
          <span className="premium-text">25+ مستخدم</span>
        </div>
      </div>
    </motion.div>
  );
};
