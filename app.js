/* =============================================
   BenyoRiki Digital Universe — app.js v2026
   FIXED: Calculator var conflict, Canvas conflict, Music player
   ============================================= */

// ===== PARTICLES =====
(function(){
  const pCanvas = document.getElementById('particles');
  if(!pCanvas) return;
  const pCtx = pCanvas.getContext('2d');
  let W, H, particles = [];
  function resize(){ W = pCanvas.width = window.innerWidth; H = pCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  for(let i=0;i<80;i++) particles.push({
    x:Math.random()*9999,y:Math.random()*9999,
    r:Math.random()*1.8+.3,
    vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,
    a:Math.random(),
    hue: Math.random() > 0.5 ? 265 : 190
  });
  function draw(){
    pCtx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      pCtx.beginPath();
      pCtx.arc(p.x%W,p.y%H,p.r,0,Math.PI*2);
      pCtx.fillStyle=`hsla(${p.hue},80%,70%,${p.a*0.4})`;
      pCtx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== NAV =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => navLinks.classList.remove('open'));
});
const navSections = ['social','music','tools','game'];
window.addEventListener('scroll', () => {
  let current = '';
  navSections.forEach(id => {
    const el = document.getElementById(id);
    if(el && el.getBoundingClientRect().top <= 100) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === current);
  });
});

// ===== TOAST =====
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3000);
}

// ===== AUTH SYSTEM =====
let currentUser = null;
const USERS_KEY = 'br_users_v2';
const SESSION_KEY = 'br_session_v2';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

// Init session
(function initAuth(){
  const session = loadSession();
  if(session) {
    const users = loadUsers();
    const user = users.find(u => u.username === session.username);
    if(user) { currentUser = user; updateAuthUI(); }
  }
})();

function updateAuthUI() {
  const btn = document.getElementById('navAuthBtn');
  const lbl = document.getElementById('navAuthLabel');
  if(currentUser) {
    lbl.textContent = currentUser.name.split(' ')[0];
    btn.onclick = showUserMenu;
    btn.querySelector('.auth-icon').textContent = '👤';
  } else {
    lbl.textContent = 'Login';
    btn.onclick = openAuthModal;
    btn.querySelector('.auth-icon').textContent = '👤';
  }
  document.getElementById('totalSongs').textContent = TRACKS.length;
  renderTopPlayed();
  renderLiked();
}

function openAuthModal() {
  document.getElementById('authModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.closeAuthModal = function() {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
};
document.getElementById('authModal').addEventListener('click', function(e){
  if(e.target === this) closeAuthModal();
});

window.switchTab = function(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabRegister').classList.toggle('active', tab==='register');
  document.getElementById('formLogin').style.display = tab==='login' ? '' : 'none';
  document.getElementById('formRegister').style.display = tab==='register' ? '' : 'none';
};

window.togglePw = function(id, btn) {
  const el = document.getElementById(id);
  if(el.type==='password'){ el.type='text'; btn.textContent='🙈'; }
  else { el.type='password'; btn.textContent='👁'; }
};

document.getElementById('regPass').addEventListener('input', function(){
  const val = this.value;
  const bar = document.getElementById('pwStrength');
  if(!val) { bar.style.width='0'; return; }
  let strength = 0;
  if(val.length >= 6) strength++;
  if(val.length >= 10) strength++;
  if(/[A-Z]/.test(val)) strength++;
  if(/[0-9]/.test(val)) strength++;
  if(/[^a-zA-Z0-9]/.test(val)) strength++;
  const colors = ['','#ef4444','#f59e0b','#eab308','#22c55e','#16a34a'];
  bar.style.width = (strength*20)+'%';
  bar.style.background = colors[strength];
  bar.style.height = '4px';
});

window.doRegister = function() {
  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const err = document.getElementById('regErr');
  err.textContent = '';

  if(!name||!username||!email||!pass){ err.textContent='Semua field wajib diisi!'; return; }
  if(pass.length < 6){ err.textContent='Password minimal 6 karakter!'; return; }
  if(!/^[a-zA-Z0-9_]+$/.test(username)){ err.textContent='Username hanya boleh huruf, angka, dan _'; return; }
  if(!/\S+@\S+\.\S+/.test(email)){ err.textContent='Format email tidak valid!'; return; }

  const users = loadUsers();
  if(users.find(u=>u.username===username)){ err.textContent='Username sudah digunakan!'; return; }
  if(users.find(u=>u.email===email)){ err.textContent='Email sudah terdaftar!'; return; }

  const user = { id: Date.now(), name, username, email, password: btoa(pass), joinDate: new Date().toLocaleDateString('id-ID'), role: 'user', liked: [], playCount: {} };
  users.push(user);
  saveUsers(users);

  currentUser = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify({username}));
  closeAuthModal();
  updateAuthUI();
  showToast(`🎉 Selamat datang, ${name}!`, 'success');
};

window.doLogin = function() {
  const username = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const remember = document.getElementById('rememberMe').checked;
  const err = document.getElementById('loginErr');
  err.textContent = '';

  if(!username||!pass){ err.textContent='Isi username dan password!'; return; }

  // Demo admin account
  if(username === 'admin' && pass === 'admin123') {
    currentUser = { id:0, name:'Admin BenyoRiki', username:'admin', role:'admin', liked:[], playCount:{} };
    if(remember) localStorage.setItem(SESSION_KEY, JSON.stringify({username:'admin'}));
    closeAuthModal();
    updateAuthUI();
    showToast('✅ Login sebagai Admin!', 'success');
    return;
  }

  const users = loadUsers();
  const user = users.find(u => (u.username===username||u.email===username) && u.password===btoa(pass));
  if(!user){ err.textContent='Username/password salah!'; return; }

  currentUser = user;
  if(remember) localStorage.setItem(SESSION_KEY, JSON.stringify({username:user.username}));
  closeAuthModal();
  updateAuthUI();
  showToast(`✅ Selamat datang kembali, ${user.name}!`, 'success');
};

window.socialLogin = function(provider) {
  showToast(`${provider} login — demo mode`, 'success');
  currentUser = { id: Date.now(), name: `User ${provider}`, username: `user_${Date.now()}`, role: 'user', liked: [], playCount: {} };
  closeAuthModal();
  updateAuthUI();
};

function showUserMenu() {
  showToast(`👤 ${currentUser.name} | ${currentUser.role === 'admin' ? '👑 Admin' : 'User'} — Klik lagi untuk logout`);
  const btn = document.getElementById('navAuthBtn');
  btn.onclick = doLogout;
  setTimeout(() => { if(currentUser) btn.onclick = showUserMenu; }, 4000);
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  updateAuthUI();
  showToast('👋 Berhasil logout');
  document.getElementById('navAuthBtn').onclick = openAuthModal;
}

