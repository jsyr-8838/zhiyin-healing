const CACHE_NAME = 'zhi-yin-v3';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/checkin',
  '/healing',
  '/healing/tcm-quest',
  '/healing/wuyin',
  '/healing/liuzijue',
  '/healing/meridian-chart',
  '/healing/shichen',
  '/healing/ai-diagnosis',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/brand/zhiyin-logo-seal-mini-v8.jpg',
];

// 离线回退 HTML（国风风格）
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>知音 - 离线模式</title>
  <style>
    body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;
    background:linear-gradient(180deg,#faf5ee,#f0e8d8);font-family:serif;color:#3a2a1a;text-align:center}
    .icon{width:64px;height:64px;margin:0 auto 16px;opacity:0.3}
    h1{font-size:20px;margin:0 0 8px}
    p{font-size:14px;color:#8a7a60;margin:0 0 4px}
    .small{font-size:12px;color:#b8a88a}
  </style>
</head>
<body>
  <div>
    <svg class="icon" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" stroke="#b8860b" stroke-width="1.5" opacity="0.3" />
      <path d="M32 18v18M32 42v4" stroke="#b8860b" stroke-width="2" stroke-linecap="round" opacity="0.5" />
      <circle cx="32" cy="32" r="3" fill="#b8860b" opacity="0.4" />
    </svg>
    <h1>当前处于离线状态</h1>
    <p>请检查网络后重试</p>
    <p class="small">已缓存的疗愈页面仍可使用</p>
  </div>
</body>
</html>`;

// Install - 预缓存静态资源 + 关键页面
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 逐个添加，避免一个失败导致全部失败
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

// Activate - 清理旧缓存 + 通知客户端
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          try {
            const url = new URL(client.url);
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
              client.postMessage({ type: 'UNREGISTER_SW' });
            } else {
              // 通知客户端有新版本
              client.postMessage({ type: 'SW_UPDATED' });
            }
          } catch (e) { /* noop */ }
        });
      }),
    ])
  );
  self.clients.claim();
});

// 后台同步：离线时的埋点数据排队，恢复网络后批量上传
self.addEventListener('sync', (event) => {
  if (event.tag === 'evo-track-sync') {
    event.waitUntil(flushPendingTracks());
  }
});

// 待上传的埋点数据
async function flushPendingTracks() {
  try {
    const cache = await caches.open('evo-track-queue');
    const keys = await cache.keys();
    for (const req of keys) {
      const cached = await cache.match(req);
      if (cached) {
        const data = await cached.json();
        await fetch('/api/evo/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        await cache.delete(req);
      }
    }
  } catch (e) {
    // 静默失败
  }
}

// Fetch - 智能缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Non-GET and API requests always go to network (except evo/track which can use BackgroundSync)
  if (request.method !== 'GET') {
    if (request.url.includes('/api/evo/track')) {
      // 埋点请求：先缓存，等后台同步
      event.respondWith(
        (async () => {
          try {
            const resp = await fetch(request);
            return resp;
          } catch {
            // 网络失败，缓存请求待后台同步
            const cache = await caches.open('evo-track-queue');
            await cache.put(request, new Response(request.body));
            return new Response('{}', { status: 202 });
          }
        })()
      );
    }
    return;
  }

  if (request.url.includes('/api/')) {
    return;
  }

  // In local dev, don't intercept
  const url = new URL(request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
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

  // 静态资源：缓存优先
  if (request.url.match(/\.(mp3|png|jpg|jpeg|webp|svg|woff2?|css|js)$/)) {
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

  // 其他资源：网络优先 + 缓存兜底
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
