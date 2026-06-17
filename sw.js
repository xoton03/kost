const CACHE_NAME = 'kost-v20';
const urlsToCache = [
  './',
  './index.html',
  './tictache.html',
  './ticticket.html',
  './station.html',
  './flo.html',
  './explorer.html',
  './technical_fiche.html',
  './styles.css',
  './database.js',
  './sync.js',
  './navigation.js',
  './updater.js',
  './prices_flo.js',
  './dexie.js',
  './lucide.js',
  './jsbarcode.js',
  './supabase.js',
  './assets/favicon.png',
  './assets/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
