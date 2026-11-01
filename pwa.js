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

  function checkUpdate() { if (reg && navigator.onLine) reg.update().catch(function () {}); }
  function typing() { var a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); }

  /* SW baru mengambil alih -> muat ulang agar tampilan terbaru langsung terlihat */
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing || !hadController) { hadController = true; return; }
    if (typing()) {
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
      checkUpdate();
    }).catch(function () {});
    /* periksa pembaruan saat tab dibuka kembali & tiap 30 menit */
    document.addEventListener('visibilitychange', function () { if (!document.hidden) checkUpdate(); });
    setInterval(checkUpdate, 30 * 60 * 1000);
  });
})();
