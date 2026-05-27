const CACHE_NAME = 'kost-v9.0';
const urlsToCache = [
  './',
  './index.html',
  './tictache.html',
  './ticticket.html',
  './station.html',
  './flo.html',
  './technical_fiche.html',
  './styles.css',
  './database.js',
  './sync.js',
  './navigation.js',
  './updater.js',
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
