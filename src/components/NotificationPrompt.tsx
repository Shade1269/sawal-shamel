import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationPrompt = () => {
  const { toast } = useToast();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if notifications were already configured
    const configured = localStorage.getItem('notificationsConfigured');
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    
    // Show prompt if not configured and not dismissed
    if (!configured && !dismissed) {
      // Small delay to ensure the page is loaded
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "غير مدعوم",
        description: "المتصفح لا يدعم التنبيهات",
        variant: "destructive"
      });
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      localStorage.setItem('notificationsConfigured', 'true');
      
      toast({
        title: "تم تفعيل التنبيهات",
        description: "ستصلك التنبيهات الآن عند وصول رسائل جديدة!"
      });
      
      // Show test notification
      new Notification('دردشتي', {
        body: 'تم تفعيل التنبيهات بنجاح! 🎉',
        icon: '/favicon.ico'
      });
      
      setShow(false);
    } else {
      toast({
        title: "لم يتم السماح بالتنبيهات",
        description: "يمكنك تفعيلها لاحقاً من إعدادات الملف الشخصي",
        variant: "destructive"
      });
      setShow(false);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem('notificationPromptDismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="mx-auto max-w-md bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary animate-pulse" />
              تفعيل التنبيهات
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={dismissPrompt}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            احصل على تنبيهات فورية عند وصول رسائل جديدة
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button 
              onClick={requestNotificationPermission}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              تفعيل التنبيهات
            </Button>
            <Button 
              variant="outline" 
              onClick={dismissPrompt}
              className="px-4"
            >
              لاحقاً
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            يمكنك تغيير هذا الإعداد لاحقاً من ملفك الشخصي
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPrompt;