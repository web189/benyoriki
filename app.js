/* ═══════════════════════════════════════════════
   RIKI DEV 2026 — app.js
   Lightweight · Canggih · Full Featured
   ═══════════════════════════════════════════════ */

/* ── THEME ── */
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const applyTheme = t => { html.setAttribute('data-theme', t); localStorage.setItem('rk-theme', t); };
applyTheme(localStorage.getItem('rk-theme') || 'dark');
themeBtn?.addEventListener('click', () => applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

/* ── NAVBAR ── */
const navbar = document.getElementById('navbar');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar?.classList.toggle('up', y > 40);
  // active link
  document.querySelectorAll('section[id]').forEach(s => {
    const top = s.offsetTop - 120, id = s.id;
    const link = document.querySelector(`.nl[href="#${id}"]`);
    if (y >= top && y < top + s.offsetHeight) {
      document.querySelectorAll('.nl').forEach(l => l.classList.remove('active'));
      link?.classList.add('active');
    }
  });
  lastY = y;
}, { passive: true });

/* ── HAMBURGER ── */
const hamburger = document.getElementById('hamburger');
const mobMenu = document.getElementById('mobMenu');
hamburger?.addEventListener('click', () => mobMenu?.classList.toggle('show'));
function closeMob() { mobMenu?.classList.remove('show'); }
document.addEventListener('click', e => { if (!navbar?.contains(e.target)) closeMob(); });

/* ── SMOOTH ANCHOR SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── CURSOR GLOW ── */
const cursorGlow = document.getElementById('cursorGlow');
let cx = 0, cy = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
function animCursor() {
  cx += (tx - cx) * 0.12;
  cy += (ty - cy) * 0.12;
  if (cursorGlow) cursorGlow.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(animCursor);
}
animCursor();
// Hide default cursor on desktop
if (window.innerWidth > 768) document.body.style.cursor = 'auto';

/* ── CANVAS PARTICLES ── */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas?.getContext('2d');
let pts = [];

function resizeC() { if (!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function mkPt() { return { x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.3 + .3, a: Math.random() * .4 + .07 }; }
function initC() { pts = Array.from({ length: 65 }, mkPt); }
function drawC() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const light = html.getAttribute('data-theme') === 'light';
  const rgb = light ? '37,99,235' : '90,150,255';
  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${p.a})`; ctx.fill();
  });
  pts.forEach((a, i) => {
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 115) { ctx.beginPath(); ctx.strokeStyle = `rgba(${rgb},${.055 * (1 - d / 115)})`; ctx.lineWidth = .65; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
  });
  requestAnimationFrame(drawC);
}
resizeC(); initC(); drawC();
window.addEventListener('resize', () => { resizeC(); initC(); }, { passive: true });

/* ── COUNTER ANIMATION ── */
function runCounter(el) {
  const target = +el.dataset.count;
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1600, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step); else el.textContent = target;
  };
  requestAnimationFrame(step);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = '1';
      runCounter(e.target);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => cntObs.observe(el));

/* ── DB WIDGET LIVE UPDATES ── */
setInterval(() => {
  const o = document.getElementById('dbO');
  const r = document.getElementById('dbR');
  if (o) o.textContent = `#${1200 + Math.floor(Math.random() * 150)}`;
  if (r) r.textContent = `Rp ${(2 + Math.random() * .7).toFixed(1)}M`;
}, 2600);
setInterval(() => {
  const s = document.getElementById('dbS');
  if (s) { s.textContent = '0ms ago'; setTimeout(() => { if (s) s.textContent = `${Math.floor(Math.random() * 90)}ms ago`; }, 900); }
}, 1600);

/* ── MOCK BAR CHART ANIMATION ── */
function animateMockBars() {
  document.querySelectorAll('.mock-bar').forEach(bar => {
    const h = 30 + Math.random() * 60;
    bar.style.height = h + '%';
  });
}
setInterval(animateMockBars, 3000);

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i % 6 * 70);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: .08 });
document.querySelectorAll('.srv-card,.tg-item,.kl-list li').forEach(el => {
  el.classList.add('reveal');
  revObs.observe(el);
});

