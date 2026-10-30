/* PORTOFOLIO — filter, carousel dots (HP), modal preview.
   iframe baru dimuat saat tombol "Tampilkan Preview" ditekan. */
(function () {
  'use strict';
  var grid = document.getElementById('portoGrid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.pc'));
  var btns = document.querySelectorAll('.pf-btn');
  var countEl = document.getElementById('portoCount');
  var dotsWrap = document.getElementById('portoDots');
  var hint = document.getElementById('portoSwipeHint');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── FILTER + "LIHAT SEMUA" (awal: 6 kartu = 2 baris x 3) ── */
  var LIMIT = 6, filter = 'all', expanded = false, firstRender = true;
  var more = document.getElementById('portoMore'), moreBtn = document.getElementById('portoMoreBtn'), moreTx = document.getElementById('portoMoreTx');
  function visible() { return cards.filter(function (c) { return !c.hidden; }); }
  function render(animate) {
    var matches = cards.filter(function (c) { return filter === 'all' || c.dataset.cat === filter; });
    var shown = expanded ? matches : matches.slice(0, LIMIT);
    cards.forEach(function (c) {
      var show = shown.indexOf(c) > -1, was = !c.hidden;
      c.hidden = !show; c.classList.remove('pc-in');
      if (show && !was && animate && !reduce) { void c.offsetWidth; c.classList.add('pc-in'); }
    });
    if (countEl) countEl.textContent = shown.length;
    if (more) {
      more.hidden = matches.length <= LIMIT;
      moreBtn.setAttribute('aria-expanded', expanded);
      moreTx.textContent = expanded ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua ' + matches.length + ' Proyek';
      moreBtn.classList.toggle('open', expanded);
    }
    grid.scrollLeft = 0;
    buildDots();
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
      filter = b.dataset.filter; expanded = false; render(true);
    });
  });
  if (moreBtn) moreBtn.addEventListener('click', function () {
    expanded = !expanded; render(true);
    if (!expanded) { var f = document.getElementById('portoFilter'); if (f) f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
  });

  /* ── DOTS (carousel HP) ── */
  function step() { var v = visible(); return v.length ? v[0].offsetWidth + 14 : 1; }
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.textContent = '';
    visible().forEach(function (c, i) {
      var d = document.createElement('button');
      d.type = 'button'; d.className = 'porto-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Proyek ' + (i + 1));
      d.addEventListener('click', function () { grid.scrollTo({ left: step() * i, behavior: 'smooth' }); });
      dotsWrap.appendChild(d);
    });
  }
  var tick = false;
  grid.addEventListener('scroll', function () {
    if (hint && grid.scrollLeft > 20) hint.style.opacity = '0';
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      tick = false;
      var i = Math.min(Math.round(grid.scrollLeft / step()), visible().length - 1);
      var ds = dotsWrap ? dotsWrap.children : [];
      for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('active', k === i);
    });
  }, { passive: true });
  window.addEventListener('resize', buildDots);
  render(false);

  /* ── STATUS (hasil tools/screenshots.mjs): LIVE hanya untuk website yang terverifikasi ── */
  function applyStatus() {
    fetch('img/porto/status.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.projects) return;
      var shots = 0;
      cards.forEach(function (c) {
        var p = d.projects[c.dataset.slug]; if (!p) return;
        if (p.shot) shots++;
        var b = c.querySelector('.pc-live');
        if (p.live && b) { b.dataset.state = 'live'; b.querySelector('b').textContent = 'LIVE'; }
      });
      var el = document.getElementById('pstatShot'); if (el) el.textContent = shots;
    }).catch(function () {});
  }
  (window.requestIdleCallback || function (f) { setTimeout(f, 800); })(applyStatus);

  /* ── MODAL ── */
  var pm = document.getElementById('pm');
  if (!pm) return;
  var $ = function (id) { return document.getElementById(id); };
  var frame = $('pmFrame'), loading = $('pmLoading'), fb = $('pmFallback'), stage = pm.querySelector('.pm-stage');
  var cur = null, timer = null, lastFocus = null, loaded = false;

  function stopTimer() { clearTimeout(timer); timer = null; }
  function showFallback() {
    stopTimer(); loading.hidden = true; fb.hidden = false;
    $('pmToggle').querySelector('span').textContent = 'Coba tampilkan website';
  }
  function hideFallback() { fb.hidden = true; $('pmToggle').querySelector('span').textContent = 'Tidak tampil? Lihat screenshot'; }

  function load(card) {
    cur = card; loaded = false; stopTimer();
    var d = card.dataset, title = card.querySelector('.pc-title').textContent;
    $('pmTitle').textContent = title;
    $('pmDesc').textContent = card.querySelector('.pc-desc').textContent;
    $('pmHost').textContent = d.host;
    $('pmOpen').href = d.url; $('pmFbOpen').href = d.url; $('pmWa').href = d.wa;
    pm.style.setProperty('--glow', card.style.getPropertyValue('--glow'));
    $('pmFbPh').textContent = 'Screenshot belum tersedia';
    var img = $('pmFbImg'); img.hidden = true; img.alt = 'Screenshot website ' + title;
    img.onload = function () { img.hidden = false; }; img.onerror = function () { img.hidden = true; };
    img.src = 'img/porto/' + d.slug + '.webp';
    hideFallback();
    loading.hidden = false; frame.classList.remove('ready');
    frame.title = 'Preview ' + title;
    frame.onload = function () { if (frame.src === 'about:blank' || !cur) return; loaded = true; stopTimer(); loading.hidden = true; frame.classList.add('ready'); };
    timer = setTimeout(function () { if (!loaded) showFallback(); }, 10000);
    frame.src = d.url;
    var v = visible(), i = v.indexOf(card);
    $('pmPrev').disabled = $('pmNext').disabled = v.length < 2;
  }
  function open(card) {
    lastFocus = document.activeElement;
    pm.hidden = false; document.documentElement.classList.add('pm-lock');
    load(card);
    pm.querySelector('.pm-open').focus({ preventScroll: true });
  }
  function close() {
    stopTimer(); cur = null; frame.onload = null; frame.src = 'about:blank';
    pm.hidden = true; document.documentElement.classList.remove('pm-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function go(dir) {
    var v = visible(); if (v.length < 2 || !cur) return;
    load(v[(v.indexOf(cur) + dir + v.length) % v.length]);
  }

  grid.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]');
    if (t) open(t.closest('.pc'));
  });
  pm.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) close();
    var vb = e.target.closest('[data-view]');
    if (vb && vb.tagName === 'BUTTON') {
      pm.querySelectorAll('.pm-seg button').forEach(function (b) { var on = b === vb; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      stage.dataset.view = vb.dataset.view;
    }
  });
  $('pmPrev').addEventListener('click', function () { go(-1); });
  $('pmNext').addEventListener('click', function () { go(1); });
  $('pmToggle').addEventListener('click', function () { if (fb.hidden) showFallback(); else hideFallback(); });
  document.addEventListener('keydown', function (e) {
    if (pm.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && document.activeElement !== frame) go(-1);
    else if (e.key === 'ArrowRight' && document.activeElement !== frame) go(1);
    else if (e.key === 'Tab') { /* focus trap sederhana */
      var f = Array.prototype.filter.call(pm.querySelectorAll('a[href],button:not([disabled])'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
