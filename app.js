/* ═══════════════════════════════════════════════
   RIKI DEV 2026 — app.js
   Lightweight · Canggih · Full Featured
   ═══════════════════════════════════════════════ */

/* ── SCROLL PROGRESS BAR ── */
(function() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
})();

/* ── THEME ── */
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const applyTheme = t => { html.setAttribute('data-theme', t); localStorage.setItem('rk-theme', t); };
applyTheme(localStorage.getItem('rk-theme') || 'dark');
themeBtn?.addEventListener('click', () => applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

/* ── NAVBAR ── */
const navbar = document.getElementById('navbar');
let lastY = 0, ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      navbar?.classList.toggle('up', y > 40);
      // Active link highlight
      document.querySelectorAll('section[id]').forEach(s => {
        const top = s.offsetTop - 120, id = s.id;
        const link = document.querySelector(`.nl[href="#${id}"]`);
        if (y >= top && y < top + s.offsetHeight) {
          document.querySelectorAll('.nl').forEach(l => l.classList.remove('active'));
          link?.classList.add('active');
        }
      });
      lastY = y;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ── HAMBURGER ── */
const hamburger = document.getElementById('hamburger');
const mobMenu = document.getElementById('mobMenu');
hamburger?.addEventListener('click', () => mobMenu?.classList.toggle('show'));
function closeMob() { mobMenu?.classList.remove('show'); }
document.addEventListener('click', e => { if (!navbar?.contains(e.target)) closeMob(); });

/* ── SECTION HEADING ENTRANCE OBSERVER ── */
const headObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'none';
      e.target.style.filter = 'none';
      headObs.unobserve(e.target);
    }
  });
}, { threshold: .2 });
document.querySelectorAll('.sec-h2, .sec-label, .sec-sub').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.filter = 'blur(3px)';
  el.style.transition = 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), filter .6s ease';
  headObs.observe(el);
});

/* ── SMOOTH ANCHOR SCROLL with offset ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
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
  const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1800, 1);
    const ease = easeOutExpo(p);
    el.textContent = Math.floor(ease * target);
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
      // Gold flash on finish
      el.style.transition = 'text-shadow .3s';
      el.style.textShadow = '0 0 30px rgba(201,168,76,.6)';
      setTimeout(() => { el.style.textShadow = '0 0 20px rgba(201,168,76,.3)'; }, 300);
    }
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
      setTimeout(() => e.target.classList.add('visible'), i % 6 * 80);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: .06 });
document.querySelectorAll('.srv-card,.tg-item,.kl-list li,.price-card,.ps-content,.testi-card,.manfaat-card,.faq-item,.usp-item').forEach(el => {
  el.classList.add('reveal');
  revObs.observe(el);
});

/* ── 3D TILT ON EMBED CARDS ── */
document.querySelectorAll('.embed-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    card.style.transition = 'transform .08s linear, background var(--dur)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1), background var(--dur)';
  });
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
    embedCards.forEach((card, i) => {
      const cat = card.dataset.cat;
      const show = filter === 'all' || cat === filter;
      if (show) {
        card.classList.remove('hidden');
        // Re-trigger entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(.99)';
        setTimeout(() => {
          card.style.opacity = '';
          card.style.transform = '';
          card.classList.add('ec-visible');
        }, i * 60);
        visible++;
      } else {
        card.classList.add('hidden');
        card.classList.remove('ec-visible');
      }
    });
    if (portoCount) portoCount.textContent = visible;
  });
});

/* ── EMBED CARDS ENTRANCE ── */
const ecObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('ec-visible'), i * 80);
      ecObs.unobserve(e.target);
    }
  });
}, { threshold: .05 });
embedCards.forEach(card => ecObs.observe(card));

/* ── IFRAME EMBED LOADER — FIXED ── */
function loadEmbed(btn) {
  const wrap = btn.closest('.embed-frame-wrap');
  if (!wrap) return;
  const overlay = wrap.querySelector('.embed-overlay');
  const iframe = wrap.querySelector('.embed-iframe');
  const loading = wrap.querySelector('.embed-loading');
  if (!iframe || !overlay) return;

  // Prevent double-loading
  if (wrap.dataset.loaded === '1') {
    overlay.classList.add('hidden');
    return;
  }

  // Hide overlay immediately so user sees loading state
  overlay.style.display = 'none';
  loading?.classList.add('active');

  const src = iframe.dataset.src;
  if (!src) {
    loading?.classList.remove('active');
    overlay.style.display = '';
    return;
  }

  // Set timeout fallback for blocked sites
  const timeout = setTimeout(() => {
    loading?.classList.remove('active');
    showEmbedFallback(wrap, src);
  }, 9000);

  iframe.addEventListener('load', () => {
    clearTimeout(timeout);
    loading?.classList.remove('active');
    iframe.classList.add('loaded');
    wrap.dataset.loaded = '1';
  }, { once: true });

  iframe.addEventListener('error', () => {
    clearTimeout(timeout);
    loading?.classList.remove('active');
    showEmbedFallback(wrap, src);
  }, { once: true });

  // Actually set the src — this triggers the load
  iframe.src = src;
}

