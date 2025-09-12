import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AtlantisLeaderboard } from '@/components/AtlantisLeaderboard';
import { AllianceManager } from '@/components/AllianceManager';
import { UserProgressCard } from '@/components/UserProgressCard';
import { AtlantisNotifications } from '@/components/AtlantisNotifications';
import { LiveLeaderboardUpdates } from '@/components/LiveLeaderboardUpdates';
import { AtlantisAnimations, useAtlantisAnimations } from '@/components/AtlantisAnimations';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { BackButton } from '@/components/ui/back-button';
import { 
  Crown, 
  Trophy, 
  Users, 
  Star, 
  Target,
  Gamepad2,
  Sparkles
} from 'lucide-react';

export const AtlantisSystem = () => {
  const { 
    loading, 
    userLevel, 
    userAlliance, 
    weeklyLeaderboard,
    allianceLeaderboard,
    currentChallenge,
    castleController
  } = useAtlantisSystem();
  
  const { currentAnimation, showAnimation, hideAnimation } = useAtlantisAnimations();

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/dashboard" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    نظام أتلانتس
                  </h1>
                  <p className="text-muted-foreground">
                    نظام التحفيز والمنافسة للمسوقين
                  </p>
                </div>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="flex items-center gap-2">
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
          <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Star className="h-5 w-5" />
                نظام النقاط
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Target className="h-5 w-5" />
                التحديات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• تحديات أسبوعية متجددة</p>
                <p>• مكافآت خاصة للفائزين</p>
                <p>• منافسة فردية وجماعية</p>
                <p>• أهداف قابلة للتحقيق</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Sparkles className="h-5 w-5" />
                المكافآت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• ثيمات حصرية</p>
                <p>• زيادة في نسب العمولة</p>
                <p>• شارات وألقاب فخرية</p>
                <p>• مزايا خاصة في المنصة</p>
              </div>
            </CardContent>
          </Card>
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