import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Trophy, Zap, Sparkles } from 'lucide-react';

interface AtlantisAnimationsProps {
  type: 'levelUp' | 'pointsEarned' | 'challengeComplete' | 'castleCapture';
  level?: string;
  points?: number;
  onComplete?: () => void;
}

export const AtlantisAnimations = ({ 
  type, 
  level, 
  points, 
  onComplete 
}: AtlantisAnimationsProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'legendary': return 'from-purple-500 to-purple-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'legendary': return 'أسطوري';
      case 'gold': return 'ذهبي';
      case 'silver': return 'فضي';
      default: return 'برونزي';
    }
  };

  const animations = {
    levelUp: (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="text-center bg-card/95 backdrop-blur-sm p-8 rounded-2xl border shadow-2xl max-w-md mx-4"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-6"
          >
            <Crown className="h-16 w-16 mx-auto text-yellow-500" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            ترقية المستوى! 🎉
          </motion.h2>
          
          {level && (
            <motion.div
              className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${getLevelColor(level)} text-white font-bold text-lg mb-4`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <Star className="h-5 w-5 mr-2" />
              مستوى {getLevelName(level)}
            </motion.div>
          )}
          
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            تهانينا! لقد وصلت إلى مستوى جديد في أتلانتس
          </motion.p>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 60}%`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: 360,
                  y: [0, -20, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.8 + i * 0.1,
                  repeat: 2
                }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    ),

    pointsEarned: (
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg border flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
          >
            <Star className="h-6 w-6" />
          </motion.div>
          <div>
            <p className="font-semibold">نقاط جديدة!</p>
            <p className="text-sm">+{points} نقطة</p>
          </div>
        </motion.div>
      </motion.div>
    ),

    challengeComplete: (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="text-center bg-card/95 backdrop-blur-sm p-8 rounded-2xl border shadow-2xl max-w-md mx-4"
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <motion.div
            className="mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-4 text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            تحدي مكتمل! 🏆
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            أحسنت! لقد أكملت التحدي بنجاح
          </motion.p>
        </motion.div>
      </motion.div>
    ),

    castleCapture: (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="text-center bg-card/95 backdrop-blur-sm p-8 rounded-2xl border shadow-2xl max-w-md mx-4"
          initial={{ scale: 0.5, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.7 }}
        >
          <motion.div
            className="mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", duration: 1 }}
          >
            <div className="text-6xl">🏰</div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            سيطرة على القلعة! 👑
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            تحالفك يسيطر الآن على قلعة أتلانتس!
          </motion.p>
        </motion.div>
      </motion.div>
    )
  };

  return animations[type] || null;
};

// Hook لإدارة الرسوم المتحركة
export const useAtlantisAnimations = () => {
  const [currentAnimation, setCurrentAnimation] = React.useState<{
    type: AtlantisAnimationsProps['type'];
    level?: string;
    points?: number;
  } | null>(null);

  const showAnimation = (
    type: AtlantisAnimationsProps['type'], 
    props?: { level?: string; points?: number }
  ) => {
    setCurrentAnimation({ type, ...props });
    
    // إخفاء الرسوم المتحركة تلقائياً بعد 3 ثوان
    setTimeout(() => {
      setCurrentAnimation(null);
    }, 3000);
  };

  const hideAnimation = () => {
    setCurrentAnimation(null);
  };

  return {
    currentAnimation,
    showAnimation,
    hideAnimation
  };
};