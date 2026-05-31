// Your frame files must be placed in /frames and named exactly:
// ezgif-frame-001.jpg ... ezgif-frame-100.jpg
const FRAME_COUNT = 100;
const FRAME_PATH = (index) => `frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;

const canvas = document.getElementById("frameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const scrubSection = document.getElementById("scrubSection");
const heroCopy = document.getElementById("heroCopy");
const scrollHint = document.getElementById("scrollHint");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
const loaderText = document.getElementById("loaderText");

const images = new Array(FRAME_COUNT);
let loaded = 0;
let currentFrame = 0;
let ticking = false;

function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(currentFrame);
}

function drawCover(img){
  if(!img || !img.complete || !img.naturalWidth) return;
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const nw = iw * scale;
  const nh = ih * scale;
  const x = (cw - nw) / 2;
  const y = (ch - nh) / 2;
  ctx.fillStyle = "#fbf8ef";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, nw, nh);
}

function drawFrame(index){
  const img = images[index];
  if(img) drawCover(img);
}

function getProgress(){
  const rect = scrubSection.getBoundingClientRect();
  const scrollable = scrubSection.offsetHeight - window.innerHeight;
  const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
  return progress;
}

function update(){
  const progress = getProgress();
  currentFrame = Math.min(FRAME_COUNT - 1, Math.floor(progress * (FRAME_COUNT - 1)));
  drawFrame(currentFrame);

  const titleProgress = Math.min(1, Math.max(0, (progress - 0.72) / 0.22));
  heroCopy.style.opacity = titleProgress.toFixed(3);
  heroCopy.style.transform = `translate(-50%, -50%) scale(${0.96 + titleProgress * 0.04})`;
  scrollHint.style.opacity = progress > 0.08 ? "0" : "0.85";

  ticking = false;
}

function onScroll(){
  if(!ticking){
    requestAnimationFrame(update);
    ticking = true;
  }
}

function loadFrames(){
  for(let i = 0; i < FRAME_COUNT; i++){
    const img = new Image();
    img.src = FRAME_PATH(i);
    img.onload = () => {
      loaded++;
      const percent = Math.round((loaded / FRAME_COUNT) * 100);
      loaderBar.style.width = `${percent}%`;
      loaderText.textContent = `${percent}%`;
      if(i === 0) drawFrame(0);
      if(loaded === FRAME_COUNT){
        setTimeout(() => loader.classList.add("hidden"), 250);
        update();
      }
    };
    img.onerror = () => {
      console.warn(`Missing frame: ${FRAME_PATH(i)}`);
      loaded++;
      const percent = Math.round((loaded / FRAME_COUNT) * 100);
      loaderBar.style.width = `${percent}%`;
      loaderText.textContent = `${percent}%`;
      if(loaded === FRAME_COUNT){
        loader.classList.add("hidden");
        update();
      }
    };
    images[i] = img;
  }
}

window.addEventListener("resize", resizeCanvas, { passive: true });
window.addEventListener("scroll", onScroll, { passive: true });
resizeCanvas();
loadFrames();
