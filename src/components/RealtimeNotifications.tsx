import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  ShoppingBag,
  DollarSign,
  Award,
  MessageSquare,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'message' | 'order' | 'commission';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  user_id: string;
}

interface NotificationIconProps {
  type: string;
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, className = "w-4 h-4" }) => {
  const iconMap = {
    info: <Info className={className} />,
    success: <Check className={className} />,
    warning: <AlertTriangle className={className} />,
    error: <X className={className} />,
    achievement: <Award className={className} />,
    message: <MessageSquare className={className} />,
    order: <ShoppingBag className={className} />,
    commission: <DollarSign className={className} />
  };

  return iconMap[type as keyof typeof iconMap] || <Bell className={className} />;
};

const RealtimeNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useFastAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Define colors directly
  const colors = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--destructive)',
    info: 'var(--info)',
    accent: 'var(--accent)',
    muted: 'var(--muted)'
  };

  // Load notifications on mount
  useEffect(() => {
    if (isAuthenticated && profile?.id) {
      loadNotifications();
      setupRealtimeSubscription();
    }
  }, [isAuthenticated, profile?.id]);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    if (!profile?.id) return;

    try {
      // Since we don't have a notifications table, let's create mock notifications
      // In a real app, you would fetch from your notifications table
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'إنجاز جديد!',
          description: 'لقد حصلت على مستوى جديد: المستوى الفضي',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          read: false,
          actionUrl: '/profile',
          user_id: profile.id
        },
        {
          id: '2',
          type: 'commission',
          title: 'عمولة جديدة',
          description: 'تم إضافة عمولة بقيمة 50 ريال من عملية بيع',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
          metadata: { amount: 50, currency: 'SAR' },
          user_id: profile.id
        },
        {
          id: '3',
          type: 'order',
          title: 'طلب جديد',
          description: 'تم استلام طلب جديد في متجرك',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: true,
          actionUrl: '/orders',
          user_id: profile.id
        },
        {
          id: '4',
          type: 'message',
          title: 'رسالة جديدة',
          description: 'لديك رسالة جديدة في الدردشة',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          read: true,
          actionUrl: '/chat',
          user_id: profile.id
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!profile?.id) return;

    // Setup realtime subscription for new notifications
    // In a real app, you would subscribe to your notifications table
    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_notifications',
          filter: `user_id=eq.${profile.id}`
        }, 
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.description,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );

      // In a real app, you would update the database
      // await supabase
      //   .from('user_notifications')
      //   .update({ read: true })
      //   .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      // In a real app, you would update the database
      // await supabase
      //   .from('user_notifications')
      //   .update({ read: true })
      //   .eq('user_id', profile?.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // In a real app, you would delete from the database
      // await supabase
      //   .from('user_notifications')
      //   .delete()
      //   .eq('id', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // Use navigate for internal routes
      if (notification.actionUrl.startsWith('/')) {
        navigate(notification.actionUrl);
      } else {
        // External URL - use window.location
        window.location.href = notification.actionUrl;
      }
    }
    setIsOpen(false);
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      info: colors.info,
      success: colors.success,
      warning: colors.warning,
      error: colors.danger,
      achievement: colors.warning,
      message: colors.accent,
      order: colors.primary,
      commission: colors.success
    };
    return colorMap[type as keyof typeof colorMap] || colors.muted;
  };

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <UnifiedButton variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full min-w-[20px] h-5 text-xs flex items-center justify-center font-medium"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </UnifiedButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <UnifiedBadge variant="secondary" className="text-xs">
                {unreadCount} جديد
              </UnifiedBadge>
            )}
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4" />
            </UnifiedButton>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-full flex-shrink-0 mt-0.5"
                        style={{ 
                          backgroundColor: `${getNotificationColor(notification.type)}20`,
                          color: getNotificationColor(notification.type)
                        }}
                      >
                        <NotificationIcon type={notification.type} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <UnifiedButton
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </UnifiedButton>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                              locale: ar
                            })}
                          </span>
                          
                          {notification.metadata?.amount && (
                            <UnifiedBadge variant="outline" className="text-xs">
                              {notification.metadata.amount} {notification.metadata.currency}
                            </UnifiedBadge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-3">
            <UnifiedButton variant="outline" className="w-full text-sm">
              عرض جميع الإشعارات
            </UnifiedButton>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RealtimeNotifications;