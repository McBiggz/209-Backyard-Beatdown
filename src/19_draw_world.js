// ================= DRAW: WORLD =================
function shadowOf(f,size){const lying=['down','pinned','fall','pinning'].includes(f.state)||(f.state==='finished'&&f.finBy==='slam'&&f.y<4);
 const x=lying?PX(bodyX(f),f.z):PX(f.x,f.z),y=PY(f.z);ELL(x,y,lying?22*size:Math.max(4,Math.round(9*size*(1-f.y/120))),2,'rgba(0,0,0,0.32)');}
function drawCtrIcon(f){if(f.cpu)return; if(f.state!=='whipped')return;let lbl=null,pct=0;
 if(f.ctrWin>0&&f.canRev){lbl=coarse?'GRAB':(f.idx?'L':'H');pct=f.ctrWin/CTR.whipReverse;}
 else if(f.runWin>0){lbl=coarse?'PUNCH/KICK':(f.idx?'J/K':'F/G');pct=f.runWin/CTR.ropeAttack;}
 if(!lbl)return;const x=sx_(f),y=sy_(f)-76*f.ch.size,w=TW(lbl)+8,on=Math.floor(G.t*16)%2;
 BOX(x-w/2,y,w,11,'#140a0c',on?'#ffd35a':'#ff4a3a');T(lbl,x,y+3,1,'#fff','center',null);R(x-w/2+1,y+9,Math.round((w-2)*pct),1,'#ffd35a');}
function drawDodgeHint(){if(G.mm||G.over)return;const me=G.f[0],o=G.f[1];if(!me||me.cpu||!['idle','walk'].includes(me.state)||!runnerComing(me,o))return;
 const x=clamp(PX(me.x,me.z),80,W-80),y=PY(me.z)-me.y-86*(me.ch.size||1);
 T(coarse?'JUMP: LEAPFROG · DOWN+JUMP: DROP DOWN':'SPACE: LEAPFROG · S+SPACE: DROP DOWN',x,y,1,Math.floor(G.t*8)%2?'#ffd35a':'#fff','center','#000');}
