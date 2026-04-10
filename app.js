/* =============================================
   BenyoRiki Digital Universe — app.js v2026
   FIREBASE REALTIME + STORAGE UPLOAD + NEON FX
   ============================================= */

// ===== PARTICLES =====
(function(){
  const pCanvas = document.getElementById('particles');
  if(!pCanvas) return;
  const pCtx = pCanvas.getContext('2d');
  let W, H, particles = [];
  function resize(){ W = pCanvas.width = window.innerWidth; H = pCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  for(let i=0;i<80;i++) particles.push({ x:Math.random()*9999, y:Math.random()*9999, r:Math.random()*1.8+.3, vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18, a:Math.random(), hue: Math.random()>.5?265:190 });
  function draw(){
    pCtx.clearRect(0,0,W,H);
    particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0; pCtx.beginPath(); pCtx.arc(p.x%W,p.y%H,p.r,0,Math.PI*2); pCtx.fillStyle=`hsla(${p.hue},80%,70%,${p.a*0.4})`; pCtx.fill(); });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== NEON HERO EFFECTS =====
(function initNeon(){
  const hero = document.querySelector('.hero');
  if(!hero) return;

  // Canvas Lightning Bolts
  const nCanvas = document.getElementById('neonCanvas');
  if(nCanvas){
    const nCtx = nCanvas.getContext('2d');
    let nW, nH;
    function resizeNeon(){ nW = nCanvas.width = hero.offsetWidth; nH = nCanvas.height = hero.offsetHeight; }
    window.addEventListener('resize', resizeNeon); resizeNeon();
    const neonColors = ['rgba(196,181,253,','rgba(236,72,153,','rgba(6,182,212,','rgba(167,139,250,'];
    function drawBolt(x1,y1,x2,y2,color,width,depth){
      if(depth<=0) return;
      const mx=(x1+x2)/2+(Math.random()-.5)*(Math.abs(x2-x1)+Math.abs(y2-y1))*0.4;
      const my=(y1+y2)/2+(Math.random()-.5)*(Math.abs(x2-x1)+Math.abs(y2-y1))*0.4;
      nCtx.beginPath(); nCtx.moveTo(x1,y1); nCtx.lineTo(mx,my); nCtx.lineTo(x2,y2);
      nCtx.strokeStyle=color+'0.9)'; nCtx.lineWidth=width; nCtx.shadowBlur=12; nCtx.shadowColor=color+'0.8)'; nCtx.stroke();
      if(depth>1){
        drawBolt(x1,y1,mx,my,color,width*.65,depth-1);
        drawBolt(mx,my,x2,y2,color,width*.65,depth-1);
        if(Math.random()>.55){ const bx=mx+(Math.random()-.5)*150,by=my+(Math.random()-.5)*150; drawBolt(mx,my,bx,by,color,width*.4,depth-2); }
      }
    }
    let boltTimer=0, activeBolts=[];
    function spawnBolt(){
      const side=Math.floor(Math.random()*4);
      let x1,y1;
      if(side===0){x1=Math.random()*nW;y1=0;}else if(side===1){x1=nW;y1=Math.random()*nH;}else if(side===2){x1=Math.random()*nW;y1=nH;}else{x1=0;y1=Math.random()*nH;}
      const x2=nW*.2+Math.random()*nW*.6, y2=nH*.2+Math.random()*nH*.6;
      const color=neonColors[Math.floor(Math.random()*neonColors.length)];
      activeBolts.push({x1,y1,x2,y2,color,alpha:1,life:0,maxLife:8+Math.floor(Math.random()*6)});
    }
    function animateNeon(){
      nCtx.clearRect(0,0,nW,nH); boltTimer++;
      if(boltTimer%(40+Math.floor(Math.random()*40))===0) spawnBolt();
      activeBolts=activeBolts.filter(b=>b.life<b.maxLife);
      activeBolts.forEach(b=>{ b.life++; b.alpha=1-b.life/b.maxLife; nCtx.save(); nCtx.globalAlpha=b.alpha*(b.life<2?b.life/2:1); drawBolt(b.x1,b.y1,b.x2,b.y2,b.color,1.5,4); nCtx.restore(); });
      requestAnimationFrame(animateNeon);
    }
    animateNeon();
  }

  // Floating Neon Rays
  function spawnRay(){
    const ray=document.createElement('div');
    const colors=['','pink','cyan'];
    ray.className='neon-ray '+colors[Math.floor(Math.random()*colors.length)];
    const w=80+Math.random()*200, top=Math.random()*100, duration=1.5+Math.random()*3;
    ray.style.cssText=`width:${w}px;top:${top}%;left:-${w}px;position:absolute;opacity:0;`;
    hero.querySelector('.hero-bg').appendChild(ray);
    let start=null, totalW=hero.offsetWidth+w+50;
    function step(ts){ if(!start)start=ts; const p=(ts-start)/(duration*1000); if(p>=1){ray.remove();return;} const e=p<.1?p/.1:p>.9?(1-p)/.1:1; ray.style.opacity=e*(.6+Math.random()*.1); ray.style.left=((-w)+p*totalW)+'px'; if(Math.random()>.92)ray.style.opacity=Math.random()*.3; requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  setInterval(spawnRay, 600+Math.random()*800);
  for(let i=0;i<3;i++) setTimeout(spawnRay,i*300);

  // Sparks on click
  hero.addEventListener('click', e=>{
    const rect=hero.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    for(let i=0;i<8;i++){
      const spark=document.createElement('div'); spark.className='neon-spark';
      const angle=(Math.PI*2/8)*i+Math.random()*.5, dist=20+Math.random()*50;
      const tx=Math.cos(angle)*dist, ty=Math.sin(angle)*dist, dur=.8+Math.random()*.6;
      spark.style.cssText=`left:${x}px;top:${y}px;--tx:${tx}px;--ty:${ty}px;--dur:${dur}s;`;
      hero.appendChild(spark); setTimeout(()=>spark.remove(),dur*1000+100);
    }
  });

  // Ring Pulses
  function spawnRing(){
    const ring=document.createElement('div'); ring.className='neon-ring';
    const sz=100+Math.random()*300, x=10+Math.random()*80, y=10+Math.random()*80, dur=2+Math.random()*1.5;
    const colors=['124,58,237','236,72,153','6,182,212','167,139,250'];
    const c=colors[Math.floor(Math.random()*colors.length)];
    ring.style.cssText=`width:${sz}px;height:${sz}px;left:${x}%;top:${y}%;border-color:rgba(${c},.5);box-shadow:0 0 20px rgba(${c},.3),inset 0 0 20px rgba(${c},.05);--dur:${dur}s;`;
    hero.querySelector('.hero-bg').appendChild(ring);
    setTimeout(()=>ring.remove(),dur*1000+100);
  }
  setInterval(spawnRing,2500); setTimeout(spawnRing,500); setTimeout(spawnRing,1200);
})();

// ===== NAV =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(l => { l.addEventListener('click', () => navLinks.classList.remove('open')); });
const navSections = ['social','music','tools','game'];
window.addEventListener('scroll', () => {
  let current='';
  navSections.forEach(id=>{ const el=document.getElementById(id); if(el&&el.getBoundingClientRect().top<=100)current=id; });
  document.querySelectorAll('.nav-link').forEach(l=>{ l.classList.toggle('active',l.dataset.section===current); });
});

// ===== TOAST =====
function showToast(msg, type='') {
  const t=document.getElementById('toast'); t.textContent=msg; t.className='toast show '+type;
  setTimeout(()=>t.className='toast',3000);
}

// ===== AUTH =====
let currentUser=null;
const USERS_KEY='br_users_v2', SESSION_KEY='br_session_v2';
function loadUsers(){ try{return JSON.parse(localStorage.getItem(USERS_KEY))||[];}catch{return[];} }
function saveUsers(users){ localStorage.setItem(USERS_KEY,JSON.stringify(users)); }
function loadSession(){ try{return JSON.parse(localStorage.getItem(SESSION_KEY));}catch{return null;} }
(function initAuth(){ const session=loadSession(); if(session){const users=loadUsers();const user=users.find(u=>u.username===session.username);if(user){currentUser=user;updateAuthUI();}} })(); // Tab slider init - run after DOM ready setTimeout(()=>{ const slider=document.getElementById('authTabSlider'); if(slider)slider.style.transform=''; },0);
function updateAuthUI(){
  const btn=document.getElementById('navAuthBtn'),lbl=document.getElementById('navAuthLabel');
  if(currentUser){lbl.textContent=currentUser.name.split(' ')[0];btn.onclick=showUserMenu;btn.querySelector('.auth-icon').textContent='👤';}
  else{lbl.textContent='Login';btn.onclick=openAuthModal;btn.querySelector('.auth-icon').textContent='👤';}
}
function openAuthModal(){ document.getElementById('authModal').classList.add('open'); document.body.style.overflow='hidden'; }
window.closeAuthModal=function(){ document.getElementById('authModal').classList.remove('open'); document.body.style.overflow=''; };
document.getElementById('authModal').addEventListener('click',function(e){if(e.target===this)closeAuthModal();});
window.switchTab=function(tab){ document.getElementById('tabLogin').classList.toggle('active',tab==='login'); document.getElementById('tabRegister').classList.toggle('active',tab==='register'); document.getElementById('formLogin').style.display=tab==='login'?'flex':'none'; document.getElementById('formRegister').style.display=tab==='register'?'flex':'none'; const slider=document.getElementById('authTabSlider'); if(slider)slider.style.transform=tab==='register'?'translateX(100%)':''; };
window.togglePw=function(id,btn){ const el=document.getElementById(id); if(el.type==='password'){el.type='text';btn.textContent='🙈';}else{el.type='password';btn.textContent='👁';} };
document.getElementById('regPass').addEventListener('input',function(){ const val=this.value,bar=document.getElementById('pwStrength'),lbl=document.getElementById('pwStrengthLabel'); if(!val){bar.style.width='0';if(lbl)lbl.textContent='';return;} let s=0; if(val.length>=6)s++;if(val.length>=10)s++;if(/[A-Z]/.test(val))s++;if(/[0-9]/.test(val))s++;if(/[^a-zA-Z0-9]/.test(val))s++; const colors=['','#ef4444','#f59e0b','#eab308','#22c55e','#16a34a']; const labels=['','Sangat Lemah','Lemah','Sedang','Kuat','Sangat Kuat']; bar.style.width=(s*20)+'%';bar.style.background=colors[s];bar.style.height='3px'; if(lbl){lbl.textContent=labels[s];lbl.style.color=colors[s];} });
window.doRegister=function(){ const name=document.getElementById('regName').value.trim(),username=document.getElementById('regUser').value.trim(),email=document.getElementById('regEmail').value.trim(),pass=document.getElementById('regPass').value,err=document.getElementById('regErr'); err.textContent=''; if(!name||!username||!email||!pass){err.textContent='Semua field wajib diisi!';return;} if(pass.length<6){err.textContent='Password minimal 6 karakter!';return;} if(!/^[a-zA-Z0-9_]+$/.test(username)){err.textContent='Username hanya boleh huruf, angka, dan _';return;} if(!/\S+@\S+\.\S+/.test(email)){err.textContent='Format email tidak valid!';return;} const users=loadUsers(); if(users.find(u=>u.username===username)){err.textContent='Username sudah digunakan!';return;} if(users.find(u=>u.email===email)){err.textContent='Email sudah terdaftar!';return;} const user={id:Date.now(),name,username,email,password:btoa(pass),joinDate:new Date().toLocaleDateString('id-ID'),role:'user',liked:[],playCount:{}}; users.push(user);saveUsers(users);currentUser=user;localStorage.setItem(SESSION_KEY,JSON.stringify({username}));closeAuthModal();updateAuthUI();showToast(`🎉 Selamat datang, ${name}!`,'success'); };
window.doLogin=function(){ const username=document.getElementById('loginUser').value.trim(),pass=document.getElementById('loginPass').value,remember=document.getElementById('rememberMe').checked,err=document.getElementById('loginErr'); err.textContent=''; if(!username||!pass){err.textContent='Isi username dan password!';return;} if(username==='admin'&&pass==='admin123'){currentUser={id:0,name:'Admin BenyoRiki',username:'admin',role:'admin',liked:[],playCount:{}};if(remember)localStorage.setItem(SESSION_KEY,JSON.stringify({username:'admin'}));closeAuthModal();updateAuthUI();showToast('✅ Login sebagai Admin!','success');return;} const users=loadUsers();const user=users.find(u=>(u.username===username||u.email===username)&&u.password===btoa(pass)); if(!user){err.textContent='Username/password salah!';return;} currentUser=user;if(remember)localStorage.setItem(SESSION_KEY,JSON.stringify({username:user.username}));closeAuthModal();updateAuthUI();showToast(`✅ Selamat datang kembali, ${user.name}!`,'success'); };
window.socialLogin=function(provider){ showToast(`${provider} login — demo mode`,'success');currentUser={id:Date.now(),name:`User ${provider}`,username:`user_${Date.now()}`,role:'user',liked:[],playCount:{}};closeAuthModal();updateAuthUI(); };
function showUserMenu(){ showToast(`👤 ${currentUser.name} | ${currentUser.role==='admin'?'👑 Admin':'User'} — Klik lagi untuk logout`);const btn=document.getElementById('navAuthBtn');btn.onclick=doLogout;setTimeout(()=>{if(currentUser)btn.onclick=showUserMenu;},4000); }
function doLogout(){ currentUser=null;localStorage.removeItem(SESSION_KEY);updateAuthUI();showToast('👋 Berhasil logout');document.getElementById('navAuthBtn').onclick=openAuthModal;renderLiked(); }

// ===== MUSIC STATE =====
const LIKED_KEY='br_liked_v2', PLAY_COUNTS_KEY='br_plays_v2';
const DEFAULT_TRACKS=[
  {id:'sys_1',title:"Awan Nano",artist:"Tulus",genre:"pop",year:"2014",emoji:"☁️",duration:"4:10",color:"#4facfe",folder:"Hits Indonesia",tags:["#hits","#santai"],addedBy:"system",url:""},
  {id:'sys_2',title:"Sampai Jua",artist:"Afgan",genre:"pop",year:"2012",emoji:"🌙",duration:"4:32",color:"#a18cd1",folder:"Hits Indonesia",tags:["#galau"],addedBy:"system",url:""},
  {id:'sys_3',title:"Tak Ingin Usai",artist:"Rizky Febian",genre:"pop",year:"2019",emoji:"💫",duration:"3:58",color:"#fbc2eb",folder:"Cinta & Galau",tags:["#galau","#santai"],addedBy:"system",url:""},
  {id:'sys_4',title:"Ruang Sendiri",artist:"Tulus",genre:"pop",year:"2022",emoji:"🏠",duration:"4:05",color:"#43e97b",folder:"Slow & Santai",tags:["#santai"],addedBy:"system",url:""},
  {id:'sys_5',title:"Hari Yang Cerah",artist:"The Changcuters",genre:"rock",year:"2008",emoji:"☀️",duration:"3:20",color:"#f7971e",folder:"Old School",tags:["#semangat","#nostalgia"],addedBy:"system",url:""},
  {id:'sys_6',title:"Jatuh Cinta",artist:"Raisa",genre:"pop",year:"2016",emoji:"❤️",duration:"4:22",color:"#f85032",folder:"Cinta & Galau",tags:["#galau","#hits"],addedBy:"system",url:""},
  {id:'sys_7',title:"Kita Bisa",artist:"Melly Goeslaw",genre:"pop",year:"2010",emoji:"✊",duration:"4:00",color:"#12c2e9",folder:"Semangat & Energi",tags:["#semangat"],addedBy:"system",url:""},
  {id:'sys_8',title:"Gemilang",artist:"Gigi",genre:"rock",year:"2003",emoji:"⚡",duration:"3:45",color:"#ee0979",folder:"Old School",tags:["#semangat","#nostalgia"],addedBy:"system",url:""},
  {id:'sys_9',title:"Bidadari Tak Bersayap",artist:"Anji",genre:"pop",year:"2014",emoji:"😇",duration:"4:18",color:"#b8e994",folder:"Hits Indonesia",tags:["#hits","#galau"],addedBy:"system",url:""},
  {id:'sys_10',title:"Cinta Sejati",artist:"Bunga Citra Lestari",genre:"pop",year:"2012",emoji:"🌹",duration:"4:30",color:"#ff6b6b",folder:"Cinta & Galau",tags:["#galau"],addedBy:"system",url:""},
  {id:'sys_11',title:"Blinding Lights",artist:"The Weeknd",genre:"pop",year:"2019",emoji:"🌃",duration:"3:22",color:"#ff3366",folder:"Hits Dunia",tags:["#hits","#upbeat"],addedBy:"system",url:""},
  {id:'sys_12',title:"Shape of You",artist:"Ed Sheeran",genre:"pop",year:"2017",emoji:"🎸",duration:"3:53",color:"#f9ca24",folder:"Hits Dunia",tags:["#hits"],addedBy:"system",url:""},
  {id:'sys_13',title:"Bulan Dikekang Malam",artist:"Hindia",genre:"indie",year:"2019",emoji:"🌛",duration:"4:15",color:"#6c5ce7",folder:"Hits Indonesia",tags:["#galau","#lofi"],addedBy:"system",url:""},
  {id:'sys_14',title:"Runtuh",artist:"Feby Putri ft. Fiersa Besari",genre:"indie",year:"2020",emoji:"🍂",duration:"4:02",color:"#e17055",folder:"Cinta & Galau",tags:["#galau","#viral"],addedBy:"system",url:""},
  {id:'sys_15',title:"Mantra Cinta",artist:"Lesti",genre:"dangdut",year:"2023",emoji:"💝",duration:"4:30",color:"#fd79a8",folder:"Viral 2025-2026",tags:["#viral","#hits"],addedBy:"system",url:""},
  {id:'sys_16',title:"Lathi",artist:"Weird Genius ft. Sarah N Azhari",genre:"electronic",year:"2020",emoji:"⚡",duration:"3:06",color:"#00cec9",folder:"Viral 2025-2026",tags:["#viral","#upbeat"],addedBy:"system",url:""},
];
let TRACKS=[...DEFAULT_TRACKS];
let currentTrackIdx=0, isPlaying=false, isShuffle=false, isRepeat=false, isMuted=false;
let eqInterval=null, progressInterval=null, fakeTime=0, fakeDuration=0, eqMode='bars';
let selectedTags=[], currentFilter={genre:'all',folder:'all',search:''};
let pendingAudioFile=null, pendingCoverFile=null, uploadedAudioUrl='', uploadedCoverUrl='';
const audioEl=document.getElementById('audioPlayer');

// ===== FIREBASE REALTIME SYNC =====
function initFirebaseSync(){
  // Muat lagu lokal (dari localStorage) terlebih dahulu agar langsung tersedia
  loadLocalTracksIntoPlaylist();
  renderTracks(); updateTotalSongs();

  try{
    db.ref('tracks').on('value',(snapshot)=>{
      const data=snapshot.val();
      if(data){
        const fbTracks=Object.entries(data).map(([key,val])=>({...val,firebaseKey:key}));
        const defaultIds=new Set(DEFAULT_TRACKS.map(t=>t.id));
        const newFb=fbTracks.filter(t=>!defaultIds.has(t.id));
        const fbIds=new Set(newFb.map(t=>t.id));
        const localOnly=loadLocalTracks().filter(t=>!fbIds.has(t.id)&&!defaultIds.has(t.id));
        TRACKS=[...DEFAULT_TRACKS,...newFb,...localOnly];
      } else {
        TRACKS=[...DEFAULT_TRACKS];
        loadLocalTracksIntoPlaylist();
      }
      renderTracks(); updateTotalSongs(); renderTopPlayed(); renderLiked();
    },(err)=>{
      console.warn('Firebase sync error:',err);
      TRACKS=[...DEFAULT_TRACKS]; loadLocalTracksIntoPlaylist();
      renderTracks(); updateTotalSongs();
    });
  }catch(e){
    console.warn('Firebase unavailable');
    TRACKS=[...DEFAULT_TRACKS]; loadLocalTracksIntoPlaylist();
    renderTracks(); updateTotalSongs();
  }
}
function updateTotalSongs(){ const el=document.getElementById('totalSongs'); if(el)el.textContent=TRACKS.length; }
async function saveTrackToFirebase(track){
  const newRef=db.ref('tracks').push(); track.id=newRef.key; await newRef.set(track); return track.id;
}
async function deleteTrackFromFirebase(key){ await db.ref('tracks/'+key).remove(); }

// ===== AUDIO EVENTS (FIXED) =====
audioEl.addEventListener('timeupdate',()=>{ if(audioEl.duration&&!isNaN(audioEl.duration)){fakeTime=audioEl.currentTime;fakeDuration=audioEl.duration;updateProgress();} });
audioEl.addEventListener('ended',()=>{ if(isRepeat){audioEl.currentTime=0;audioEl.play().catch(()=>{});}else{nextTrack();} });
audioEl.addEventListener('loadedmetadata',()=>{ fakeDuration=audioEl.duration;const m=Math.floor(fakeDuration/60),s=Math.floor(fakeDuration%60);document.getElementById('totalTime').textContent=`${m}:${s.toString().padStart(2,'0')}`; });
audioEl.addEventListener('error',()=>{ /* silently fail, fake progress runs */ });

// ===== TRACK LIST RENDER =====
function getFilteredTracks(){ return TRACKS.filter(t=>{ const gOk=currentFilter.genre==='all'||t.genre===currentFilter.genre; const fOk=currentFilter.folder==='all'||t.folder===currentFilter.folder; const sOk=!currentFilter.search||t.title.toLowerCase().includes(currentFilter.search)||t.artist.toLowerCase().includes(currentFilter.search)||(t.genre||'').toLowerCase().includes(currentFilter.search); return gOk&&fOk&&sOk; }); }

function renderTracks(){
  const list=document.getElementById('trackList'); if(!list)return;
  const filtered=getFilteredTracks(); list.innerHTML='';
  if(!filtered.length){ list.innerHTML='<div style="color:var(--text2);font-size:.8rem;padding:1rem;text-align:center">Tidak ada lagu ditemukan</div>'; document.getElementById('trackCount').textContent='0 lagu'; return; }
  filtered.forEach((t,i)=>{
    const realIdx=TRACKS.indexOf(t);
    const div=document.createElement('div');
    div.className='track-item'+(realIdx===currentTrackIdx?' active':'');
    const canDelete=currentUser&&t.addedBy!=='system'&&(currentUser.username===t.addedBy||currentUser.role==='admin');
    div.innerHTML=`<span class="ti-num">${i+1}</span><span class="ti-emoji" style="background:${t.color||'#7c3aed'}22">${t.emoji||'🎵'}</span><div class="ti-info"><div class="ti-title">${t.title}</div><div class="ti-artist">${t.artist} · ${t.folder||'—'}</div></div><span class="ti-dur">${t.duration||'—'}</span>${t.addedBy!=='system'?'<span class="ti-badge">New</span>':''}${canDelete?`<button class="ti-del" title="Hapus" onclick="deleteTrack(event,'${t.firebaseKey||t.id}','${t.id}')">🗑</button>`:''}`;
    div.addEventListener('click',(e)=>{ if(e.target.closest('.ti-del'))return; currentTrackIdx=realIdx; loadTrack(realIdx); playTrack(); });
    list.appendChild(div);
  });
  document.getElementById('trackCount').textContent=`${filtered.length} lagu`;
}
window.filterPlaylist=function(f){ currentFilter.genre=f; document.querySelectorAll('.pt').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderTracks(); };
window.filterFolder=function(f,btn){ currentFilter.folder=f; document.querySelectorAll('.ft').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderTracks(); };
const searchInput=document.getElementById('searchInput');
if(searchInput) searchInput.addEventListener('input',e=>{ currentFilter.search=e.target.value.toLowerCase(); renderTracks(); });

// ===== DELETE TRACK =====
window.deleteTrack=async function(e,firebaseKey,trackId){
  e.stopPropagation();
  if(!currentUser){showToast('🔐 Login diperlukan','error');return;}
  if(!confirm('Hapus lagu ini?'))return;
  const track=TRACKS.find(t=>t.id===trackId||t.firebaseKey===firebaseKey);
  if(!track||track.addedBy==='system'){showToast('❌ Lagu tidak bisa dihapus','error');return;}
  if(currentUser.username!==track.addedBy&&currentUser.role!=='admin'){showToast('❌ Tidak punya izin','error');return;}
  // Hapus dari TRACKS lokal
  const idx=TRACKS.indexOf(track); if(idx>-1)TRACKS.splice(idx,1);
  // Hapus dari localStorage lokal
  removeLocalTrack(track.id);
  // Revoke blob URL jika ada
  if(track.url&&track.url.startsWith('blob:'))try{URL.revokeObjectURL(track.url);}catch(e){}
  renderTracks(); updateTotalSongs();
  showToast(`🗑 "${track.title}" berhasil dihapus`,'success');
  // Hapus dari Firebase jika ada
  try{
    const key=track.firebaseKey||firebaseKey;
    if(key&&key!==track.id) await deleteTrackFromFirebase(key);
    if(track.storageRef){try{await storage.ref(track.storageRef).delete();}catch(e){}}
  }catch(err){ console.warn('Firebase delete error:',err); }
};

// ===== LOAD & PLAY =====
function loadTrack(i){
  const t=TRACKS[i]; if(!t)return;
  document.getElementById('npTitle').textContent=t.title;
  document.getElementById('npArtist').textContent=t.artist;
  document.getElementById('npGenre').textContent=(t.genre||'').toUpperCase();
  document.getElementById('npYear').textContent=t.year||'—';
  document.getElementById('npFolder').textContent=t.folder||'—';
  const ci=document.getElementById('npCoverInner');
  if(t.cover){ ci.innerHTML=`<img src="${t.cover}" alt="${t.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.parentNode.innerHTML='<span>${t.emoji||'🎵'}</span>'">`; ci.classList.add('has-cover'); }
  else{ ci.innerHTML=`<span>${t.emoji||'🎵'}</span>`; ci.classList.remove('has-cover'); }
  ci.style.background=`radial-gradient(circle at 30% 30%, ${t.color||'#7c3aed'}44, #0d0d1a)`;
  document.getElementById('npGlow').style.background=t.color||'#7c3aed';
  fakeTime=0;
  const parts=(t.duration||'3:30').split(':'); fakeDuration=parseInt(parts[0]||0)*60+parseInt(parts[1]||0); if(!fakeDuration)fakeDuration=210;
  document.getElementById('totalTime').textContent=t.duration||'—';
  document.getElementById('progressFill').style.width='0%';
  document.getElementById('currentTime').textContent='0:00';
  const thumb=document.getElementById('progressThumb'); if(thumb)thumb.style.left='0%';
  if(t.url&&t.url.trim()){ if(audioEl.src!==t.url){audioEl.src=t.url;audioEl.load();} }
  else{ audioEl.pause(); audioEl.removeAttribute('src'); }
  updateLikeBtn(); trackPlay(i); renderQueue(); renderTopPlayed();
  document.querySelectorAll('.track-item').forEach((el,idx)=>{ const filtered=getFilteredTracks(); el.classList.toggle('active',filtered[idx]&&TRACKS.indexOf(filtered[idx])===i); });
}
function trackPlay(i){ const c=JSON.parse(localStorage.getItem(PLAY_COUNTS_KEY)||'{}'); c[i]=(c[i]||0)+1; localStorage.setItem(PLAY_COUNTS_KEY,JSON.stringify(c)); }
function playTrack(){
  isPlaying=true;
  const pb=document.getElementById('playBtn'); if(pb)pb.textContent='⏸';
  const ci=document.getElementById('npCoverInner'); if(ci)ci.classList.add('spinning');
  const glow=document.getElementById('npGlow'); if(glow)glow.classList.add('active');
  startFakeProgress(); startEqualizer();
  if(audioEl.src&&audioEl.src!==window.location.href) audioEl.play().catch(()=>{});
}
function pauseTrack(){
  isPlaying=false;
  const pb=document.getElementById('playBtn'); if(pb)pb.textContent='▶';
  const ci=document.getElementById('npCoverInner'); if(ci)ci.classList.remove('spinning');
  const glow=document.getElementById('npGlow'); if(glow)glow.classList.remove('active');
  stopFakeProgress(); stopEqualizer();
  if(audioEl.src&&audioEl.src!==window.location.href) audioEl.pause();
}
window.togglePlay=()=>{ isPlaying?pauseTrack():playTrack(); };
window.nextTrack=()=>{
  const filtered=getFilteredTracks(); if(!filtered.length)return;
  let nextReal; if(isShuffle){nextReal=TRACKS.indexOf(filtered[Math.floor(Math.random()*filtered.length)]);}
  else{const ci=filtered.findIndex(t=>TRACKS.indexOf(t)===currentTrackIdx);nextReal=TRACKS.indexOf(filtered[(ci+1)%filtered.length]);}
  currentTrackIdx=nextReal>=0?nextReal:0; loadTrack(currentTrackIdx); playTrack();
};
window.prevTrack=()=>{
  const filtered=getFilteredTracks(); if(!filtered.length)return;
  const ci=filtered.findIndex(t=>TRACKS.indexOf(t)===currentTrackIdx);
  currentTrackIdx=TRACKS.indexOf(filtered[(ci-1+filtered.length)%filtered.length]);
  if(currentTrackIdx<0)currentTrackIdx=0; loadTrack(currentTrackIdx); playTrack();
};
window.toggleShuffle=()=>{ isShuffle=!isShuffle; document.getElementById('shuffleBtn').classList.toggle('active',isShuffle); showToast(isShuffle?'🔀 Acak aktif':'🔀 Acak nonaktif'); };
window.toggleRepeat=()=>{ isRepeat=!isRepeat; document.getElementById('repeatBtn').classList.toggle('active',isRepeat); showToast(isRepeat?'↺ Ulangi aktif':'↺ Ulangi nonaktif'); };
window.toggleMute=()=>{ isMuted=!isMuted; audioEl.muted=isMuted; document.getElementById('muteBtn').textContent=isMuted?'🔇':'🔈'; };
window.setVolume=(v)=>{ audioEl.volume=v/100; const s=document.getElementById('volumeSlider'); if(s)s.style.background=`linear-gradient(to right,var(--accent2) ${v}%,var(--card2) ${v}%)`; };
window.seekTo=(e)=>{ const bar=document.getElementById('progressBar'); const ratio=Math.max(0,Math.min(1,(e.clientX-bar.getBoundingClientRect().left)/bar.offsetWidth)); fakeTime=ratio*fakeDuration; if(audioEl.src&&audioEl.duration&&!isNaN(audioEl.duration))audioEl.currentTime=ratio*audioEl.duration; updateProgress(); };
function startFakeProgress(){ clearInterval(progressInterval); progressInterval=setInterval(()=>{ if(!isPlaying)return; if(audioEl.src&&audioEl.src!==window.location.href&&!audioEl.paused&&audioEl.duration&&!isNaN(audioEl.duration))return; fakeTime=Math.min(fakeTime+1,fakeDuration); if(fakeDuration&&fakeTime>=fakeDuration){if(isRepeat)fakeTime=0;else{nextTrack();return;}} updateProgress(); },1000); }
function stopFakeProgress(){ clearInterval(progressInterval); }
function updateProgress(){ const pct=fakeDuration?Math.min((fakeTime/fakeDuration)*100,100):0; const fill=document.getElementById('progressFill'),thumb=document.getElementById('progressThumb'); if(fill)fill.style.width=pct+'%'; if(thumb)thumb.style.left=pct+'%'; const m=Math.floor(fakeTime/60),s=Math.floor(fakeTime%60); const ct=document.getElementById('currentTime'); if(ct)ct.textContent=`${m}:${s.toString().padStart(2,'0')}`; }

// ===== RADIO / STREAM =====
window.addFromUrl=()=>{ const url=document.getElementById('urlInput').value.trim(); if(!url)return; audioEl.src=url; audioEl.play().then(()=>{ isPlaying=true;document.getElementById('playBtn').textContent='⏸';document.getElementById('npTitle').textContent='📻 Radio Stream';document.getElementById('npArtist').textContent=url.split('/').pop().slice(0,30)||url;document.getElementById('npFolder').textContent='Radio';document.getElementById('npCoverInner').classList.add('spinning');startEqualizer();showToast('📻 Radio/Stream diputar','success'); }).catch(()=>showToast('❌ URL tidak bisa diputar','error')); };
window.playRadio=(url,name)=>{ if(!url){showToast('📻 Preset belum tersedia','error');return;} document.getElementById('urlInput').value=url;document.getElementById('npTitle').textContent=name;document.getElementById('npFolder').textContent='Radio';window.addFromUrl(); };

// ===== EQUALIZER =====
const eqBars=20;
function buildEQ(){ const eq=document.getElementById('equalizer');if(!eq)return;eq.innerHTML='';for(let i=0;i<eqBars;i++){const b=document.createElement('div');b.className='eq-bar';b.style.height='4px';eq.appendChild(b);} }
buildEQ();
function startEqualizer(){ clearInterval(eqInterval); eqInterval=setInterval(()=>{ document.querySelectorAll('.eq-bar').forEach((b,i)=>{ const h=Math.sin(Date.now()/200+i*0.4)*25+Math.random()*35+10; b.style.height=h+'px'; }); },100); }
function stopEqualizer(){ clearInterval(eqInterval); document.querySelectorAll('.eq-bar').forEach(b=>b.style.height='4px'); }
window.setEqMode=function(mode,btn){ eqMode=mode; document.querySelectorAll('.eq-mode').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); };

// ===== QUEUE / TOP / LIKED =====
function renderQueue(){ const q=document.getElementById('queueList');if(!q)return;q.innerHTML='';const filtered=getFilteredTracks();for(let i=1;i<=5;i++){const idx=(filtered.findIndex(t=>TRACKS.indexOf(t)===currentTrackIdx)+i)%filtered.length;const t=filtered[idx];if(!t)continue;const d=document.createElement('div');d.className='queue-item';d.textContent=`${t.emoji||'🎵'} ${t.title} — ${t.artist}`;d.onclick=()=>{currentTrackIdx=TRACKS.indexOf(t);loadTrack(currentTrackIdx);playTrack();};q.appendChild(d);} }
function renderTopPlayed(){ const counts=JSON.parse(localStorage.getItem(PLAY_COUNTS_KEY)||'{}'),sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5),tp=document.getElementById('topPlayed');if(!tp)return;tp.innerHTML='';if(!sorted.length){tp.innerHTML='<div style="color:var(--text2);font-size:.78rem;padding:.3rem .5rem">Belum ada data</div>';return;}sorted.forEach(([idx,cnt],i)=>{const t=TRACKS[idx];if(!t)return;const d=document.createElement('div');d.className='top-item';d.innerHTML=`<span class="top-num">${i+1}</span>${t.emoji||'🎵'} ${t.title}<span style="margin-left:auto;font-size:.65rem;color:var(--text2)">${cnt}x</span>`;d.onclick=()=>{currentTrackIdx=+idx;loadTrack(+idx);playTrack();};tp.appendChild(d);}); }
window.toggleLike=function(){ if(!currentUser){openAuthModal();return;} const liked=JSON.parse(localStorage.getItem(LIKED_KEY+'_'+currentUser.username)||'[]'),t=TRACKS[currentTrackIdx];if(!t)return;const idx=liked.indexOf(t.id);if(idx>-1){liked.splice(idx,1);showToast(`💔 ${t.title} dihapus`);}else{liked.push(t.id);showToast(`❤️ ${t.title} disukai`,'success');}localStorage.setItem(LIKED_KEY+'_'+currentUser.username,JSON.stringify(liked));updateLikeBtn();renderLiked(); };
function updateLikeBtn(){ const btn=document.getElementById('likeBtn');if(!btn)return;if(!currentUser){btn.textContent='♡ Suka';btn.classList.remove('active');return;} const liked=JSON.parse(localStorage.getItem(LIKED_KEY+'_'+currentUser.username)||'[]'),t=TRACKS[currentTrackIdx],isLiked=t&&liked.includes(t.id);btn.textContent=isLiked?'❤️ Disukai':'♡ Suka';btn.classList.toggle('active',isLiked); }
function renderLiked(){ const ll=document.getElementById('likedList');if(!ll)return;if(!currentUser){ll.innerHTML='<div style="color:var(--text2);font-size:.78rem;padding:.5rem">Login untuk melihat daftar suka</div>';return;}const liked=JSON.parse(localStorage.getItem(LIKED_KEY+'_'+currentUser.username)||'[]');if(!liked.length){ll.innerHTML='<div style="color:var(--text2);font-size:.78rem;padding:.5rem">Belum ada lagu yang disukai</div>';return;}ll.innerHTML='';TRACKS.filter(t=>liked.includes(t.id)).forEach(t=>{const d=document.createElement('div');d.className='liked-item';d.innerHTML=`${t.emoji||'🎵'} ${t.title} <span style="margin-left:auto;font-size:.65rem;color:var(--text2)">${t.artist}</span>`;d.onclick=()=>{currentTrackIdx=TRACKS.indexOf(t);loadTrack(currentTrackIdx);playTrack();};ll.appendChild(d);}); }
window.shareTrack=function(){ const t=TRACKS[currentTrackIdx];if(!t)return;const text=`🎵 Dengerin "${t.title}" by ${t.artist} di BenyoRiki!\n🌐 https://jasadaud.online/`;if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>showToast('🔗 Link disalin!','success'));else showToast('🎵 '+t.title,'success'); };

// ===== FILE UPLOAD HANDLERS =====
window.handleAudioFile=function(input){
  // Support both real input element and synthetic object from drop
  const file = input.files ? input.files[0] : input;
  if(!file){ setAudioStatus('❌ Tidak ada file yang dipilih','error'); return; }

  // Validate size
  if(file.size > 50*1024*1024){
    setAudioStatus('❌ File terlalu besar! Maksimal 50MB','error');
    if(input.value !== undefined) try{ input.value=''; }catch(e){}
    return;
  }

  // Validate by extension ONLY — do NOT rely on file.type
  // because MP3 MIME type ("audio/mpeg") can be empty string on some browsers/OS
  const ext = file.name.split('.').pop().toLowerCase().trim();
  const allowedExt = ['mp3','ogg','wav','m4a','aac','flac','opus','weba','webm'];
  if(!allowedExt.includes(ext)){
    // Secondary check: if MIME has 'audio' in it, still allow
    if(!file.type || !file.type.includes('audio')){
      setAudioStatus('❌ Format tidak didukung! Gunakan MP3, OGG, WAV, M4A, AAC, FLAC','error');
      if(input.value !== undefined) try{ input.value=''; }catch(e){}
      return;
    }
  }

  // Accepted!
  pendingAudioFile = file;
  uploadedAudioUrl = '';
  setUploadProgress(0);
  setAudioStatus(`✅ File dipilih: ${file.name} (${(file.size/1024/1024).toFixed(1)} MB) — Siap diupload`, 'success');

  // Auto-fill title from filename
  const ti = document.getElementById('am_title');
  if(ti && !ti.value){
    ti.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Read duration via blob URL
  try {
    const blobUrl = URL.createObjectURL(file);
    const tmpA = new Audio();
    tmpA.preload = 'metadata';
    tmpA.onloadedmetadata = () => {
      const m = Math.floor(tmpA.duration/60), s = Math.floor(tmpA.duration%60);
      const di = document.getElementById('am_duration');
      if(di && !di.value) di.value = `${m}:${s.toString().padStart(2,'0')}`;
      URL.revokeObjectURL(blobUrl);
    };
    tmpA.onerror = () => URL.revokeObjectURL(blobUrl);
    tmpA.src = blobUrl;
  } catch(e) { /* non-critical */ }
};
window.handleCoverFile=function(input){ const file=input.files[0];if(!file)return;if(!file.type.startsWith('image/')){showToast('❌ File harus gambar!','error');input.value='';return;}if(file.size>5*1024*1024){showToast('❌ Gambar maks 5MB','error');input.value='';return;} pendingCoverFile=file;uploadedCoverUrl='';const reader=new FileReader();reader.onload=(e)=>{const p=document.getElementById('coverPreview'),l=document.querySelector('.cover-label');if(p){p.src=e.target.result;p.style.display='block';}if(l)l.textContent=file.name;};reader.readAsDataURL(file); };
function setAudioStatus(msg,type=''){ const el=document.getElementById('audioStatus');if(!el)return;el.textContent=msg;el.className='fuz-status '+type; }
function setUploadProgress(pct,label){
  const bar=document.getElementById('audioProgress'),fill=document.getElementById('audioProgressBar'),lbl=document.getElementById('audioProgressLabel');
  if(bar){bar.style.display= pct>0?'block':'none';}
  if(fill){fill.style.width=Math.min(100,pct)+'%';fill.style.transition=pct===0?'none':'width .3s ease';}
  if(lbl){lbl.textContent=label||'';}
}
// ===== LOCAL STORAGE TRACKS (fallback tanpa Firebase Storage) =====
const LOCAL_TRACKS_KEY = 'br_local_tracks_v2';

function loadLocalTracks(){
  try{ return JSON.parse(localStorage.getItem(LOCAL_TRACKS_KEY)||'[]'); }catch{ return []; }
}
function saveLocalTrack(track){
  const tracks = loadLocalTracks();
  tracks.unshift(track);
  // Simpan maks 50 lagu lokal supaya tidak membebani localStorage
  try{ localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(tracks.slice(0,50))); }catch(e){
    // Jika storage penuh, hapus yang lama dan coba lagi
    try{ localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(tracks.slice(0,10))); }catch(e2){}
  }
}
function removeLocalTrack(trackId){
  const tracks = loadLocalTracks().filter(t=>t.id!==trackId);
  try{ localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(tracks)); }catch(e){}
}

