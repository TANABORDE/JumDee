// sw.js - Service Worker for PWA Offline Support
const CACHE_NAME = 'jum-dee-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/memory-matching.js',
  '/js/math-speed.js',
  '/js/reaction-game.js',
  '/js/word-matching.js',
  '/js/sequence-simon.js',
  '/js/grid-memory.js',
  '/js/sudoku.js',
  '/js/jigsaw.js',
  '/manifest.json',
  '/assets/icon-192.svg',
  '/assets/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback if offline and not in cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
