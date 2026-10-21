// Tăng số phiên bản khi muốn ép máy người dùng tải lại bản mới
const V = 'roadmap-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Trang chính: ưu tiên mạng (luôn lấy bản mới nhất), mất mạng thì dùng bản đã lưu
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { caches.open(V).then(c => c.put('index.html', r.clone())); return r; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Font và file tĩnh: dùng bản lưu trước, đồng thời cập nhật ngầm
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(r => {
          if (r && (r.ok || r.type === 'opaque')) caches.open(V).then(c => c.put(req, r.clone()));
          return r;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
