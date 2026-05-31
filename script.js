/*
  Put your JPG frames inside /frames using this naming format:
  ezgif-frame-001.jpg, ezgif-frame-002.jpg, ezgif-frame-003.jpg ...

  IMPORTANT: Change FRAME_COUNT below to your total number of frames.
  Your sequence is 15 FPS, but scroll speed is controlled by page height in CSS.
*/

const FRAME_COUNT = 100; // <-- change this to your actual total frame count
const FRAME_PATH = (index) => `frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;

const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
const titleLayer = document.querySelector('.title-layer');

const images = [];
let loadedFrames = 0;
let currentFrame = 0;
let ticking = false;

const loader = document.createElement('div');
loader.className = 'loading';
loader.textContent = 'Loading invitation...';
document.body.appendChild(loader);

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(currentFrame);
}

function drawCoverImage(img) {
  if (!img || !img.complete || !img.naturalWidth) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih);
  const width = iw * scale;
  const height = ih * scale;
  const x = (cw - width) / 2;
  const y = (ch - height) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, width, height);
}

function drawFrame(index) {
  const img = images[index];
  drawCoverImage(img);
}

function preloadFrames() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);

    img.onload = () => {
      loadedFrames++;
      if (i === 0) {
        drawFrame(0);
      }
      if (loadedFrames >= Math.min(FRAME_COUNT, 8)) {
        loader.remove();
      }
    };

    img.onerror = () => {
      if (i === 0) {
        loader.textContent = 'Add frames inside the /frames folder and update FRAME_COUNT in script.js';
      }
    };

    images.push(img);
  }
}

function getScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
}

function update() {
  const progress = getScrollProgress();
  const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));

  if (frameIndex !== currentFrame) {
    currentFrame = frameIndex;
    drawFrame(currentFrame);
  }

  // Title fades in near the end of the frame animation.
  if (progress > 0.68) {
    titleLayer.classList.add('visible');
  } else {
    titleLayer.classList.remove('visible');
  }

  ticking = false;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', onScroll, { passive: true });

resizeCanvas();
preloadFrames();
update();
