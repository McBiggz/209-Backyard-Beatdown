// ================= INPUT =================
const keys={},pressed={};
const BLOCK=new Set(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space']);
addEventListener('keydown',e=>{if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;if(BLOCK.has(e.code))e.preventDefault();initAudio();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
const MAP=[
 {left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'],jump:['Space'],punch:['KeyF'],kick:['KeyG'],grab:['KeyH'],fin:['KeyR']},
 {left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'],jump:['KeyU','Numpad0'],punch:['KeyJ','Numpad1'],kick:['KeyK','Numpad2'],grab:['KeyL','Numpad3'],fin:['KeyI','NumpadDecimal']}];
const held=a=>a.some(k=>keys[k]),hit=a=>a.some(k=>pressed[k]);
const blank=()=>({left:false,right:false,up:false,down:false,jumpP:false,punchP:false,kickP:false,grabP:false,finP:false});
// ---- One input format for everyone: keyboard, touch pad and CPU all become the same 9 buttons per step,
// packed into one number. That number is what a replay stores and what online play will send over the wire.
const IBITS=['left','right','up','down','jumpP','punchP','kickP','grabP','finP'];
const packInp=o=>IBITS.reduce((n,k,i)=>o[k]?n|(1<<i):n,0);
const unpackInp=n=>{const o={};IBITS.forEach((k,i)=>o[k]=!!(n&(1<<i)));return o;};
function humanInput(i){const m=MAP[i];return{left:held(m.left),right:held(m.right),up:held(m.up),down:held(m.down),jumpP:hit(m.jump),punchP:hit(m.punch),kickP:hit(m.kick),grabP:hit(m.grab),finP:hit(m.fin)};}
const confirmP=()=>hit(['Enter','Space','NumpadEnter','KeyF']);
const tc=document.getElementById('tc'),FINBTN=tc.querySelector('.bf');
const coarse=matchMedia('(pointer:coarse)').matches||('ontouchstart' in window);
if(coarse)document.body.classList.add('touch');
const press=k=>{if(!keys[k])pressed[k]=true;keys[k]=true;},release=k=>{keys[k]=false;};
// thumb pad: one zone, 8 directions, slide your thumb without lifting
(()=>{const pad=document.getElementById('dpad'),knob=document.getElementById('knob');let tid=null;const dirs=['KeyW','KeyA','KeyS','KeyD'];
 const set=(dx,dy)=>{const r=75,d=Math.hypot(dx,dy),k=d>r?r/d:1;knob.style.transform=`translate(${dx*k*0.6}px,${dy*k*0.6}px)`;
  const on={KeyW:dy<-18&&Math.abs(dy)>Math.abs(dx)*0.45,KeyS:dy>18&&Math.abs(dy)>Math.abs(dx)*0.45,KeyA:dx<-18&&Math.abs(dx)>Math.abs(dy)*0.45,KeyD:dx>18&&Math.abs(dx)>Math.abs(dy)*0.45};
  for(const k of dirs){if(on[k])press(k);else release(k);}};
 const pos=t=>{const r=pad.getBoundingClientRect();set(t.clientX-r.left-r.width/2,t.clientY-r.top-r.height/2);};
 pad.addEventListener('touchstart',e=>{e.preventDefault();initAudio();const t=e.changedTouches[0];tid=t.identifier;pos(t);},{passive:false});
 pad.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===tid)pos(t);},{passive:false});
 const end=e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===tid){tid=null;knob.style.transform='';dirs.forEach(release);}};
 pad.addEventListener('touchend',end,{passive:false});pad.addEventListener('touchcancel',end,{passive:false});})();
// full screen + landscape lock on the first tap, where the browser allows it
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const fsOK=()=>!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
function goFull(){try{const d=document.documentElement,rq=d.requestFullscreen||d.webkitRequestFullscreen;if(!rq)return;const p=rq.call(d,{navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{});}catch(e){}setTimeout(fit,200);}).catch(()=>{});}catch(e){}}
const fsb=document.getElementById('fsbtn');fsb.addEventListener('click',e=>{e.stopPropagation();initAudio();goFull();});
function fsUI(){document.body.classList.toggle('fs-ok',coarse&&fsOK()&&!fsEl()&&!(G&&G.scene==='fight'&&!G.paused));}
document.addEventListener('fullscreenchange',()=>{fsUI();setTimeout(fit,200);});document.addEventListener('webkitfullscreenchange',()=>{fsUI();setTimeout(fit,200);});
let fsTried=false;addEventListener('touchend',()=>{if(fsTried||!coarse)return;fsTried=true;try{const d=document.documentElement,rq=d.requestFullscreen||d.webkitRequestFullscreen;if(rq){const p=rq.call(d,{navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}).catch(()=>{});}}catch(e){}},{passive:true});
tc.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;
 const dn=e=>{e.preventDefault();initAudio();if(!keys[k])pressed[k]=true;keys[k]=true;b.classList.add('dn');};
 const up=e=>{e.preventDefault();keys[k]=false;b.classList.remove('dn');};
 b.addEventListener('touchstart',dn,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});
 b.addEventListener('mousedown',dn);b.addEventListener('mouseup',up);b.addEventListener('mouseleave',up);});
