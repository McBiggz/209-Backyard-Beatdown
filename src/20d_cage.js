// ================= STEEL CAGE MATCH =================
// A chain-link cage around the ring. No count-outs, no rolling out. Win by pin, or by ESCAPING. No new buttons:
//  JUMP while pushing into a side wall    climb the cage (mash any button to climb faster); reach the top = you win
//  GRAB at the middle of the front ropes  open the door (mash to get it open faster); get through = you win
//  GRAB next to someone escaping          pull him off the cage / slam the door on him
const CAGE_SRC={panel:"__ASSET(props/cage_panel.png)__",post:"__ASSET(props/cage_post.png)__",door:"__ASSET(props/cage_door.png)__"};
const CAGE_IMG={};for(const k in CAGE_SRC){const im=new Image();im.src=CAGE_SRC[k];CAGE_IMG[k]=im;}
const CG=()=>(DATA.moves.cage||{});
// ring corners at mat level (world = screen in the wide arena)
const CAGE_C={BL:{x:82,z:121},BR:{x:227,z:121},FL:{x:42,z:158},FR:{x:271,z:158}};
const DOOR_X=156.5;
const ESCAPING=new Set(['cclimb','cdoor']);
HITTABLE.add('cdoor');
const mashed_=i=>!!(i&&(i.punchP||i.kickP||i.grabP||i.jumpP));
function cageEdge(f){const[a,b]=ringX(f.z);return f.x<=a+5?-1:f.x>=b-5?1:0;}
function atDoor(f){return f.z>=ZMAX-5&&Math.abs(f.x-DOOR_X)<24;}
function startEscape(f,kind,side){setState(f,kind);f.esc=0;f.escKind=kind;f.escSide=side;f.vx=f.vz=0;f.walkPh=0;
 if(kind==='cdoor'){f.dir=1;f.x=clamp(f.x,DOOR_X-6,DOOR_X+6);}else f.dir=side;sfx('grab');heat(0.08);
 say(kind==='cclimb'?`${f.ch.short} is climbing the cage!`:`${f.ch.short} is going for the door!`);}
function updEscape(f,o,I,dt){const g=CG();f.vx=f.vz=0;const m=mashed_(I);
 if(f.state==='cclimb'){f.esc+=dt/(g.climbTime||5)+(m?(g.mash||0.035):0);f.y=Math.min(1,f.esc)*(g.topY||96);f.walkPh+=dt*(m?14:6);}
 else{f.esc+=dt/(g.doorTime||3.5)+(m?(g.mash||0.035)*0.8:0);f.wiggle=m?0.12:Math.max(0,(f.wiggle||0)-dt);}
 if(f.esc>=1)cageEscaped(f,o);}
function cageEscaped(f,o){const climb=f.state==='cclimb';f.esc=0;f.escKind=null;f.out=true;f.y=0;f.vx=f.vz=0;
 if(climb){f.x=f.escSide<0?20:300;f.z=200;}else{f.x=DOOR_X;f.z=200;}
 G.over={w:f,l:o,t:0,how:climb?'ESCAPED OVER THE TOP':'ESCAPED THROUGH THE DOOR'};setState(f,'win');
 sfx('bell');sfx('roar');heat(0.4);G.flash=0.25;shake(6);irpMark('big');crowdReact(f,true);
 callout(f.ch.short+' ESCAPES!','#ffd35a',2.2);say(`${f.ch.name} ${climb?'goes over the top of the cage':'is through the door'} and wins!`);}
// pulled off the cage (or the door slammed on him): hurts more the higher he got
function stopEscape(o,by){const g=CG(),climb=o.state==='cclimb',h=o.y;o.esc=0;o.escKind=null;
 if(climb){damage(o,(g.fallDmg||6)+(g.fallDmgTop||14)*clamp(h/(g.topY||96),0,1),by);knock(o,-o.escSide*70,40,true);o.y=Math.max(h,1);
  callout('PULLED OFF THE CAGE!','#ff4a3a',1.2);say(`${by.ch.short} drags ${o.ch.short} off the cage!`);}
 else{damage(o,g.doorDmg||10,by);knock(o,0,120,true);o.z=ZMAX-8;callout('DOOR SLAMMED!','#ff4a3a',1.2);say(`${by.ch.short} slams the cage door on ${o.ch.short}!`);}
 sfx('slam');shake(8);G.hitStop=0.1;heat(0.15);irpMark('big');}

