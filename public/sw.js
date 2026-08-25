/**
 * SafeWatch — basit service worker.
 *
 * GitHub Pages alt klasöründe (…/EM_SafeWatch/) de çalışır: yollar
 * registration.scope üzerinden türetilir.
 */

const CACHE = "safewatch-v4";

function scoped(path) {
  const base = self.registration.scope.replace(/\/$/, "");
  if (path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const PRECACHE = [
  scoped("/"),
  scoped("/saha/"),
  scoped("/nasil-oynanir/"),
  scoped("/manifest.webmanifest"),
  scoped("/icon.svg"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match(scoped("/")))
        )
    );
    return;
  }

  const isScriptOrStyle =
    url.pathname.includes("/_next/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css");

  if (isScriptOrStyle) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
