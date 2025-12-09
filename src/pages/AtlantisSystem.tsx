import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { AtlantisLeaderboard } from '@/features/chat/components/AtlantisLeaderboard';
import { UserProgressCard } from '@/components/UserProgressCard';
import { AtlantisNotifications } from '@/features/chat/components/AtlantisNotifications';
import { LiveLeaderboardUpdates } from '@/features/chat/components/LiveLeaderboardUpdates';
import { AtlantisAnimations, useAtlantisAnimations } from '@/features/chat/components/AtlantisAnimations';
import { AllianceManager } from '@/features/affiliate/components/AllianceManager';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Trophy, 
  Users, 
  Star, 
  Target,
  Sparkles,
  MessageCircle,
  Gamepad2,
  Snowflake,
  Zap,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AtlantisSystem = () => {
  const navigate = useNavigate();
  const { 
    loading: _loading, 
    userLevel, 
    userAlliance: _userAlliance, 
    weeklyLeaderboard: _weeklyLeaderboard,
    allianceLeaderboard: _allianceLeaderboard,
    currentChallenge: _currentChallenge,
    castleController: _castleController
  } = useAtlantisSystem();
  
  const { currentAnimation, showAnimation: _showAnimation, hideAnimation } = useAtlantisAnimations();

  const quickActions = [
    {
      icon: <Snowflake className="w-6 h-6" />,
      title: 'صقيع أتلانتس',
      description: 'لعبة البقاء والمنافسة',
      color: 'from-blue-600 to-cyan-600',
      route: '/atlantis/frost'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'غرف الدردشة',
      description: 'تواصل مع المجتمع',
      color: 'from-purple-600 to-pink-600',
      route: '/atlantis/chat'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'التحديات',
      description: 'اربح مكافآت إضافية',
      color: 'from-amber-600 to-orange-600',
      route: '/atlantis/guide'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/affiliate" />
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Crown className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                    نظام أتلانتس
                  </h1>
                  <p className="text-muted-foreground">
                    نظام التحفيز والمنافسة للمسوقين
                  </p>
                </div>
              </div>
            </div>
            
            {/* User Stats Quick View */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-bold">{userLevel?.total_points || 0} نقطة</span>
              </div>
              <AtlantisNotifications />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                className={`w-full h-auto p-0 overflow-hidden rounded-xl`}
                onClick={() => navigate(action.route)}
              >
                <div className={`w-full bg-gradient-to-br ${action.color} p-6 text-white text-right`}>
                  <div className="flex items-start justify-between">
                    <motion.div
                      className="p-3 bg-white/20 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {action.icon}
                    </motion.div>
                    <Gamepad2 className="w-5 h-5 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mt-4">{action.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{action.description}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User Progress */}
          <div className="lg:col-span-1 space-y-6">
            <UserProgressCard />
            <LiveLeaderboardUpdates />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="leaderboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  لوحة المتصدرين
                </TabsTrigger>
                <TabsTrigger value="alliances" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  إدارة التحالفات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard">
                <AtlantisLeaderboard />
              </TabsContent>

              <TabsContent value="alliances">
                <AllianceManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EnhancedCard variant="success" className="gradient-card-accent h-full">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2 text-accent">
                  <Star className="h-5 w-5" />
                  نظام النقاط
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/10 transition-colors">
                    <span>مبيعة منتج</span>
                    <Badge variant="secondary">+10 نقطة</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/10 transition-colors">
                    <span>عميل جديد</span>
                    <Badge variant="secondary">+25 نقطة</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/10 transition-colors">
                    <span>تحدي أسبوعي</span>
                    <Badge variant="secondary">+100 نقطة</Badge>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EnhancedCard variant="info" className="gradient-info h-full">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2 text-info">
                  <Target className="h-5 w-5" />
                  التحديات
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    تحديات أسبوعية متجددة
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    مكافآت خاصة للفائزين
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    منافسة فردية وجماعية
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    أهداف قابلة للتحقيق
                  </p>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <EnhancedCard variant="success" className="gradient-card-success h-full">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2 text-success">
                  <Gift className="h-5 w-5" />
                  المكافآت
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    ثيمات حصرية
                  </p>
                  <p className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    زيادة في نسب العمولة
                  </p>
                  <p className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    شارات وألقاب فخرية
                  </p>
                  <p className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    مزايا خاصة في المنصة
                  </p>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </motion.div>
        </div>
      </div>

      {/* Animations */}
      {currentAnimation && (
        <AtlantisAnimations
          type={currentAnimation.type}
          level={currentAnimation.level}
          points={currentAnimation.points}
          onComplete={hideAnimation}
        />
      )}
    </div>
  );
};

export default AtlantisSystem;