let clickQ=null;
cv.addEventListener('pointerdown',e=>{initAudio();const r=cv.getBoundingClientRect();clickQ={x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};});
const inRect=(p,r)=>p&&p.x>=r[0]&&p.x<=r[0]+r[2]&&p.y>=r[1]&&p.y<=r[1]+r[3];


// ---- Controllers (Xbox / PlayStation / Switch Pro, wired or Bluetooth). Each pad "presses" the same keys as a player:
// pad 1 = Player 1's keys, pad 2 = Player 2's, so every screen and menu works with no extra code.
// Stick or d-pad: move. A/Cross: jump. X/Square: punch. Y/Triangle: kick. B/Circle: grab. Any shoulder/trigger: finisher.
// Start: pause (and P1 confirms in menus with A). Back/Select/Share: back / pause menu.
const PAD_BTN={0:'jump',2:'punch',3:'kick',1:'grab',4:'fin',5:'fin',6:'fin',7:'fin'};
const padPrev=[{},{}];let padOn=false;
function padSet(p,code,down){const was=!!padPrev[p][code];if(down===was)return;padPrev[p][code]=down;
 if(down){if(!keys[code])pressed[code]=true;keys[code]=true;}else keys[code]=false;}
function padPoll(){if(!navigator.getGamepads||!TEST_MODES)return; // test link only for now
 let list;try{list=[...navigator.getGamepads()].filter(g=>g&&g.connected);}catch(e){return;}
 if(list.length&&!padOn){padOn=true;document.body.classList.add('pad');}
 list.slice(0,2).forEach((g,p)=>{const m=MAP[p],b=i=>!!(g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>0.5)),ax=i=>g.axes[i]||0,DZ=0.45;
  const st={left:b(14)||ax(0)<-DZ,right:b(15)||ax(0)>DZ,up:b(12)||ax(1)<-DZ,down:b(13)||ax(1)>DZ};
  for(const k in st)padSet(p,m[k][0],st[k]);
  const want={};for(const i in PAD_BTN){const k=PAD_BTN[i];want[k]=want[k]||b(+i);}for(const k in want)padSet(p,m[k][0],want[k]);
  padSet(p,'KeyP',b(9));padSet(p,'Escape',b(8));
  if(p===0)padSet(p,'Enter',b(9)&&G.scene!=='fight');});}
addEventListener('gamepadconnected',()=>{padOn=true;document.body.classList.add('pad');});
addEventListener('gamepaddisconnected',()=>{if(!navigator.getGamepads||![...navigator.getGamepads()].some(g=>g&&g.connected)){padOn=false;document.body.classList.remove('pad');}});
