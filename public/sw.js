// Service worker: installability (app shell precache + offline fallback for
// navigations) plus a Background Sync wake-up that asks any open page to
// flush its offline Qaza log queue (see lib/qaza/useOfflineQueue.ts).
//
// The app is otherwise fully dynamic/authenticated, so this deliberately
// doesn't try to cache API/data responses — only the static shell needed to
// avoid a blank screen, and the fallback page shown when navigation fails.

const CACHE = "hearth-shell-v1";
const SHELL_URLS = ["/offline", "/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match("/offline").then((res) => res ?? Response.error())),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "qaza-sync") return;
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "hearth-sync" }));
    }),
  );
});
