const CACHE_NAME = 'kost-v22';
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
  './config.js',
  './offline.html',
  './js/state.js',
  './js/ui.js',
  './js/scanner.js',
  './js/modals.js',
  './js/bg3d.js',
  './assets/favicon.png',
  './assets/logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Automatic skip waiting when new SW is detected
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
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Check if it's a Supabase/GAS API request
  const isApiRequest = url.href.includes('supabase.co') || url.href.includes('script.google.com');

  if (isApiRequest) {
    // Network First strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open('api-cache').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.href.includes('fonts.googleapis.com') ||
    url.href.includes('fonts.gstatic.com') ||
    url.pathname.includes('/assets/')
  ) {
    // Stale-While-Revalidate strategy
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
  } else {
    // Cache First with Network Fallback (and navigate mode offline.html fallback)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).catch(err => {
            if (event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
            throw err;
          });
        })
    );
  }
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
