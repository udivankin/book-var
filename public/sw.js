self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName); // Clear everything!
        })
      );
    }).then(() => {
      self.clients.claim(); // Take control and immediately unregister
      self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Do nothing. Use network.
});

