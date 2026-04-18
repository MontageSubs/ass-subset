'use strict';

const CACHE_NAME = 'ass-subset-v2.5.3';
const PRECACHE = [
  '/ass-subset/',
  '/ass-subset/index.html',
  '/ass-subset/worker.js',
  '/ass-subset/vendor/jszip.min.js',
  '/ass-subset/vendor/opentype.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.includes('/ass-subset/')) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(resp => {
          if (resp && resp.status === 200) cache.put(e.request, resp.clone());
          return resp;
        }).catch(() => { });
        return cached || fetchPromise;
      })
    )
  );
});
