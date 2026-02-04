const CACHE_NAME = 'imstillhere-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: "Are you still alive?",
    body: "Tap to prove it. Your people are counting on you. 💀",
    icon: '/icons/icon-192.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'checkin-reminder',
      actions: [
        { action: 'checkin', title: "I'm still alive ✅" },
      ],
      data: { url: '/dashboard' },
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'checkin') {
    // Quick check-in via API
    event.waitUntil(
      fetch('/api/checkin', { method: 'POST', credentials: 'same-origin' })
        .then(() => self.clients.matchAll({ type: 'window' }))
        .then((clients) => {
          if (clients.length > 0) {
            clients[0].focus();
            clients[0].navigate('/dashboard');
          } else {
            self.clients.openWindow('/dashboard');
          }
        })
    );
  } else {
    event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/dashboard'));
  }
});
