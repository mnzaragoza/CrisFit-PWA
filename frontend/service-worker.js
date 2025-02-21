const CACHE_NAME = 'crisfit-pwa-cache-v1';
const urlsToCache = [
  './index.html',
  './dashboard.html',
  './styles.css',
  './script.js',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Install Service Worker and cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch files from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;  // Servir desde el cache
        }
        return fetch(event.request);  // Hacer la solicitud de red si no está en el cache
      })
  );
});

// Clear old caches when a new service worker is activated
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Borrar cachés antiguas
          }
        })
      );
    })
  );
});

