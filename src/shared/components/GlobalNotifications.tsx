import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const GlobalNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { isAuthenticated, profile } = useFastAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [isAuthenticated, profile?.id]);

  const loadNotifications = async () => {
    // إنشاء إشعارات تجريبية للاختبار
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'مرحباً بك في أتلانتس!',
        message: 'تم إنشاء حسابك بنجاح. استكشف المنصة واستمتع بالتسوق.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/products'
      },
      {
        id: '2',
        title: 'عروض خاصة',
        message: 'لا تفوت العروض الحصرية على المنتجات المختارة - خصم يصل إلى 50%!',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/products'
      },
      {
        id: '3',
        title: 'تحديث الملف الشخصي',
        message: 'يرجى تحديث معلومات ملفك الشخصي لتحسين تجربة التسوق.',
        type: 'warning',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/profile'
      }
    ];

    if (profile?.role === 'affiliate' || profile?.role === 'merchant' || profile?.role === 'marketer') {
      sampleNotifications.push({
        id: '4',
        title: 'طلب جديد',
        message: 'تم استلام طلب جديد مرتبط بروابطك. راجع التفاصيل لمعالجته.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        actionUrl: '/affiliate/orders'
      });

      sampleNotifications.push({
        id: '5',
        title: 'عمولة جديدة',
        message: 'تهانينا! حصلت على عمولة جديدة بقيمة 150 ريال من آخر عملية بيع.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        actionUrl: '/affiliate/analytics'
      });
    }

    setNotifications(sampleNotifications);
    const unread = sampleNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const subscribeToNotifications = () => {
    // في بيئة حقيقية، سيتم الاستماع للإشعارات من الخادم
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const newNotification = payload.payload as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // عرض toast للإشعار الجديد
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative gap-2 hover:bg-primary/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute left-0 sm:left-0 top-full mt-2 z-50">
          <Card className="w-[280px] sm:w-80 max-h-[70vh] sm:max-h-96 bg-card border shadow-luxury">
            <div className="p-3 sm:p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-base sm:text-lg">الإشعارات</h3>
              <div className="flex items-center gap-1 sm:gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs px-2 py-1"
                  >
                    قراءة الكل
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[50vh] sm:max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-muted-foreground">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-xs sm:text-sm truncate">
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 sm:p-3 text-center border-t">
                <Button variant="ghost" size="sm" className="text-xs">
                  عرض جميع الإشعارات
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default GlobalNotifications;