/* ── 3D TILT ON EMBED CARDS ── */
document.querySelectorAll('.embed-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    if (card.classList.contains('ec-visible'))
      card.style.transform = `translateY(-6px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── PORTFOLIO FILTER (EMBED CARDS) ── */
const filterBtns = document.querySelectorAll('.pf-btn');
const embedCards = document.querySelectorAll('.embed-card');
const portoCount = document.getElementById('portoCount');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    let visible = 0;
    embedCards.forEach(card => {
      const cat = card.dataset.cat;
      const show = filter === 'all' || cat === filter;
      if (show) { card.classList.remove('hidden'); visible++; }
      else card.classList.add('hidden');
    });
    if (portoCount) portoCount.textContent = visible;
  });
});

/* ── EMBED CARDS ENTRANCE ── */
const ecObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('ec-visible'), i * 90);
      ecObs.unobserve(e.target);
    }
  });
}, { threshold: .05 });
embedCards.forEach(card => {
  card.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .35s';
  ecObs.observe(card);
});

/* ── IFRAME EMBED LOADER ── */
function loadEmbed(btn) {
  const wrap = btn.closest('.embed-frame-wrap');
  if (!wrap) return;
  const overlay = wrap.querySelector('.embed-overlay');
  const iframe = wrap.querySelector('.embed-iframe');
  const loading = wrap.querySelector('.embed-loading');
  if (!iframe || !overlay) return;

  // Show loading indicator
  loading?.classList.add('active');
  overlay.classList.add('hidden');

  // Set real src from data-src
  const src = iframe.dataset.src;
  if (src && !iframe.src) {
    iframe.src = src;

    // Detect load or block
    const timeout = setTimeout(() => {
      // If still not loaded after 8s, show blocked fallback
      loading?.classList.remove('active');
      showEmbedFallback(wrap, src);
    }, 8000);

    iframe.addEventListener('load', () => {
      clearTimeout(timeout);
      loading?.classList.remove('active');
      try {
        // Try accessing the iframe content (will throw if cross-origin blocked)
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        // If we get here, it loaded fine
        iframe.classList.add('loaded');
      } catch (e) {
        // Cross-origin is normal for external sites — still show iframe
        iframe.classList.add('loaded');
      }
    }, { once: true });

    iframe.addEventListener('error', () => {
      clearTimeout(timeout);
      loading?.classList.remove('active');
      showEmbedFallback(wrap, src);
    }, { once: true });
  } else {
    // Already loaded
    loading?.classList.remove('active');
    iframe.classList.add('loaded');
  }
}

function showEmbedFallback(wrap, url) {
  // Check if already showing blocked state
  if (wrap.querySelector('.embed-blocked')) return;
  const iframe = wrap.querySelector('.embed-iframe');
  if (iframe) iframe.style.display = 'none';
  const blocked = document.createElement('div');
  blocked.className = 'embed-blocked show';
  blocked.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
    <div><strong>Preview tidak tersedia</strong>Website ini memblokir embed (X-Frame-Options).<br>Tapi situsnya masih bisa dikunjungi langsung! ✅</div>
    <a href="${url}" target="_blank" rel="noopener" class="eb-visit-btn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Buka Website Langsung
    </a>`;
  wrap.appendChild(blocked);
}

/* ── CONTACT FORM ── */
function submitForm() {
  const name = document.getElementById('fName')?.value.trim();
  const type = document.getElementById('fType')?.value;
  const desc = document.getElementById('fDesc')?.value.trim();
  if (!name || !type || !desc) { showToast('⚠️ Lengkapi semua kolom terlebih dahulu'); return; }
  const msg = encodeURIComponent(`Halo Riki! Saya *${name}*\n\nMembutuhkan: *${type}*\n\nDeskripsi:\n${desc}`);
  window.open(`https://wa.me/6282318001234?text=${msg}`, '_blank');
  showToast('✅ Membuka WhatsApp...');
}

function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ── CHATBOX ── */
const chatFab = document.getElementById('chatFab');
const chatbox = document.getElementById('chatbox');
const fabDot = document.getElementById('fabDot');
const cbMsgs = document.getElementById('cbMsgs');
const cbTyping = document.getElementById('cbTyping');
const cbIn = document.getElementById('cbIn');
let chatOpen = false, waShown = 0;

function toggleChat() {
  chatOpen = !chatOpen;
  chatbox?.classList.toggle('open', chatOpen);
  if (chatOpen && fabDot) fabDot.style.display = 'none';
}

function addMsg(html, type = 'bot') {
  const d = document.createElement('div');
  d.className = `cb-msg ${type}`;
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  d.innerHTML = `<div class="cb-bubble">${html}</div><div class="cb-time">${now}</div>`;
  cbMsgs?.appendChild(d);
  if (cbMsgs) cbMsgs.scrollTop = 9999;
}