function drawFighters(){
 const R0=G.ref,ents=G.f.filter(f=>!f.hidden).map(f=>({f,z:f.z+(f.layer||0)+(f.state==='pinning'?0.5:0)+(f.state==='finished'&&f.y>4?0.5:0)}));if(!R0.hidden)ents.push({f:R0,z:R0.z,ref:true});
 if(G.props&&wide())for(const p of G.props)if(p.held<0)ents.push({p,z:p.z-0.3});
 for(const e of ents)if(e.f&&!(e.f.mwA<0.6))shadowOf(e.f,e.ref?0.9:e.f.ch.size);
 ents.sort((p,q)=>p.z-q.z);
 if(G.cage&&wide())drawCageBack();
 const front=e=>wide()&&(e.z>=180||(!e.ref&&!e.p&&e.f.state==='perch'));let postsDone=!wide();
 const drawPosts=()=>{postsDone=true;const PS=G.map==='secret'?SPOSTS:POSTS;for(const k in PS){const p=PS[k];if(p.img.complete)ctx.drawImage(p.img,p.x-G.cam,p.y,p.w,p.h);}};
 // Ranch entrance: whoever is deeper than the entrance (walking into the tunnel) goes behind its curtains and banner
 let entDone=!(wide()&&G.stage===3&&G.map!=='secret'&&G.scene==='fight');
 const drawEnt=()=>{entDone=true;const E=ENTFRONT;if(E.img.complete&&E.img.naturalWidth)ctx.drawImage(E.img,E.x-G.cam,E.y,E.w,E.h);};
 for(const e of ents)if(e.f&&!e.ref){const L=lpOf(e.f,frameOf(e.f));if(L&&L.some(q=>!q.front)){fDraw(e.f,fArgs(e.f),L,'back');}} // body parts that go BEHIND the other wrestler
 for(const e of [...ents.filter(e=>!front(e)),null,...ents.filter(front)]){if(!entDone&&(e===null||e.z>=ENTFRONT.z))drawEnt();if(e===null){drawPosts();continue;}if(e.p){drawProp(e.p);continue;}if(e.ref){drawSpr(SETS.ref,refFrame(R0),PX(R0.x,R0.z),PY(R0.z),R0.dir,depthS(R0.z)*REF_SCALE);continue;}
  const f=e.f,A=fArgs(f);if(f.mwA!=null&&f.mwA<1)ctx.globalAlpha=Math.max(0,f.mwA);
  const {fr,fx_,fy_,ds,dsc,ky}=A;
  // speed blur: fading copies trail behind a dropkick / dive
  if(TEST_MODES&&(f.state==='dropkick'||f.state==='dive')&&Math.abs(f.vx)>60){const vx=f.vx*ds,vy=f.vy*ds;
   for(const[k,a]of[[0.045,0.28],[0.085,0.14],[0.125,0.07]]){ctx.globalAlpha=a*(f.mwA??1);drawSpr(f.set,fr,fx_-vx*k,fy_+vy*k,f.dir*(f.turn||1),dsc,ky);}ctx.globalAlpha=f.mwA!=null&&f.mwA<1?Math.max(0,f.mwA):1;}
  fDraw(f,A,lpOf(f,fr),'main');
  ctx.globalAlpha=1;if(G.props&&f.wpn>=0)drawHeld(f);}
 for(const e of ents)if(e.f&&!e.ref){const L=lpOf(e.f,e.f._fr);if(L&&L.some(q=>q.front))fDraw(e.f,e.f._A,L,'front');} // body parts drawn IN FRONT of everyone
}
function drawParts(){for(const p of G.parts){const a=p.life/p.max;
 if(p.type==='ring'){const r=Math.round(3+(1-a)*14),cx=Math.round(p.x),cy=Math.round(p.y);ctx.fillStyle=p.col;for(let k=-3;k<=3;k++){const an=(p.vx>=0?0:Math.PI)+k*0.25;ctx.fillRect(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),1,1);}continue;}
 if(p.type==='fire'&&a<0.3)continue;R(p.x,p.y,p.size,p.size,p.col);}}
function drawPops(){for(const p of G.pops){ctx.globalAlpha=clamp(p.life/p.max*2,0,1);T(p.text,p.x,p.y,1,p.col,'center','#000');}ctx.globalAlpha=1;}
function drawCallout(){const c=G.callout;if(!c)return;const p=c.t/c.dur;ctx.globalAlpha=p>0.8?(1-p)/0.2:1;T(c.text,192,44,c.t<0.1?4:3,c.col,'center','#1a0304');ctx.globalAlpha=1;}
function drawHUD(){if(G.mm){drawGroupHUD();return;}const[a,b]=G.f;hpBar(a,3,3,1);hpBar(b,W-3,3,-1);drawCrowd();
 R(0,207,W,9,'#0a0506');R(0,207,20,9,'#8f0f14');T('LIVE',10,209,1,'#fff','center',null);
 const vis=Math.min(G.ticker.length,Math.floor(G.tickerT*60));T(G.ticker.slice(0,vis),24,209,1,'#f1e6d0','left',null);
 T(muted?'M:SOUND OFF':'M:SOUND',W-3,209,1,'#7a6a5a','right',null);
 if(G.pin&&!G.pin.d.cpu){const P=G.pin,y=PY(P.d.z)-40,x=clamp(PX(bodyX(P.d),P.d.z),82,W-82);T(P.ropes?(coarse?'PUSH THE PAD TO GRAB THE ROPES!':'PUSH A DIRECTION TO GRAB THE ROPES!'):(coarse?'TAP OR WIGGLE THE STICK TO KICK OUT!':'MASH OR WIGGLE TO KICK OUT!'),x,y,1,Math.floor(G.t*8)%2?'#ffd35a':'#fff','center');
  R(x-30,y+7,60,4,'#000');R(x-29,y+8,58*clamp(P.presses/Math.min(P.need,60),0,1),2,'#33d17a');
  if(P.d.meter>=100&&!P.d.usedSW)T(coarse?'OR PRESS FINISH FOR A SECOND WIND!':('OR PRESS '+(P.d.idx?'I':'R')+' FOR A SECOND WIND!'),x,y+14,1,Math.floor(G.t*8)%2?'#ff8a1f':'#fff','center');}}
