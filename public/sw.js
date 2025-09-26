/* eslint-disable no-restricted-globals */
const VERSION = 'anaqati-pwa-v2';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const MEDIA_CACHE = `${VERSION}-media`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/anaqati-icon-192.png',
  '/anaqati-icon-256.png',
  '/anaqati-icon-512.png',
];
const APP_SHELL_ROUTES = ['/', '/affiliate', '/admin', '/checkout', '/order/confirmation'];

const STATIC_FILE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.css', '.json'];
const MEDIA_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff2', '.woff', '.ttf'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (error) {
        // ignore precache failures (likely offline)
      }
      await warmupRoutes();
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, MEDIA_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => {});
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (shouldHandleAsStatic(request, sameOrigin)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (shouldHandleAsMedia(request)) {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE));
    return;
  }

  if (sameOrigin) {
    event.respondWith(networkFirst(request));
  }
});

async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    const staticCache = await caches.open(STATIC_CACHE);
    const offline = await staticCache.match(OFFLINE_URL);
    return offline ?? Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cached ?? Promise.reject(error);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached ?? networkFetch;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

function shouldHandleAsStatic(request, sameOrigin) {
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'worker') {
    return true;
  }
  if (!sameOrigin && request.destination === 'style') {
    return true;
  }
  const url = new URL(request.url);
  return STATIC_FILE_EXTENSIONS.some((ext) => url.pathname.endsWith(ext)) || url.pathname.startsWith('/assets/');
}

function shouldHandleAsMedia(request) {
  if (request.destination === 'image' || request.destination === 'font') {
    return true;
  }
  const url = new URL(request.url);
  return MEDIA_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

async function warmupRoutes() {
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.all(
    APP_SHELL_ROUTES.map(async (route) => {
      try {
        const response = await fetch(route, { cache: 'no-store' });
        if (response && response.ok) {
          await cache.put(route, response.clone());
        }
      } catch (error) {
        // ignore warmup failures (likely offline during install)
      }
    })
  );
}
