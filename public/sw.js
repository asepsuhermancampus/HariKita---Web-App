// HariKita PWA Service Worker
//
// PENTING (perbaikan routing "URL berubah tapi konten tetap sama"):
//  - JANGAN fallback navigasi ke halaman lain (mis. "/") saat offline/gagal —
//    itu menyebabkan setiap navigasi menampilkan konten halaman beranda.
//  - JANGAN cache `/_next/static/**` (chunk JS/CSS ber-hash). Menyajikan chunk
//    lama lintas build membuat router klien menjalankan JS basi -> halaman tidak
//    ikut berubah saat URL berubah. Next.js sudah meng-hash & meng-cache sendiri.
//  - Navigasi: network-first murni; bila offline, tampilkan respons cache HANYA
//    untuk URL yang sama (bukan halaman lain), atau halaman offline khusus.
const CACHE_NAME = "harikita-cache-v2";

// Hanya aset statis kecil yang aman untuk di-precache (bukan HTML dinamis).
const PRECACHE_ASSETS = [
  "/favicon.ico",
  "/logo_cameo.png",
  "/logo_badge.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Precaching error non-critical:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya tangani GET same-origin.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Jangan pernah intersepsi API, RSC, Server Actions, atau chunk Next.js.
  // Biarkan network murni agar navigasi & HMR selalu segar.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/_next/data/") ||
    request.headers.get("RSC") === "1" ||
    url.searchParams.has("_rsc") ||
    request.headers.get("Next-Router-Prefetch") === "1"
  ) {
    return;
  }

  // Navigasi HTML: NETWORK-ONLY. Tidak ada fallback ke halaman lain.
  // Bila offline, biarkan browser menampilkan errornya (bukan konten salah).
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  // Aset ikon saja: stale-while-revalidate (aman, tidak memengaruhi routing).
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
