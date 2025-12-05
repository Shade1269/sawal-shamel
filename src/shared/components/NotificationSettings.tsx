import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, MessageSquare, Users, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  pushEnabled: boolean;
  newMessages: boolean;
  mentions: boolean;
  channelUpdates: boolean;
  moderation: boolean;
}

const NotificationSettings = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushEnabled: false,
    newMessages: true,
    mentions: true,
    channelUpdates: false,
    moderation: false
  });
  const [loading, setLoading] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }, []);

  // Save preferences
  const savePreferences = (newPrefs: NotificationPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPrefs));
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "غير مدعوم",
        description: "المتصفح لا يدعم التنبيهات",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "التنبيهات محظورة",
        description: "يجب السماح بالتنبيهات من إعدادات المتصفح",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast({
        title: "تم تفعيل التنبيهات",
        description: "ستصلك التنبيهات الآن!"
      });
      
      // Show test notification
      new Notification('دردشتي', {
        body: 'تم تفعيل التنبيهات بنجاح!',
        icon: '/favicon.ico'
      });
      
      return true;
    } else {
      toast({
        title: "لم يتم السماح بالتنبيهات",
        description: "لن تصلك التنبيهات",
        variant: "destructive"
      });
      return false;
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    setLoading(true);
    
    if (enabled) {
      const permitted = await requestNotificationPermission();
      if (permitted) {
        const newPrefs = { ...preferences, pushEnabled: true };
        savePreferences(newPrefs);
        
        // Mark as configured permanently 
        localStorage.setItem('notificationsConfigured', 'true');
        localStorage.setItem('notificationPromptDismissed', 'true');
      }
    } else {
      const newPrefs = { ...preferences, pushEnabled: false };
      savePreferences(newPrefs);
      toast({
        title: "تم إيقاف التنبيهات",
        description: "يمكنك تشغيلها مرة أخرى من هنا"
      });
    }
    
    setLoading(false);
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          إعدادات التنبيهات
        </CardTitle>
        <CardDescription>
          اختر التنبيهات التي تريد استلامها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between space-x-2 space-x-reverse">
          <div className="flex items-center gap-3">
            {preferences.pushEnabled ? (
              <Bell className="h-5 w-5 text-success" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label className="text-base font-medium">
                تفعيل التنبيهات
              </Label>
              <p className="text-sm text-muted-foreground">
                استقبال التنبيهات من المتصفح
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.pushEnabled}
            onCheckedChange={handlePushToggle}
            disabled={loading}
          />
        </div>

        {preferences.pushEnabled && (
          <div className="space-y-4 pl-6 border-r-2 border-primary/30">
            
            {/* New Messages */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <Label className="text-sm cursor-pointer">الرسائل الجديدة</Label>
              </div>
              <Switch
                checked={preferences.newMessages}
                onCheckedChange={(checked) => {
                  updatePreference('newMessages', checked);
                  toast({
                    title: checked ? "تم تفعيل تنبيهات الرسائل" : "تم إيقاف تنبيهات الرسائل",
                    description: checked ? "ستصلك تنبيهات عند وصول رسائل جديدة" : "لن تصلك تنبيهات للرسائل الجديدة"
                  });
                }}
              />
            </div>

            {/* Mentions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label className="text-sm cursor-pointer">الإشارات والردود</Label>
              </div>
              <Switch
                checked={preferences.mentions}
                onCheckedChange={(checked) => {
                  updatePreference('mentions', checked);
                  toast({
                    title: checked ? "تم تفعيل تنبيهات الإشارات" : "تم إيقاف تنبيهات الإشارات",
                    description: checked ? "ستصلك تنبيهات عند ذكر اسمك" : "لن تصلك تنبيهات للإشارات"
                  });
                }}
              />
            </div>

            {/* Channel Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <Label className="text-sm cursor-pointer">تحديثات القنوات</Label>
              </div>
              <Switch
                checked={preferences.channelUpdates}
                onCheckedChange={(checked) => {
                  updatePreference('channelUpdates', checked);
                  toast({
                    title: checked ? "تم تفعيل تنبيهات القنوات" : "تم إيقاف تنبيهات القنوات",
                    description: checked ? "ستصلك تنبيهات لتحديثات القنوات" : "لن تصلك تنبيهات لتحديثات القنوات"
                  });
                }}
              />
            </div>

            {/* Moderation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label className="text-sm cursor-pointer">إشعارات الإدارة</Label>
              </div>
              <Switch
                checked={preferences.moderation}
                onCheckedChange={(checked) => {
                  updatePreference('moderation', checked);
                  toast({
                    title: checked ? "تم تفعيل إشعارات الإدارة" : "تم إيقاف إشعارات الإدارة",
                    description: checked ? "ستصلك الإشعارات الإدارية" : "لن تصلك الإشعارات الإدارية"
                  });
                }}
              />
            </div>
          </div>
        )}

        {!preferences.pushEnabled && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              فعّل التنبيهات لتبقى على اطلاع بكل جديد
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default NotificationSettings;