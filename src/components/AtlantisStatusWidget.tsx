import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Star, 
  Users, 
  Trophy,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface AtlantisStatusWidgetProps {
  compact?: boolean;
}

export const AtlantisStatusWidget = ({ compact = false }: AtlantisStatusWidgetProps) => {
  const { loading, userLevel, userAlliance, userMembership } = useAtlantisSystem();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">جاري التحميل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
        onClick={() => navigate('/atlantis')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <Badge className={`bg-gradient-to-r ${getLevelColor(userLevel.current_level)} text-white text-xs`}>
                  {getLevelName(userLevel.current_level)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {userLevel.total_points} نقطة
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/90 to-card backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">أتلانتس</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/atlantis')}
              className="text-primary hover:bg-primary/10"
            >
              عرض التفاصيل
              <ArrowRight className="h-3 w-3 mr-1" />
            </Button>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-3">
            <Badge className={`bg-gradient-to-r ${getLevelColor(userLevel.current_level)} text-white px-3 py-1`}>
              {getLevelName(userLevel.current_level)}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              {userLevel.total_points} نقطة
            </div>
          </div>

          {/* Progress */}
          {!isMaxLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>للمستوى التالي</span>
                <span>{userLevel.next_level_threshold - userLevel.total_points} نقطة</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Alliance Info */}
          {userAlliance && userMembership && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {userAlliance.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {userMembership.role === 'leader' ? 'قائد' : 'عضو'}
              </Badge>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-primary/5 rounded-lg">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">الترتيب</p>
              <p className="text-sm font-semibold">-</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-xs text-muted-foreground">المساهمة</p>
              <p className="text-sm font-semibold">
                {userMembership?.contribution_points || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};