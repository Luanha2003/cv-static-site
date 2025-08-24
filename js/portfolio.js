// year (nếu có trong trang)
const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

/* ---------- Side nav: set active theo ROUTE ---------- */
(() => {
  const route = (location.pathname || '/').toLowerCase();
  document.querySelectorAll('.sidenav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    a.classList.toggle('active', href === route);
  });
})();

/* ---------- Tabs (About) ---------- */
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tab-pane');
if (tabs.length) {
  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      panes.forEach(p=>p.classList.remove('show'));
      t.classList.add('active');
      const target=document.querySelector(`[data-pane="${t.dataset.tab}"]`);
      if(target) target.classList.add('show');
    });
  });
  // mở pane đầu
  tabs[0].click();
}

/* ---------- Nebula (canvas #nebula) ---------- */
const neb = document.getElementById('nebula');
const nctx = neb?.getContext?.('2d');
let NW=0, NH=0, NDPR=1, nT=0;
function nResize(){
  if(!neb) return;
  NDPR = Math.min(2, window.devicePixelRatio||1);
  NW = neb.width = innerWidth*NDPR;
  NH = neb.height = innerHeight*NDPR;
}
function drawNebula(){
  if(!nctx) return;
  nctx.clearRect(0,0,NW,NH);
  const x1 = NW*0.72 + Math.sin(nT*0.4)*120*NDPR;
  const y1 = NH*0.28 + Math.cos(nT*0.3)*80*NDPR;
  let g1 = nctx.createRadialGradient(x1,y1,0,x1,y1,NW*0.55);
  g1.addColorStop(0,'rgba(110,231,255,.18)'); g1.addColorStop(1,'rgba(110,231,255,0)');
  nctx.fillStyle=g1; nctx.fillRect(0,0,NW,NH);

  const x2 = NW*0.28 + Math.cos(nT*0.32)*140*NDPR;
  const y2 = NH*0.68 + Math.sin(nT*0.27)*100*NDPR;
  let g2 = nctx.createRadialGradient(x2,y2,0,x2,y2,NW*0.58);
  g2.addColorStop(0,'rgba(255,90,90,.22)'); g2.addColorStop(1,'rgba(255,90,90,0)');
  nctx.fillStyle=g2; nctx.fillRect(0,0,NW,NH);

  nT += 0.003;
}

/* ---------- Particle network (canvas #net) ---------- */
const net = document.getElementById('net');
const ctx = net?.getContext?.('2d');
let W=0,H=0,DPR=1,P=[],MAX=0;
const MOUSE={x:-1,y:-1,active:false};

function rand(n){return Math.random()*n}
function resize(){
  if(!net) return;
  DPR=Math.min(2, window.devicePixelRatio||1);
  W=net.width=innerWidth*DPR; H=net.height=innerHeight*DPR;
  MAX = innerWidth<700 ? 110 : 170;
}
function init(){
  if(!ctx) return;
  resize(); nResize();
  P.length=0;
  for(let i=0;i<MAX;i++){
    P.push({x:rand(W), y:rand(H), vx:(rand(1)-.5)*0.35, vy:(rand(1)-.5)*0.35, r:rand(1.3)+0.7, t:rand(6.28), tw:rand(0.02)+0.01});
  }
  loop();
}
window.addEventListener('resize',()=>{resize(); nResize();});
window.addEventListener('mousemove',e=>{
  if(!net) return;
  const rect=net.getBoundingClientRect();
  MOUSE.x=(e.clientX-rect.left)*DPR; MOUSE.y=(e.clientY-rect.top)*DPR; MOUSE.active=true;
});
window.addEventListener('mouseleave',()=>MOUSE.active=false);

function drawNet(){
  if(!ctx) return;
  ctx.fillStyle='rgba(10,15,20,.82)'; ctx.fillRect(0,0,W,H);
  const lg=ctx.createLinearGradient(0,0,W,H);
  lg.addColorStop(0,'rgba(255,210,120,.65)'); lg.addColorStop(1,'rgba(255,150,70,.55)');
  for(let i=0;i<P.length;i++){
    const p=P[i]; p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
    if(MOUSE.active){ const dx=MOUSE.x-p.x, dy=MOUSE.y-p.y, d=Math.hypot(dx,dy); if(d<220*DPR){ p.vx+=dx/d*0.005; p.vy+=dy/d*0.005 } }
    p.t+=p.tw; const rr=p.r*(0.8+Math.abs(Math.sin(p.t))*0.25);
    ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,Math.PI*2); ctx.fillStyle='rgba(255,184,86,.95)'; ctx.fill();
    for(let j=i+1;j<P.length;j++){ const q=P[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.hypot(dx,dy);
      if(d<160*DPR){ ctx.strokeStyle=lg; ctx.lineWidth=1*DPR; ctx.globalAlpha=(1-d/(160*DPR))*.9; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); ctx.globalAlpha=1; }
    }
  }
}
function loop(){ drawNebula(); drawNet(); requestAnimationFrame(loop) }
init();

