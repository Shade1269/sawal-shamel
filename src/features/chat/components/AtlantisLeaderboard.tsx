import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaderboardCard } from './LeaderboardCard';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { Loader2, Trophy, Users, Calendar, Crown, Target } from 'lucide-react';

export const AtlantisLeaderboard = () => {
  const {
    loading,
    weeklyLeaderboard,
    allianceLeaderboard,
    currentChallenge,
    castleController,
    fetchWeeklyLeaderboard,
    fetchAllianceLeaderboard
  } = useAtlantisSystem();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchWeeklyLeaderboard(),
      fetchAllianceLeaderboard()
    ]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل التصنيفات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Castle Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 gradient-card-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <CardTitle>لوحة المتصدرين - أتلانتس</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'تحديث'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              تابع ترتيبك ومنافسة أفضل المسوقين والتحالفات في المملكة
            </p>
          </CardContent>
        </Card>

        {/* Castle Controller Card */}
        <Card className="bg-gradient-warning/10 border-warning/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              <CardTitle className="text-foreground">سيطرة القلعة</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {castleController ? (
              <div className="space-y-2">
                <p className="font-semibold text-yellow-800">
                  {castleController.name}
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {castleController.member_count} أعضاء
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">لا يوجد تحالف مسيطر</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Challenge */}
      {currentChallenge && (
        <Card className="bg-gradient-luxury/10 border-luxury/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-luxury" />
              <CardTitle className="text-foreground">التحدي الأسبوعي</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-purple-800">{currentChallenge.name}</h3>
                <p className="text-sm text-purple-600">{currentChallenge.description}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">الهدف</p>
                <p className="text-2xl font-bold text-purple-800">
                  {currentChallenge.target_value.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">مكافأة</p>
                <p className="text-xl font-bold text-purple-800">
                  +{currentChallenge.bonus_points} نقطة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            المسوقين الأفراد
          </TabsTrigger>
          <TabsTrigger value="alliances" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            التحالفات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">ترتيب المسوقين لهذا الأسبوع</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              الأسبوع الحالي
            </Badge>
          </div>
          
          {weeklyLeaderboard.length > 0 ? (
            <div className="space-y-4">
              {weeklyLeaderboard.map((entry, index) => (
                <LeaderboardCard 
                  key={entry.id} 
                  entry={entry} 
                  position={index + 1} 
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  لا توجد بيانات للأسبوع الحالي
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alliances" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">ترتيب التحالفات لهذا الأسبوع</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              الأسبوع الحالي
            </Badge>
          </div>
          
          {allianceLeaderboard.length > 0 ? (
            <div className="space-y-4">
              {allianceLeaderboard.map((entry, index) => (
                <Card 
                  key={entry.id}
                  className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    index < 3 ? 'ring-2 ring-primary/20 gradient-card-primary' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                          {index === 1 && <Trophy className="h-6 w-6 text-gray-400" />}
                          {index === 2 && <Trophy className="h-6 w-6 text-amber-600" />}
                          <Badge variant={index < 3 ? "default" : "outline"} className="font-bold">
                            #{index + 1}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">
                            {entry.alliance?.name || 'تحالف مجهول'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {entry.active_members} أعضاء نشطين
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            {entry.total_points.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">نقطة</span>
                        </div>
                        
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <div className="text-center">
                            <div className="font-semibold">{entry.total_sales.toLocaleString()}</div>
                            <div className="text-xs">ر.س</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{entry.total_orders}</div>
                            <div className="text-xs">طلب</div>
                          </div>
                        </div>

                        {entry.castle_controlled && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            🏰 يسيطر على القلعة
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  لا توجد تحالفات مسجلة للأسبوع الحالي
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};