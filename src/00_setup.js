
"use strict";
// =====================================================================
//  209 DRAGON'S DEN: BACKYARD BRAWL  —  native 16-bit build
//  Everything renders at 384x216 and is scaled up with hard pixels.
//  Wrestler sprites are generated as real pixel art: frame-by-frame poses,
//  15-colour palettes per wrestler (like SNES sprite palettes), pixel
//  shading and 1px outlines. No post-process filter.
// =====================================================================
const W=384,H=216;
const DPR=2;const cv=document.getElementById('c'),SCR=cv.getContext('2d');cv.width=W*DPR;cv.height=H*DPR;SCR.imageSmoothingEnabled=false;
let ctx=SCR;
function fit(){let r=Math.min(innerWidth/W,innerHeight/H);if(r>=2&&!(matchMedia('(pointer:coarse)').matches))r=Math.floor(r*2)/2;cv.style.width=(W*r)+'px';cv.style.height=(H*r)+'px';}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,250));fit();
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const lerp=(a,b,k)=>a+(b-a)*k, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;
  if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}return `rgb(${r|0},${g|0},${b|0})`;}
const LOGO_SRC={"T": "__ASSET(logo/logo_T.png)__", "B": "__ASSET(logo/logo_B.png)__", "A": "__ASSET(logo/logo_A.png)__", "M": "__ASSET(logo/logo_M.png)__"};

