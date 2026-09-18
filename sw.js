const CACHE_NAME = 'foxurl-offline-v1';
const OFFLINE_URL = '/offline.html';

// Cache the offline page immediately when the Service Worker installs
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })
  );
  self.skipWaiting();
});

// Activate worker and clean up old caches if necessary
self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Intercept network failures
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match(OFFLINE_URL);
        });
      })
    );
  }
});
