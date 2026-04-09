// Shipyard Service Worker — cache-first for static assets, network-first for API
const CACHE_NAME = "shipyard-v1";
const STATIC_ASSETS = [
  "/",
  "/explore",
  "/manifest.json",
];

// Install: pre-cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Network-first for API calls and auth
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets (images, fonts, scripts)
  if (
    event.request.destination === "image" ||
    event.request.destination === "font" ||
    event.request.destination === "script" ||
    event.request.destination === "style"
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network with cache fallback for pages
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