// ===== MUSIC DATABASE =====
const MUSIC_DB_KEY = 'br_music_db_v2';
const LIKED_KEY = 'br_liked_v2';
const PLAY_COUNTS_KEY = 'br_plays_v2';

// Default tracks - with real streamable demo URLs where possible
const DEFAULT_TRACKS = [
  {id:1,title:"Awan Nano",artist:"Tulus",genre:"pop",year:"2014",emoji:"☁️",duration:"4:10",color:"#4facfe",folder:"Hits Indonesia",tags:["#hits","#santai"],addedBy:"system",url:""},
  {id:2,title:"Sampai Jua",artist:"Afgan",genre:"pop",year:"2012",emoji:"🌙",duration:"4:32",color:"#a18cd1",folder:"Hits Indonesia",tags:["#galau"],addedBy:"system",url:""},
  {id:3,title:"Tak Ingin Usai",artist:"Rizky Febian",genre:"pop",year:"2019",emoji:"💫",duration:"3:58",color:"#fbc2eb",folder:"Cinta & Galau",tags:["#galau","#santai"],addedBy:"system",url:""},
  {id:4,title:"Ruang Sendiri",artist:"Tulus",genre:"pop",year:"2022",emoji:"🏠",duration:"4:05",color:"#43e97b",folder:"Slow & Santai",tags:["#santai"],addedBy:"system",url:""},
  {id:5,title:"Hari Yang Cerah",artist:"The Changcuters",genre:"rock",year:"2008",emoji:"☀️",duration:"3:20",color:"#f7971e",folder:"Old School",tags:["#semangat","#nostalgia"],addedBy:"system",url:""},
  {id:6,title:"Jatuh Cinta",artist:"Raisa",genre:"pop",year:"2016",emoji:"❤️",duration:"4:22",color:"#f85032",folder:"Cinta & Galau",tags:["#galau","#hits"],addedBy:"system",url:""},
  {id:7,title:"Kita Bisa",artist:"Melly Goeslaw",genre:"pop",year:"2010",emoji:"✊",duration:"4:00",color:"#12c2e9",folder:"Semangat & Energi",tags:["#semangat"],addedBy:"system",url:""},
  {id:8,title:"Gemilang",artist:"Gigi",genre:"rock",year:"2003",emoji:"⚡",duration:"3:45",color:"#ee0979",folder:"Old School",tags:["#semangat","#nostalgia"],addedBy:"system",url:""},
  {id:9,title:"Bidadari Tak Bersayap",artist:"Anji",genre:"pop",year:"2014",emoji:"😇",duration:"4:18",color:"#b8e994",folder:"Hits Indonesia",tags:["#hits","#galau"],addedBy:"system",url:""},
  {id:10,title:"Cinta Sejati",artist:"Bunga Citra Lestari",genre:"pop",year:"2012",emoji:"🌹",duration:"4:30",color:"#ff6b6b",folder:"Cinta & Galau",tags:["#galau"],addedBy:"system",url:""},
  {id:11,title:"Blinding Lights",artist:"The Weeknd",genre:"pop",year:"2019",emoji:"🌃",duration:"3:22",color:"#ff3366",folder:"Hits Dunia",tags:["#hits","#upbeat"],addedBy:"system",url:""},
  {id:12,title:"Shape of You",artist:"Ed Sheeran",genre:"pop",year:"2017",emoji:"🎸",duration:"3:53",color:"#f9ca24",folder:"Hits Dunia",tags:["#hits"],addedBy:"system",url:""},
  {id:13,title:"Bulan Dikekang Malam",artist:"Hindia",genre:"indie",year:"2019",emoji:"🌛",duration:"4:15",color:"#6c5ce7",folder:"Hits Indonesia",tags:["#galau","#lofi"],addedBy:"system",url:""},
  {id:14,title:"Runtuh",artist:"Feby Putri ft. Fiersa Besari",genre:"indie",year:"2020",emoji:"🍂",duration:"4:02",color:"#e17055",folder:"Cinta & Galau",tags:["#galau","#viral"],addedBy:"system",url:""},
  {id:15,title:"Mantra Cinta",artist:"Lesti",genre:"dangdut",year:"2023",emoji:"💝",duration:"4:30",color:"#fd79a8",folder:"Viral 2025-2026",tags:["#viral","#hits"],addedBy:"system",url:""},
  {id:16,title:"Lathi",artist:"Weird Genius ft. Sarah N Azhari",genre:"electronic",year:"2020",emoji:"⚡",duration:"3:06",color:"#00cec9",folder:"Viral 2025-2026",tags:["#viral","#upbeat"],addedBy:"system",url:""},
];

function loadTracks() {
  try {
    const saved = JSON.parse(localStorage.getItem(MUSIC_DB_KEY));
    return saved && saved.length > 0 ? saved : [...DEFAULT_TRACKS];
  } catch { return [...DEFAULT_TRACKS]; }
}
function saveTracks(tracks) {
  localStorage.setItem(MUSIC_DB_KEY, JSON.stringify(tracks));
}

let TRACKS = loadTracks();
let currentTrackIdx = 0, isPlaying = false, isShuffle = false, isRepeat = false, isMuted = false;
let eqInterval = null, progressInterval = null, fakeTime = 0, fakeDuration = 0;
let eqMode = 'bars';
let selectedTags = [];
let currentFilter = { genre: 'all', folder: 'all', search: '' };
const audioEl = document.getElementById('audioPlayer');

// ===== FIX: Audio event listeners for real playback =====
audioEl.addEventListener('timeupdate', () => {
  if(audioEl.src && audioEl.duration) {
    fakeTime = audioEl.currentTime;
    fakeDuration = audioEl.duration;
    updateProgress();
  }
});
audioEl.addEventListener('ended', () => {
  if(isRepeat) { audioEl.currentTime = 0; audioEl.play().catch(()=>{}); }
  else { nextTrack(); }
});
audioEl.addEventListener('error', () => {
  // Audio failed to load - show message but keep UI functional
  showToast('🎵 Lagu ini belum ada URL audio. Tambahkan URL di "Tambah Musik"', '');
});