// CPU: when the opponent's down, sometimes go for an escape; always try to stop the other guy escaping
function cageCpu(f,o,I,dt){const a=f.ai,g=CG();
 if(ESCAPING.has(f.state)){if(arand()<dt*(g.cpuMash||7))I.punchP=true;return;}
 if(ESCAPING.has(o.state)){Object.assign(I,blank());const tx=o.x-(o.escKind==='cclimb'?o.escSide*14:0),tz=o.escKind==='cdoor'?ZMAX-8:o.z,dx=tx-f.x,dz=tz-f.z;
  if(Math.abs(dx)>10)I[dx>0?'right':'left']=true;if(Math.abs(dz)>5)I[dz>0?'down':'up']=true;
  if(Math.abs(o.x-f.x)<36&&Math.abs(o.z-f.z)<14&&FREE.has(f.state)&&arand()<dt*(g.cpuReact||5))I.grabP=true;return;}
 if(!FREE.has(f.state)){a.cg=null;return;}
 if(o.state==='down'&&o.out===f.out&&o.hp<(g.cpuOppHp||65)){if(a.cgFor!==o.sid){a.cgFor=o.sid;a.cg=null;
   if(arand()<(g.cpuTry||0.35)*(f.hp>o.hp?0.6:1.2)){const[l,r]=ringX(f.z),door=Math.abs(f.x-DOOR_X)+(ZMAX-f.z)*1.5,side=Math.min(f.x-l,r-f.x);
    a.cg=door<side?{k:'door',x:DOOR_X,z:ZMAX-2}:{k:'climb',side:f.x-l<r-f.x?-1:1,z:clamp(f.z,ZMIN+12,ZMAX-12)};}}}
 else if(o.state!=='getup')a.cg=null;
 const c=a.cg;if(!c)return;Object.assign(I,blank());
 if(c.k==='door'){const dx=c.x-f.x,dz=c.z-f.z;if(Math.abs(dx)>6)I[dx>0?'right':'left']=true;if(Math.abs(dz)>2)I[dz>0?'down':'up']=true;if(atDoor(f)){I.grabP=true;a.cg=null;}}
 else{const dz=c.z-f.z;if(Math.abs(dz)>4)I[dz>0?'down':'up']=true;I[c.side<0?'left':'right']=true;if(cageEdge(f)===c.side){I.jumpP=true;a.cg=null;}}}
function cageCpuAll(inp,dt){if(G.over)return;for(let i=0;i<2;i++)if(G.f[i].cpu)cageCpu(G.f[i],G.f[1-i],inp[i],dt);}
// before the wrestlers move
function cagePre(inp,dt){for(let i=0;i<2;i++){const f=G.f[i],o=G.f[1-i],I=inp[i];if(G.over)continue;
 if(ESCAPING.has(f.state)){updEscape(f,o,I,dt);Object.assign(I,blank());if(G.over)return;continue;}
 if(!FREE.has(f.state))continue;
 if(I.grabP&&ESCAPING.has(o.state)&&Math.abs(o.x-f.x)<40&&Math.abs(o.z-f.z)<16){I.grabP=false;
  // the higher he's got, the harder he is to drag down: past halfway he can kick you off
  if(o.state==='cclimb'&&!schance(clamp(1-(o.esc-0.5)*2,0,1))){setState(f,'hit');f.stun=0.5;f.vx=-o.escSide*-90;damage(f,4,o);sfx('hit');callout(o.ch.short+' KICKS HIM AWAY!','#5fe07a',1.0);heat(0.1);}
  else stopEscape(o,f);continue;}
 const mx=I.left?-1:I.right?1:0,e=cageEdge(f);
 if(I.jumpP&&e&&mx===e&&f.z>ZMIN+5&&f.z<ZMAX-5){I.jumpP=false;startEscape(f,'cclimb',e);continue;}
 const oNear=Math.abs(o.x-f.x)<36*f.ch.size&&Math.abs(o.z-f.z)<12&&(GRABBABLE.has(o.state)||o.state==='down');
 if(I.grabP&&atDoor(f)&&!oNear){I.grabP=false;startEscape(f,'cdoor',0);}}}
// after the wrestlers move: keep climbers on the wall, drop anyone knocked off it
function cagePost(dt){for(const f of G.f){
 if(ESCAPING.has(f.state)){const[a,b]=ringX(f.z);if(f.state==='cclimb'){f.x=f.escSide<0?a:b;f.y=Math.min(1,f.esc)*(CG().topY||96);}else{f.z=ZMAX;f.y=0;}}
 else if(f.escKind){f.escKind=null;f.esc=0;if(f.y>3&&!['fall','jump','dive','dropkick'].includes(f.state))knock(f,-(f.escSide||0)*60,30,true);}}}

