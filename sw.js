// sw.js  (v5)
const CACHE = 'aephirum-ficha-v5';
const ASSETS = ['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ❗ Ignore tudo que não for http/https (ex.: chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // (Opcional, recomendado) limita a MESMA ORIGEM
  if (url.origin !== self.location.origin) return;

  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then(c => {
          // evita quebrar caso o response seja imcacheável
          try { c.put(e.request, clone); } catch (_) {}
        });
        return res;
      }).catch(() => caches.match('./'));
    })
  );
});
