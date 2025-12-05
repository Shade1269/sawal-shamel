import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Users, 
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react';

interface RankingChange {
  id: string;
  userId: string;
  userName: string;
  previousRank: number;
  currentRank: number;
  pointsGained: number;
  timestamp: string;
  type: 'individual' | 'alliance';
}

export const LiveLeaderboardUpdates = () => {
  const [recentChanges, setRecentChanges] = useState<RankingChange[]>([]);
  const [isLive, setIsLive] = useState(true);
  const { fetchWeeklyLeaderboard, fetchAllianceLeaderboard } = useAtlantisSystem();

  // Mock live updates for demonstration
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate live ranking changes
      const mockChanges: RankingChange[] = [
        {
          id: Date.now().toString(),
          userId: 'user1',
          userName: 'أحمد المسوق',
          previousRank: 5,
          currentRank: 3,
          pointsGained: 150,
          timestamp: new Date().toISOString(),
          type: 'individual'
        }
      ];

      setRecentChanges(prev => [...mockChanges, ...prev.slice(0, 9)]);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // Real-time subscription to leaderboard changes
  useEffect(() => {
    const leaderboardChannel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'weekly_leaderboard'
        },
        (payload) => {
          const oldRank = payload.old?.rank;
          const newRank = payload.new?.rank;
          const pointsGained = (payload.new?.points || 0) - (payload.old?.points || 0);

          if (oldRank !== newRank && pointsGained > 0) {
            const change: RankingChange = {
              id: Date.now().toString(),
              userId: payload.new.user_id,
              userName: payload.new.profiles?.full_name || 'مسوق',
              previousRank: oldRank,
              currentRank: newRank,
              pointsGained,
              timestamp: new Date().toISOString(),
              type: 'individual'
            };

            setRecentChanges(prev => [change, ...prev.slice(0, 9)]);
            
            // Refresh leaderboard data
            fetchWeeklyLeaderboard();
          }
        }
      )
      .subscribe();

    const allianceLeaderboardChannel = supabase
      .channel('alliance-leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alliance_weekly_leaderboard'
        },
        (payload) => {
          const oldRank = payload.old?.rank;
          const newRank = payload.new?.rank;
          const pointsGained = (payload.new?.total_points || 0) - (payload.old?.total_points || 0);

          if (oldRank !== newRank && pointsGained > 0) {
            const change: RankingChange = {
              id: Date.now().toString(),
              userId: payload.new.alliance_id,
              userName: payload.new.alliance?.name || 'تحالف',
              previousRank: oldRank,
              currentRank: newRank,
              pointsGained,
              timestamp: new Date().toISOString(),
              type: 'alliance'
            };

            setRecentChanges(prev => [change, ...prev.slice(0, 9)]);
            
            // Refresh alliance leaderboard data
            fetchAllianceLeaderboard();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leaderboardChannel);
      supabase.removeChannel(allianceLeaderboardChannel);
    };
  }, [fetchWeeklyLeaderboard, fetchAllianceLeaderboard]);

  const getRankChangeIcon = (previousRank: number, currentRank: number) => {
    if (currentRank < previousRank) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (currentRank > previousRank) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getRankChangeText = (previousRank: number, currentRank: number) => {
    const difference = Math.abs(previousRank - currentRank);
    if (currentRank < previousRank) {
      return `تقدم ${difference} ${difference === 1 ? 'مركز' : 'مراكز'}`;
    } else if (currentRank > previousRank) {
      return `تراجع ${difference} ${difference === 1 ? 'مركز' : 'مراكز'}`;
    }
    return 'بدون تغيير';
  };

  return (
    <Card className="bg-gradient-success border-success/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-5 w-5" />
            التحديثات المباشرة
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${isLive ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs font-medium">
                {isLive ? 'مباشر' : 'متوقف'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              <RefreshCw className={`h-4 w-4 ${isLive ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentChanges.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد تحديثات حديثة</p>
            </div>
          ) : (
            recentChanges.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {change.type === 'alliance' ? (
                      <Users className="h-4 w-4 text-accent" />
                    ) : (
                      <Trophy className="h-4 w-4 text-premium" />
                    )}
                    {change.currentRank <= 3 && (
                      <Crown className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm">{change.userName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        #{change.previousRank} → #{change.currentRank}
                      </span>
                      <span>•</span>
                      <span>+{change.pointsGained} نقطة</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getRankChangeIcon(change.previousRank, change.currentRank)}
                    <span className={`text-xs font-medium ${
                      change.currentRank < change.previousRank ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {getRankChangeText(change.previousRank, change.currentRank)}
                    </span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {change.type === 'alliance' ? 'تحالف' : 'فردي'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {recentChanges.length > 0 && (
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};