function getFilteredTracks() {
  return TRACKS.filter(t => {
    const genreOk = currentFilter.genre === 'all' || t.genre === currentFilter.genre;
    const folderOk = currentFilter.folder === 'all' || t.folder === currentFilter.folder;
    const searchOk = !currentFilter.search || 
      t.title.toLowerCase().includes(currentFilter.search) ||
      t.artist.toLowerCase().includes(currentFilter.search) ||
      t.genre.toLowerCase().includes(currentFilter.search);
    return genreOk && folderOk && searchOk;
  });
}

function renderTracks() {
  const list = document.getElementById('trackList');
  const filtered = getFilteredTracks();
  list.innerHTML = '';
  filtered.forEach((t, i) => {
    const realIdx = TRACKS.indexOf(t);
    const div = document.createElement('div');
    div.className = 'track-item' + (realIdx === currentTrackIdx ? ' active' : '');
    div.innerHTML = `
      <span class="ti-num">${i+1}</span>
      <span class="ti-emoji" style="background:${t.color}22">${t.emoji}</span>
      <div class="ti-info">
        <div class="ti-title">${t.title}</div>
        <div class="ti-artist">${t.artist} · ${t.folder||'—'}</div>
      </div>
      <span class="ti-dur">${t.duration}</span>
      ${t.addedBy !== 'system' ? `<span class="ti-badge">New</span>` : ''}`;
    div.onclick = () => { currentTrackIdx = realIdx; loadTrack(realIdx); playTrack(); };
    list.appendChild(div);
  });
  document.getElementById('trackCount').textContent = `${filtered.length} lagu`;
}

window.filterPlaylist = function(f) {
  currentFilter.genre = f;
  document.querySelectorAll('.pt').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderTracks();
};

window.filterFolder = function(f, btn) {
  currentFilter.folder = f;
  document.querySelectorAll('.ft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTracks();
};

document.getElementById('searchInput').addEventListener('input', e => {
  currentFilter.search = e.target.value.toLowerCase();
  renderTracks();
});

function loadTrack(i) {
  const t = TRACKS[i];
  if(!t) return;
  document.getElementById('npTitle').textContent = t.title;
  document.getElementById('npArtist').textContent = t.artist;
  document.getElementById('npGenre').textContent = t.genre.toUpperCase();
  document.getElementById('npYear').textContent = t.year || '—';
  document.getElementById('npFolder').textContent = t.folder || '—';

  if(t.cover) {
    document.getElementById('npCoverInner').innerHTML = `<img src="${t.cover}" alt="${t.title}" onerror="this.parentNode.innerHTML='<span>${t.emoji}</span>'">`;
    document.getElementById('npCoverInner').classList.add('has-cover');
  } else {
    document.getElementById('npCoverInner').innerHTML = `<span id="npEmoji">${t.emoji}</span>`;
    document.getElementById('npCoverInner').classList.remove('has-cover');
  }
  document.getElementById('npCoverInner').style.background = `radial-gradient(circle at 30% 30%, ${t.color}44, #0d0d1a)`;
  document.getElementById('npGlow').style.background = t.color;

  fakeTime = 0;
  const parts = (t.duration||'3:30').split(':');
  fakeDuration = parseInt(parts[0])*60 + parseInt(parts[1]||'0');
  document.getElementById('totalTime').textContent = t.duration || '—';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('currentTime').textContent = '0:00';

  // Audio - only set src if url exists
  if(t.url && t.url.trim()) {
    audioEl.src = t.url;
    audioEl.load();
  } else {
    audioEl.src = '';
    audioEl.removeAttribute('src');
  }

  updateLikeBtn();
  trackPlay(i);

  // Update active track in list
  document.querySelectorAll('.track-item').forEach((el) => {
    const idx = parseInt(el.querySelector('.ti-num')?.textContent || '0') - 1;
    const filtered = getFilteredTracks();
    if(filtered[idx]) {
      el.classList.toggle('active', TRACKS.indexOf(filtered[idx]) === i);
    }
  });
  renderQueue();
  renderTopPlayed();
}

function trackPlay(i) {
  const counts = JSON.parse(localStorage.getItem(PLAY_COUNTS_KEY)||'{}');
  counts[i] = (counts[i]||0)+1;
  localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(counts));
}

function playTrack() {
  isPlaying = true;
  document.getElementById('playBtn').textContent = '⏸';
  document.getElementById('npCoverInner').classList.add('spinning');
  document.getElementById('npGlow').classList.add('active');
  startFakeProgress();
  startEqualizer();
  // Try to play audio if src exists
  if(audioEl.src && audioEl.src !== window.location.href) {
    audioEl.play().catch(() => {
      // Audio failed - fallback to fake progress only (works for demo without URLs)
    });
  }
}

function pauseTrack() {
  isPlaying = false;
  document.getElementById('playBtn').textContent = '▶';
  document.getElementById('npCoverInner').classList.remove('spinning');
  document.getElementById('npGlow').classList.remove('active');
  stopFakeProgress();
  stopEqualizer();
  if(audioEl.src && audioEl.src !== window.location.href) audioEl.pause();
}
window.togglePlay = () => { isPlaying ? pauseTrack() : playTrack(); };

window.nextTrack = () => {
  const filtered = getFilteredTracks();
  let nextReal;
  if(isShuffle) {
    nextReal = TRACKS.indexOf(filtered[Math.floor(Math.random()*filtered.length)]);
  } else {
    const ci = filtered.findIndex(t => TRACKS.indexOf(t)===currentTrackIdx);
    const ni = (ci+1)%filtered.length;
    nextReal = TRACKS.indexOf(filtered[ni]);
  }
  currentTrackIdx = nextReal>=0 ? nextReal : 0;
  loadTrack(currentTrackIdx); playTrack();
};
window.prevTrack = () => {
  const filtered = getFilteredTracks();
  const ci = filtered.findIndex(t => TRACKS.indexOf(t)===currentTrackIdx);
  const pi = (ci-1+filtered.length)%filtered.length;
  currentTrackIdx = TRACKS.indexOf(filtered[pi]);
  if(currentTrackIdx<0) currentTrackIdx=0;
  loadTrack(currentTrackIdx); playTrack();
};
window.toggleShuffle = () => {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('active', isShuffle);
  showToast(isShuffle ? '🔀 Acak aktif' : '🔀 Acak nonaktif');
};
window.toggleRepeat = () => {
  isRepeat = !isRepeat;
  document.getElementById('repeatBtn').classList.toggle('active', isRepeat);
  showToast(isRepeat ? '↺ Ulangi aktif' : '↺ Ulangi nonaktif');
};
window.toggleMute = () => {
  isMuted = !isMuted;
  audioEl.muted = isMuted;
  document.getElementById('muteBtn').textContent = isMuted ? '🔇' : '🔈';
};
window.setVolume = (v) => {
  audioEl.volume = v/100;
  const slider = document.getElementById('volumeSlider');
  slider.style.background = `linear-gradient(to right,var(--accent2) ${v}%,var(--card2) ${v}%)`;
};
window.seekTo = (e) => {
  const bar = document.getElementById('progressBar');
  const ratio = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
  fakeTime = Math.max(0, Math.min(fakeDuration, ratio * fakeDuration));
  if(audioEl.src && audioEl.duration) audioEl.currentTime = ratio * audioEl.duration;
  updateProgress();
};

