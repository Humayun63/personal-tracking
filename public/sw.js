// Service worker: installability (offline fallback for never-visited pages)
// plus real offline support for pages you HAVE visited — every successful
// same-origin GET response is cached at runtime, and served back when the
// network fails, so closing and reopening the PWA offline shows your last
// Qaza/Budget view instead of a generic "you're offline" screen.
//
// Data mutations don't go through here at all: Qaza logs and Budget expenses
// use their own IndexedDB queues (see each module's useOfflineQueue.ts) that
// write straight to Supabase once a connection is back.
//
// Also handles a Background Sync wake-up that asks any open page to flush
// those queues.

const VERSION = "v2";
const SHELL_CACHE = `hearth-shell-${VERSION}`;
const RUNTIME_CACHE = `hearth-runtime-${VERSION}`;
const SHELL_URLS = ["/offline", "/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave Supabase/other-origin calls alone

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cache successful responses (page HTML, RSC navigation payloads,
        // static assets) so they're available if the network drops later.
        if (res.ok) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const offline = await caches.match("/offline");
          if (offline) return offline;
        }
        return Response.error();
      }),
  );
});

const SYNC_TAGS = ["qaza-sync", "budget-sync"];

self.addEventListener("sync", (event) => {
  if (!SYNC_TAGS.includes(event.tag)) return;
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "hearth-sync" }));
    }),
  );
});
