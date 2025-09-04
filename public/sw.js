// Service Worker for push notifications
self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  console.log('Push message received:', event);
  
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'رسالة جديدة',
      body: event.data.text() || 'لديك رسالة جديدة في الدردشة',
      icon: '/favicon.ico'
    };
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'chat-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'فتح الدردشة'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ],
    data: {
      url: data.url || '/chat',
      channel: data.channel
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/chat';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('message', function(event) {
  console.log('Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag } = event.data;
    
    self.registration.showNotification(title, {
      body,
      icon: icon || '/favicon.ico',
      tag: tag || 'chat',
      requireInteraction: true
    });
  }
});