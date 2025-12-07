import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  ShoppingCart, 
  Package, 
  Award,
  Info,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'order' | 'achievement' | 'product' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: JSX.Element;
  priority: 'low' | 'medium' | 'high';
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // محاكاة الإشعارات (في التطبيق الحقيقي ستأتي من الخادم)
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'order',
        title: 'طلب جديد!',
        message: 'تم تأكيد طلب جديد بقيمة 245 ر.س من العميلة سارة أحمد',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        actionUrl: '/affiliate/orders/1001',
        icon: <ShoppingCart className="h-4 w-4" />,
        priority: 'high'
      },
      {
        id: '2',
        type: 'achievement',
        title: 'إنجاز جديد! 🏆',
        message: 'مبروك! وصلت لـ 100 مبيعة هذا الشهر واكتسبت 50 نقطة إضافية',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        icon: <Award className="h-4 w-4 text-warning" />,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'product',
        title: 'نفد المخزون',
        message: 'المنتج "فستان صيفي أنيق" وصل لآخر 3 قطع متاحة',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
        actionUrl: '/affiliate/products/1',
        icon: <Package className="h-4 w-4 text-warning" />,
        priority: 'medium'
      },
      {
        id: '4',
        type: 'system',
        title: 'تحديث جديد',
        message: 'تم إضافة ميزة الثيمات الجديدة! جرب الثيم الأسطوري الآن',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/affiliate/store/themes',
        icon: <Info className="h-4 w-4 text-info" />,
        priority: 'low'
      },
      {
        id: '5',
        type: 'promotion',
        title: 'عرض خاص!',
        message: 'احصل على 20% خصم إضافي على جميع الأحذية لمدة محدودة',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        icon: <Gift className="h-4 w-4 text-success" />,
        priority: 'medium'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "تم وضع علامة مقروء",
      description: "تم وضع علامة مقروء على جميع الإشعارات"
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-info" />;
      case 'achievement': return <Award className="h-4 w-4 text-warning" />;
      case 'product': return <Package className="h-4 w-4 text-warning" />;
      case 'system': return <Info className="h-4 w-4 text-info" />;
      case 'promotion': return <Gift className="h-4 w-4 text-success" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" side="bottom" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                وضع علامة مقروء على الكل
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2 space-y-2">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`border-l-4 ${getPriorityColor(notification.priority)}`}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          // Navigate to action URL
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              
                              {notification.actionUrl && (
                                <Badge variant="outline" className="text-xs">
                                  انقر للعرض
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                // Navigate to all notifications page
                setIsOpen(false);
              }}
            >
              عرض جميع الإشعارات
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;