const HPG=(()=>{const a=[224,48,64],b=[48,96,232],o=[];for(let k=0;k<24;k++){const t=k/23;o.push(`rgb(${lerp(a[0],b[0],t)|0},${lerp(a[1],b[1],t)|0},${lerp(a[2],b[2],t)|0})`);}return o;})();
function hpBar(f,x,y,d){const w=140,x0=d>0?x+2:x-w-2;
 T(f.ch.name+(f.cpu?' (CPU)':''),d>0?x0:x0+w,y,1,f.ch.align==='heel'?'#9cff57':'#fff',d>0?'left':'right','#000');
 const by=y+7;R(x0-1,by-1,w+2,9,'#000');R(x0,by,w,7,'#f2f2f2');R(x0+1,by+1,w-2,5,'#1a1020');
 const iw=w-2,hs=Math.round(iw*f.hpShow/100),hv=Math.round(iw*f.hp/100);
 R(d>0?x0+1:x0+1+iw-hs,by+1,hs,5,'#ffffff');
 for(let k=0;k<24;k++){const sx=Math.floor(iw*k/24),ex=Math.floor(iw*(k+1)/24);const a0=d>0?sx:iw-ex,a1=d>0?ex:iw-sx;const L=d>0?0:iw-hv,Rr=d>0?hv:iw;const s0=Math.max(a0,L),s1=Math.min(a1,Rr);if(s1>s0){R(x0+1+s0,by+1,s1-s0,5,HPG[k]);R(x0+1+s0,by+1,s1-s0,1,'rgba(255,255,255,0.45)');}}
 const mw=70,mx=d>0?x0:x0+w-mw;R(mx-1,by+9,mw+2,4,'#000');const full=f.meter>=100,mv=Math.round(mw*f.meter/100);
 R(d>0?mx:mx+mw-mv,by+10,mv,2,full?(Math.floor(G.t*8)%2?'#ffd35a':'#ff8a1f'):'#c99a2a');
 if(full){const key=f.cpu?'':(f.idx===0?(coarse?' [FINISH]':' [R]'):' [I]');T('* READY'+key,d>0?mx+mw+3:mx-3,by+9,1,'#ffd35a',d>0?'left':'right','#000');}}


// crowd meter: centre top, under the pause button. Cold = blue, warming = gold, hot = flashing orange "ON FIRE"
function drawCrowd(){if(G.entrance)return;const v=clamp(G.hype,0,1),hot=v>=CTR.crowd.hot,x=W/2-36,y=coarse?29:24,w=72;
 const col=hot?(Math.floor(G.t*8)%2?'#ff8a1f':'#ffd35a'):v>0.5?'#ffd35a':'#5aa8ff';
 T(hot?'CROWD: ON FIRE!':'CROWD',W/2,y-7,1,hot?col:'#bfae98','center','#000');
 R(x-1,y-1,w+2,6,'#000');R(x,y,w,4,'#2a1418');R(x,y,Math.round(w*v),4,col);R(x+Math.round(w*CTR.crowd.hot),y-1,1,6,'#fff');}

