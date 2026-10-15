// Versioned, scope-relative app shell. Navigation uses network first to avoid stale pages.
const CACHE_NAME = 'qatra-hayat-v2-navigation';
const urlsToCache = [
  './',
  './index.html',
  './about.html',
  './articles.html',
  './privacy.html',
  './contact.html',
  './tips.html',
  './assets/css/site-navigation.css',
  './assets/js/site-navigation.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('qatra-hayat-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});

// Background sync for reminders
self.addEventListener('sync', event => {
  if (event.tag === 'water-reminder') {
    self.registration.showNotification('💧 قطرة حياة', {
      body: 'حان وقت شرب الماء!',
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Ccircle cx='96' cy='96' r='88' fill='%230288d1'/%3E%3Ctext x='96' y='115' font-size='70' text-anchor='middle' fill='white'%3E💧%3C/text%3E%3C/svg%3E",
      badge: '💧',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'drink', title: '✅ شربت' },
        { action: 'snooze', title: '⏰ تأجيل 10 د' }
      ]
    });
  }
  if (event.tag === 'diaper-reminder') {
    self.registration.showNotification('👶 قطرة حياة', {
      body: 'حان وقت تغيير الحفاض!',
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Ccircle cx='96' cy='96' r='88' fill='%23ff7043'/%3E%3Ctext x='96' y='115' font-size='70' text-anchor='middle' fill='white'%3E👶%3C/text%3E%3C/svg%3E",
      badge: '👶',
      vibrate: [300, 100, 300],
      requireInteraction: true
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'drink') {
    // User confirmed drinking
  }
  event.waitUntil(clients.openWindow('/'));
});
