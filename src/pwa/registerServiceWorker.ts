export function registerServiceWorker() {
  if (typeof window === "undefined" || !('serviceWorker' in navigator)) {
    return;
  }

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      listenForUpdates(registration);
    } catch (error) {
      console.warn('[pwa] فشل تسجيل خدمة الخدمة', error);
    }
  };

  if (document.readyState === 'complete') {
    void register();
  } else {
    window.addEventListener('load', register, { once: true });
  }

  window.addEventListener('appinstalled', () => {
    console.info('[pwa] التطبيق تم تثبيته على الجهاز');
  });
}

function listenForUpdates(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    notifyUpdate(registration.waiting);
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        notifyUpdate(installing);
      }
    });
  });
}

function notifyUpdate(worker: ServiceWorker) {
  worker.postMessage({ type: 'SKIP_WAITING' });
  console.info('[pwa] تم تحديث Service Worker وسيتم تفعيل الإصدار الجديد بعد إغلاق جميع النوافذ.');
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    // إلغاء تسجيل جميع Service Workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    
    // مسح جميع الكاشات
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    
    console.info('[pwa] تم إلغاء Service Worker ومسح جميع الكاشات');
  } catch (error) {
    console.warn('[pwa] خطأ في إلغاء Service Worker:', error);
  }
}