// Inisialisasi: gabungkan local tracks ke TRACKS saat startup
function loadLocalTracksIntoPlaylist(){
  const localTracks = loadLocalTracks();
  if(!localTracks.length) return;
  const existingIds = new Set(TRACKS.map(t=>t.id));
  localTracks.forEach(t=>{ if(!existingIds.has(t.id)){ TRACKS.push(t); existingIds.add(t.id); } });
}

async function uploadAudioToStorage(file,trackId){
  const ext=file.name.split('.').pop().toLowerCase(), refPath=`tracks/${trackId}/audio.${ext}`, storageRef=storage.ref(refPath);
  return new Promise((resolve,reject)=>{
    const task=storageRef.put(file,{contentType: file.type||'audio/mpeg'});
    task.on('state_changed',
      (snap)=>{
        const pct=Math.round((snap.bytesTransferred/snap.totalBytes)*100);
        setUploadProgress(pct,`Mengupload audio... ${pct}%`);
        setAudioStatus(`⬆️ Mengupload... ${pct}% (${(snap.bytesTransferred/1024/1024).toFixed(1)}/${(snap.totalBytes/1024/1024).toFixed(1)}MB)`,'');
      },
      (err)=>{ reject(err); },
      async()=>{
        const url=await task.snapshot.ref.getDownloadURL();
        setUploadProgress(100,'✅ Upload selesai!');
        setAudioStatus('✅ Audio berhasil diupload!','success');
        resolve({url,refPath});
      }
    );
  });
}
async function uploadCoverToStorage(file,trackId){ const ext=file.name.split('.').pop().toLowerCase(),refPath=`tracks/${trackId}/cover.${ext}`,snap=await storage.ref(refPath).put(file);return snap.ref.getDownloadURL(); }