// ---- one fighter's sprite, with optional body-part layers (cut-out pieces drawn in front of / behind the other wrestler)
function fArgs(f){const ds=depthS(f.z);
  let jx=0,jy=0,ky=1;if(TEST_MODES){const lk=(G.t-(f.landAt||-9))/0.28;if(lk>=0&&lk<1)jy=-Math.sin(lk*Math.PI)*5*(1-lk); // a body bounces once off the mat
   if(lk>=0&&lk<0.45)ky=1-0.13*Math.sin(lk/0.45*Math.PI);                                                                        // squash as it lands
   if((f.state==='jump'||f.state==='dropkick'||f.state==='dive')&&f.y>2)ky=1+clamp(Math.abs(f.vy)/420,0,1)*0.09;                // stretch while flying fast
   const w=windOf(f.state);if(w&&f.t<w+0.03)jx=-f.dir*Math.min(2,f.t*60);}                                                 // lean back into the wind-up
  const fx_=PX(f.x,f.z)+jx,fy_=PY(f.z)-f.y*ds+jy+(f.state==='dropdown'&&frameOf(f)==='pinning'?CTR.dodge.dropDy*ds:0),fr=frameOf(f),dsc=ds*(f.ch.drawScale||1);
 return {fr,fx_,fy_,ds,dsc,ky,gx:fx_+(f.dox||0)*ds,gy:fy_-(f.doy||0)*ds,gd:f.dir*(f.turn||1)*(f.flipX?-1:1)*(FLIP_FR[artId(f)]&&FLIP_FR[artId(f)][fr]?-1:1)};}
// frames drawn mirrored for one wrestler (Viral's pin cover faces the other way so the bodies line up)
const FLIP_FR={viral:{pinning:1}};
// the transform drawSpr uses, as a matrix from sprite units (0..SW, 0..SH) to the canvas
function sprM(f,A){let m=ctx.getTransform(),sx=A.gx,sy=A.gy;
 if(f.rot){m=m.translate(Math.round(A.gx),Math.round(A.gy-28*A.dsc)).rotate(f.rot*f.dir);sx=0;sy=28*A.dsc;}
 sx=Math.round(sx);sy=Math.round(sy);const sh=A.dsc*A.ky,sw=A.dsc/Math.sqrt(A.ky);
 if(A.gd>=0)return m.translate(sx-AX*sw,sy-AY*sh).scale(sw,sh);
 return m.translate(sx,0).scale(-1,1).translate(-AX*sw,sy-AY*sh).scale(sw,sh);}
function lpPath(L,pick){for(const q of L)if(pick(q)&&q.pts.length>2){ctx.moveTo(q.pts[0][0],q.pts[0][1]);for(const p of q.pts.slice(1))ctx.lineTo(p[0],p[1]);ctx.closePath();}}
function fDraw(f,A,L,mode){const M=sprM(f,A),prev=ctx.getTransform();
 const raw=()=>{if(f.rot){ctx.save();ctx.translate(Math.round(A.gx),Math.round(A.gy-28*A.dsc));ctx.rotate(f.rot*Math.PI/180*f.dir);drawSpr(f.set,A.fr,0,28*A.dsc,A.gd,A.dsc,A.ky);ctx.restore();}
  else drawSpr(f.set,A.fr,A.gx,A.gy,A.gd,A.dsc,A.ky);};
 if(mode==='main'){f._M=M;f._fr=A.fr;f._A=A;}
 const back=L&&L.some(q=>!q.front);
 if(mode==='main'&&!back){raw();return;}
 ctx.save();ctx.setTransform(M);ctx.beginPath();
 if(mode==='main'){ctx.rect(-4000,-4000,9000,9000);lpPath(L,q=>!q.front);ctx.setTransform(prev);ctx.clip('evenodd');}
 else{lpPath(L,mode==='front'?q=>q.front:q=>!q.front);ctx.setTransform(prev);ctx.clip();}
 raw();ctx.restore();}
// layer data: baked into the game (LAYERS_DEF), plus edits saved on this device (test link only)
const LAYERS_DEF={};
let LAYERS_LOCAL=null;try{if(TEST_MODES)LAYERS_LOCAL=JSON.parse(localStorage.getItem('bb_layers')||'null');}catch(e){}
function lpOf(f,fr){const k=artId(f)+'|'+fr;return (LAYERS_LOCAL&&LAYERS_LOCAL[k])||LAYERS_DEF[k]||null;}
