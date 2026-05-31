// Your GitHub path is: frames/ezgif-frame-001.jpg ... frames/ezgif-frame-100.jpg
const FRAME_COUNT = 100;
const FRAME_FOLDER = 'frames';
const FRAME_PREFIX = 'ezgif-frame-';
const FRAME_EXT = 'jpg';
const PAD_LENGTH = 3;

const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const barFill = document.getElementById('barFill');
const loadText = document.getElementById('loadText');
const frameSection = document.getElementById('frameSection');

const frameSrc = (n) => `${FRAME_FOLDER}/${FRAME_PREFIX}${String(n).padStart(PAD_LENGTH, '0')}.${FRAME_EXT}`;
const frames = new Array(FRAME_COUNT + 1);
let loaded = 0;
let firstFrameReady = false;
let lastDrawn = -1;

function setCanvasSize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawFrame(lastDrawn > 0 ? lastDrawn : 1, true);
}

function drawCover(img){
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;
  ctx.clearRect(0,0,cw,ch);
  ctx.drawImage(img,x,y,w,h);
}

function drawFrame(index, force=false){
  index = Math.max(1, Math.min(FRAME_COUNT, index));
  if(!force && index === lastDrawn) return;
  const img = frames[index];
  if(img && img.complete && img.naturalWidth){
    drawCover(img);
    lastDrawn = index;
  }
}

function getProgress(){
  const rect = frameSection.getBoundingClientRect();
  const scrollable = frameSection.offsetHeight - window.innerHeight;
  const passed = Math.min(Math.max(-rect.top, 0), scrollable);
  return scrollable > 0 ? passed / scrollable : 0;
}

let ticking = false;
function onScroll(){
  if(ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const progress = getProgress();
    const frame = Math.round(1 + progress * (FRAME_COUNT - 1));
    drawFrame(frame);
    ticking = false;
  });
}

function loadFrame(n){
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      frames[n] = img;
      loaded++;
      const percent = Math.round((loaded / FRAME_COUNT) * 100);
      barFill.style.width = percent + '%';
      loadText.textContent = `Loaded ${loaded}/${FRAME_COUNT}`;
      if(n === 1 && !firstFrameReady){
        firstFrameReady = true;
        drawFrame(1, true);
        loader.classList.add('hidden');
      }
      resolve(true);
    };
    img.onerror = () => {
      console.error('Missing frame:', frameSrc(n));
      loadText.innerHTML = `Missing frame: <b>${frameSrc(n)}</b>`;
      resolve(false);
    };
    img.src = frameSrc(n);
  });
}

async function init(){
  setCanvasSize();
  await loadFrame(1);
  const batchSize = 8;
  for(let start=2; start<=FRAME_COUNT; start+=batchSize){
    const batch = [];
    for(let n=start; n<Math.min(start+batchSize, FRAME_COUNT+1); n++) batch.push(loadFrame(n));
    await Promise.all(batch);
  }
  loader.classList.add('hidden');
  onScroll();
}

window.addEventListener('resize', setCanvasSize, {passive:true});
window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('orientationchange', () => setTimeout(setCanvasSize, 250));
init();