// ===== ADD MUSIC MODAL =====
window.requireLoginForMusic=function(){ if(!currentUser){showToast('🔐 Login terlebih dahulu untuk menambah musik!','error');setTimeout(()=>openAuthModal(),500);return;}openAddMusic(); };
function openAddMusic(){ document.getElementById('addMusicModal').classList.add('open');document.body.style.overflow='hidden';selectedTags=[];pendingAudioFile=null;pendingCoverFile=null;uploadedAudioUrl='';uploadedCoverUrl='';document.querySelectorAll('.tag-opt').forEach(t=>t.classList.remove('selected'));document.getElementById('amErr').textContent='';setAudioStatus('');const bar=document.getElementById('audioProgress');if(bar)bar.style.display='none';const fill=document.getElementById('audioProgressBar');if(fill)fill.style.width='0%';const prev=document.getElementById('coverPreview');if(prev){prev.src='';prev.style.display='none';}const cl=document.querySelector('.cover-label');if(cl)cl.textContent='📷 Upload gambar cover (opsional)';['am_title','am_artist','am_url','am_cover','am_desc','am_duration','am_year'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});const g=document.getElementById('am_genre');if(g)g.value='';const af=document.getElementById('am_audio_file');if(af)af.value='';const cf=document.getElementById('am_cover_file');if(cf)cf.value=''; }
window.closeAddMusic=function(){ document.getElementById('addMusicModal').classList.remove('open');document.body.style.overflow=''; };
document.getElementById('addMusicModal').addEventListener('click',function(e){if(e.target===this)closeAddMusic();});
const audioZone=document.getElementById('audioDropZone');
if(audioZone){ audioZone.addEventListener('dragover',e=>{e.preventDefault();audioZone.classList.add('drag-over');});audioZone.addEventListener('dragleave',()=>audioZone.classList.remove('drag-over'));audioZone.addEventListener('drop',e=>{e.preventDefault();audioZone.classList.remove('drag-over');const file=e.dataTransfer.files[0];if(file){pendingAudioFile=null;window.handleAudioFile({files:e.dataTransfer.files});}}); }
window.toggleTag=function(el,tag){ el.classList.toggle('selected');if(selectedTags.includes(tag))selectedTags=selectedTags.filter(t=>t!==tag);else selectedTags.push(tag); };