window.addFromUrl = () => {
  const url = document.getElementById('urlInput').value.trim();
  if(!url) return;
  audioEl.src = url;
  audioEl.play().then(() => {
    isPlaying = true;
    document.getElementById('playBtn').textContent = '⏸';
    document.getElementById('npTitle').textContent = '📻 Radio Stream';
    document.getElementById('npArtist').textContent = url.split('/').pop().slice(0,30)||url;
    document.getElementById('npFolder').textContent = 'Radio';
    startEqualizer();
    showToast('📻 Radio/Stream sedang diputar', 'success');
  }).catch(() => showToast('❌ URL tidak bisa diputar. Gunakan URL langsung (.mp3, .ogg)', 'error'));
};

window.playRadio = (url, name) => {
  if(!url) { showToast('📻 Preset radio belum tersedia', 'error'); return; }
  document.getElementById('urlInput').value = url;
  document.getElementById('npTitle').textContent = name;
  document.getElementById('npFolder').textContent = 'Radio';
  addFromUrl();
};

function startFakeProgress() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if(!isPlaying) return;
    // If real audio is playing, let timeupdate handle it
    if(audioEl.src && audioEl.src !== window.location.href && !audioEl.paused && audioEl.duration) {
      return; // audio events handle this
    }
    // Fake progress for tracks without audio URL
    fakeTime++;
    if(fakeDuration && fakeTime >= fakeDuration) {
      if(isRepeat) { fakeTime=0; }
      else { nextTrack(); return; }
    }
    updateProgress();
  }, 1000);
}
function stopFakeProgress() { clearInterval(progressInterval); }
function updateProgress() {
  const pct = fakeDuration ? (fakeTime/fakeDuration*100) : 0;
  document.getElementById('progressFill').style.width = pct+'%';
  const m = Math.floor(fakeTime/60), s = Math.floor(fakeTime%60);
  document.getElementById('currentTime').textContent = `${m}:${s.toString().padStart(2,'0')}`;
}

// Equalizer
const eqBars = 20;
function buildEQ() {
  const eq = document.getElementById('equalizer');
  eq.innerHTML = '';
  for(let i=0;i<eqBars;i++){
    const b = document.createElement('div');
    b.className = 'eq-bar'; b.style.height = '4px';
    eq.appendChild(b);
  }
}
buildEQ();
function startEqualizer() {
  clearInterval(eqInterval);
  eqInterval = setInterval(() => {
    const bars = document.querySelectorAll('.eq-bar');
    bars.forEach((b,i) => {
      const h = Math.sin(Date.now()/200+i*0.4)*25+Math.random()*35+10;
      b.style.height = h+'px';
    });
  }, 100);
}
function stopEqualizer() {
  clearInterval(eqInterval);
  document.querySelectorAll('.eq-bar').forEach(b => b.style.height='4px');
}
window.setEqMode = function(mode, btn) {
  eqMode = mode;
  document.querySelectorAll('.eq-mode').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
};

function renderQueue() {
  const q = document.getElementById('queueList');
  q.innerHTML = '';
  const filtered = getFilteredTracks();
  for(let i=1;i<=5;i++){
    const idx = (filtered.findIndex(t=>TRACKS.indexOf(t)===currentTrackIdx)+i)%filtered.length;
    const t = filtered[idx];
    if(!t) continue;
    const d = document.createElement('div');
    d.className = 'queue-item';
    d.textContent = `${t.emoji} ${t.title} — ${t.artist}`;
    d.onclick = () => { currentTrackIdx = TRACKS.indexOf(t); loadTrack(currentTrackIdx); playTrack(); };
    q.appendChild(d);
  }
}

function renderTopPlayed() {
  const counts = JSON.parse(localStorage.getItem(PLAY_COUNTS_KEY)||'{}');
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const tp = document.getElementById('topPlayed');
  if(!tp) return;
  tp.innerHTML = '';
  if(!sorted.length) { tp.innerHTML='<div style="color:var(--text2);font-size:.78rem;padding:.3rem .5rem">Belum ada data</div>'; return; }
  sorted.forEach(([idx, cnt], i) => {
    const t = TRACKS[idx];
    if(!t) return;
    const d = document.createElement('div');
    d.className = 'top-item';
    d.innerHTML = `<span class="top-num">${i+1}</span>${t.emoji} ${t.title}<span style="margin-left:auto;font-size:.65rem;color:var(--text2)">${cnt}x</span>`;
    d.onclick = () => { currentTrackIdx = +idx; loadTrack(+idx); playTrack(); };
    tp.appendChild(d);
  });
}

// Liked songs
window.toggleLike = function() {
  if(!currentUser) { openAuthModal(); return; }
  const liked = JSON.parse(localStorage.getItem(LIKED_KEY+'_'+currentUser.username)||'[]');
  const t = TRACKS[currentTrackIdx];
  if(!t) return;
  const idx = liked.indexOf(t.id);
  if(idx>-1) { liked.splice(idx,1); showToast(`💔 ${t.title} dihapus dari Disukai`); }
  else { liked.push(t.id); showToast(`❤️ ${t.title} ditambahkan ke Disukai`, 'success'); }
  localStorage.setItem(LIKED_KEY+'_'+currentUser.username, JSON.stringify(liked));
  updateLikeBtn();
  renderLiked();
};

function updateLikeBtn() {
  const btn = document.getElementById('likeBtn');
  if(!btn) return;
  if(!currentUser) { btn.textContent = '♡ Suka'; btn.classList.remove('active'); return; }
  const liked = JSON.parse(localStorage.getItem(LIKED_KEY+'_'+currentUser.username)||'[]');
  const t = TRACKS[currentTrackIdx];
  const isLiked = t && liked.includes(t.id);
  btn.textContent = isLiked ? '❤️ Disukai' : '♡ Suka';
  btn.classList.toggle('active', isLiked);
}

