const CACHE_NAME = 'learnus-v1.0.0';
const STATIC_CACHE_NAME = 'learnus-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'learnus-dynamic-v1.0.0';

// Файлы для кэширования при установке
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  // Next.js статические ресурсы будут добавлены автоматически
];

// Стратегии кэширования
const CACHE_STRATEGIES = {
  // Сначала кэш, затем сеть (для статических ресурсов)
  CACHE_FIRST: 'cache-first',
  // Сначала сеть, затем кэш (для динамического контента)
  NETWORK_FIRST: 'network-first',
  // Только сеть (для API запросов)
  NETWORK_ONLY: 'network-only',
  // Только кэш
  CACHE_ONLY: 'cache-only'
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Installation failed', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Удаляем старые кэши
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName.startsWith('learnus-')) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('SW: Activation failed', error);
      })
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорируем запросы к другим доменам
  if (url.origin !== location.origin) {
    return;
  }

  // Определяем стратегию кэширования
  const strategy = getCacheStrategy(request);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request));
      break;
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request));
      break;
    case CACHE_STRATEGIES.NETWORK_ONLY:
      // Не кэшируем, просто делаем запрос
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Определение стратегии кэширования для запроса
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // API запросы - только сеть
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_ONLY;
  }
  
  // Статические ресурсы - сначала кэш
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.includes('/_next/static/')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // HTML страницы - сначала сеть
  if (request.destination === 'document') {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // По умолчанию - сначала сеть
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Стратегия "Сначала кэш"
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('SW: Serving from cache', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('SW: Cached network response', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error('SW: Cache first failed', error);
    // Возвращаем офлайн страницу для HTML запросов
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Нет подключения к интернету');
    }
    throw error;
  }
}

// Стратегия "Сначала сеть"
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('SW: Updated cache from network', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('SW: Serving from cache fallback', request.url);
      return cachedResponse;
    }
    
    // Для HTML запросов возвращаем офлайн страницу
    if (request.destination === 'document') {
      return caches.match('/offline.html') || 
        new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Нет подключения - Learnus</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  min-height: 100vh; 
                  margin: 0; 
                  background: #f9fafb;
                  color: #374151;
                  text-align: center;
                  padding: 20px;
                }
                .offline-content {
                  max-width: 400px;
                }
                h1 { color: #ef4444; margin-bottom: 16px; }
                p { margin-bottom: 24px; line-height: 1.5; }
                button {
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 16px;
                }
                button:hover { background: #1d4ed8; }
              </style>
            </head>
            <body>
              <div class="offline-content">
                <h1>Нет подключения к интернету</h1>
                <p>Проверьте подключение к интернету и попробуйте снова.</p>
                <button onclick="window.location.reload()">Попробовать снова</button>
              </div>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
    }
    
    throw error;
  }
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push уведомления (для будущего использования)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Learnus', options)
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('SW: Service Worker loaded');