window.submitAddMusic=async function(){
  if(!currentUser){showToast('🔐 Login diperlukan!','error');return;}
  const title=document.getElementById('am_title').value.trim(),
        artist=document.getElementById('am_artist').value.trim(),
        genre=document.getElementById('am_genre').value,
        folder=document.getElementById('am_folder').value,
        year=document.getElementById('am_year').value.trim()||new Date().getFullYear()+'',
        duration=document.getElementById('am_duration').value.trim()||'3:00',
        manualUrl=document.getElementById('am_url').value.trim(),
        manualCover=document.getElementById('am_cover').value.trim(),
        err=document.getElementById('amErr');
  err.textContent='';
  if(!title){err.textContent='Judul lagu wajib diisi!';return;}
  if(!artist){err.textContent='Nama artis wajib diisi!';return;}
  if(!genre){err.textContent='Pilih genre lagu!';return;}
  if(!pendingAudioFile&&!manualUrl){err.textContent='Upload file audio atau isi URL audio!';return;}
  const btn=document.getElementById('amSubmitBtn'); btn.disabled=true; btn.textContent='⏳ Memproses...';
  const emojis=['🎵','🎶','🎸','🎹','🎤','🎼','🎺','🎻','🥁','🎷','✨','💫','🌟','⭐','🌙','☀️'];
  const colors=['#4facfe','#a18cd1','#fbc2eb','#43e97b','#f7971e','#f85032','#12c2e9','#ee0979','#b8e994','#ff6b6b','#6c5ce7','#fd79a8','#00cec9','#e17055'];
  const tempId='track_'+Date.now();

  // ── LANGKAH 1: Buat blob URL lokal untuk diputar SEKARANG ──
  let localBlobUrl='';
  let coverDataUrl='';
  if(pendingAudioFile) localBlobUrl=URL.createObjectURL(pendingAudioFile);

  // Baca cover sebagai data URL agar bisa disimpan di localStorage
  if(pendingCoverFile){
    try{
      coverDataUrl = await new Promise((res,rej)=>{
        const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(pendingCoverFile);
      });
    }catch(e){ coverDataUrl=''; }
  }

  // ── LANGKAH 2: Simpan lagu ke TRACKS (lokal) dan langsung bisa diputar ──
  const newTrack={
    id: tempId,
    title, artist, genre, year, duration,
    url: localBlobUrl || manualUrl,
    cover: coverDataUrl || manualCover,
    folder,
    emoji: emojis[Math.floor(Math.random()*emojis.length)],
    color: colors[Math.floor(Math.random()*colors.length)],
    tags: selectedTags,
    addedBy: currentUser.username,
    addedAt: new Date().toLocaleDateString('id-ID'),
    timestamp: Date.now(),
    isLocal: !!pendingAudioFile,   // tandai sebagai lokal
    storageRef: ''
  };

  // Tambahkan ke playlist sekarang (tanpa tunggu Firebase)
  TRACKS.push(newTrack);

  // Simpan ke localStorage (tanpa blob URL karena tidak bisa diserialisasi)
  const trackForStorage={...newTrack, url: manualUrl||'', cover: coverDataUrl||manualCover};
  saveLocalTrack(trackForStorage);

  setUploadProgress(60,'✅ Lagu siap diputar!');
  setAudioStatus('✅ Lagu berhasil ditambahkan dan siap diputar!','success');
  renderTracks(); updateTotalSongs();

  showToast(`🎵 "${title}" berhasil ditambahkan!`,'success');
  closeAddMusic();

  // Pilih dan putar lagu yang baru ditambahkan
  currentTrackIdx = TRACKS.length - 1;
  loadTrack(currentTrackIdx);
  playTrack();

  btn.disabled=false;
  btn.innerHTML='💾 Upload & Simpan ke Firebase <span>→</span>';

  // ── LANGKAH 3: Coba upload ke Firebase di background (opsional) ──
  if(pendingAudioFile){
    (async()=>{
      try{
        setAudioStatus('☁️ Mencoba sync ke Firebase (background)...','');
        setUploadProgress(1,'Memulai upload Firebase...');
        const res=await uploadAudioToStorage(pendingAudioFile,tempId);
        // Update URL ke Firebase URL
        newTrack.url=res.url; newTrack.storageRef=res.refPath; newTrack.isLocal=false;

        let finalCoverUrl=coverDataUrl||manualCover;
        if(pendingCoverFile){ try{ finalCoverUrl=await uploadCoverToStorage(pendingCoverFile,tempId); newTrack.cover=finalCoverUrl; }catch(e){} }

        const trackForFb={...newTrack, url:res.url, cover:finalCoverUrl||''};
        delete trackForFb.firebaseKey;
        await saveTrackToFirebase(trackForFb);

        // Update localStorage entry dengan URL Firebase
        const locals=loadLocalTracks().map(t=>t.id===tempId?{...t,url:res.url,cover:finalCoverUrl||t.cover,storageRef:res.refPath}:t);
        try{localStorage.setItem(LOCAL_TRACKS_KEY,JSON.stringify(locals));}catch(e){}

        setUploadProgress(100,'✅ Tersimpan ke Firebase!');
        setAudioStatus('✅ Tersinkron ke Firebase!','success');
        showToast('☁️ Lagu tersinkron ke Firebase!','success');
      }catch(e){
        console.warn('Firebase upload background failed:',e);
        setUploadProgress(0);
        setAudioStatus('⚠️ Firebase gagal — lagu tetap tersimpan lokal','');
        // Tidak tampilkan error ke user karena lagu sudah bisa diputar
      }
    })();
  } else {
    // Hanya URL — langsung simpan ke Firebase
    try{
      await saveTrackToFirebase({...newTrack, cover: manualCover});
      setUploadProgress(100,'✅ Tersimpan!');
    }catch(e){ console.warn('Firebase save failed:',e); }
  }
};

