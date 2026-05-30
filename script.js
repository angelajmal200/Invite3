const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-t,3);
const els={
  hero:document.querySelector('.hero'),
  groom:document.querySelector('.groom'),
  bride:document.querySelector('.bride'),
  topTitle:document.querySelector('.title-top'),
  centerTitle:document.querySelector('.title-center'),
  waveTop:document.querySelector('.wave-top'),
  waveBottom:document.querySelector('.wave-bottom'),
  lotusLeft:document.querySelector('.lotus-left'),
  lotusRight:document.querySelector('.lotus-right'),
  butterflyA:document.querySelector('.butterfly-a'),
  butterflyB:document.querySelector('.butterfly-b'),
  hint:document.querySelector('.scroll-hint')
};
let ticking=false;
function progress(){
  const rect=els.hero.getBoundingClientRect();
  const max=rect.height-window.innerHeight;
  return clamp(-rect.top/max,0,1);
}
function render(){
  const p=progress();
  const join=ease(clamp((p-.08)/.52,0,1));
  const reveal=ease(clamp((p-.55)/.25,0,1));
  const vw=window.innerWidth;
  const mobile=vw<760;
  const groomStart=mobile?-42:-28;
  const brideStart=mobile?42:28;
  const meet=mobile?-11:-5;
  els.groom.style.transform=`translateX(${lerp(groomStart, meet, join)}vw) scale(${lerp(.96,1.04,join)})`;
  els.bride.style.transform=`translateX(${lerp(brideStart, -meet, join)}vw) scale(${lerp(.96,1.04,join)})`;
  els.topTitle.style.opacity=String(clamp(1-p*2.2,0,1));
  els.topTitle.style.transform=`translate(-50%, ${-p*90}px) scale(${lerp(1,.92,p)})`;
  els.centerTitle.style.opacity=String(reveal);
  els.centerTitle.style.transform=`translate(-50%, ${lerp(42,0,reveal)}px) scale(${lerp(.94,1,reveal)})`;
  els.waveTop.style.transform=`translateX(-50%) translateY(${p*80}px) scaleY(-1)`;
  els.waveBottom.style.transform=`translateX(-50%) translateY(${-p*130}px)`;
  els.lotusLeft.style.transform=`translate(${p*55}px, ${-p*115}px) rotate(${-p*5}deg)`;
  els.lotusRight.style.transform=`translate(${-p*55}px, ${-p*125}px) scaleX(-1) rotate(${p*5}deg)`;
  els.butterflyA.style.transform=`translate(${p*38}vw, ${-p*34}vh) rotate(${p*24}deg) scale(${lerp(.82,1.08,p)})`;
  els.butterflyB.style.transform=`translate(${-p*35}vw, ${-p*26}vh) rotate(${-12-p*20}deg) scale(${lerp(.65,.95,p)})`;
  els.hint.style.opacity=String(clamp(1-p*6,0,1));
  ticking=false;
}
function request(){if(!ticking){requestAnimationFrame(render);ticking=true}}
window.addEventListener('scroll',request,{passive:true});
window.addEventListener('resize',request);
render();
