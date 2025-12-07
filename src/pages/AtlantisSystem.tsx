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
import { 
  Crown, 
  Trophy, 
  Users, 
  Star, 
  Target,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AtlantisSystem = () => {
  const navigate = useNavigate();
  const { 
    loading: _loading, 
    userLevel: _userLevel, 
    userAlliance: _userAlliance, 
    weeklyLeaderboard: _weeklyLeaderboard,
    allianceLeaderboard: _allianceLeaderboard,
    currentChallenge: _currentChallenge,
    castleController: _castleController
  } = useAtlantisSystem();
  
  const { currentAnimation, showAnimation: _showAnimation, hideAnimation } = useAtlantisAnimations();

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/affiliate" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
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
            
            {/* Notifications & Chat */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/atlantis/chat')}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                دردشة أتلانتس
              </button>
              <AtlantisNotifications />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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
          <EnhancedCard variant="success" className="gradient-card-accent">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2 text-accent">
                <Star className="h-5 w-5" />
                نظام النقاط
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>مبيعة منتج</span>
                  <Badge variant="secondary">+10 نقطة</Badge>
                </div>
                <div className="flex justify-between">
                  <span>عميل جديد</span>
                  <Badge variant="secondary">+25 نقطة</Badge>
                </div>
                <div className="flex justify-between">
                  <span>تحدي أسبوعي</span>
                  <Badge variant="secondary">+100 نقطة</Badge>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="info" className="gradient-info">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2 text-info">
                <Target className="h-5 w-5" />
                التحديات
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2 text-sm">
                <p>• تحديات أسبوعية متجددة</p>
                <p>• مكافآت خاصة للفائزين</p>
                <p>• منافسة فردية وجماعية</p>
                <p>• أهداف قابلة للتحقيق</p>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="success" className="gradient-card-success">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2 text-success">
                <Sparkles className="h-5 w-5" />
                المكافآت
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2 text-sm">
                <p>• ثيمات حصرية</p>
                <p>• زيادة في نسب العمولة</p>
                <p>• شارات وألقاب فخرية</p>
                <p>• مزايا خاصة في المنصة</p>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
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