import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Star, 
  Trophy, 
  Sparkles, 
  Zap,
  Award,
  Target
} from 'lucide-react';

interface AnimationTrigger {
  type: 'level_up' | 'achievement' | 'rank_change' | 'challenge_complete';
  data: any;
}

interface AtlantisAnimationsProps {
  trigger?: AnimationTrigger;
  onAnimationComplete?: () => void;
}

export const AtlantisAnimations = ({ trigger, onAnimationComplete }: AtlantisAnimationsProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<string>('');

  useEffect(() => {
    if (trigger) {
      setAnimationType(trigger.type);
      setShowAnimation(true);
      
      // Auto hide after animation duration
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onAnimationComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onAnimationComplete]);

  const levelUpAnimation = "animate-scale-in animate-fade-in";
  const achievementAnimation = "animate-fade-in";
  const rankChangeAnimation = "animate-slide-in-right";

  const renderLevelUpAnimation = () => (
    <div className="relative animate-scale-in">
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-8 shadow-2xl">
        <Crown className="h-16 w-16 text-white mx-auto" />
      </div>
      
      {/* Sparkles around the crown */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${20 + (i % 2) * 60}%`,
              animationDelay: `${i * 200}ms`
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
        ))}
      </div>

      <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🎉 ترقية مستوى!
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          وصلت للمستوى {trigger?.data?.newLevel || 'الجديد'}
        </p>
        <Badge className="mt-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2">
          +{trigger?.data?.bonusPoints || 100} نقطة مكافأة
        </Badge>
      </div>
    </div>
  );

  const renderAchievementAnimation = () => (
    <div className="text-center animate-fade-in">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 shadow-2xl mx-auto w-fit hover-scale">
        <Trophy className="h-12 w-12 text-white" />
      </div>
      
      <div className="mt-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="text-2xl font-bold text-yellow-600">
          🏆 إنجاز جديد!
        </h2>
        <p className="text-muted-foreground mt-2">
          {trigger?.data?.achievementName || 'حققت إنجازاً مميزاً'}
        </p>
      </div>
    </div>
  );

  const renderRankChangeAnimation = () => (
    <div className="flex items-center gap-4 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-full p-4 shadow-lg hover-scale">
        <Target className="h-8 w-8 text-white" />
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-xl font-semibold text-green-600">
          📈 تحسن في الترتيب!
        </h3>
        <p className="text-muted-foreground">
          تقدمت للمركز #{trigger?.data?.newRank || 1}
        </p>
      </div>
    </div>
  );

  const renderAnimationContent = () => {
    switch (animationType) {
      case 'level_up':
        return renderLevelUpAnimation();
      case 'achievement':
        return renderAchievementAnimation();
      case 'rank_change':
        return renderRankChangeAnimation();
      default:
        return renderLevelUpAnimation();
    }
  };

  return (
    <>
      {showAnimation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAnimation(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {renderAnimationContent()}
            
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAnimation(false)}
                className="mt-4 hover-scale"
              >
                رائع! 🎉
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Hook for triggering animations
export const useAtlantisAnimations = () => {
  const [animationTrigger, setAnimationTrigger] = useState<AnimationTrigger | undefined>();

  const triggerLevelUp = (newLevel: string, bonusPoints: number = 100) => {
    setAnimationTrigger({
      type: 'level_up',
      data: { newLevel, bonusPoints }
    });
  };

  const triggerAchievement = (achievementName: string) => {
    setAnimationTrigger({
      type: 'achievement',
      data: { achievementName }
    });
  };

  const triggerRankChange = (newRank: number) => {
    setAnimationTrigger({
      type: 'rank_change',
      data: { newRank }
    });
  };

  const clearTrigger = () => {
    setAnimationTrigger(undefined);
  };

  return {
    animationTrigger,
    triggerLevelUp,
    triggerAchievement,
    triggerRankChange,
    clearTrigger
  };
};