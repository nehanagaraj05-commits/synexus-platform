/* ========================================== */
/* sw.js: The Service Worker Background Proxy */
/* ========================================== */

const CACHE_NAME = "platform-cache-v1";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./api.js",
  "./utils.js",
  "./websocket.js",
  "./db.js",
  "./worker.js",
];

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing phase...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching core assets.");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        console.warn(
          "[Service Worker] Network request failed and no cache available.",
        );
      });
    }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activation phase...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});
