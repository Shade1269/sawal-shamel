import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Star, Users, TrendingUp, Clock, Award, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityFeedWidgetProps {
  showLeaderboard?: boolean;
  showTeamActivities?: boolean;
  maxActivities?: number;
  className?: string;
}

const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  showLeaderboard = true,
  showTeamActivities = false,
  maxActivities = 10,
  className = '',
}) => {
  const { user } = useSupabaseAuth();
  const {
    activities,
    teamActivities,
    leaderboard,
    isConnected,
    logActivity,
    getTeamActivities,
    getLeaderboard,
    refreshFeed,
  } = useActivityFeed();

  const [activeTab, setActiveTab] = useState('activities');

  // Load leaderboard on mount
  useEffect(() => {
    if (showLeaderboard && isConnected) {
      getLeaderboard();
    }
  }, [showLeaderboard, isConnected, getLeaderboard]);

  // Load team activities if user has alliance
  useEffect(() => {
    if (showTeamActivities && isConnected && (user as any)?.alliance_id) {
      getTeamActivities((user as any).alliance_id);
    }
  }, [showTeamActivities, isConnected, (user as any)?.alliance_id, getTeamActivities]);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'sale':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'signup':
        return <Users className="h-4 w-4 text-info" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-warning" />;
      case 'login':
        return <Zap className="h-4 w-4 text-premium" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityBg = (activityType: string) => {
    switch (activityType) {
      case 'sale':
        return 'bg-success/10 border-success/30';
      case 'signup':
        return 'bg-info/10 border-info/30';
      case 'achievement':
        return 'bg-warning/10 border-warning/30';
      case 'login':
        return 'bg-premium/10 border-premium/30';
      default:
        return 'bg-muted/30';
    }
  };

  const displayActivities = activities.slice(0, maxActivities);

  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">الأنشطة المباشرة</CardTitle>
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshFeed}
            className="text-xs"
          >
            تحديث
          </Button>
        </div>
        
        <CardDescription>
          تابع آخر الأنشطة والإنجازات في الوقت الفعلي
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="activities" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              الأنشطة
            </TabsTrigger>
            
            {showLeaderboard && (
              <TabsTrigger value="leaderboard" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                المتصدرون
              </TabsTrigger>
            )}
            
            {showTeamActivities && (user as any)?.alliance_id && (
              <TabsTrigger value="team" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                الفريق
              </TabsTrigger>
            )}
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-0">
            <ScrollArea className="h-80">
              <div className="px-4 space-y-3">
                <AnimatePresence>
                  {displayActivities.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <h4 className="font-medium text-muted-foreground">
                        لا توجد أنشطة حديثة
                      </h4>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        ستظهر الأنشطة الجديدة هنا تلقائياً
                      </p>
                    </motion.div>
                  ) : (
                    displayActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`p-3 ${getActivityBg(activity.activity_type)}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getActivityIcon(activity.activity_type)}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={activity.user?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {activity.user?.username?.charAt(0) || 'م'}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <span className="text-sm font-medium">
                                  {activity.user?.username || 'مستخدم'}
                                </span>
                                
                                {activity.points_earned > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    {activity.points_earned}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground/70">
                                  {formatDistanceToNow(new Date(activity.created_at), {
                                    addSuffix: true,
                                    locale: ar,
                                  })}
                                </span>
                                
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {activity.activity_type === 'sale' && 'مبيعات'}
                                  {activity.activity_type === 'signup' && 'تسجيل'}
                                  {activity.activity_type === 'achievement' && 'إنجاز'}
                                  {activity.activity_type === 'login' && 'دخول'}
                                  {activity.activity_type === 'general' && 'عام'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Leaderboard Tab */}
          {showLeaderboard && (
            <TabsContent value="leaderboard" className="mt-0">
              <ScrollArea className="h-80">
                <div className="px-4 space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <h4 className="font-medium text-muted-foreground">
                        لا توجد بيانات للمتصدرين
                      </h4>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <Card key={entry.userId} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <Badge 
                              variant={index < 3 ? 'default' : 'secondary'}
                              className="w-8 h-8 p-0 flex items-center justify-center"
                            >
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index >= 3 && (index + 1)}
                            </Badge>
                          </div>
                          
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.user?.avatar_url} />
                            <AvatarFallback>
                              {entry.user?.username?.charAt(0) || 'م'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {entry.user?.username || 'مستخدم'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.points} نقطة
                            </p>
                          </div>
                          
                          {entry.userId === user?.id && (
                            <Badge variant="outline" className="text-xs">
                              أنت
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Team Activities Tab */}
          {showTeamActivities && (user as any)?.alliance_id && (
            <TabsContent value="team" className="mt-0">
              <ScrollArea className="h-80">
                <div className="px-4 space-y-3">
                  {teamActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <h4 className="font-medium text-muted-foreground">
                        لا توجد أنشطة للفريق
                      </h4>
                    </div>
                  ) : (
                    teamActivities.slice(0, maxActivities).map((activity) => (
                      <Card key={activity.id} className={`p-3 ${getActivityBg(activity.activity_type)}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={activity.user?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {activity.user?.username?.charAt(0) || 'م'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <span className="text-sm font-medium">
                                {activity.user?.username || 'عضو الفريق'}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            
                            <span className="text-xs text-muted-foreground/70">
                              {formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {!isConnected && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">
              جاري الاتصال...
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ActivityFeedWidget;