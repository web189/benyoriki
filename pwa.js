/* Daftarkan service worker, notifikasi offline/online, dan update otomatis. */
(function () {
  'use strict';
  var toastEl, hideT;
  function toast(msg, opts) {
    opts = opts || {};
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'pwa-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.className = 'pwa-toast show ' + (opts.kind || '');
    toastEl.textContent = '';
    var s = document.createElement('span'); s.textContent = msg; toastEl.appendChild(s);
    if (opts.action) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = opts.action; b.onclick = opts.onAction; toastEl.appendChild(b);
    }
    clearTimeout(hideT);
    if (!opts.sticky) hideT = setTimeout(function () { toastEl.classList.remove('show'); }, opts.ms || 3500);
  }

  /* ── status koneksi ── */
  function offline() { document.documentElement.classList.add('is-offline'); toast('Kamu sedang offline — tampilan tersimpan tetap bisa dibuka', { kind: 'off', sticky: true }); }
  function online() {
    document.documentElement.classList.remove('is-offline');
    toast('Kembali online — memeriksa pembaruan…', { kind: 'on', ms: 2500 });
    checkUpdate();
  }
  window.addEventListener('offline', offline);
  window.addEventListener('online', online);
  if (!navigator.onLine) offline();

  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;

  var reg = null, refreshing = false, hadController = !!navigator.serviceWorker.controller;

  function typing() { var a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); }
  function busy() { var pm = document.getElementById('pm'); return typing() || (pm && !pm.hidden); }   /* sedang mengetik / preview terbuka */

  /* ── deteksi versi baru dari ISI halaman (tanpa perlu mengubah nomor VERSION di sw.js) ── */
  var baseHash = null, lastCheck = 0;
  function hashStr(s) { var h = 5381, i; for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h + ':' + s.length; }
  function pageUrl() { return location.href.split('#')[0]; }
  function readBase() {            /* versi yang sedang tampil = salinan di cache (kalau dibuka offline, ini versi lama) */
    if (!window.caches) return Promise.resolve();
    return caches.match(pageUrl(), { ignoreSearch: true }).then(function (r) { return r ? r.text() : null; })
      .then(function (t) { if (t) baseHash = hashStr(t); }).catch(function () {});
  }
  function reloadNow() { if (refreshing) return; refreshing = true; try { sessionStorage.setItem('by-auto-reload', String(Date.now())); } catch (e) {} location.reload(); }
  function announceNew() {
    var recent = 0; try { recent = Date.now() - Number(sessionStorage.getItem('by-auto-reload') || 0); } catch (e) {}
    if (busy() || recent < 120000) {   /* jangan ganggu pengguna / cegah loop reload */
      toast('Versi terbaru tersedia', { kind: 'on', sticky: true, action: 'Muat ulang', onAction: reloadNow });
      return;
    }
    toast('Versi baru ditemukan — memperbarui…', { kind: 'on', sticky: true });
    setTimeout(reloadNow, 1000);
  }
  function contentCheck() {
    if (!navigator.onLine || Date.now() - lastCheck < 60000) return;
    lastCheck = Date.now();
    fetch(pageUrl(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : null; }).then(function (t) {
      if (!t) return;
      var h = hashStr(t);
      if (baseHash === null) { baseHash = h; return; }
      if (h !== baseHash) { baseHash = h; announceNew(); }
    }).catch(function () {});
  }
  function checkUpdate() { if (reg && navigator.onLine) reg.update().catch(function () {}); contentCheck(); }

  /* SW baru mengambil alih -> muat ulang agar tampilan terbaru langsung terlihat */
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing || !hadController) { hadController = true; return; }
    if (busy()) {
      toast('Versi terbaru siap', { kind: 'on', sticky: true, action: 'Muat ulang', onAction: function () { refreshing = true; location.reload(); } });
      return;
    }
    refreshing = true;
    toast('Memperbarui ke versi terbaru…', { kind: 'on', sticky: true });
    setTimeout(function () { location.reload(); }, 900);
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(function (r) {
      reg = r;
      if (!hadController) toast('Website siap dibuka offline', { kind: 'on', ms: 3000 });
      r.addEventListener('updatefound', function () {
        var w = r.installing; if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state === 'installed' && navigator.serviceWorker.controller) w.postMessage('SKIP_WAITING');
        });
      });
      readBase().then(checkUpdate);
    }).catch(function () {});
    /* periksa pembaruan saat tab dibuka kembali & tiap 30 menit */
    document.addEventListener('visibilitychange', function () { if (!document.hidden) checkUpdate(); });
    setInterval(checkUpdate, 30 * 60 * 1000);
  });
})();