function showEmbedFallback(wrap, url) {
  if (wrap.querySelector('.embed-blocked')) return;
  const iframe = wrap.querySelector('.embed-iframe');
  if (iframe) { iframe.style.display = 'none'; }
  const blocked = document.createElement('div');
  blocked.className = 'embed-blocked show';
  blocked.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
    <div><strong>Preview tidak tersedia</strong><br>Website ini memblokir tampilan embed.<br>Tapi bisa dikunjungi langsung! ✅</div>
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
  window.open(`https://wa.me/628988995637?text=${msg}`, '_blank');
  showToast('✅ Membuka WhatsApp...');
}

function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ── CHATBOX — AI POWERED ── */
const chatFab = document.getElementById('chatFab');
const chatbox = document.getElementById('chatbox');
const fabDot = document.getElementById('fabDot');
const cbMsgs = document.getElementById('cbMsgs');
const cbTyping = document.getElementById('cbTyping');
const cbIn = document.getElementById('cbIn');
let chatOpen = false, waShown = 0, conversationHistory = [];

// System prompt khusus untuk asisten Riki
const SYSTEM_PROMPT = `Kamu adalah asisten virtual dari Riki Hermawan S.Kom, pengembang sistem website profesional untuk UMKM dan bisnis lokal Indonesia.

IDENTITAS:
- Nama asisten: Asisten Riki
- Pemilik jasa: Riki Hermawan S.Kom
- Kontak WA: 08988995637
- Website: benyoriki.com
- Spesialisasi: Sistem website real-time, kasir online, toko digital, dashboard bisnis

PAKET HARGA (SELALU SEBUT INI JIKA DITANYA HARGA):
- Basic: Mulai Rp 500rb → Landing Page/Profil Bisnis, Hosting+Domain 1 tahun GRATIS, selesai 2–3 hari kerja
- Standar: Mulai Rp 1,5jt → Toko Online, Katalog Produk, Sistem Login, selesai 3–5 hari kerja
- Pro: Mulai Rp 3jt → Kasir Online, Dashboard Real-Time, Multi-Cabang, selesai 5–10 hari kerja
- SEMUA paket: Demo dulu sebelum bayar, support pasca-launch termasuk

KEUNGGULAN UTAMA (selalu tekankan):
- Website bisnis siap 2–6 hari kerja
- Harga mulai di bawah Rp 500rb, hosting+domain gratis di paket Basic
- Demo sistem sebelum bayar — tidak puas, tidak bayar
- Support & revisi pasca-launch
- Bisa diakses dari HP kapan saja

ATURAN MENJAWAB:
1. Jawab dalam Bahasa Indonesia yang hangat, friendly, dan profesional
2. Maksimal 4–5 kalimat per balasan — singkat tapi langsung ke manfaat
3. Jika ditanya harga: LANGSUNG sebut paket dan harga spesifik (Basic/Standar/Pro)
4. Jangan bilang "tergantung" tanpa memberikan angka perkiraan dulu
5. Setelah 2 pesan, sarankan untuk konsultasi WA atau isi form
6. Gunakan emoji secukupnya agar terasa personal
7. Jika ditanya hal di luar layanan web/bisnis, arahkan kembali dengan sopan
8. Selalu akhiri dengan ajakan action (chat WA, isi form, atau lihat portofolio)`;

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

function showTyping(cb, delay = 1400) {
  if (cbTyping) cbTyping.style.display = 'flex';
  if (cbMsgs) cbMsgs.scrollTop = 9999;
  setTimeout(() => {
    if (cbTyping) cbTyping.style.display = 'none';
    cb();
    waShown++;
    if (waShown === 2) addWABtn();
  }, delay);
}

function addWABtn() {
  const d = document.createElement('div');
  d.style.cssText = 'display:flex;justify-content:center;margin-top:4px';
  d.innerHTML = `<a href="https://wa.me/628988995637" target="_blank" style="display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;font-weight:700;padding:9px 16px;border-radius:50px;font-size:.78rem;font-family:'Outfit',sans-serif">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    💬 Lanjut Chat di WhatsApp
  </a>`;
  cbMsgs?.appendChild(d);
  if (cbMsgs) cbMsgs.scrollTop = 9999;
}

async function getAIReply(userMessage) {
  // Tambah ke history
  conversationHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: conversationHistory
      })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const reply = data.content?.[0]?.text || getFallbackReply(userMessage);

    // Simpan reply ke history
    conversationHistory.push({ role: 'assistant', content: reply });

    // Batasi history agar tidak terlalu panjang (max 10 pesan terakhir)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    return reply;
  } catch (e) {
    // Fallback jika API gagal
    return getFallbackReply(userMessage);
  }
}

