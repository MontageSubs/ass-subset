'use strict';
const CACHE_NAME = 'ass-subset-v2'; 
const PRECACHE = [
  '/ass-subset/',
  '/ass-subset/index.html',
  '/ass-subset/manifest.json',
  'https://montagesubs.github.io/assets/images/montagesubs_logo-512.jpg',
  'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js'
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

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || (resp.type !== 'basic' && resp.type !== 'cors')) {
          return resp;
        }
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return resp;
      });
    })
  );
});