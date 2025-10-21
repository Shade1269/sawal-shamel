import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NotificationManagerProps {
  className?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ className }) => {
  const { user } = useSupabaseAuth();
  const notifications = useNotifications(user?.id);

  if (!notifications.isSupported) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notifications.isEnabled ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <h4 className="font-medium">الإشعارات</h4>
                <p className="text-sm text-muted-foreground">
                  {notifications.isEnabled 
                    ? 'تصلك إشعارات الرسائل الجديدة' 
                    : 'فعل الإشعارات لتصلك الرسائل الجديدة'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!notifications.isEnabled ? (
                <Button
                  size="sm"
                  onClick={notifications.requestPermission}
                  className="text-xs"
                >
                  تفعيل الإشعارات
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={notifications.unsubscribe}
                  className="text-xs"
                >
                  إيقاف الإشعارات
                </Button>
              )}
            </div>
          </div>

          {notifications.permission === 'denied' && (
            <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                تم رفض صلاحيات الإشعارات. لتفعيل الإشعارات، اذهب إلى إعدادات المتصفح وافعل الإشعارات لهذا الموقع.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;