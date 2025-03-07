// Nombre del caché (incrementa la versión cada vez que hagas cambios)
const CACHE_NAME = 'crisfit-pwa-cache-v2';

// Archivos que se almacenarán en caché
const urlsToCache = [
  'index.html',
  'dashboard.html',
  'styles.css',
  'script.js',
  'icon-192x192.png',
  'icon-512x512.png',
  // Agrega aquí otros archivos que necesites cachear (imágenes, videos, etc.)
];

// Instalación del Service Worker y almacenamiento en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME) // Abre el caché
      .then((cache) => {
        return cache.addAll(urlsToCache); // Almacena los archivos en caché
      })
      .then(() => self.skipWaiting()) // Forza la activación del nuevo Service Worker
  );
});

// Estrategia de fetch: "Network First, Cache Fallback"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request) // Intenta obtener el recurso desde la red
      .then((networkResponse) => {
        // Si la solicitud de red es exitosa, actualiza el caché
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, networkResponse.clone()); // Almacena la respuesta en caché
          });
        return networkResponse; // Devuelve la respuesta de la red
      })
      .catch(() => {
        // Si falla la red, sirve desde el caché
        return caches.match(event.request);
      })
  );
});

// Limpieza de cachés antiguos al activar el nuevo Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Lista de cachés permitidos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Borra los cachés que no estén en la lista permitida
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Reclama control sobre los clientes
  );
});

