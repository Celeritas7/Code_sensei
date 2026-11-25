/* Staging worker: shell/runtime only. Personal API caches belong to the verified
 * account boundary, never to an origin-wide fetch fallback. Old packs retained. */
const VERSION = 'cs-access-v1', SHELL = VERSION + '-shell';
const FILES = ['./', './index.html', './js/compose.js', './css/compose.css', './manifest.json',
  './js/access-core.js', './js/access-boot.js', './js/access-config.js', './vendor/supabase.js',
  './icons/icon.svg', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'];
const paths = new Set(FILES.map(path => new URL(path, self.registration.scope).pathname));
self.addEventListener('install', event => event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  if (event.data === 'CS_ACCESS_VERSION') event.ports[0]?.postMessage(VERSION);
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.hostname.endsWith('.supabase.co') || /\/(rest|auth|functions)\/v1\//.test(url.pathname)) return;
  if (url.origin === self.location.origin && paths.has(url.pathname)) {
    event.respondWith(caches.open(SHELL).then(async cache => {
      const key = url.origin + url.pathname;
      const saved = await cache.match(key);
      if (saved) return saved;
      const response = await fetch(request);
      if (response.ok && !url.search && !url.hash) await cache.put(key, response.clone());
      return response;
    }));
  } else if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('/pyodide/')) {
    event.respondWith(caches.open('cs-pyodide-v1').then(async cache => {
      const saved = await cache.match(request); if (saved) return saved;
      const response = await fetch(request); if (response.ok) await cache.put(request, response.clone()); return response;
    }));
  }
});