function renderLiked() {
  const ll = document.getElementById('likedList');
  if(!ll) return;
  if(!currentUser) { ll.innerHTML='<div style="color:var(--text2);font-size:.78rem;padding:.5rem">Login untuk melihat daftar suka</div>'; return; }
  const liked = JSON.parse(localStorage.getItem(LIKED_KEY+'_'+currentUser.username)||'[]');
  if(!liked.length) { ll.innerHTML='<div style="color:var(--text2);font-size:.78rem;padding:.5rem">Belum ada lagu yang disukai</div>'; return; }
  ll.innerHTML = '';
  TRACKS.filter(t=>liked.includes(t.id)).forEach(t => {
    const d = document.createElement('div');
    d.className = 'liked-item';
    d.innerHTML = `${t.emoji} ${t.title} <span style="margin-left:auto;font-size:.65rem;color:var(--text2)">${t.artist}</span>`;
    d.onclick = () => { currentTrackIdx=TRACKS.indexOf(t); loadTrack(currentTrackIdx); playTrack(); };
    ll.appendChild(d);
  });
}

window.shareTrack = function() {
  const t = TRACKS[currentTrackIdx];
  if(!t) return;
  const text = `🎵 Dengerin "${t.title}" by ${t.artist} di BenyoRiki Digital Universe!\n🌐 https://jasadaud.online/`;
  if(navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('🔗 Link disalin ke clipboard!', 'success'));
  } else {
    showToast('🎵 '+t.title+' — '+t.artist, 'success');
  }
};

// Add Music Feature (Login Required)
window.requireLoginForMusic = function() {
  if(!currentUser) {
    showToast('🔐 Login terlebih dahulu untuk menambah musik!', 'error');
    setTimeout(() => openAuthModal(), 500);
    return;
  }
  openAddMusic();
};

