import { Crown, Trophy, Medal, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/hooks/useAtlantisSystem';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  position: number;
}

export const LeaderboardCard = ({ entry, position }: LeaderboardCardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default" as const;
      case 2:
        return "secondary" as const;
      case 3:
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'legendary':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      default:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
      position <= 3 ? 'ring-2 ring-primary/20 bg-gradient-to-r from-primary/5 to-transparent' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Rank and User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRankIcon(position)}
              <Badge variant={getRankBadgeVariant(position)} className="font-bold">
                #{position}
              </Badge>
            </div>
            
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={entry.user_profile?.avatar_url} 
                alt={entry.user_profile?.full_name || 'User'} 
              />
              <AvatarFallback>
                {entry.user_profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <h3 className="font-semibold text-lg">
                {entry.user_profile?.full_name || 'مسوق مجهول'}
              </h3>
              <div className="flex items-center space-x-2">
                {entry.theme_earned && (
                  <Badge 
                    className={`text-xs ${getLevelBadgeColor(entry.theme_earned)}`}
                  >
                    {entry.theme_earned === 'legendary' ? 'أسطوري' :
                     entry.theme_earned === 'gold' ? 'ذهبي' :
                     entry.theme_earned === 'silver' ? 'فضي' : 'برونزي'}
                  </Badge>
                )}
                {entry.rank_change !== 0 && (
                  <div className="flex items-center space-x-1">
                    {getRankChangeIndicator(entry.rank_change)}
                    <span className={`text-xs ${
                      entry.rank_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(entry.rank_change)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right space-y-1">
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-primary">
                {formatNumber(entry.points)}
              </span>
              <span className="text-xs text-muted-foreground">نقطة</span>
            </div>
            
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-semibold">{formatNumber(entry.sales_amount)}</div>
                <div className="text-xs">ر.س</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{entry.orders_count}</div>
                <div className="text-xs">طلب</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{entry.customers_count}</div>
                <div className="text-xs">عميل</div>
              </div>
            </div>

            {entry.bonus_earned > 0 && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                مكافأة: +{formatNumber(entry.bonus_earned)} نقطة
              </div>
            )}
          </div>
        </div>

        {/* Special effects for top 3 */}
        {position <= 3 && (
          <div className="mt-3 pt-3 border-t border-primary/10">
            <div className="flex justify-center">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                position === 1 ? 'bg-yellow-100 text-yellow-800' :
                position === 2 ? 'bg-gray-100 text-gray-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {position === 1 ? '🏆 المركز الأول - ثيم ذهبي خاص' :
                 position === 2 ? '🥈 المركز الثاني - مكافأة عمولة 5%' :
                 '🥉 المركز الثالث - مكافأة عمولة 5%'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};