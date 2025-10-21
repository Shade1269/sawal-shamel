import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { Star, Trophy, TrendingUp, Target, Award } from 'lucide-react';

export const UserProgressCard = () => {
  const { userLevel, userAlliance, userMembership } = useAtlantisSystem();

  if (!userLevel) return null;

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

  const progressPercentage = ((userLevel.total_points / userLevel.next_level_threshold) * 100);
  const isMaxLevel = userLevel.current_level === 'legendary';

  return (
    <Card className="bg-gradient-to-br from-card/90 to-card backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            تقدمك في أتلانتس
          </CardTitle>
          <Badge className={`bg-gradient-to-r ${getLevelColor(userLevel.current_level)} text-white`}>
            {getLevelName(userLevel.current_level)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>تقدم المستوى</span>
            <span className="font-semibold">
              {userLevel.total_points} / {userLevel.next_level_threshold} نقطة
            </span>
          </div>
          {!isMaxLevel && (
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
          )}
          {isMaxLevel && (
            <div className="text-center py-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2">
                🏆 وصلت للمستوى الأقصى!
              </Badge>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{userLevel.total_points}</p>
            <p className="text-xs text-muted-foreground">إجمالي النقاط</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">{userLevel.level_points}</p>
            <p className="text-xs text-muted-foreground">نقاط المستوى</p>
          </div>
        </div>

        {/* Alliance Info */}
        {userAlliance && userMembership && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">التحالف الحالي</span>
              <Badge variant="outline">
                {userMembership.role === 'leader' ? 'قائد' : 'عضو'}
              </Badge>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-blue-800">{userAlliance.name}</p>
              <p className="text-xs text-muted-foreground">
                مساهمتك: {userMembership.contribution_points} نقطة
              </p>
            </div>
          </div>
        )}

        {/* Next Level Benefits */}
        {!isMaxLevel && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Target className="h-4 w-4" />
              مزايا المستوى التالي
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {userLevel.current_level === 'bronze' && (
                <>
                  <p>• إمكانية إنشاء تحالف</p>
                  <p>• زيادة نسبة العمولة 5%</p>
                  <p>• أدوات تسويقية متقدمة</p>
                </>
              )}
              {userLevel.current_level === 'silver' && (
                <>
                  <p>• ثيم ذهبي حصري</p>
                  <p>• زيادة نسبة العمولة 10%</p>
                  <p>• مزايا قيادة التحالف</p>
                </>
              )}
              {userLevel.current_level === 'gold' && (
                <>
                  <p>• ثيم أسطوري حصري</p>
                  <p>• زيادة نسبة العمولة 15%</p>
                  <p>• إمكانية السيطرة على القلعة</p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};