/* === Animated counters (ease-out, start when visible) === */
(function(){
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);  // chậm dần về cuối

  function animateCounter(el, target, duration){
    const suffix = el.dataset.suffix || '';
    const startTime = performance.now();

    function update(now){
      const t = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(t);
      const val = Math.floor(target * eased);
      el.textContent = val.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.done) return;      // chỉ chạy 1 lần
        el.dataset.done = '1';

        const target = parseInt((el.dataset.target || '0').replace(/\D/g,''), 10) || 0;
        // tốc độ tự căn theo độ lớn số (2.5s–5.5s), càng về sau càng chậm
        const duration = Math.max(2500, Math.min(5500, 2200 + target * 1.8));
        animateCounter(el, target, duration);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();

/* ===== Page transition for sidenav (LEFT → RIGHT curtain) ===== */
(() => {
  const nav = document.querySelector('.sidenav');
  if (!nav) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // tạo overlay (curtain) phủ màn hình
  const curtain = document.createElement('div');
  curtain.className = 'route-curtain';
  document.body.appendChild(curtain);

  // Khi tải trang: tạm "che" rồi kéo màn từ trái sang phải để lộ trang
  function revealOnLoad(){
    if (reduce) { curtain.remove(); return; }
    // đặt về trạng thái CHE (ở giữa màn hình)
    curtain.style.transition = 'none';
    curtain.style.transform = 'translateX(0)';
    curtain.getBoundingClientRect(); // force reflow
    // chạy animation kéo sang PHẢI để lộ trang
    curtain.style.transition = 'transform .6s cubic-bezier(.22,.8,.25,1)';
    requestAnimationFrame(() => {
      curtain.style.transform = 'translateX(100%)';
    });
    document.body.classList.add('page-enter');
    setTimeout(() => document.body.classList.remove('page-enter'), 700);
  }
  revealOnLoad();

  // Rời trang: kéo màn từ TRÁI → PHẢI để che rồi điều hướng
  function navigateWithCurtain(url){
    if (reduce) { location.href = url; return; }

    // nhảy ngay ra ngoài bên trái, rồi trượt vào giữa (TRÁI → PHẢI)
    curtain.style.transition = 'none';
    curtain.style.transform = 'translateX(-100%)';
    curtain.getBoundingClientRect(); // force reflow
    curtain.style.transition = 'transform .6s cubic-bezier(.22,.8,.25,1)';
    curtain.style.transform = 'translateX(0)';

    const onEnd = () => {
      curtain.removeEventListener('transitionend', onEnd);
      location.href = url;
    };
    curtain.addEventListener('transitionend', onEnd);
  }

  // Bắt click trên các link trong sidenav (nội bộ)
  nav.querySelectorAll('a[href^="/"]').forEach(a => {
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || a.target === '_blank') return;
      e.preventDefault();
      navigateWithCurtain(a.getAttribute('href'));
    });
  });
})();

/* === Download CV: split label thành từng ký tự + reveal === */
(() => {
  const labels = document.querySelectorAll('.download-btn .lbl');
  if (!labels.length) return;

  labels.forEach(lbl => {
    if (lbl.dataset.split === '1') return; // tránh chạy lại (nếu có)
    const text = lbl.textContent || '';
    const frag = document.createDocumentFragment();
    [...text].forEach((ch, idx) => {
      const span = document.createElement('span');
      span.className = 'ch' + (ch === ' ' ? ' sp' : '');
      span.style.setProperty('--i', idx);
      span.textContent = ch === ' ' ? '\u00A0' : ch; // giữ khoảng trắng
      frag.appendChild(span);
    });
    lbl.textContent = '';
    lbl.appendChild(frag);
    lbl.classList.add('is-split');

    // trễ khởi động nhẹ để hợp với transition trang (tùy chọn)
    lbl.style.setProperty('--d0', '200ms');

    lbl.dataset.split = '1';
  });
})();


