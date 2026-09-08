/* Service worker — เก็บไฟล์ไว้ในเครื่องเพื่อให้เปิดใช้ได้ตอนไม่มีเน็ต
   เปลี่ยนเลข VERSION ทุกครั้งที่อัปเดตไฟล์ เพื่อให้เครื่องผู้ใช้โหลดของใหม่ */
const VERSION = 'edl-counter-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if(req.method !== 'GET') return;
  // หน้าเว็บ: เอาของใหม่จากเน็ตก่อน ถ้าเน็ตล่มค่อยใช้ของที่เก็บไว้
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // ไฟล์อื่น: ใช้ของที่เก็บไว้ก่อน เร็วและใช้ได้ตอนออฟไลน์
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    }).catch(() => hit))
  );
});
