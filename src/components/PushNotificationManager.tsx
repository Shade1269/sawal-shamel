import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Settings, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';

interface NotificationSettings {
  orders: boolean;
  promotions: boolean;
  systemUpdates: boolean;
  chatMessages: boolean;
}

export const PushNotificationManager: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    orders: true,
    promotions: false,
    systemUpdates: true,
    chatMessages: true
  });

  const { toast } = useToast();
  const { profile } = useFastAuth();

  useEffect(() => {
    checkNotificationSupport();
    loadStoredSettings();
  }, []);

  const checkNotificationSupport = () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // تحقق من الاشتراك الحالي
      checkCurrentSubscription();
    } else {
      setIsSupported(false);
      toast({
        title: "الإشعارات غير مدعومة",
        description: "متصفحك لا يدعم الإشعارات الفورية",
        variant: "destructive"
      });
    }
  };

  const checkCurrentSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const loadStoredSettings = () => {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const requestPermission = async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
        toast({
          title: "تم تفعيل الإشعارات",
          description: "سيتم إرسال الإشعارات المهمة إليك"
        });
      } else if (result === 'denied') {
        toast({
          title: "تم رفض الإشعارات",
          description: "لن تتلقى إشعارات من التطبيق",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "خطأ في طلب الإذن",
        description: "حدث خطأ أثناء طلب إذن الإشعارات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      // تحقق من وجود service worker
      let registration = await navigator.serviceWorker.getRegistration('/sw.js');
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      // انتظار service worker ليصبح جاهزاً
      await navigator.serviceWorker.ready;

      // إنشاء اشتراك push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      // حفظ الاشتراك في قاعدة البيانات
      await saveSubscriptionToDatabase(subscription);
      
      setIsSubscribed(true);
      
      console.log('Push subscription successful:', subscription);
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast({
        title: "فشل في الاشتراك",
        description: "حدث خطأ أثناء تفعيل الإشعارات",
        variant: "destructive"
      });
    }
  };

  const saveSubscriptionToDatabase = async (subscription: PushSubscription) => {
    if (!profile?.id) return;

    try {
      // حفظ محلي كنسخة احتياطية
      localStorage.setItem('pushSubscription', JSON.stringify({
        userId: profile.id,
        subscription: subscription.toJSON(),
        timestamp: Date.now()
      }));

      // TODO: حفظ في قاعدة البيانات عند إضافة جدول push_subscriptions
      console.log('Subscription saved locally for user:', profile.id);
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          
          // إزالة من التخزين المحلي
          localStorage.removeItem('pushSubscription');
          
          toast({
            title: "تم إلغاء الاشتراك",
            description: "لن تتلقى إشعارات بعد الآن"
          });
        }
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "خطأ في إلغاء الاشتراك",
        description: "حدث خطأ أثناء إلغاء الإشعارات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('إشعار تجريبي', {
        body: 'هذا إشعار تجريبي للتأكد من عمل النظام',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, text: 'مُفعَّل', color: 'bg-green-100 text-green-800' };
      case 'denied':
        return { icon: <XCircle className="h-4 w-4 text-red-600" />, text: 'مرفوض', color: 'bg-red-100 text-red-800' };
      default:
        return { icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />, text: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const permissionStatus = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <BellOff className="h-5 w-5" />
            الإشعارات الفورية
          </CardTitle>
          <CardDescription>
            متصفحك لا يدعم الإشعارات الفورية
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              إدارة الإشعارات الفورية
            </CardTitle>
            <CardDescription>
              تخصيص إعدادات الإشعارات والتحكم في استقبالها
            </CardDescription>
          </div>
          
          <Badge className={permissionStatus.color}>
            <div className="flex items-center gap-1">
              {permissionStatus.icon}
              {permissionStatus.text}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* حالة الإشعارات */}
        <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">حالة الإشعارات</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'مُفعَّل ويعمل بشكل طبيعي' : 'غير مُفعَّل'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permission === 'granted' && !isSubscribed && (
              <Button
                onClick={subscribeToPush}
                disabled={isLoading}
                size="sm"
              >
                تفعيل الإشعارات
              </Button>
            )}
            
            {permission === 'granted' && isSubscribed && (
              <>
                <Button
                  onClick={sendTestNotification}
                  variant="outline"
                  size="sm"
                >
                  إشعار تجريبي
                </Button>
                <Button
                  onClick={unsubscribeFromPush}
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                >
                  إلغاء التفعيل
                </Button>
              </>
            )}
            
            {permission !== 'granted' && (
              <Button
                onClick={requestPermission}
                disabled={isLoading}
                size="sm"
              >
                طلب الإذن
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* إعدادات الإشعارات */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات الإشعارات
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات الطلبات</p>
                <p className="text-sm text-muted-foreground">تحديثات عن حالة طلباتك</p>
              </div>
              <Switch
                checked={settings.orders}
                onCheckedChange={(checked) => saveSettings({ ...settings, orders: checked })}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الرسائل الجديدة</p>
                <p className="text-sm text-muted-foreground">إشعار عند وصول رسائل جديدة</p>
              </div>
              <Switch
                checked={settings.chatMessages}
                onCheckedChange={(checked) => saveSettings({ ...settings, chatMessages: checked })}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">العروض الترويجية</p>
                <p className="text-sm text-muted-foreground">إشعارات العروض والخصومات</p>
              </div>
              <Switch
                checked={settings.promotions}
                onCheckedChange={(checked) => saveSettings({ ...settings, promotions: checked })}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تحديثات النظام</p>
                <p className="text-sm text-muted-foreground">إشعارات الميزات والتحديثات الجديدة</p>
              </div>
              <Switch
                checked={settings.systemUpdates}
                onCheckedChange={(checked) => saveSettings({ ...settings, systemUpdates: checked })}
                disabled={permission !== 'granted'}
              />
            </div>
          </div>
        </div>

        {permission === 'denied' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>ملاحظة:</strong> تم رفض إذن الإشعارات. لتفعيل الإشعارات، يرجى السماح بالإشعارات في إعدادات المتصفح وإعادة تحميل الصفحة.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;