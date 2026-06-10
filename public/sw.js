const CACHE_NAME = "bilimmanba-v1";
const OFFLINE_URL = "/offline.html";

// O'rnatishda asosiy fayllarni cache qilamiz
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/offline.html",
        "/icon-192.png",
        "/icon-512.png",
      ]);
    }),
  );
  self.skipWaiting();
});

// Eski cache'larni tozalaymiz
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch — network first, offline bo'lsa cache
self.addEventListener("fetch", (event) => {
  // Faqat GET va same-origin
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // API so'rovlarini cache qilmaymiz
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Muvaffaqiyatli javobni cache'ga saqlaymiz
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Offline — cache'dan beramiz
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Sahifa bo'lsa offline page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        });
      }),
  );
});

// ─── PUSH (eski kod — saqlanadi) ───
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
