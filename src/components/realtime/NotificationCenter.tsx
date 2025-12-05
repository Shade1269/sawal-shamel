import React from 'react';
import { Bell, X, Check, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    clearAll 
  } = useRealTimeNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'support':
        return <AlertCircle className="h-4 w-4 text-info" />;
      default:
        return <Info className="h-4 w-4 text-info" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    const opacity = read ? 'bg-opacity-30' : 'bg-opacity-60';
    
    switch (type) {
      case 'success':
        return `bg-success/10 ${opacity}`;
      case 'error':
        return `bg-destructive/10 ${opacity}`;
      case 'warning':
        return `bg-warning/10 ${opacity}`;
      case 'support':
        return `bg-info/10 ${opacity}`;
      default:
        return `bg-muted ${opacity}`;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            الإشعارات {unreadCount > 0 && `(${unreadCount} غير مقروء)`}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full sm:w-[400px]">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              الإشعارات
            </SheetTitle>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center justify-between">
              <SheetDescription>
                {unreadCount > 0 
                  ? `لديك ${unreadCount} إشعار غير مقروء`
                  : 'جميع الإشعارات مقروءة'
                }
              </SheetDescription>
              
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll}
                  className="text-xs"
                >
                  مسح الكل
                </Button>
              )}
            </div>
          )}
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Bell className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      لا توجد إشعارات
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      ستظهر إشعاراتك الجديدة هنا
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 ${getNotificationBg(notification.type, notification.read)} ${
                    !notification.read ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight">
                            {notification.title}
                          </h4>
                          
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ar
                            })}
                          </span>
                          
                          {notification.type && (
                            <Badge 
                              variant={notification.type === 'error' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {notification.type === 'success' && 'نجح'}
                              {notification.type === 'error' && 'خطأ'}
                              {notification.type === 'warning' && 'تحذير'}
                              {notification.type === 'support' && 'دعم'}
                              {notification.type === 'info' && 'معلومات'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {!isConnected && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-warning/10 border-warning/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    فقدان الاتصال - جاري إعادة المحاولة...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;