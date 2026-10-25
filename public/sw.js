/*
 * Bilim Manba service worker — ilova sifatida o'rnatish va internetsiz o'qish.
 *
 *  - Sahifalar (maqola, maktab, seriya, bosh sahifa): avval tarmoq, internet
 *    bo'lmasa — oxirgi saqlangan nusxa, u ham bo'lmasa — /offline.html.
 *    Oxirgi 40 ta ochilgan sahifa saqlanadi (admin, profil, kirish — yo'q).
 *  - /_nuxt/ fayllari (nomida hash bor, o'zgarmaydi): avval kesh.
 *  - Boshqa domenlar (API, Cloudinary rasmlari) — tegilmaydi.
 *
 * Yangi versiya: VERSION o'zgartiriladi — eski keshlar o'chadi.
 */
const VERSION = "v2";
const STATIC = `bm-static-${VERSION}`;
const PAGES = `bm-pages-${VERSION}`;
const MAX_PAGES = 40;
const NET_TIMEOUT_MS = 5000;
const PRECACHE = ["/offline.html", "/icon-192.png", "/favicon-32x32.png"];

// Internetsiz ham ochilsin deb saqlanadigan sahifalar
const CACHEABLE = /^\/($|articles\/|maktab|series|categories|reyting|about|faq)/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("bm-") && k !== STATIC && k !== PAGES)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const trim = async () => {
  const cache = await caches.open(PAGES);
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - MAX_PAGES))) await cache.delete(k);
};

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

async function page(request, url) {
  // Kesh kaliti query'siz (?utm_source=... bir xil sahifa)
  const key = url.origin + url.pathname;
  try {
    const res = await withTimeout(fetch(request), NET_TIMEOUT_MS);
    if (res.ok && res.type === "basic" && CACHEABLE.test(url.pathname)) {
      const copy = res.clone();
      caches
        .open(PAGES)
        .then((c) => c.delete(key).then(() => c.put(key, copy)))
        .then(trim)
        .catch(() => {});
    }
    return res;
  } catch {
    const cached = await caches.match(key, { cacheName: PAGES });
    if (cached) return cached;
    // Sekin internet: tarmoq javobini biroz kutib ko'ramiz
    try {
      return await fetch(request);
    } catch {
      return (await caches.match("/offline.html")) || Response.error();
    }
  }
}

async function asset(request) {
  const cached = await caches.match(request, { cacheName: STATIC });
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) {
    const copy = res.clone();
    caches.open(STATIC).then((c) => c.put(request, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    event.respondWith(page(request, url));
    return;
  }
  // Yangi build'ni tekshiruvchi fayl — doim tarmoqdan
  if (url.pathname.startsWith("/_nuxt/builds/")) return;
  if (url.pathname.startsWith("/_nuxt/") || /\.(woff2?|png|svg|ico)$/.test(url.pathname)) {
    event.respondWith(asset(request));
  }
});
