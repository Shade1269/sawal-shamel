import { useEffect, useState } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { User, ShoppingCart, Eye } from 'lucide-react';

interface Notification {
  id: number;
  type: 'purchase' | 'view' | 'visitor';
  message: string;
  timestamp: Date;
}

/**
 * Live Social Proof Notifications
 * إشعارات حية للدليل الاجتماعي
 */
export const LiveNotifications = () => {
  const { settings } = useGamingSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);

  // Generate fake notifications for demo
  useEffect(() => {
    if (!settings.isGamingMode) return;

    const names = ['أحمد', 'محمد', 'فاطمة', 'خالد', 'سارة', 'عمر', 'نورا', 'يوسف'];
    const products = ['iPhone 15 Pro', 'AirPods Pro', 'MacBook Air', 'iPad Pro', 'Apple Watch', 'Magic Keyboard'];

    const createNotification = () => {
      const types: Notification['type'][] = ['purchase', 'view', 'visitor'];
      const type = types[Math.floor(Math.random() * types.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const product = products[Math.floor(Math.random() * products.length)];

      let message = '';
      switch (type) {
        case 'purchase':
          message = `${name} اشترى ${product} قبل ${Math.floor(Math.random() * 10) + 1} دقيقة`;
          break;
        case 'view':
          message = `${Math.floor(Math.random() * 20) + 5} شخص يشاهدون ${product} الآن`;
          break;
        case 'visitor':
          message = `${name} دخل المتجر للتو`;
          break;
      }

      const newNotification: Notification = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date(),
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    // Initial notification
    createNotification();

    // Random notifications every 5-15 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        createNotification();
      }
    }, Math.random() * 10000 + 5000);

    return () => clearInterval(interval);
  }, [settings]);

  // Visitor counter
  useEffect(() => {
    if (!settings.isGamingMode) return;

    // Random initial count
    setVisitorCount(Math.floor(Math.random() * 50) + 20);

    // Update count every 10 seconds
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(10, prev + change);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [settings]);

  if (!settings.isGamingMode) return null;

  return (
    <>
      {/* Live Visitor Counter */}
      <div
        className="live-counter"
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9998,
        }}
      >
        <span className="live-indicator" />
        <User className="h-4 w-4" />
        <span className="font-semibold">{visitorCount} متصل الآن</span>
      </div>

      {/* Notifications */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="live-notification"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {notification.type === 'purchase' && <ShoppingCart className="h-5 w-5 text-green-400" />}
              {notification.type === 'view' && <Eye className="h-5 w-5 text-blue-400" />}
              {notification.type === 'visitor' && <User className="h-5 w-5 text-purple-400" />}

              <div>
                <p className="text-sm text-white font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