(() => {
  const labels = document.querySelectorAll('.download-btn .lbl');
  if (!labels.length) return;

  labels.forEach(lbl => {
    if (lbl.dataset.split === '1') return;   

    const text = lbl.textContent || '';
    const frag = document.createDocumentFragment();

    [...text].forEach((ch, idx) => {
      const span = document.createElement('span');
      span.className = 'ch' + (ch === ' ' ? ' sp' : '');
      span.style.setProperty('--i', idx);        
      span.textContent = ch === ' ' ? '\u00A0' : ch; 
      frag.appendChild(span);
    });

    lbl.textContent = '';
    lbl.appendChild(frag);
    lbl.classList.add('is-split');              

    
    lbl.style.setProperty('--cv-dur', '4.8s');   
    lbl.style.setProperty('--cv-stagger', '.10s'); 
    lbl.style.setProperty('--cv-delay', '180ms');  

    lbl.dataset.split = '1';
  });
})();

/* ===== Contact: fake submit + toast ===== */
(() => {
  // form ở trang Contact – đổi selector nếu bạn đặt khác
  const form =
    document.querySelector('.contact-only form') ||
    document.querySelector('form.contact-card') ||
    document.querySelector('form#contact-form');

  if (!form) return;

  function ensureToastRoot(){
    let root = document.getElementById('toast-root');
    if (!root){
      root = document.createElement('div');
      root.id = 'toast-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function showToast(message){
    const root = ensureToastRoot();
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML = `
      <span class="toast__icon" aria-hidden="true">✔</span>
      <span class="toast__text"></span>
    `;
    el.querySelector('.toast__text').textContent = message || 'Đã gửi tin nhắn thành công';
    root.appendChild(el);

    requestAnimationFrame(() => el.classList.add('toast--show'));
    setTimeout(() => {
      el.classList.remove('toast--show');
      el.addEventListener('transitionend', () => el.remove(), { once:true });
    }, 2600);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();                 // chặn gửi thật
    showToast('Đã gửi tin nhắn thành công'); // đổi chuỗi nếu muốn
    try { form.reset(); } catch {}
  });
})();

/* === PERF FIX: tạm dừng FX & prefetch trang đích khi chuyển trang === */
(() => {
  const $ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const links = $('.sidenav a[href]');

  // Đổi trạng thái để CSS phía trên tắt FX nặng khi rời trang
  function beginLeave() {
    document.documentElement.classList.add('is-leaving');

    // Nếu có vòng lặp raf riêng, thử hủy (không lỗi nếu không có)
    try {
      if (window.__rafId) cancelAnimationFrame(window.__rafId);
    } catch (_) {}

    // Phòng hờ: ẩn canvas FX ngay trước khi điều hướng
    const neb = document.getElementById('nebula');
    const net = document.getElementById('net');
    if (neb) neb.style.display = 'none';
    if (net) net.style.display = 'none';
  }

  // Prefetch để lần nhấn thật sự không bị “khựng” do tải lạnh
  function prefetch(href) {
    try {
      const l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = href;
      document.head.appendChild(l);
    } catch (_) {}
  }

  links.forEach(a => {
    const url = a.href;

    a.addEventListener('mouseenter', () => prefetch(url), { passive: true });

    a.addEventListener('click', (e) => {
      // Bỏ qua các trường hợp mở tab mới
      if (a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      beginLeave();
      // Không chặn điều hướng; chỉ dán class để khung hình hiện tại kịp áp CSS
      // Trình duyệt sẽ điều hướng ngay sau khi click
    }, { passive: true });
  });

  // Khi quay lại bằng back/forward cache, khôi phục trạng thái
  window.addEventListener('pageshow', () => {
    document.documentElement.classList.remove('is-leaving');
    const neb = document.getElementById('nebula');
    const net = document.getElementById('net');
    if (neb) neb.style.display = '';
    if (net) net.style.display = '';
  });

  // Tab ẩn/hiện: tự động dừng/khôi phục FX để tiết kiệm paint
  document.addEventListener('visibilitychange', () => {
    const hidden = document.visibilityState !== 'visible';
    document.documentElement.classList.toggle('is-leaving', hidden);
  });
})();
