const CACHE_NAME = 'zhi-yin-v2';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/checkin',
  '/healing',
  '/diagnosis',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// 离线回退 HTML
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>知音 - 离线</title>
  <style>
    body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;
    background:linear-gradient(180deg,#faf5ee,#f0e8d8);font-family:serif;color:#3a2a1a;text-align:center}
    .icon{font-size:64px;margin-bottom:16px}
    h1{font-size:20px;margin:0 0 8px}
    p{font-size:14px;color:#8a7a60;margin:0}
  </style>
</head>
<body>
  <div>
    <div class="icon">🎵</div>
    <h1>当前处于离线状态</h1>
    <p>请检查网络后重试，部分已缓存功能仍可使用</p>
  </div>
</body>
</html>`;

// Install - 预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      // In local dev, unregister this SW entirely (no PWA caching needed)
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          try {
            const url = new URL(client.url);
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
              // Tell the page to unregister SW
              client.postMessage({ type: 'UNREGISTER_SW' });
            }
          } catch (e) { /* noop */ }
        });
      }),
    ])
  );
  self.clients.claim();
});

// Fetch - network first, cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Non-GET and API requests always go to network
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  // In local dev (localhost/127.0.0.1), don't intercept navigation requests
  // This prevents false "offline" pages when the dev server restarts
  const url = new URL(request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return; // Let the browser handle it directly
  }

  // Navigation requests: network first + offline HTML fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(OFFLINE_HTML, {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          });
        })
    );
    return;
  }

  // 静态资源：缓存优先（音频/图片等大文件优先用缓存）
  if (request.url.match(/\.(mp3|png|jpg|jpeg|webp|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 其他资源：网络优先
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => cached || new Response('', { status: 503 }));
      })
  );
});
