/* Service Worker benyoriki.com — akses offline + update otomatis.
   Ubah VERSION setiap kali ada rilis besar agar semua pengunjung otomatis memperbarui tampilan. */
const VERSION = 'v1.1.0';
const NET_TIMEOUT = 4500;   /* sinyal lemah: lewat batas ini, pakai versi tersimpan dulu */
const CORE = 'by-core-' + VERSION;
const RUNTIME = 'by-runtime';
const PRECACHE = [
  '/', '/index.html', '/style.css', '/porto.css', '/polish.css', '/app.js', '/porto.js', '/pwa.js',
  '/manifest.json', '/favicon.ico', '/favicon.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-192.png', '/icon-maskable-512.png', '/apple-touch-icon.png', '/favicon-32.png', '/favicon-48.png',
  '/img/hero/hp-store.webp', '/img/hero/pc-sambal.webp',
  '/img/testi1.jpg', '/img/testi2.jpg', '/img/testi3.jpg',
  '/img/porto/status.json'
];
const SHOTS = ['barbershop','belajarbermain','bengkel','boxing','ebook','gym','jasadaud','kontrakan','kopdar','laundry','martabak','mbe','nabilove','pemancingan-gerry','restoran','spklu','toko-online','tokobangunan','travel']
  .map(s => '/img/porto/' + s + '.webp');

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CORE);
    /* satu file gagal tidak menggagalkan instalasi */
    await Promise.all(PRECACHE.concat(SHOTS).map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('by-core-') && k !== CORE).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

/* network-first: ambil versi terbaru kalau online; kalau offline ATAU sinyal sangat lemah -> pakai cadangan dari cache */
async function networkFirst(req, fallbackUrl, preload) {
  const cache = await caches.open(CORE);
  const net = (async () => {
    const res = (preload && await preload) || await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  })();
  net.catch(() => {});                                   /* cegah unhandled rejection saat kalah balapan */
  const backup = async () => (await cache.match(req, { ignoreSearch: true })) || (fallbackUrl && await cache.match(fallbackUrl));
  try {
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), NET_TIMEOUT))]);
  } catch (err) {
    return (await backup()) || net.catch(() => Response.error());
  }
}
/* stale-while-revalidate: cepat dari cache, diam-diam diperbarui di belakang */
async function swr(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    if (url.origin !== location.origin) return;
    e.respondWith(networkFirst(req, '/index.html', e.preloadResponse));
    return;
  }
  /* font Google */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(swr(req)); return; }
  if (url.origin !== location.origin) return;           /* iframe preview & API luar tidak disentuh */
  if (/\.(html|css|js|json)$/.test(url.pathname) || url.pathname === '/') { e.respondWith(networkFirst(req, null)); return; }
  e.respondWith(swr(req));                               /* gambar, ikon */
});
