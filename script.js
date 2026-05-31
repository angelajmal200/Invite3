/*
  Put frames here:
  /frames/ezgif-frame-001.jpg ... /frames/ezgif-frame-100.jpg
*/
const FRAME_COUNT = 100;
const FRAME_PATH = (index) => `frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;

const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const scrubSection = document.getElementById('scrub-section');
const details = document.getElementById('details');
const loader = document.getElementById('loader');
const loadPercent = document.getElementById('loadPercent');
const nameReveal = document.getElementById('nameReveal');
const scrollHint = document.querySelector('.scroll-hint');

let images = new Array(FRAME_COUNT);
let loaded = 0;
let currentIndex = 0;
let rafId = null;
let ready = false;

function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(currentIndex);
}

function drawCover(img){
  if(!img || !img.complete || !img.naturalWidth) return;
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const w = iw * scale;
  const h = ih * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;
  ctx.fillStyle = '#fbf7ed';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, w, h);
}

function drawFrame(index){
  currentIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
  const img = images[currentIndex];
  if(img) drawCover(img);
}

function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function smoothstep(edge0, edge1, x){
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function update(){
  const rect = scrubSection.getBoundingClientRect();
  const scrollable = scrubSection.offsetHeight - window.innerHeight;
  const progress = clamp((-rect.top) / scrollable, 0, 1);

  // Use first 78% of the sticky section for the frame animation.
  // Last part is reserved for title reveal, then details appear immediately after.
  const frameProgress = clamp(progress / 0.78, 0, 1);
  const index = Math.round(frameProgress * (FRAME_COUNT - 1));

  drawFrame(index);

  const titleProgress = smoothstep(0.72, 0.96, progress);
  nameReveal.style.opacity = titleProgress.toFixed(3);
  nameReveal.style.transform = `translateY(${(1-titleProgress)*24}px) scale(${0.96 + titleProgress*0.04})`;
  scrollHint.style.opacity = String(1 - smoothstep(0.10, 0.45, progress));

  rafId = null;
}

function requestUpdate(){
  if(!rafId) rafId = requestAnimationFrame(update);
}

function preload(){
  // Load first frame immediately so there is no blank screen.
  const first = new Image();
  first.src = FRAME_PATH(0);
  first.onload = () => {
    images[0] = first;
    loaded++;
    resizeCanvas();
    requestUpdate();
  };
  first.onerror = () => {
    loader.textContent = 'Frame not found: frames/ezgif-frame-001.jpg';
  };

  for(let i = 1; i < FRAME_COUNT; i++){
    const img = new Image();
    img.onload = () => {
      loaded++;
      loadPercent.textContent = `${Math.round((loaded / FRAME_COUNT) * 100)}%`;
      if(loaded >= Math.min(FRAME_COUNT, 8)){
        ready = true;
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.style.display = 'none', 400);
      }
    };
    img.onerror = () => console.warn('Missing frame:', FRAME_PATH(i));
    img.src = FRAME_PATH(i);
    images[i] = img;
  }
}

window.addEventListener('resize', resizeCanvas, { passive:true });
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 300), { passive:true });
window.addEventListener('scroll', requestUpdate, { passive:true });
window.addEventListener('load', () => { resizeCanvas(); preload(); requestUpdate(); });
