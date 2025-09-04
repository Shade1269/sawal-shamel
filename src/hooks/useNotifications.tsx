import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  subscription: PushSubscription | null;
}

export const useNotifications = (userId?: string) => {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    subscription: null
  });

  useEffect(() => {
    // Check if notifications and service worker are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied'
    }));

    if (isSupported && userId) {
      initializeNotifications();
    }
  }, [userId]);

  const initializeNotifications = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Get existing subscription
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        subscription
      }));

      // If we have permission and user is logged in, subscribe
      if (Notification.permission === 'granted' && userId && !subscription) {
        await subscribeToPush(registration);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: "غير مدعوم",
        description: "المتصفح لا يدعم الإشعارات",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: "تم تفعيل الإشعارات",
          description: "ستصلك إشعارات الرسائل الجديدة"
        });

        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        await subscribeToPush(registration);
        return true;
      } else {
        toast({
          title: "تم رفض الإشعارات",
          description: "لن تصلك إشعارات الرسائل الجديدة",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      toast({
        title: "خطأ في الإشعارات",
        description: "فشل في طلب الصلاحيات",
        variant: "destructive"
      });
      return false;
    }
  };

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIW7Ex_VdMDf6DHQ4d4VZ-ddNfPlQd6rKdyFOspZE-Rb2dV_MpmI'; // You'll need to generate this
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      setState(prev => ({ ...prev, subscription }));

      // Save subscription to backend
      if (userId) {
        await saveSubscription(subscription, userId);
      }

      console.log('Push subscription successful:', subscription);
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const saveSubscription = async (subscription: PushSubscription, userId: string) => {
    try {
      // TODO: Save to database once push_subscriptions table types are available
      localStorage.setItem('push_subscription', JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
        timestamp: Date.now()
      }));
      console.log('Subscription saved locally');
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  };

  const showInAppNotification = (title: string, body: string, options?: {
    playSound?: boolean;
    channel?: string;
  }) => {
    // Show toast notification
    toast({
      title,
      description: body,
    });

    // Play notification sound
    if (options?.playSound !== false) {
      playNotificationSound();
    }

    // Show browser notification if permission granted and page not visible
    if (state.permission === 'granted' && document.hidden) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: options?.channel || 'chat',
        requireInteraction: true
      });
    }
  };

  const playNotificationSound = () => {
    try {
      // Create audio element for notification sound
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAC...'; // Notification sound data
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Sound playback not available:', error);
    }
  };

  const unsubscribe = async () => {
    if (state.subscription) {
      try {
        await state.subscription.unsubscribe();
        setState(prev => ({ ...prev, subscription: null }));
        
        // Remove from local storage
        localStorage.removeItem('push_subscription');

        toast({
          title: "تم إلغاء الإشعارات",
          description: "لن تصلك إشعارات push بعد الآن"
        });
      } catch (error) {
        console.error('Unsubscribe failed:', error);
      }
    }
  };

  return {
    ...state,
    requestPermission,
    showInAppNotification,
    playNotificationSound,
    unsubscribe,
    isEnabled: state.permission === 'granted'
  };
};