// ===== INIT MUSIC =====
setVolume(70); initFirebaseSync();

// ===== CALCULATOR =====
let calcCurrent='0',calcExpression='',calcOperator=null,calcNewNum=false,calcHistoryArr=[];
window.setCalcMode=function(mode,btn){ document.querySelectorAll('.calc-mode').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const s=document.getElementById('calcSciRow');if(s)s.classList.toggle('visible',mode==='sci'); };
window.calcNum=function(n){ if(calcNewNum){calcCurrent=n==='.'?'0.':n;calcNewNum=false;}else{if(n==='.'&&calcCurrent.includes('.'))return;calcCurrent=calcCurrent==='0'&&n!=='.'?n:calcCurrent+n;}document.getElementById('calcResult').textContent=calcCurrent; };
window.calcOp=function(op){ if(calcOperator&&!calcNewNum)window.calcEquals();calcExpression=calcCurrent+' '+op;document.getElementById('calcExpr').textContent=calcExpression;calcOperator=op;calcNewNum=true; };
window.calcEquals=function(){ if(!calcOperator)return;const b=parseFloat(calcCurrent.replace(',','.')),a=parseFloat(calcExpression.split(' ')[0].replace(',','.'));const ops={'÷':(x,y)=>y!==0?x/y:'Error','×':(x,y)=>x*y,'+':(x,y)=>x+y,'−':(x,y)=>x-y,'-':(x,y)=>x-y};const result=ops[calcOperator]?ops[calcOperator](a,b):0;const res=typeof result==='number'?parseFloat(result.toFixed(10)).toString():result;calcHistoryArr.unshift(`${calcExpression} ${calcCurrent} = ${res}`);calcHistoryArr=calcHistoryArr.slice(0,8);renderCalcHistory();document.getElementById('calcExpr').textContent=calcExpression+' '+calcCurrent+' =';document.getElementById('calcResult').textContent=res;calcCurrent=res.toString();calcOperator=null;calcNewNum=true; };
window.calcFunc=function(f){ if(f==='AC'){calcCurrent='0';calcExpression='';calcOperator=null;calcNewNum=false;document.getElementById('calcResult').textContent='0';document.getElementById('calcExpr').textContent='';}else if(f==='+/-'){calcCurrent=(parseFloat(calcCurrent)*-1).toString();document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='%'){calcCurrent=(parseFloat(calcCurrent)/100).toString();document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='√'){const v=parseFloat(calcCurrent);calcCurrent=v>=0?Math.sqrt(v).toString():'Error';document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='x²'){calcCurrent=Math.pow(parseFloat(calcCurrent),2).toString();document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='sin'){calcCurrent=Math.sin(parseFloat(calcCurrent)*Math.PI/180).toFixed(8).toString();document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='cos'){calcCurrent=Math.cos(parseFloat(calcCurrent)*Math.PI/180).toFixed(8).toString();document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='tan'){calcCurrent=Math.tan(parseFloat(calcCurrent)*Math.PI/180).toFixed(8).toString();document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='log'){const v=parseFloat(calcCurrent);calcCurrent=v>0?Math.log10(v).toFixed(8).toString():'Error';document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='ln'){const v=parseFloat(calcCurrent);calcCurrent=v>0?Math.log(v).toFixed(8).toString():'Error';document.getElementById('calcResult').textContent=calcCurrent;}else if(f==='π'){calcCurrent=Math.PI.toString();document.getElementById('calcResult').textContent=calcCurrent;calcNewNum=false;}else if(f==='1/x'){const v=parseFloat(calcCurrent);calcCurrent=v!==0?(1/v).toString():'Error';document.getElementById('calcResult').textContent=calcCurrent;} };
function renderCalcHistory(){ const ch=document.getElementById('calcHistory');ch.innerHTML='';const l=document.createElement('div');l.className='ch-label';l.textContent='Riwayat';ch.appendChild(l);calcHistoryArr.forEach(h=>{const d=document.createElement('div');d.className='ch-item';d.textContent=h;d.onclick=()=>{const res=h.split('= ')[1];if(res){calcCurrent=res;document.getElementById('calcResult').textContent=res;calcNewNum=true;}};ch.appendChild(d);}); }
document.addEventListener('keydown',function(e){ if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;const k=e.key;if(k>='0'&&k<='9'){e.preventDefault();window.calcNum(k);}else if(k==='.'){e.preventDefault();window.calcNum('.');}else if(k==='+'){e.preventDefault();window.calcOp('+');}else if(k==='-'){e.preventDefault();window.calcOp('−');}else if(k==='*'){e.preventDefault();window.calcOp('×');}else if(k==='/'){e.preventDefault();window.calcOp('÷');}else if(k==='Enter'||k==='='){e.preventDefault();window.calcEquals();}else if(k==='Escape'){e.preventDefault();window.calcFunc('AC');}else if(k==='Backspace'){e.preventDefault();calcCurrent=calcCurrent.length>1?calcCurrent.slice(0,-1):'0';document.getElementById('calcResult').textContent=calcCurrent;}else if(k===' '){e.preventDefault();window.togglePlay();}else if(k==='ArrowRight')window.nextTrack();else if(k==='ArrowLeft')window.prevTrack();else if(k==='m'||k==='M')window.toggleMute(); });