function getFallbackReply(txt) {
  const t = txt.toLowerCase();
  if (t.includes('kasir') || t.includes('pos') || t.includes('inventory'))
    return `🛒 <strong>Sistem Kasir Online</strong> adalah layanan paling diminati kami! Cocok banget untuk warung, toko, atau bisnis multi-cabang — stok update otomatis, laporan harian, bisa diakses dari HP. Harga tergantung fitur & kerumitan sistem, estimasi mulai <strong>Rp 2–5 juta</strong>. Hosting & domain dihitung terpisah untuk paket ini. Mau konsultasi gratis dulu? 😊`;
  if (t.includes('toko') || t.includes('online') || t.includes('shop') || t.includes('ecommerce'))
    return `🌐 <strong>Toko Online</strong> kami dibuat khusus untuk UMKM — tampil profesional tanpa harga selangit! Katalog produk, keranjang belanja, order via WhatsApp, semua bisa disesuaikan. Harga tergantung banyaknya fitur, mulai dari <strong>di bawah Rp 500rb</strong> untuk yang sederhana (sudah termasuk hosting & domain gratis). Produk apa yang mau Anda jual? 🎯`;
  if (t.includes('harga') || t.includes('biaya') || t.includes('berapa') || t.includes('budget') || t.includes('murah') || t.includes('mahal') || t.includes('paket'))
    return `💰 Kami punya 3 paket dengan harga transparan:<br><br>📌 <strong>Basic</strong>: Mulai Rp 500rb → Landing Page + Hosting & Domain Gratis (2–3 hari selesai)<br>📌 <strong>Standar</strong>: Mulai Rp 1,5jt → Toko Online + Sistem Login (3–5 hari selesai)<br>📌 <strong>Pro</strong>: Mulai Rp 3jt → Kasir + Dashboard Real-Time + Multi-Cabang (5–10 hari selesai)<br><br>Semua paket: <strong>demo dulu sebelum bayar</strong>. Mau tahu lebih detail? <a href='https://wa.me/628988995637' target='_blank'>Chat Riki sekarang →</a> 🚀`;
  if (t.includes('hosting') || t.includes('domain'))
    return `🌐 Soal hosting & domain, begini ketentuannya: untuk paket website <strong>di bawah Rp 500rb</strong>, hosting & domain sudah <strong>GRATIS</strong> termasuk dalam paket! Untuk proyek yang lebih kompleks dengan kebutuhan server lebih besar, hosting & domain dihitung <strong>terpisah</strong> dari harga jasa pembuatan. Mau tahu lebih lanjut? Yuk konsultasi gratis! 😊`;
  if (t.includes('dashboard') || t.includes('laporan') || t.includes('analitik'))
    return `📊 <strong>Dashboard bisnis real-time</strong> bisa pantau omzet, stok, dan transaksi dari mana saja langsung dari HP Anda! Grafik live, laporan otomatis, export PDF/Excel. Harga tergantung fitur & kerumitan, estimasi mulai <strong>Rp 3–7 juta</strong> (hosting & domain terpisah). Sangat cocok untuk pemilik bisnis yang sering mobile. Bisnis Anda di bidang apa? 🏪`;
  if (t.includes('lama') || t.includes('waktu') || t.includes('kapan') || t.includes('selesai'))
    return `⏱️ Waktu pengerjaan tergantung kompleksitas sistem. Website sederhana bisa <strong>3–5 hari kerja</strong>, toko online <strong>7–10 hari</strong>, kasir/dashboard real-time <strong>10–14 hari</strong>. Kami juga kasih demo dulu sebelum sistem diluncurkan, jadi Anda bisa lihat hasilnya sebelum bayar penuh! 🚀`;
  if (t.includes('portfolio') || t.includes('portofolio') || t.includes('contoh') || t.includes('hasil'))
    return `👀 Portofolio kami bisa dilihat langsung di halaman ini — <strong>bukan sekadar screenshot, tapi website asli yang bisa dibuka!</strong> Scroll ke bagian Portofolio ya. Ada toko online, kasir, UMKM makanan & minuman, dan lainnya. Mau saya rekomendasikan yang paling mirip dengan bisnis Anda? 😊`;
  if (/halo|hai|hi|hello|selamat|pagi|siang|malam/.test(t))
    return `Halo! Selamat datang di layanan website Riki 👋 Kami spesialis pembuatan sistem web untuk <strong>UMKM & bisnis lokal</strong> — harga mulai <strong>di bawah Rp 500rb</strong>, sudah termasuk hosting & domain gratis untuk paket dasar! Ada yang bisa saya bantu hari ini? 😊`;
  if (t.includes('revisi') || t.includes('support') || t.includes('maintenance') || t.includes('after'))
    return `🛡️ Tenang, kami tidak tinggalkan Anda setelah selesai! Setiap proyek sudah termasuk <strong>support & revisi</strong> pasca-launch. Jika ada bug atau perlu penyesuaian, kami siap bantu. Untuk maintenance jangka panjang juga tersedia paket bulanan. Tidak perlu khawatir soal itu! 💪`;
  if (t.includes('gratis') || t.includes('free'))
    return `🎁 Ada yang gratis nih! Untuk paket website <strong>di bawah Rp 500rb</strong>, sudah termasuk <strong>hosting & domain GRATIS</strong>. Selain itu, konsultasi awal dan demo sistem sebelum deal juga gratis! Untuk paket yang lebih kompleks, hosting & domain dihitung terpisah sesuai kebutuhan. Tertarik? 😊`;
  return `Terima kasih sudah menghubungi kami! 🙏 Kami spesialis <strong>sistem website untuk UMKM & bisnis</strong> — harga rata-rata <strong>di bawah Rp 500rb</strong> dengan hosting & domain gratis untuk paket dasar. Harga bisa lebih tergantung fitur & kerumitan sistem. Boleh ceritakan bisnis Anda? Biar saya rekomendasikan solusi yang paling tepat 💡`;
}

