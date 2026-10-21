/* Service worker: luôn lấy bản mới nhất từ mạng trước, chỉ dùng bản lưu khi mất mạng.
   Nhờ vậy mỗi lần cập nhật index.html trên repo, web tự hiện bản mới, không cần đổi tên cache. */
const CACHE = 'rm-offline';

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: 'no-cache' }); /* luôn kiểm tra lại với máy chủ, tránh cache 10 phút của GitHub Pages */
      if (res.status === 200) { try { (await caches.open(CACHE)).put(r, res.clone()); } catch (err) {} }
      return res;
    } catch (err) {
      return (await caches.match(r, { ignoreSearch: true })) || (await caches.match('index.html')) || Response.error();
    }
  })());
});
