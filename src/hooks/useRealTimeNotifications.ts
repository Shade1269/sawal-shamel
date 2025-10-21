import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'support';
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

interface UseRealTimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  sendNotification: (targetUserId: string, title: string, message: string, type?: string, metadata?: Record<string, any>) => void;
  clearAll: () => void;
}

export const useRealTimeNotifications = (): UseRealTimeNotificationsReturn => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get project ID from current URL or use environment
      const projectId = window.location.hostname.split('.')[0];
      const wsUrl = `wss://${projectId}.functions.supabase.co/functions/v1/realtime-notifications`;
      
      console.log('🔗 Connecting to notifications WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to real-time notifications');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Subscribe to user notifications
        wsRef.current?.send(JSON.stringify({
          type: 'SUBSCRIBE_USER',
          userId: user.id
        }));

        // Set up ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'PING' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Notification received:', data);

          switch (data.type) {
            case 'INITIAL_NOTIFICATIONS':
              setNotifications(data.notifications || []);
              break;

            case 'NEW_NOTIFICATION':
              const newNotification = data.notification;
              setNotifications(prev => [newNotification, ...prev]);
              
              // Show toast for new notifications
              toast({
                title: newNotification.title,
                description: newNotification.message,
                variant: newNotification.type === 'error' ? 'destructive' : 'default',
              });

              // Play notification sound
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                  body: newNotification.message,
                  icon: '/favicon.ico',
                });
              }
              break;

            case 'NOTIFICATION_READ':
              setNotifications(prev => 
                prev.map(n => 
                  n.id === data.notificationId 
                    ? { ...n, read: true }
                    : n
                )
              );
              break;

            case 'PONG':
              // Connection is alive
              break;

            case 'ERROR':
              console.error('❌ Notification error:', data.message);
              toast({
                title: 'خطأ في الإشعارات',
                description: data.message,
                variant: 'destructive',
              });
              break;
          }
        } catch (error) {
          console.error('❌ Error parsing notification message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 Notifications WebSocket closed:', event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          console.log(`🔄 Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          toast({
            title: 'انقطع الاتصال',
            description: 'فشل في إعادة الاتصال بخدمة الإشعارات',
            variant: 'destructive',
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('🚨 Notifications WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
    }
  }, [user?.id, toast]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'MARK_AS_READ',
        notificationId
      }));
    }
  }, []);

  // Send notification to another user
  const sendNotification = useCallback((
    targetUserId: string,
    title: string,
    message: string,
    type = 'info',
    metadata = {}
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'BROADCAST_NOTIFICATION',
        targetUserId,
        title,
        message,
        notificationType: type,
        metadata
      }));
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  // Connect when user is available
  useEffect(() => {
    if (user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => disconnect();
  }, [user?.id, connect, disconnect]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    sendNotification,
    clearAll
  };
};
