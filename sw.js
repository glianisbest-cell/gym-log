const CACHE = 'gymlog-v2';
const ASSETS = [
  '/gymlog/',
  '/gymlog/index.html',
  '/gymlog/manifest.json',
  '/gymlog/icon-192.png',
  '/gymlog/icon-512.png'
];

// Install: cache all core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', e => {
  // Never intercept Google API or auth calls
  if (
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('accounts.google.com') ||
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('fonts.gstatic.com')
  ) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('/gymlog/'))
  );
});
