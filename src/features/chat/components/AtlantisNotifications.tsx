import { useEffect, useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Star, 
  Crown, 
  Target, 
  Users, 
  X,
  TrendingUp,
} from 'lucide-react';

interface AtlantisNotification {
  id: string;
  type: 'level_up' | 'new_challenge' | 'alliance_update' | 'leaderboard_change' | 'castle_control';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export const AtlantisNotifications = () => {
  const [notifications, setNotifications] = useState<AtlantisNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { userLevel } = useAtlantisSystem();
  const { toast } = useToast();

  // Mock notifications for demonstration
  useEffect(() => {
    // Simulate receiving notifications
    const mockNotifications: AtlantisNotification[] = [
      {
        id: '1',
        type: 'new_challenge',
        title: 'تحدي جديد!',
        message: 'تحدي أسبوعي جديد: وصل لـ 100 عميل جديد واربح 500 نقطة',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'leaderboard_change',
        title: 'تغيير في الترتيب',
        message: 'تقدمت 3 مراكز في ترتيب المسوقين هذا الأسبوع!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'alliance_update',
        title: 'تحديث التحالف',
        message: 'تحالفك صعد للمركز الثاني في الترتيب الأسبوعي',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!userLevel) return;

    // Subscribe to level changes
    const levelChannel = supabase
      .channel('user-level-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_levels',
          filter: `user_id=eq.${userLevel.user_id}`
        },
        (payload) => {
          const oldLevel = payload.old?.current_level;
          const newLevel = payload.new?.current_level;
          
          if (oldLevel !== newLevel) {
            const levelNames = {
              bronze: 'برونزي',
              silver: 'فضي', 
              gold: 'ذهبي',
              legendary: 'أسطوري'
            };

            const notification: AtlantisNotification = {
              id: Date.now().toString(),
              type: 'level_up',
              title: '🎉 ترقية مستوى!',
              message: `تهانينا! وصلت للمستوى ${levelNames[newLevel as keyof typeof levelNames]}`,
              timestamp: new Date().toISOString(),
              read: false
            };

            setNotifications(prev => [notification, ...prev]);
            
            toast({
              title: notification.title,
              description: notification.message,
              duration: 5000
            });

            // Play sound effect using TTS
            try {
              import('@/lib/atlantisServices').then(({ AtlantisTTSService }) => {
                AtlantisTTSService.playLevelUpSound(newLevel as any);
              });
            } catch (e) {
              console.warn('Could not play level up sound:', e);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new challenges
    const challengeChannel = supabase
      .channel('new-challenges')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weekly_challenges'
        },
        (payload) => {
          const challenge = payload.new;
          const notification: AtlantisNotification = {
            id: Date.now().toString(),
            type: 'new_challenge',
            title: '🎯 تحدي جديد!',
            message: `تحدي جديد: ${challenge.name} - مكافأة ${challenge.bonus_points} نقطة`,
            data: challenge,
            timestamp: new Date().toISOString(),
            read: false
          };

          setNotifications(prev => [notification, ...prev]);
          
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000
          });

          // Play challenge sound
          try {
            import('@/lib/atlantisServices').then(({ AtlantisTTSService }) => {
              AtlantisTTSService.playNewChallengeSound(challenge.name);
            });
          } catch (e) {
            console.warn('Could not play challenge sound:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(levelChannel);
      supabase.removeChannel(challengeChannel);
    };
  }, [userLevel, toast]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'level_up': return <Star className="h-5 w-5 text-premium" />;
      case 'new_challenge': return <Target className="h-5 w-5 text-info" />;
      case 'alliance_update': return <Users className="h-5 w-5 text-accent" />;
      case 'leaderboard_change': return <TrendingUp className="h-5 w-5 text-success" />;
      case 'castle_control': return <Crown className="h-5 w-5 text-warning" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-destructive text-destructive-foreground animate-pulse"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card border rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">إشعارات أتلانتس</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-primary/5 border-r-2 border-primary' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              >
                تعيين الكل كمقروء
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};