// ---------- drawing ----------
// one wall = an image stretched between two corners, drawn in thin vertical strips so it follows the ring's angle
function cageWall(img,A,B,h){if(!img.complete||!img.naturalWidth)return;const iw=img.naturalWidth,ih=img.naturalHeight,N=12,sw=iw/N;
 for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,x0=lerp(A.x,B.x,u0),z0=lerp(A.z,B.z,u0),x1=lerp(A.x,B.x,u1),z1=lerp(A.z,B.z,u1),hh=h*depthS(z0);
  ctx.save();ctx.transform((x1-x0)/sw,(z1-z0)/sw,0,hh/ih,PX(x0,z0),PY(z0)-hh);ctx.drawImage(img,i*sw,0,sw+0.6,ih,0,0,sw+0.6,ih);ctx.restore();}}
function cagePostAt(C,h){const im=CAGE_IMG.post;if(!im.complete||!im.naturalWidth)return;const s=depthS(C.z),hh=(h+6)*s,w=hh*im.naturalWidth/im.naturalHeight;
 ctx.drawImage(im,PX(C.x,C.z)-w/2,PY(C.z)-hh,w,hh);}
const lerpP=(A,B,u)=>({x:lerp(A.x,B.x,u),z:lerp(A.z,B.z,u)});
function drawCageBack(){const h=CG().height||112,C=CAGE_C,P=CAGE_IMG.panel;ctx.save();ctx.imageSmoothingEnabled=true;
 const m=lerpP(C.BL,C.BR,0.5);cageWall(P,C.BL,m,h);cageWall(P,m,C.BR,h);cageWall(P,C.BL,C.FL,h);cageWall(P,C.BR,C.FR,h);
 cagePostAt(C.BL,h);cagePostAt(C.BR,h);cagePostAt(lerpP(C.BL,C.BR,0.5),h);ctx.restore();}
function drawCageFront(){const h=CG().height||112,C=CAGE_C,P=CAGE_IMG.panel,D=CAGE_IMG.door,dw=(CG().doorW||58)/(C.FR.x-C.FL.x);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.globalAlpha=CG().frontAlpha||0.85;const u0=(DOOR_X-C.FL.x)/(C.FR.x-C.FL.x)-dw/2,u1=u0+dw;
 const d0=lerpP(C.FL,C.FR,u0),d1=lerpP(C.FL,C.FR,u1);cageWall(P,C.FL,d0,h);cageWall(D,d0,d1,h);cageWall(P,d1,C.FR,h);
 ctx.globalAlpha=1;cagePostAt(C.FL,h);cagePostAt(C.FR,h);ctx.restore();}
function drawCageHint(){const me=G.f[0];if(G.over)return;
 // escape progress over anyone escaping
 for(const f of G.f)if(ESCAPING.has(f.state)){const x=clamp(PX(f.x,f.z),40,W-40),y=Math.max(46,PY(f.z)-f.y*depthS(f.z)-92*(f.ch.size||1));
  R(x-31,y-1,62,7,'#000');R(x-30,y,60*clamp(f.esc,0,1),5,'#5fe07a');T('ESCAPE',x,y-10,1,'#fff','center','#000');}
 if(me.cpu)return;let txt=null;const o=G.f[1];
 if(ESCAPING.has(me.state))txt=coarse?'TAP FAST TO ESCAPE!':'MASH TO ESCAPE!';
 else if(FREE.has(me.state)){if(ESCAPING.has(o.state)&&Math.abs(o.x-me.x)<60&&Math.abs(o.z-me.z)<20)txt=o.state==='cclimb'?(coarse?'GRAB: PULL HIM DOWN!':'H: PULL HIM DOWN!'):(coarse?'GRAB: SLAM THE DOOR!':'H: SLAM THE DOOR!');
  else if(atDoor(me))txt=coarse?'GRAB: OPEN THE DOOR':'H: OPEN THE DOOR';
  else if(cageEdge(me)&&me.z>ZMIN+5&&me.z<ZMAX-5)txt=coarse?'PUSH + JUMP: CLIMB THE CAGE':'PUSH + SPACE: CLIMB THE CAGE';}
 if(txt)T(txt,clamp(PX(me.x,me.z),80,W-80),Math.max(60,PY(me.z)-me.y*depthS(me.z)-104*(me.ch.size||1)),1,Math.floor(G.t*8)%2?'#ffd35a':'#fff','center','#000');}