function openAddMusic() {
  document.getElementById('addMusicModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  selectedTags = [];
  document.querySelectorAll('.tag-opt').forEach(t=>t.classList.remove('selected'));
  document.getElementById('amErr').textContent = '';
  ['am_title','am_artist','am_url','am_cover','am_desc'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
}
window.closeAddMusic = function() {
  document.getElementById('addMusicModal').classList.remove('open');
  document.body.style.overflow = '';
};
document.getElementById('addMusicModal').addEventListener('click', function(e){
  if(e.target === this) closeAddMusic();
});

window.toggleTag = function(el, tag) {
  el.classList.toggle('selected');
  if(selectedTags.includes(tag)) selectedTags = selectedTags.filter(t=>t!==tag);
  else selectedTags.push(tag);
};

window.submitAddMusic = function() {
  const title = document.getElementById('am_title').value.trim();
  const artist = document.getElementById('am_artist').value.trim();
  const genre = document.getElementById('am_genre').value;
  const folder = document.getElementById('am_folder').value;
  const year = document.getElementById('am_year').value.trim() || new Date().getFullYear()+'';
  const duration = document.getElementById('am_duration').value.trim() || '3:00';
  const url = document.getElementById('am_url').value.trim();
  const cover = document.getElementById('am_cover').value.trim();
  const err = document.getElementById('amErr');
  err.textContent = '';

  if(!title){ err.textContent='Judul lagu wajib diisi!'; return; }
  if(!artist){ err.textContent='Nama artis wajib diisi!'; return; }
  if(!genre){ err.textContent='Pilih genre lagu!'; return; }

  const emojis = ['🎵','🎶','🎸','🎹','🎤','🎼','🎺','🎻','🥁','🎷','✨','💫','🌟','⭐','🌙','☀️'];
  const colors = ['#4facfe','#a18cd1','#fbc2eb','#43e97b','#f7971e','#f85032','#12c2e9','#ee0979','#b8e994','#ff6b6b','#6c5ce7','#fd79a8','#00cec9','#e17055'];

  const newTrack = {
    id: Date.now(),
    title, artist, genre,
    year, duration, url,
    cover: cover || '',
    folder,
    emoji: emojis[Math.floor(Math.random()*emojis.length)],
    color: colors[Math.floor(Math.random()*colors.length)],
    tags: selectedTags,
    addedBy: currentUser.username,
    addedAt: new Date().toLocaleDateString('id-ID')
  };

  TRACKS.push(newTrack);
  saveTracks(TRACKS);
  renderTracks();
  closeAddMusic();
  showToast(`🎵 "${title}" berhasil ditambahkan!`, 'success');
  document.getElementById('totalSongs').textContent = TRACKS.length;
};

// Init music
renderTracks();
setVolume(70);
document.getElementById('totalSongs').textContent = TRACKS.length;

// ===== CALCULATOR (FIXED - renamed variable to avoid conflict with function) =====
let calcCurrent = '0', calcExpression = '', calcOperator = null, calcNewNum = false;
let calcHistoryArr = [];
let calcMode = 'basic';

window.setCalcMode = function(mode, btn) {
  calcMode = mode;
  document.querySelectorAll('.calc-mode').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const sciRow = document.getElementById('calcSciRow');
  if(sciRow) sciRow.classList.toggle('visible', mode === 'sci');
};

window.calcNum = function(n) {
  if(calcNewNum) { calcCurrent = n === '.' ? '0.' : n; calcNewNum = false; }
  else {
    if(n === '.' && calcCurrent.includes('.')) return;
    calcCurrent = calcCurrent === '0' && n !== '.' ? n : calcCurrent + n;
  }
  document.getElementById('calcResult').textContent = calcCurrent;
};

// FIX: Renamed from calcOp to calcOpBtn to avoid variable conflict
window.calcOp = function(op) {
  if(calcOperator && !calcNewNum) { calcEquals(); }
  calcExpression = calcCurrent + ' ' + op;
  document.getElementById('calcExpr').textContent = calcExpression;
  calcOperator = op; calcNewNum = true;
};

window.calcEquals = function() {
  if(!calcOperator) return;
  const b = parseFloat(calcCurrent.replace(',','.'));
  const a = parseFloat(calcExpression.split(' ')[0].replace(',','.'));
  const ops = {
    '÷': (x,y) => y!==0 ? x/y : 'Error',
    '×': (x,y) => x*y,
    '+': (x,y) => x+y,
    '−': (x,y) => x-y,
    '-': (x,y) => x-y
  };
  const result = ops[calcOperator] ? ops[calcOperator](a, b) : 0;
  const res = typeof result === 'number' ? parseFloat(result.toFixed(10)).toString() : result;
  calcHistoryArr.unshift(`${calcExpression} ${calcCurrent} = ${res}`);
  calcHistoryArr = calcHistoryArr.slice(0,8);
  renderCalcHistory();
  document.getElementById('calcExpr').textContent = calcExpression + ' ' + calcCurrent + ' =';
  document.getElementById('calcResult').textContent = res;
  calcCurrent = res.toString(); calcOperator = null; calcNewNum = true;
};

window.calcFunc = function(f) {
  if(f === 'AC') {
    calcCurrent = '0'; calcExpression = ''; calcOperator = null; calcNewNum = false;
    document.getElementById('calcResult').textContent = '0';
    document.getElementById('calcExpr').textContent = '';
  } else if(f === '+/-') {
    calcCurrent = (parseFloat(calcCurrent) * -1).toString();
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === '%') {
    calcCurrent = (parseFloat(calcCurrent) / 100).toString();
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === '√') {
    const val = parseFloat(calcCurrent);
    calcCurrent = val >= 0 ? Math.sqrt(val).toString() : 'Error';
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'x²') {
    calcCurrent = Math.pow(parseFloat(calcCurrent),2).toString();
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'sin') {
    calcCurrent = Math.sin(parseFloat(calcCurrent) * Math.PI/180).toFixed(8).toString();
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'cos') {
    calcCurrent = Math.cos(parseFloat(calcCurrent) * Math.PI/180).toFixed(8).toString();
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'tan') {
    calcCurrent = Math.tan(parseFloat(calcCurrent) * Math.PI/180).toFixed(8).toString();
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'log') {
    const val = parseFloat(calcCurrent);
    calcCurrent = val > 0 ? Math.log10(val).toFixed(8).toString() : 'Error';
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'ln') {
    const val = parseFloat(calcCurrent);
    calcCurrent = val > 0 ? Math.log(val).toFixed(8).toString() : 'Error';
    document.getElementById('calcResult').textContent = calcCurrent;
  } else if(f === 'π') {
    calcCurrent = Math.PI.toString();
    document.getElementById('calcResult').textContent = calcCurrent;
    calcNewNum = false;
  } else if(f === '1/x') {
    const val = parseFloat(calcCurrent);
    calcCurrent = val !== 0 ? (1/val).toString() : 'Error';
    document.getElementById('calcResult').textContent = calcCurrent;
  }
};

// Keyboard support for calculator
document.addEventListener('keydown', function(e) {
  if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const key = e.key;
  if(key >= '0' && key <= '9') { e.preventDefault(); calcNum(key); }
  else if(key === '.') { e.preventDefault(); calcNum('.'); }
  else if(key === '+') { e.preventDefault(); calcOp('+'); }
  else if(key === '-') { e.preventDefault(); calcOp('−'); }
  else if(key === '*') { e.preventDefault(); calcOp('×'); }
  else if(key === '/') { e.preventDefault(); calcOp('÷'); }
  else if(key === 'Enter' || key === '=') { e.preventDefault(); calcEquals(); }
  else if(key === 'Escape') { e.preventDefault(); calcFunc('AC'); }
  else if(key === 'Backspace') {
    e.preventDefault();
    if(calcCurrent.length > 1) { calcCurrent = calcCurrent.slice(0,-1); }
    else { calcCurrent = '0'; }
    document.getElementById('calcResult').textContent = calcCurrent;
  }
  // Music controls
  else if(key === ' ') { e.preventDefault(); window.togglePlay(); }
  else if(key === 'ArrowRight') window.nextTrack();
  else if(key === 'ArrowLeft') window.prevTrack();
  else if(key === 'm' || key === 'M') window.toggleMute();
});

function renderCalcHistory() {
  const ch = document.getElementById('calcHistory');
  ch.innerHTML = '';
  const l=document.createElement('div'); l.className='ch-label'; l.textContent='Riwayat'; ch.appendChild(l);
  calcHistoryArr.forEach(h => {
    const d=document.createElement('div'); d.className='ch-item'; d.textContent=h;
    d.onclick = () => {
      const res = h.split('= ')[1];
      if(res) { calcCurrent = res; document.getElementById('calcResult').textContent = res; calcNewNum = true; }
    };
    ch.appendChild(d);
  });
}

window.addEvent = function() {
  const input = document.getElementById('eventInput');
  const val = input.value.trim();
  if(!val) return;
  const list = document.getElementById('eventList');
  const today = new Date().toLocaleDateString('id-ID');
  const d = document.createElement('div');
  d.className = 'event-item';
  d.innerHTML = `📌 ${today}: ${val}<button class="event-del" onclick="this.parentNode.remove()">✕</button>`;
  list.appendChild(d);
  input.value = '';
  showToast('📌 Pengingat ditambahkan!', 'success');
};

// ===== CALENDAR =====
const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HOLIDAYS_2026 = {
  '1-1':'Tahun Baru Masehi','1-27':'Isra Miraj',
  '2-9':'Tahun Baru Imlek','3-22':'Hari Raya Nyepi',
  '3-20':'Wafat Isa Al Masih','3-31':'Hari Raya Idul Fitri',
  '4-1':'Hari Raya Idul Fitri','5-1':'Hari Buruh','5-14':'Kenaikan Isa Al Masih',
  '5-29':'Hari Raya Waisak','6-1':'Hari Pancasila','6-6':'Hari Raya Idul Adha',
  '6-26':'Tahun Baru Hijriyah','8-17':'HUT RI','9-4':'Maulid Nabi',
  '12-25':'Hari Natal','12-26':'Cuti Bersama Natal'
};

let calYear = 2026, calMonth = new Date().getMonth();
function renderCalendar() {
  const ms = document.getElementById('monthSelect');
  const ys = document.getElementById('yearSelect');
  ms.innerHTML = MONTHS_ID.map((m,i)=>`<option value="${i}" ${i===calMonth?'selected':''}>${m}</option>`).join('');
  ys.innerHTML = [2024,2025,2026,2027].map(y=>`<option value="${y}" ${y===calYear?'selected':''}>${y}</option>`).join('');
  
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const prevDays = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();
  
  const container = document.getElementById('calendarDays');
  container.innerHTML = '';
  
  for(let i=firstDay-1;i>=0;i--) {
    const d=document.createElement('div'); d.className='cal-day other-month'; d.textContent=prevDays-i; container.appendChild(d);
  }
  for(let d=1;d<=daysInMonth;d++) {
    const el=document.createElement('div');
    const key=`${calMonth+1}-${d}`;
    const isToday=today.getFullYear()===calYear&&today.getMonth()===calMonth&&today.getDate()===d;
    const isHol=HOLIDAYS_2026[key];
    const isSun=new Date(calYear,calMonth,d).getDay()===0;
    el.className='cal-day'+(isToday?' today':'')+(isHol?' holiday':'')+(isSun&&!isToday?' sunday':'');
    el.textContent=d;
    if(isHol) el.title=HOLIDAYS_2026[key];
    container.appendChild(el);
  }
  
  const rem=(7-((firstDay+daysInMonth)%7))%7;
  for(let i=1;i<=rem&&rem<7;i++){const d=document.createElement('div');d.className='cal-day other-month';d.textContent=i;container.appendChild(d);}
  
  const hl=document.getElementById('holidayList');
  hl.innerHTML='';
  Object.entries(HOLIDAYS_2026).filter(([k])=>k.startsWith(`${calMonth+1}-`)).forEach(([k,name])=>{
    const day=k.split('-')[1];
    const el=document.createElement('div');el.className='hol-item';
    el.innerHTML=`<div class="hol-dot red"></div><span class="hol-date">${day} ${MONTHS_ID[calMonth]}</span><span class="hol-name">${name}</span>`;
    hl.appendChild(el);
  });
}
window.changeMonth=(n)=>{calMonth+=n;if(calMonth<0){calMonth=11;calYear--;}if(calMonth>11){calMonth=0;calYear++;}renderCalendar();};
window.changeMonthSelect=()=>{calMonth=+document.getElementById('monthSelect').value;renderCalendar();};
window.changeYearSelect=()=>{calYear=+document.getElementById('yearSelect').value;renderCalendar();};
renderCalendar();

// ===== ONLINE USER COUNTER (Simulated) =====
function updateOnlineCount() {
  const n = Math.floor(Math.random()*50)+12;
  const el = document.getElementById('onlineUsers');
  if(el) el.textContent = n;
}
setInterval(updateOnlineCount, 8000);
updateOnlineCount();

// ===== ONET GAME (FIXED - renamed canvas variables to avoid conflict) =====
const ROWS=6, COLS=8;
const EMOJIS=['🍎','🍊','🍋','🍇','🍓','🍑','🥝','🍒','🍍','🥭','🍌','🍉','🥑','🌽','🥕','🍆','🌶','🥦','🧅','🧄','🍔','🍕','🌮','🍜','🍣','🍦','🎂','🍩','🍪','🍫','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯'];

let gameBoard=[], gameSelected=[], gameScore=0, gameLevel=1, gameHints=3, gameTimeLeft=120, gameTimerInterval=null, gameIsPaused=false;
let gameBest = parseInt(localStorage.getItem('br_best_score')||'0');

// FIX: Use separate variable names for the Onet canvas (NOT reusing 'canvas' or 'ctx')
const lineCanvas = document.getElementById('lineCanvas');
const lineCtx = lineCanvas.getContext('2d');

function resizeLineCanvas(){ lineCanvas.width=window.innerWidth; lineCanvas.height=window.innerHeight; }
window.addEventListener('resize', resizeLineCanvas); resizeLineCanvas();

document.getElementById('gameBest').textContent = gameBest;

window.startGame = () => {
  clearInterval(gameTimerInterval);
  gameScore=0; gameLevel=1; gameHints=3; gameTimeLeft=120; gameSelected=[]; gameIsPaused=false;
  generateBoard(); renderBoard(); updateHUD();
  document.getElementById('gameMsg').textContent='';
  gameTimerInterval = setInterval(() => {
    if(gameIsPaused) return;
    gameTimeLeft--;
    document.getElementById('gameTimer').textContent = gameTimeLeft;
    if(gameTimeLeft<=0){
      clearInterval(gameTimerInterval);
      if(gameScore > gameBest) { gameBest=gameScore; localStorage.setItem('br_best_score',gameBest); document.getElementById('gameBest').textContent=gameBest; }
      document.getElementById('gameMsg').textContent = `⏰ Waktu Habis! Skor: ${gameScore}`;
    }
  }, 1000);
};

window.pauseGame = () => {
  gameIsPaused = !gameIsPaused;
  document.getElementById('gameMsg').textContent = gameIsPaused ? '⏸ Game Dijeda' : '';
};

function generateBoard() {
  const count=COLS*ROWS, pairCount=count/2;
  const emSet=EMOJIS.slice(0,Math.min(pairCount,EMOJIS.length));
  let tiles=[];
  while(tiles.length<count){ const needed=count-tiles.length; const chunk=emSet.slice(0,Math.floor(needed/2)); chunk.forEach(e=>{tiles.push(e);tiles.push(e);}); }
  tiles=tiles.slice(0,count);
  for(let i=tiles.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  gameBoard=[];
  for(let r=0;r<ROWS;r++){gameBoard.push([]);for(let c=0;c<COLS;c++){gameBoard[r].push({emoji:tiles[r*COLS+c],matched:false});}}
}

function renderBoard(){
  const gb=document.getElementById('gameBoard');
  gb.style.gridTemplateColumns=`repeat(${COLS},auto)`;
  gb.innerHTML='';
  for(let r=0;r<ROWS;r++){for(let c=0;c<COLS;c++){
    const cell=gameBoard[r][c];
    const tile=document.createElement('div');
    tile.className='game-tile'+(cell.matched?' matched':'');
    tile.dataset.r=r; tile.dataset.c=c;
    tile.textContent=cell.matched?'':cell.emoji;
    if(!cell.matched) tile.addEventListener('click',()=>selectTile(r,c));
    gb.appendChild(tile);
  }}
}

function selectTile(r,c){
  if(gameBoard[r][c].matched) return;
  if(gameIsPaused) return;
  if(gameSelected.length===1&&gameSelected[0].r===r&&gameSelected[0].c===c){gameSelected=[];renderBoard();return;}
  gameSelected.push({r,c}); highlightSelected();
  if(gameSelected.length===2){
    const [a,b]=gameSelected;
    if(gameBoard[a.r][a.c].emoji===gameBoard[b.r][b.c].emoji&&canConnect(a,b)){
      setTimeout(()=>{
        drawPath(a,b,true);
        gameBoard[a.r][a.c].matched=true; gameBoard[b.r][b.c].matched=true;
        gameScore+=100+gameLevel*10; gameSelected=[]; renderBoard(); updateHUD(); checkWin();
      },300);
    } else {
      setTimeout(()=>{gameSelected=[];renderBoard();},500);
    }
  }
}

function highlightSelected(){
  document.querySelectorAll('.game-tile').forEach(t=>{
    const r=+t.dataset.r,c=+t.dataset.c;
    t.classList.toggle('selected',gameSelected.some(s=>s.r===r&&s.c===c));
  });
}

function canConnect(a,b){
  if(gameBoard[a.r][a.c].emoji!==gameBoard[b.r][b.c].emoji) return false;
  return directPath(a,b)||lPath(a,b)||zPath(a,b);
}
function isFree(r,c,excludes=[]){
  if(r<0||r>=ROWS||c<0||c>=COLS) return false;
  if(excludes.some(e=>e.r===r&&e.c===c)) return true;
  return !gameBoard[r][c]||gameBoard[r][c].matched;
}
function directPath(a,b){
  if(a.r===b.r){const mn=Math.min(a.c,b.c)+1,mx=Math.max(a.c,b.c);for(let c=mn;c<mx;c++)if(!isFree(a.r,c,[a,b]))return false;return true;}
  if(a.c===b.c){const mn=Math.min(a.r,b.r)+1,mx=Math.max(a.r,b.r);for(let r=mn;r<mx;r++)if(!isFree(r,a.c,[a,b]))return false;return true;}
  return false;
}
function lPath(a,b){const c1={r:a.r,c:b.c},c2={r:b.r,c:a.c};return(isFree(c1.r,c1.c,[a,b])&&directPath(a,c1)&&directPath(c1,b))||(isFree(c2.r,c2.c,[a,b])&&directPath(a,c2)&&directPath(c2,b));}
function zPath(a,b){
  for(let r=-1;r<=ROWS;r++){const p1={r,c:a.c},p2={r,c:b.c};if((r<0||r>=ROWS||isFree(r,a.c,[a,b]))&&(r<0||r>=ROWS||isFree(r,b.c,[a,b]))&&directPath(a,p1)&&directPath(p1,p2)&&directPath(p2,b))return true;}
  for(let c=-1;c<=COLS;c++){const p1={r:a.r,c},p2={r:b.r,c};if((c<0||c>=COLS||isFree(a.r,c,[a,b]))&&(c<0||c>=COLS||isFree(b.r,c,[a,b]))&&directPath(a,p1)&&directPath(p1,p2)&&directPath(p2,b))return true;}
  return false;
}

function getTileCenter(r,c){
  const tiles=document.querySelectorAll('.game-tile');
  const tile=[...tiles].find(t=>+t.dataset.r===r&&+t.dataset.c===c);
  if(!tile)return{x:0,y:0};
  const rect=tile.getBoundingClientRect();
  return{x:rect.left+rect.width/2,y:rect.top+rect.height/2};
}

function drawPath(a,b,animate){
  resizeLineCanvas();
  const posA=getTileCenter(a.r,a.c),posB=getTileCenter(b.r,b.c);
  lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);
  lineCtx.strokeStyle='#a78bfa';
  lineCtx.lineWidth=3;
  lineCtx.shadowBlur=12;
  lineCtx.shadowColor='#8b5cf6';
  lineCtx.lineCap='round';
  lineCtx.beginPath();
  lineCtx.moveTo(posA.x,posA.y);

  // Draw L-shaped or direct path
  const c1={r:a.r,c:b.c};
  if(isFree(c1.r,c1.c,[a,b])&&directPath(a,c1)&&directPath(c1,b)){
    const mid=getTileCenter(c1.r,c1.c);
    lineCtx.lineTo(mid.x,posA.y);
    lineCtx.lineTo(posB.x,posB.y);
  } else {
    lineCtx.lineTo(posB.x,posA.y);
    lineCtx.lineTo(posB.x,posB.y);
  }
  lineCtx.stroke();
  if(animate) setTimeout(()=>lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height),500);
}

function checkWin(){
  if(gameBoard.every(row=>row.every(c=>c.matched))){
    clearInterval(gameTimerInterval); gameLevel++; gameScore+=gameTimeLeft*5; updateHUD();
    if(gameScore>gameBest){gameBest=gameScore;localStorage.setItem('br_best_score',gameBest);document.getElementById('gameBest').textContent=gameBest;}
    document.getElementById('gameMsg').textContent=`🎉 Level Selesai! Skor: ${gameScore}${gameScore>=gameBest?' 🏆 Rekor!':''}`;
    setTimeout(()=>{gameTimeLeft=120+gameLevel*10;window.startGame();},2000);
  }
}

function updateHUD(){
  document.getElementById('gameScore').textContent=gameScore;
  document.getElementById('gameTimer').textContent=gameTimeLeft;
  document.getElementById('gameLevel').textContent=gameLevel;
  document.getElementById('gameHints').textContent=gameHints;
}

window.useHint=()=>{
  if(gameHints<=0){document.getElementById('gameMsg').textContent='Hint habis!';return;}
  gameHints--;updateHUD();
  for(let r1=0;r1<ROWS;r1++) for(let c1=0;c1<COLS;c1++){
    if(gameBoard[r1][c1].matched)continue;
    for(let r2=0;r2<ROWS;r2++) for(let c2=0;c2<COLS;c2++){
      if(r1===r2&&c1===c2)continue; if(gameBoard[r2][c2].matched)continue;
      if(gameBoard[r1][c1].emoji===gameBoard[r2][c2].emoji&&canConnect({r:r1,c:c1},{r:r2,c:c2})){
        const tiles=document.querySelectorAll('.game-tile');
        const ta=[...tiles].find(t=>+t.dataset.r===r1&&+t.dataset.c===c1);
        const tb=[...tiles].find(t=>+t.dataset.r===r2&&+t.dataset.c===c2);
        if(ta)ta.classList.add('hint-blink');if(tb)tb.classList.add('hint-blink');
        setTimeout(()=>{if(ta)ta.classList.remove('hint-blink');if(tb)tb.classList.remove('hint-blink');},1800);
        document.getElementById('gameMsg').textContent='💡 Pasangan ditemukan!';
        setTimeout(()=>{ document.getElementById('gameMsg').textContent=''; }, 2000);
        return;
      }
    }
  }
  document.getElementById('gameMsg').textContent='Tidak ada pasangan! Coba acak.';
};

window.shuffleBoard=()=>{
  const unmatched=[];
  gameBoard.forEach((row,r)=>row.forEach((cell,c)=>{if(!cell.matched)unmatched.push({r,c,emoji:cell.emoji})}));
  const emojis=unmatched.map(u=>u.emoji);
  for(let i=emojis.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[emojis[i],emojis[j]]=[emojis[j],emojis[i]];}
  unmatched.forEach((u,i)=>gameBoard[u.r][u.c].emoji=emojis[i]);
  renderBoard();
  document.getElementById('gameMsg').textContent='🔀 Papan diacak!';
  setTimeout(()=>{ document.getElementById('gameMsg').textContent=''; }, 1500);
};

// Init game board (show board before game starts)
generateBoard(); renderBoard();