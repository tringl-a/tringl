// Service Worker – App-Shell-Cache für das Trading Journal.
// Alle Daten liegen in localStorage; hier werden nur die statischen Dateien gecacht.
// Bei Änderungen an index.html o. Ä. CACHE_VERSION erhöhen.
const CACHE_VERSION = "tj-v1.6.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first mit Hintergrund-Aktualisierung (stale-while-revalidate):
// Die App startet sofort aus dem Cache (auch offline); ist das Netz da,
// wird die Datei im Hintergrund aktualisiert und beim nächsten Start genutzt.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  const cacheKey = req.mode === "navigate" ? "./index.html" : req;
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(cacheKey, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(cacheKey, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      return (await network) || new Response("Offline", { status: 503, statusText: "Offline" });
    })
  );
});
