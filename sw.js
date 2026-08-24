/* Server Genius service worker */

const VERSION = 'sg-v1';
const SHELL = [
  './',
  'index.html',
  'methodology.html',
  'assets/css/style.css',
  'assets/js/i18n.js',
  'assets/js/calculators.js',
  'assets/js/app.js',
  'assets/js/methodology.js',
  'assets/img/favicon.svg',
  'assets/img/icon-192.png',
  'assets/img/icon-512.png',
  'manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  // Navigations: fresh when online, cached shell when not.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(async () =>
        // Match the page that was actually asked for before falling back,
        // otherwise an offline visit to methodology.html served the calculator.
        (await caches.match(request, { ignoreSearch: true }))
        || (await caches.match('index.html'))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((hit) =>
      hit || fetch(request).then((res) => {
        // Cache same-origin assets and the font/icon CDNs opportunistically.
        if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => hit)
    )
  );
});