// ===== CALENDAR =====
const MONTHS_ID=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS_ID=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

// ============================================================
// DATA HARI LIBUR NASIONAL & PERINGATAN INDONESIA
// Sumber: Kepres / SKB 3 Menteri resmi
// Tipe: 'libur'=Libur Nasional, 'cuti'=Cuti Bersama, 'peringatan'=Hari Peringatan
// ============================================================
const CALENDAR_DATA = {
  2024: {
    // JANUARI
    '1-1':  { nama:'Tahun Baru Masehi 2024', tipe:'libur', icon:'🎉' },
    '1-2':  { nama:'Cuti Bersama Tahun Baru', tipe:'cuti', icon:'📅' },
    '1-15': { nama:'Hari Tritura', tipe:'peringatan', icon:'📢' },
    // FEBRUARI
    '2-10': { nama:'Tahun Baru Imlek 2575 Kongzili', tipe:'libur', icon:'🧧' },
    '2-14': { nama:'Hari Valentine (Internasional)', tipe:'peringatan', icon:'💝' },
    // MARET
    '3-11': { nama:'Hari Supersemar', tipe:'peringatan', icon:'📜' },
    '3-11': { nama:'Hari Supersemar', tipe:'peringatan', icon:'📜' },
    '3-12': { nama:'Isra Miraj Nabi Muhammad SAW 1445 H', tipe:'libur', icon:'🌙' },
    '3-22': { nama:'Hari Air Sedunia', tipe:'peringatan', icon:'💧' },
    '3-29': { nama:'Wafat Isa Al Masih (Good Friday)', tipe:'libur', icon:'✝️' },
    '3-31': { nama:'Hari Raya Paskah', tipe:'peringatan', icon:'🐣' },
    // APRIL
    '4-9':  { nama:'Hari Raya Idul Fitri 1 Syawal 1445 H', tipe:'libur', icon:'🌙' },
    '4-10': { nama:'Hari Raya Idul Fitri 2 Syawal 1445 H', tipe:'libur', icon:'🌙' },
    '4-8':  { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '4-11': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '4-12': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '4-21': { nama:'Hari Kartini', tipe:'peringatan', icon:'👩' },
    // MEI
    '5-1':  { nama:'Hari Buruh Internasional', tipe:'libur', icon:'⚒️' },
    '5-2':  { nama:'Hari Pendidikan Nasional', tipe:'peringatan', icon:'🎓' },
    '5-9':  { nama:'Kenaikan Isa Al Masih', tipe:'libur', icon:'✝️' },
    '5-10': { nama:'Cuti Bersama Kenaikan Isa Al Masih', tipe:'cuti', icon:'📅' },
    '5-16': { nama:'Hari Raya Waisak 2568 BE', tipe:'libur', icon:'☸️' },
    '5-20': { nama:'Hari Kebangkitan Nasional', tipe:'peringatan', icon:'🇮🇩' },
    // JUNI
    '6-1':  { nama:'Hari Lahir Pancasila', tipe:'libur', icon:'🦅' },
    '6-17': { nama:'Hari Raya Idul Adha 1445 H', tipe:'libur', icon:'🐑' },
    '6-18': { nama:'Cuti Bersama Idul Adha', tipe:'cuti', icon:'📅' },
    // JULI
    '7-7':  { nama:'Tahun Baru Islam 1 Muharram 1446 H', tipe:'libur', icon:'🌙' },
    // AGUSTUS
    '8-17': { nama:'Hari Kemerdekaan RI ke-79', tipe:'libur', icon:'🇮🇩' },
    // SEPTEMBER
    '9-16': { nama:'Maulid Nabi Muhammad SAW 1446 H', tipe:'libur', icon:'🌙' },
    // OKTOBER
    '10-1': { nama:'Hari Kesaktian Pancasila', tipe:'peringatan', icon:'🦅' },
    '10-5': { nama:'Hari TNI', tipe:'peringatan', icon:'🎖️' },
    '10-28':{ nama:'Hari Sumpah Pemuda', tipe:'peringatan', icon:'✊' },
    // NOVEMBER
    '11-10':{ nama:'Hari Pahlawan', tipe:'peringatan', icon:'🎖️' },
    '11-25':{ nama:'Hari Guru Nasional', tipe:'peringatan', icon:'📚' },
    // DESEMBER
    '12-12':{ nama:'Hari Bela Negara', tipe:'peringatan', icon:'🛡️' },
    '12-22':{ nama:'Hari Ibu Nasional', tipe:'peringatan', icon:'👩‍👧' },
    '12-25':{ nama:'Hari Raya Natal', tipe:'libur', icon:'🎄' },
    '12-26':{ nama:'Cuti Bersama Natal', tipe:'cuti', icon:'📅' },
  },
  2025: {
    // JANUARI
    '1-1':  { nama:'Tahun Baru Masehi 2025', tipe:'libur', icon:'🎉' },
    '1-15': { nama:'Hari Tritura', tipe:'peringatan', icon:'📢' },
    '1-27': { nama:'Isra Miraj Nabi Muhammad SAW 1446 H', tipe:'libur', icon:'🌙' },
    '1-28': { nama:'Tahun Baru Imlek 2576 Kongzili', tipe:'libur', icon:'🧧' },
    '1-29': { nama:'Cuti Bersama Tahun Baru Imlek', tipe:'cuti', icon:'📅' },
    // FEBRUARI
    '2-14': { nama:'Hari Valentine (Internasional)', tipe:'peringatan', icon:'💝' },
    // MARET
    '3-4':  { nama:'Hari Raya Nyepi (Tahun Baru Saka 1947)', tipe:'libur', icon:'🕯️' },
    '3-28': { nama:'Wafat Isa Al Masih (Good Friday)', tipe:'libur', icon:'✝️' },
    '3-30': { nama:'Hari Raya Paskah', tipe:'peringatan', icon:'🐣' },
    // MARET-APRIL (Idul Fitri)
    '3-31': { nama:'Hari Raya Idul Fitri 1 Syawal 1446 H', tipe:'libur', icon:'🌙' },
    '4-1':  { nama:'Hari Raya Idul Fitri 2 Syawal 1446 H', tipe:'libur', icon:'🌙' },
    '3-28': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '4-2':  { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '4-3':  { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '4-4':  { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    // APRIL
    '4-21': { nama:'Hari Kartini', tipe:'peringatan', icon:'👩' },
    // MEI
    '5-1':  { nama:'Hari Buruh Internasional', tipe:'libur', icon:'⚒️' },
    '5-2':  { nama:'Hari Pendidikan Nasional', tipe:'peringatan', icon:'🎓' },
    '5-12': { nama:'Hari Raya Waisak 2569 BE', tipe:'libur', icon:'☸️' },
    '5-13': { nama:'Cuti Bersama Waisak', tipe:'cuti', icon:'📅' },
    '5-20': { nama:'Hari Kebangkitan Nasional', tipe:'peringatan', icon:'🇮🇩' },
    '5-29': { nama:'Kenaikan Isa Al Masih', tipe:'libur', icon:'✝️' },
    // JUNI
    '6-1':  { nama:'Hari Lahir Pancasila', tipe:'libur', icon:'🦅' },
    '6-6':  { nama:'Hari Raya Idul Adha 1446 H', tipe:'libur', icon:'🐑' },
    '6-9':  { nama:'Tahun Baru Islam 1 Muharram 1447 H', tipe:'libur', icon:'🌙' },
    // AGUSTUS
    '8-17': { nama:'Hari Kemerdekaan RI ke-80', tipe:'libur', icon:'🇮🇩' },
    '8-18': { nama:'Cuti Bersama HUT RI', tipe:'cuti', icon:'📅' },
    // SEPTEMBER
    '9-5':  { nama:'Maulid Nabi Muhammad SAW 1447 H', tipe:'libur', icon:'🌙' },
    // OKTOBER
    '10-1': { nama:'Hari Kesaktian Pancasila', tipe:'peringatan', icon:'🦅' },
    '10-5': { nama:'Hari TNI', tipe:'peringatan', icon:'🎖️' },
    '10-28':{ nama:'Hari Sumpah Pemuda', tipe:'peringatan', icon:'✊' },
    // NOVEMBER
    '11-10':{ nama:'Hari Pahlawan', tipe:'peringatan', icon:'🎖️' },
    '11-25':{ nama:'Hari Guru Nasional', tipe:'peringatan', icon:'📚' },
    // DESEMBER
    '12-12':{ nama:'Hari Bela Negara', tipe:'peringatan', icon:'🛡️' },
    '12-22':{ nama:'Hari Ibu Nasional', tipe:'peringatan', icon:'👩‍👧' },
    '12-25':{ nama:'Hari Raya Natal', tipe:'libur', icon:'🎄' },
    '12-26':{ nama:'Cuti Bersama Natal', tipe:'cuti', icon:'📅' },
  },
  2026: {
    // JANUARI
    '1-1':  { nama:'Tahun Baru Masehi 2026', tipe:'libur', icon:'🎉' },
    '1-2':  { nama:'Cuti Bersama Tahun Baru', tipe:'cuti', icon:'📅' },
    '1-15': { nama:'Hari Tritura', tipe:'peringatan', icon:'📢' },
    '1-17': { nama:'Tahun Baru Imlek 2577 Kongzili', tipe:'libur', icon:'🧧' },
    '1-19': { nama:'Isra Miraj Nabi Muhammad SAW 1447 H', tipe:'libur', icon:'🌙' },
    // FEBRUARI
    '2-14': { nama:'Hari Valentine (Internasional)', tipe:'peringatan', icon:'💝' },
    // MARET
    '3-21': { nama:'Hari Raya Nyepi (Tahun Baru Saka 1948)', tipe:'libur', icon:'🕯️' },
    '3-20': { nama:'Wafat Isa Al Masih (Good Friday)', tipe:'libur', icon:'✝️' },
    '3-22': { nama:'Hari Raya Paskah', tipe:'peringatan', icon:'🐣' },
    // Idul Fitri 2026 (perkiraan 20-21 Maret 2026)
    '3-20': { nama:'Hari Raya Idul Fitri 1 Syawal 1447 H', tipe:'libur', icon:'🌙' },
    '3-21': { nama:'Hari Raya Idul Fitri 2 Syawal 1447 H', tipe:'libur', icon:'🌙' },
    '3-18': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '3-19': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '3-23': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '3-24': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    // APRIL
    '4-21': { nama:'Hari Kartini', tipe:'peringatan', icon:'👩' },
    // MEI
    '5-1':  { nama:'Hari Buruh Internasional', tipe:'libur', icon:'⚒️' },
    '5-2':  { nama:'Hari Pendidikan Nasional', tipe:'peringatan', icon:'🎓' },
    '5-14': { nama:'Kenaikan Isa Al Masih', tipe:'libur', icon:'✝️' },
    '5-20': { nama:'Hari Kebangkitan Nasional', tipe:'peringatan', icon:'🇮🇩' },
    '5-27': { nama:'Hari Raya Idul Adha 1447 H', tipe:'libur', icon:'🐑' },
    '5-28': { nama:'Cuti Bersama Idul Adha', tipe:'cuti', icon:'📅' },
    '5-29': { nama:'Hari Raya Waisak 2570 BE', tipe:'libur', icon:'☸️' },
    // JUNI
    '6-1':  { nama:'Hari Lahir Pancasila', tipe:'libur', icon:'🦅' },
    '6-27': { nama:'Tahun Baru Islam 1 Muharram 1448 H', tipe:'libur', icon:'🌙' },
    // AGUSTUS
    '8-17': { nama:'Hari Kemerdekaan RI ke-81', tipe:'libur', icon:'🇮🇩' },
    // SEPTEMBER
    '9-5':  { nama:'Maulid Nabi Muhammad SAW 1448 H', tipe:'libur', icon:'🌙' },
    // OKTOBER
    '10-1': { nama:'Hari Kesaktian Pancasila', tipe:'peringatan', icon:'🦅' },
    '10-5': { nama:'Hari TNI', tipe:'peringatan', icon:'🎖️' },
    '10-28':{ nama:'Hari Sumpah Pemuda', tipe:'peringatan', icon:'✊' },
    // NOVEMBER
    '11-10':{ nama:'Hari Pahlawan', tipe:'peringatan', icon:'🎖️' },
    '11-25':{ nama:'Hari Guru Nasional', tipe:'peringatan', icon:'📚' },
    // DESEMBER
    '12-12':{ nama:'Hari Bela Negara', tipe:'peringatan', icon:'🛡️' },
    '12-22':{ nama:'Hari Ibu Nasional', tipe:'peringatan', icon:'👩‍👧' },
    '12-25':{ nama:'Hari Raya Natal', tipe:'libur', icon:'🎄' },
    '12-26':{ nama:'Cuti Bersama Natal', tipe:'cuti', icon:'📅' },
  },
  2027: {
    // JANUARI
    '1-1':  { nama:'Tahun Baru Masehi 2027', tipe:'libur', icon:'🎉' },
    '1-15': { nama:'Hari Tritura', tipe:'peringatan', icon:'📢' },
    '1-8':  { nama:'Isra Miraj Nabi Muhammad SAW 1448 H', tipe:'libur', icon:'🌙' },
    '1-26': { nama:'Tahun Baru Imlek 2578 Kongzili', tipe:'libur', icon:'🧧' },
    // MARET
    '3-10': { nama:'Hari Raya Nyepi (Tahun Baru Saka 1949)', tipe:'libur', icon:'🕯️' },
    '3-10': { nama:'Hari Raya Idul Fitri 1 Syawal 1448 H', tipe:'libur', icon:'🌙' },
    '3-11': { nama:'Hari Raya Idul Fitri 2 Syawal 1448 H', tipe:'libur', icon:'🌙' },
    '3-8':  { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '3-9':  { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    '3-12': { nama:'Cuti Bersama Idul Fitri', tipe:'cuti', icon:'📅' },
    // APRIL
    '4-2':  { nama:'Wafat Isa Al Masih (Good Friday)', tipe:'libur', icon:'✝️' },
    '4-4':  { nama:'Hari Raya Paskah', tipe:'peringatan', icon:'🐣' },
    '4-21': { nama:'Hari Kartini', tipe:'peringatan', icon:'👩' },
    // MEI
    '5-1':  { nama:'Hari Buruh Internasional', tipe:'libur', icon:'⚒️' },
    '5-2':  { nama:'Hari Pendidikan Nasional', tipe:'peringatan', icon:'🎓' },
    '5-17': { nama:'Hari Raya Idul Adha 1448 H', tipe:'libur', icon:'🐑' },
    '5-18': { nama:'Hari Raya Waisak 2571 BE', tipe:'libur', icon:'☸️' },
    '5-20': { nama:'Hari Kebangkitan Nasional', tipe:'peringatan', icon:'🇮🇩' },
    '5-13': { nama:'Kenaikan Isa Al Masih', tipe:'libur', icon:'✝️' },
    // JUNI
    '6-1':  { nama:'Hari Lahir Pancasila', tipe:'libur', icon:'🦅' },
    '6-16': { nama:'Tahun Baru Islam 1 Muharram 1449 H', tipe:'libur', icon:'🌙' },
    // AGUSTUS
    '8-17': { nama:'Hari Kemerdekaan RI ke-82', tipe:'libur', icon:'🇮🇩' },
    '8-25': { nama:'Maulid Nabi Muhammad SAW 1449 H', tipe:'libur', icon:'🌙' },
    // OKTOBER
    '10-1': { nama:'Hari Kesaktian Pancasila', tipe:'peringatan', icon:'🦅' },
    '10-5': { nama:'Hari TNI', tipe:'peringatan', icon:'🎖️' },
    '10-28':{ nama:'Hari Sumpah Pemuda', tipe:'peringatan', icon:'✊' },
    // NOVEMBER
    '11-10':{ nama:'Hari Pahlawan', tipe:'peringatan', icon:'🎖️' },
    '11-25':{ nama:'Hari Guru Nasional', tipe:'peringatan', icon:'📚' },
    // DESEMBER
    '12-12':{ nama:'Hari Bela Negara', tipe:'peringatan', icon:'🛡️' },
    '12-22':{ nama:'Hari Ibu Nasional', tipe:'peringatan', icon:'👩‍👧' },
    '12-25':{ nama:'Hari Raya Natal', tipe:'libur', icon:'🎄' },
    '12-26':{ nama:'Cuti Bersama Natal', tipe:'cuti', icon:'📅' },
  }
};

// Helper: get data hari ini dari tahun aktif
function getHariData(year, key){ return (CALENDAR_DATA[year]||{})[key] || null; }
function isLiburNasional(year, key){ const d=getHariData(year,key); return d&&d.tipe==='libur'; }
function isCutiBersama(year, key){ const d=getHariData(year,key); return d&&d.tipe==='cuti'; }
function isPeringatan(year, key){ const d=getHariData(year,key); return d&&d.tipe==='peringatan'; }

let calYear=2026,calMonth=new Date().getMonth();
function renderCalendar(){
  const ms=document.getElementById('monthSelect'),ys=document.getElementById('yearSelect');
  ms.innerHTML=MONTHS_ID.map((m,i)=>`<option value="${i}" ${i===calMonth?'selected':''}>${m}</option>`).join('');
  ys.innerHTML=[2024,2025,2026,2027].map(y=>`<option value="${y}" ${y===calYear?'selected':''}>${y}</option>`).join('');

  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const prevDays=new Date(calYear,calMonth,0).getDate();
  const today=new Date();
  const container=document.getElementById('calendarDays');
  container.innerHTML='';

  // Hari dari bulan sebelumnya
  for(let i=firstDay-1;i>=0;i--){
    const d=document.createElement('div');
    d.className='cal-day other-month';
    d.textContent=prevDays-i;
    container.appendChild(d);
  }

  // Hari di bulan ini
  for(let d=1;d<=daysInMonth;d++){
    const el=document.createElement('div');
    const key=`${calMonth+1}-${d}`;
    const hariData=getHariData(calYear,key);
    const isToday=today.getFullYear()===calYear&&today.getMonth()===calMonth&&today.getDate()===d;
    const dayOfWeek=new Date(calYear,calMonth,d).getDay();
    const isSun=dayOfWeek===0;
    const isSat=dayOfWeek===6;

    let cls='cal-day';
    if(isToday) cls+=' today';
    if(hariData){
      if(hariData.tipe==='libur') cls+=' holiday';
      else if(hariData.tipe==='cuti') cls+=' cuti-bersama';
      else if(hariData.tipe==='peringatan') cls+=' peringatan';
    }
    if(isSun&&!isToday&&!hariData) cls+=' sunday';
    if(isSat&&!isToday&&!hariData) cls+=' saturday';

    el.className=cls;
    el.textContent=d;
    if(hariData) el.title=`${hariData.icon} ${hariData.nama}`;

    // Tambah tooltip dot
    if(hariData){
      const dot=document.createElement('span');
      dot.className='cal-dot cal-dot-'+hariData.tipe;
      el.appendChild(dot);
    }
    container.appendChild(el);
  }

  // Hari dari bulan berikutnya
  const rem=(7-((firstDay+daysInMonth)%7))%7;
  for(let i=1;i<=rem&&rem<7;i++){
    const d=document.createElement('div');
    d.className='cal-day other-month';
    d.textContent=i;
    container.appendChild(d);
  }

  // Daftar hari spesial bulan ini
  const hl=document.getElementById('holidayList');
  hl.innerHTML='';

  const yearData=CALENDAR_DATA[calYear]||{};
  const bulanIni=Object.entries(yearData)
    .filter(([k])=>k.startsWith(`${calMonth+1}-`))
    .sort((a,b)=>parseInt(a[0].split('-')[1])-parseInt(b[0].split('-')[1]));

  if(bulanIni.length===0){
    hl.innerHTML='<div class="hol-empty">Tidak ada hari khusus bulan ini</div>';
    return;
  }

  // Pisahkan libur nasional, cuti bersama, peringatan
  const liburList=bulanIni.filter(([,v])=>v.tipe==='libur');
  const cutiList=bulanIni.filter(([,v])=>v.tipe==='cuti');
  const peringatanList=bulanIni.filter(([,v])=>v.tipe==='peringatan');

  function renderHolGroup(title, list, colorClass){
    if(!list.length) return;
    const grp=document.createElement('div');
    grp.className='hol-group';
    grp.innerHTML=`<div class="hol-group-title ${colorClass}">${title}</div>`;
    list.forEach(([k,v])=>{
      const day=k.split('-')[1];
      const dayName=DAYS_ID[new Date(calYear,calMonth,parseInt(day)).getDay()];
      const item=document.createElement('div');
      item.className='hol-item hol-item-'+v.tipe;
      item.innerHTML=`<span class="hol-icon">${v.icon}</span><div class="hol-detail"><span class="hol-date">${dayName}, ${day} ${MONTHS_ID[calMonth]} ${calYear}</span><span class="hol-name">${v.nama}</span></div>`;
      grp.appendChild(item);
    });
    hl.appendChild(grp);
  }

  renderHolGroup('🔴 Libur Nasional', liburList, 'title-libur');
  renderHolGroup('🟡 Cuti Bersama', cutiList, 'title-cuti');
  renderHolGroup('🔵 Hari Peringatan', peringatanList, 'title-peringatan');
}
window.changeMonth=(n)=>{calMonth+=n;if(calMonth<0){calMonth=11;calYear--;}if(calMonth>11){calMonth=0;calYear++;}renderCalendar();};
window.changeMonthSelect=()=>{calMonth=+document.getElementById('monthSelect').value;renderCalendar();};
window.changeYearSelect=()=>{calYear=+document.getElementById('yearSelect').value;renderCalendar();};
renderCalendar();
window.addEvent=function(){ const input=document.getElementById('eventInput'),val=input.value.trim();if(!val)return;const list=document.getElementById('eventList'),today=new Date().toLocaleDateString('id-ID'),d=document.createElement('div');d.className='event-item';d.innerHTML=`📌 ${today}: ${val}<button class="event-del" onclick="this.parentNode.remove()">✕</button>`;list.appendChild(d);input.value='';showToast('📌 Pengingat ditambahkan!','success'); };

// ===== ONLINE COUNT =====
function updateOnlineCount(){ const n=Math.floor(Math.random()*50)+12,el=document.getElementById('onlineUsers');if(el)el.textContent=n; }
setInterval(updateOnlineCount,8000); updateOnlineCount();

// ===== ONET GAME =====
const ROWS=6,COLS=8;
const EMOJIS=['🍎','🍊','🍋','🍇','🍓','🍑','🥝','🍒','🍍','🥭','🍌','🍉','🥑','🌽','🥕','🍆','🌶','🥦','🧅','🧄','🍔','🍕','🌮','🍜','🍣','🍦','🎂','🍩','🍪','🍫','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯'];
let gameBoard=[],gameSelected=[],gameScore=0,gameLevel=1,gameHints=3,gameTimeLeft=120,gameTimerInterval=null,gameIsPaused=false;
let gameBest=parseInt(localStorage.getItem('br_best_score')||'0');
const lineCanvas=document.getElementById('lineCanvas'),lineCtx=lineCanvas.getContext('2d');
function resizeLineCanvas(){lineCanvas.width=window.innerWidth;lineCanvas.height=window.innerHeight;}
window.addEventListener('resize',resizeLineCanvas);resizeLineCanvas();
document.getElementById('gameBest').textContent=gameBest;
window.startGame=()=>{ clearInterval(gameTimerInterval);gameScore=0;gameLevel=1;gameHints=3;gameTimeLeft=120;gameSelected=[];gameIsPaused=false;generateBoard();renderBoard();updateHUD();document.getElementById('gameMsg').textContent='';gameTimerInterval=setInterval(()=>{if(gameIsPaused)return;gameTimeLeft--;document.getElementById('gameTimer').textContent=gameTimeLeft;if(gameTimeLeft<=0){clearInterval(gameTimerInterval);if(gameScore>gameBest){gameBest=gameScore;localStorage.setItem('br_best_score',gameBest);document.getElementById('gameBest').textContent=gameBest;}document.getElementById('gameMsg').textContent=`⏰ Waktu Habis! Skor: ${gameScore}`;}},1000); };
window.pauseGame=()=>{ gameIsPaused=!gameIsPaused;document.getElementById('gameMsg').textContent=gameIsPaused?'⏸ Game Dijeda':''; };
function generateBoard(){ const count=COLS*ROWS,pairCount=count/2,emSet=EMOJIS.slice(0,Math.min(pairCount,EMOJIS.length));let tiles=[];while(tiles.length<count){const needed=count-tiles.length,chunk=emSet.slice(0,Math.floor(needed/2));chunk.forEach(e=>{tiles.push(e);tiles.push(e);});}tiles=tiles.slice(0,count);for(let i=tiles.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}gameBoard=[];for(let r=0;r<ROWS;r++){gameBoard.push([]);for(let c=0;c<COLS;c++){gameBoard[r].push({emoji:tiles[r*COLS+c],matched:false});}}}
function renderBoard(){ const gb=document.getElementById('gameBoard');gb.style.gridTemplateColumns=`repeat(${COLS},auto)`;gb.innerHTML='';for(let r=0;r<ROWS;r++){for(let c=0;c<COLS;c++){const cell=gameBoard[r][c],tile=document.createElement('div');tile.className='game-tile'+(cell.matched?' matched':'');tile.dataset.r=r;tile.dataset.c=c;tile.textContent=cell.matched?'':cell.emoji;if(!cell.matched)tile.addEventListener('click',()=>selectTile(r,c));gb.appendChild(tile);}}}
function selectTile(r,c){ if(gameBoard[r][c].matched||gameIsPaused)return;if(gameSelected.length===1&&gameSelected[0].r===r&&gameSelected[0].c===c){gameSelected=[];renderBoard();return;}gameSelected.push({r,c});highlightSelected();if(gameSelected.length===2){const [a,b]=gameSelected;if(gameBoard[a.r][a.c].emoji===gameBoard[b.r][b.c].emoji&&canConnect(a,b)){setTimeout(()=>{drawPath(a,b,true);gameBoard[a.r][a.c].matched=true;gameBoard[b.r][b.c].matched=true;gameScore+=100+gameLevel*10;gameSelected=[];renderBoard();updateHUD();checkWin();},300);}else{setTimeout(()=>{gameSelected=[];renderBoard();},500);}}}
function highlightSelected(){ document.querySelectorAll('.game-tile').forEach(t=>{const r=+t.dataset.r,c=+t.dataset.c;t.classList.toggle('selected',gameSelected.some(s=>s.r===r&&s.c===c));}); }
function canConnect(a,b){ if(gameBoard[a.r][a.c].emoji!==gameBoard[b.r][b.c].emoji)return false;return directPath(a,b)||lPath(a,b)||zPath(a,b); }
function isFree(r,c,excludes=[]){ if(r<0||r>=ROWS||c<0||c>=COLS)return false;if(excludes.some(e=>e.r===r&&e.c===c))return true;return!gameBoard[r][c]||gameBoard[r][c].matched; }
function directPath(a,b){ if(a.r===b.r){const mn=Math.min(a.c,b.c)+1,mx=Math.max(a.c,b.c);for(let c=mn;c<mx;c++)if(!isFree(a.r,c,[a,b]))return false;return true;}if(a.c===b.c){const mn=Math.min(a.r,b.r)+1,mx=Math.max(a.r,b.r);for(let r=mn;r<mx;r++)if(!isFree(r,a.c,[a,b]))return false;return true;}return false; }
function lPath(a,b){ const c1={r:a.r,c:b.c},c2={r:b.r,c:a.c};return(isFree(c1.r,c1.c,[a,b])&&directPath(a,c1)&&directPath(c1,b))||(isFree(c2.r,c2.c,[a,b])&&directPath(a,c2)&&directPath(c2,b)); }
function zPath(a,b){ for(let r=-1;r<=ROWS;r++){const p1={r,c:a.c},p2={r,c:b.c};if((r<0||r>=ROWS||isFree(r,a.c,[a,b]))&&(r<0||r>=ROWS||isFree(r,b.c,[a,b]))&&directPath(a,p1)&&directPath(p1,p2)&&directPath(p2,b))return true;}for(let c=-1;c<=COLS;c++){const p1={r:a.r,c},p2={r:b.r,c};if((c<0||c>=COLS||isFree(a.r,c,[a,b]))&&(c<0||c>=COLS||isFree(b.r,c,[a,b]))&&directPath(a,p1)&&directPath(p1,p2)&&directPath(p2,b))return true;}return false; }
function getTileCenter(r,c){ const tiles=document.querySelectorAll('.game-tile'),tile=[...tiles].find(t=>+t.dataset.r===r&&+t.dataset.c===c);if(!tile)return{x:0,y:0};const rect=tile.getBoundingClientRect();return{x:rect.left+rect.width/2,y:rect.top+rect.height/2}; }
function drawPath(a,b,animate){ resizeLineCanvas();const posA=getTileCenter(a.r,a.c),posB=getTileCenter(b.r,b.c);lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);lineCtx.strokeStyle='#a78bfa';lineCtx.lineWidth=3;lineCtx.shadowBlur=12;lineCtx.shadowColor='#8b5cf6';lineCtx.lineCap='round';lineCtx.beginPath();lineCtx.moveTo(posA.x,posA.y);const c1={r:a.r,c:b.c};if(isFree(c1.r,c1.c,[a,b])&&directPath(a,c1)&&directPath(c1,b)){const mid=getTileCenter(c1.r,c1.c);lineCtx.lineTo(mid.x,posA.y);lineCtx.lineTo(posB.x,posB.y);}else{lineCtx.lineTo(posB.x,posA.y);lineCtx.lineTo(posB.x,posB.y);}lineCtx.stroke();if(animate)setTimeout(()=>lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height),500); }
function checkWin(){ if(gameBoard.every(row=>row.every(c=>c.matched))){clearInterval(gameTimerInterval);gameLevel++;gameScore+=gameTimeLeft*5;updateHUD();if(gameScore>gameBest){gameBest=gameScore;localStorage.setItem('br_best_score',gameBest);document.getElementById('gameBest').textContent=gameBest;}document.getElementById('gameMsg').textContent=`🎉 Level Selesai! Skor: ${gameScore}${gameScore>=gameBest?' 🏆 Rekor!':''}`;setTimeout(()=>{gameTimeLeft=120+gameLevel*10;window.startGame();},2000);} }
function updateHUD(){ document.getElementById('gameScore').textContent=gameScore;document.getElementById('gameTimer').textContent=gameTimeLeft;document.getElementById('gameLevel').textContent=gameLevel;document.getElementById('gameHints').textContent=gameHints; }
window.useHint=()=>{ if(gameHints<=0){document.getElementById('gameMsg').textContent='Hint habis!';return;}gameHints--;updateHUD();for(let r1=0;r1<ROWS;r1++)for(let c1=0;c1<COLS;c1++){if(gameBoard[r1][c1].matched)continue;for(let r2=0;r2<ROWS;r2++)for(let c2=0;c2<COLS;c2++){if(r1===r2&&c1===c2)continue;if(gameBoard[r2][c2].matched)continue;if(gameBoard[r1][c1].emoji===gameBoard[r2][c2].emoji&&canConnect({r:r1,c:c1},{r:r2,c:c2})){const tiles=document.querySelectorAll('.game-tile'),ta=[...tiles].find(t=>+t.dataset.r===r1&&+t.dataset.c===c1),tb=[...tiles].find(t=>+t.dataset.r===r2&&+t.dataset.c===c2);if(ta)ta.classList.add('hint-blink');if(tb)tb.classList.add('hint-blink');setTimeout(()=>{if(ta)ta.classList.remove('hint-blink');if(tb)tb.classList.remove('hint-blink');},1800);document.getElementById('gameMsg').textContent='💡 Pasangan ditemukan!';setTimeout(()=>{document.getElementById('gameMsg').textContent='';},2000);return;}}}document.getElementById('gameMsg').textContent='Tidak ada pasangan! Coba acak.'; };
window.shuffleBoard=()=>{ const unmatched=[];gameBoard.forEach((row,r)=>row.forEach((cell,c)=>{if(!cell.matched)unmatched.push({r,c,emoji:cell.emoji});}));const emojis=unmatched.map(u=>u.emoji);for(let i=emojis.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[emojis[i],emojis[j]]=[emojis[j],emojis[i]];}unmatched.forEach((u,i)=>gameBoard[u.r][u.c].emoji=emojis[i]);renderBoard();document.getElementById('gameMsg').textContent='🔀 Papan diacak!';setTimeout(()=>{document.getElementById('gameMsg').textContent='';},1500); };
generateBoard(); renderBoard();