function rmQR() { document.getElementById('cbQR')?.remove(); }

const BOT = {
  kasir: `💳 <strong>Sistem Kasir Online</strong><br>Kami buat kasir web dengan:<br>• Stok otomatis update<br>• Multi kasir/cabang<br>• Laporan harian & bulanan<br>• Akses HP & PC<br><br>Estimasi: <strong>5–10 hari kerja</strong>. 🚀`,
  toko: `🛒 <strong>Toko Online</strong><br>E-commerce lengkap:<br>• Katalog produk dinamis<br>• Keranjang belanja<br>• Real-time stok<br>• Order via WhatsApp<br><br>Cek portofolio toko online kami di bagian Portofolio ya! 😊`,
  harga: `💰 <strong>Estimasi Harga</strong><br>Bergantung kompleksitas:<br>• Landing page: terjangkau<br>• Toko online: menengah<br>• Kasir real-time: menengah+<br>• Custom enterprise: premium<br><br>Ceritakan kebutuhan Anda untuk estimasi pasti! ✨`,
  konsultasi: `📋 <strong>Konsultasi Gratis!</strong><br>Ceritakan kebutuhan:<br>1. Bisnis apa yang dijalankan?<br>2. Fitur apa yang dibutuhkan?<br>3. Berapa banyak user?<br><br>Atau langsung WhatsApp kami ⬇`,
  df: [`Terima kasih! 🙏 Untuk detail lebih lanjut, silakan WhatsApp kami ya. Tim siap membantu!`,`Menarik! Bisa ceritakan lebih detail kebutuhan sistemnya? Kami carikan solusi terbaik 💡`,`Kami spesialis <strong>real-time database</strong> web — toko, kasir, dashboard live, semua bisa! 💪`,`Yuk konsultasi gratis via WhatsApp atau isi form di bawah. Tim kami siap! ⬇`]
};

function getBotResp(txt) {
  const t = txt.toLowerCase();
  if (t.includes('kasir') || t.includes('pos')) return BOT.kasir;
  if (t.includes('toko') || t.includes('online') || t.includes('shop')) return BOT.toko;
  if (t.includes('harga') || t.includes('biaya') || t.includes('berapa')) return BOT.harga;
  if (t.includes('konsultasi') || t.includes('proyek') || t.includes('diskusi')) return BOT.konsultasi;
  if (t.includes('database') || t.includes('firebase') || t.includes('realtime')) return `🔥 <strong>Real-Time Database</strong> keahlian utama kami!<br>Firebase + WebSocket untuk sync instan semua perangkat. Mau demo langsung?`;
  if (/halo|hai|hi|hello|selamat/.test(t)) return `Halo! Senang bertemu Anda 👋<br>Siap membantu tentang jasa sistem website real-time kami. Ada yang bisa saya bantu?`;
  return BOT.df[Math.floor(Math.random() * BOT.df.length)];
}

function showTyping(cb) {
  if (cbTyping) cbTyping.style.display = 'flex';
  if (cbMsgs) cbMsgs.scrollTop = 9999;
  setTimeout(() => {
    if (cbTyping) cbTyping.style.display = 'none';
    cb();
    // Show WA button after 2nd reply
    waShown++;
    if (waShown === 2) addWABtn();
  }, 1350);
}

function addWABtn() {
  const d = document.createElement('div');
  d.style.cssText = 'display:flex;justify-content:center;margin-top:4px';
  d.innerHTML = `<a href="https://wa.me/6282318001234" target="_blank" style="display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;font-weight:700;padding:9px 16px;border-radius:50px;font-size:.78rem;font-family:'Outfit',sans-serif">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    WhatsApp Langsung
  </a>`;
  cbMsgs?.appendChild(d);
  if (cbMsgs) cbMsgs.scrollTop = 9999;
}

function qReply(txt) {
  rmQR();
  addMsg(txt, 'user');
  showTyping(() => addMsg(getBotResp(txt), 'bot'));
}

function sendChat() {
  const val = cbIn?.value.trim();
  if (!val) return;
  cbIn.value = '';
  rmQR();
  addMsg(val, 'user');
  showTyping(() => addMsg(getBotResp(val), 'bot'));
}

/* ── PAGE LOAD ANIMATION ── */
document.querySelectorAll('.hero-left > *').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity .6s ${i * .12}s ease, transform .6s ${i * .12}s ease`;
  setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, 100 + i * 120);
});