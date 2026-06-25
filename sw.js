const CACHE_NAME = 'qatra-hayat-v1';
const urlsToCache = [
  '/https://imadtbn.github.io/9atrat-hayat/',
  '/index.html',
  '/about.html',
  '/privacy.html',
  '/contact.html',
  '/tips.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Background sync for reminders
self.addEventListener('sync', event => {
  if (event.tag === 'water-reminder') {
    self.registration.showNotification('💧 قطرة حياة', {
      body: 'حان وقت شرب الماء!',
      icon: 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Ccircle cx='96' cy='96' r='88' fill='%230288d1'/%3E%3Ctext x='96' y='115' font-size='70' text-anchor='middle' fill='white'%3E💧%3C/text%3E%3C/svg%3E',
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
      icon: 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Ccircle cx='96' cy='96' r='88' fill='%23ff7043'/%3E%3Ctext x='96' y='115' font-size='70' text-anchor='middle' fill='white'%3E👶%3C/text%3E%3C/svg%3E',
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
