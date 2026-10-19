// Advaita Admin — Service Worker
// Handles push notifications and basic offline caching

const CACHE_NAME = "advaita-admin-v1";
const OFFLINE_URL = "/admin";

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
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

// Fetch: network-first with offline fallback
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

// Push: display notification when received from FCM / Web Push
self.addEventListener("push", (event) => {
  let data = {
    title: "Advaita Admin",
    body: "You have a new notification",
    url: "/admin",
    icon: "/admin-icon-192.png",
    badge: "/admin-icon-192.png",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
    actions: [
      {
        action: "open",
        title: "View",
      },
    ],
    tag: data.url, // Collapse duplicate notifications for the same page
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click: open the relevant admin page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If an admin window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});