async function processAndReply(userText) {
  addMsg(userText, 'user');
  if (cbTyping) cbTyping.style.display = 'flex';
  if (cbMsgs) cbMsgs.scrollTop = 9999;

  const reply = await getAIReply(userText);

  if (cbTyping) cbTyping.style.display = 'none';
  addMsg(reply, 'bot');
  waShown++;
  if (waShown === 2) addWABtn();
}

function qReply(txt) {
  rmQR();
  processAndReply(txt);
}

function sendChat() {
  const val = cbIn?.value.trim();
  if (!val) return;
  cbIn.value = '';
  rmQR();
  processAndReply(val);
}

/* ── FAQ TOGGLE ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const ans = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-a')?.classList.remove('open');
  });
  // Open clicked if it was closed
  if (!isOpen) {
    item.classList.add('open');
    ans?.classList.add('open');
  }
}

/* ── TESTIMONI IMAGE MODAL ── */
const modal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const closeModalBtn = document.querySelector(".close-modal");

document.querySelectorAll(".testi-img").forEach(img => {
  img.addEventListener("click", function(){
    if (!modal || !modalImg) return;
    modal.style.display = "block";
    modalImg.src = this.src;
  });
});

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => { if (modal) modal.style.display = "none"; });
}
if (modal) {
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = "none"; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = "none"; });
}

/* ── PAGE LOAD ANIMATION ── */
document.querySelectorAll('.hero-left > *').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.filter = 'blur(4px)';
  el.style.transition = `opacity .7s ${i * .13}s cubic-bezier(.16,1,.3,1), transform .7s ${i * .13}s cubic-bezier(.16,1,.3,1), filter .6s ${i * .13}s ease`;
  requestAnimationFrame(() => setTimeout(() => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
  }, 80 + i * 130));
});

/* ── BUTTON RIPPLE EFFECT ── */
document.querySelectorAll('.btn-solid, .btn-ghost, .cta-btn, .form-submit, .wa-cta, .pc-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(r.width, r.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%;
      width:${size}px; height:${size}px;
      left:${e.clientX - r.left - size/2}px;
      top:${e.clientY - r.top - size/2}px;
      background:rgba(255,255,255,.25);
      transform:scale(0); animation:ripple .55s ease-out forwards;
      pointer-events:none; z-index:10;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* Add ripple keyframe dynamically */
if (!document.getElementById('rippleStyle')) {
  const s = document.createElement('style');
  s.id = 'rippleStyle';
  s.textContent = '@keyframes ripple{to{transform:scale(2.5);opacity:0}}';
  document.head.appendChild(s);
}

/* ── EMBED CARD HIDDEN CLASS — ensure display:none works ── */
(function() {
  if (!document.getElementById('hiddenStyle')) {
    const s = document.createElement('style');
    s.id = 'hiddenStyle';
    s.textContent = '.embed-card.hidden{display:none!important}';
    document.head.appendChild(s);
  }
})();

/* ── EMBED SPINNER CSS inject ── */
(function() {
  if (!document.getElementById('spinStyle')) {
    const s = document.createElement('style');
    s.id = 'spinStyle';
    s.textContent = `
      .embed-spinner{width:24px;height:24px;border:2px solid var(--b2);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
      .embed-loading span{font-size:.72rem;color:var(--tx3)}
      .embed-blocked.show{display:flex!important}
      .embed-blocked svg{color:var(--tx3)}
    `;
    document.head.appendChild(s);
  }
})();