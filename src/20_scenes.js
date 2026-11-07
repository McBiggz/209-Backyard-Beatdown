// ================= SCENES =================
const TITLE_BTNS=[[122,158,140,11],[122,171,140,11],[122,184,140,11],[122,197,140,11]];
let TITLE_F=null;
function updTitle(){G.tut=null;if(hit(['KeyW','ArrowUp']))G.menu=Math.max(0,G.menu-1);if(hit(['KeyS','ArrowDown']))G.menu=Math.min(3,G.menu+1);let go=confirmP();
 if(clickQ)TITLE_BTNS.forEach((r,i)=>{if(inRect(clickQ,r)){G.menu=i;go=true;}});
 if(go&&G.menu===2){G.scene='lobby';netUI.show(true);sfx('punch');return;}
 if(go){G.mode=G.menu;G.scene='select';G.sel={c:[0,ROSTER.findIndex(c=>c.id==='papi')],stage:0,picks:[null,null]};sfx('punch');}}
function drawTitle(){drawArena();drawRingBack();
 if(!TITLE_F){TITLE_F=[makeFighter(ROSTER[0],-120,40,1,false,0),makeFighter(ROSTER.find(c=>c.id==='papi'),120,40,-1,false,1)];TITLE_F.forEach(f=>{f.set=SETS[f.ch.id];f.state='win';});}
 for(const f of TITLE_F){if(wide()){G.cam=0;f.x=f.idx?205:110;f.z=140;}else{f.x=f.idx?120:-120;f.z=40;}shadowOf(f,f.ch.size);drawSpr(f.set,'win'+(Math.floor(G.t*2.5+f.idx)%2),PX(f.x,f.z),PY(f.z),f.dir,f.ch.drawScale||1);}
 drawRingFront();R(0,0,W,H,'rgba(6,2,3,0.6)');
 logo('T',192,78+(Math.floor(G.t*2)%2));
 R(122,140,140,16,'#8f0f14');R(122,140,140,1,'#ffd35a');R(122,155,140,1,'#ffd35a');T('BACKYARD BRAWL',192,143,2,'#ffd35a','center','#2a0405');
 ['1 PLAYER VS CPU','2 PLAYERS (SAME SCREEN)','PLAY ONLINE','TUTORIAL & PRACTICE'].forEach((s,i)=>{const r=TITLE_BTNS[i],on=G.menu===i;BOX(r[0],r[1],r[2],r[3],on?'#8f0f14':'#140a0c',on?'#ffd35a':'#5a4a40');T((on?'> ':'')+s,192,r[1]+3,1,on?'#fff':'#bfae98','center',null);});
 T(coarse?'TAP A MODE':'W/S CHOOSE  •  ENTER START',192,210,1,'#bfae98','center','#000');}
const CARD={x:4,y:24,w:52,h:78,gap:2,cols:7};
const PER=14,pageOf=i=>Math.floor(i/PER),PAGES=()=>Math.ceil(ROSTER.length/PER);
const PAGE_BTN=[226,3,66,11];
const cardRect=i=>(i=i%PER,[CARD.x+(i%CARD.cols)*(CARD.w+CARD.gap),CARD.y+Math.floor(i/CARD.cols)*(CARD.h+CARD.gap),CARD.w,CARD.h]);
const vmove=(c,d,n)=>{const v=c+d*CARD.cols;if(pageOf(v)!==pageOf(c))return c;return v>=0&&v<n?v:c;};
const STAGE_BTN=[296,3,84,11];
function updSelect(){const S=G.sel,n=ROSTER.length;
 if(G.mode===2&&hit(['Escape'])){NET.leave();G.scene='title';return;}
 if((G.mode!==2||NET.role==='host')&&(hit(['KeyT','Tab'])||(clickQ&&inRect(clickQ,STAGE_BTN)))){G.stage=(G.stage+1)%4;G.cam=0;sfx('punch');clickQ=null;}
 if(hit(['Escape'])){if(S.stage>0&&G.mode===0){S.stage=0;S.picks[0]=null;}else G.scene='title';return;}
 const lockIn=w=>{S.picks[w]=S.c[w];sfx('kick');};
 if(S.page==null)S.page=0;
 const flip=d=>{const P=PAGES();S.page=(S.page+d+P)%P;for(let w=0;w<2;w++)if(S.picks[w]==null&&(G.mode===1||S.stage===w))S.c[w]=Math.min(n-1,S.page*PER+(S.c[w]%PER));sfx('punch');};
 if(hit(['KeyQ','KeyE','PageUp','PageDown','BracketLeft','BracketRight']))flip(hit(['KeyQ','PageUp','BracketLeft'])?-1:1);
 if(clickQ&&inRect(clickQ,PAGE_BTN)){flip(clickQ.x<PAGE_BTN[0]+PAGE_BTN[2]/2?-1:1);clickQ=null;}
 const nav=(w,L,Rr,U,D)=>{const o=S.c[w];if(hit(L))S.c[w]=(S.c[w]+n-1)%n;if(hit(Rr))S.c[w]=(S.c[w]+1)%n;if(hit(U))S.c[w]=vmove(S.c[w],-1,n);if(hit(D))S.c[w]=vmove(S.c[w],1,n);if(S.c[w]!==o)S.page=pageOf(S.c[w]);};
 if(G.mode===2){if(S.picks[0]==null){nav(0,['KeyA','ArrowLeft'],['KeyD','ArrowRight'],['KeyW','ArrowUp'],['KeyS','ArrowDown']);
   let lk=confirmP();if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){S.c[0]=i;lk=true;break;}
   if(lk){lockIn(0);S.stage=1;NET.pick(S.c[0]);}}return;}
 if(G.mode===3){nav(0,['KeyA','ArrowLeft'],['KeyD','ArrowRight'],['KeyW','ArrowUp'],['KeyS','ArrowDown']);
  let lk=confirmP();if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){S.c[0]=i;lk=true;break;}
  if(lk){lockIn(0);const dum=ROSTER.findIndex(c=>c.id===(ROSTER[S.c[0]].id==='bigmf'?'papi':'bigmf'));S.picks[1]=dum;startIntro();G.scene='fight';tutStart();}return;}
 if(G.mode===0){const w=S.stage;nav(w,['KeyA','ArrowLeft'],['KeyD','ArrowRight'],['KeyW','ArrowUp'],['KeyS','ArrowDown']);
  if(confirmP()||hit(['KeyJ'])){lockIn(w);S.stage++;if(S.stage<2)S.page=pageOf(S.c[1]);}
  if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){S.c[w]=i;lockIn(w);S.stage++;break;}
  if(S.stage>=2)startIntro();}
 else{if(S.picks[0]==null){nav(0,['KeyA'],['KeyD'],['KeyW'],['KeyS']);if(hit(['KeyF','Space']))lockIn(0);}
  if(S.picks[1]==null){nav(1,['ArrowLeft'],['ArrowRight'],['ArrowUp'],['ArrowDown']);if(hit(['KeyJ','Enter','NumpadEnter','Numpad1']))lockIn(1);}
  if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){const w=S.picks[0]==null?0:1;if(S.picks[w]==null){S.c[w]=i;lockIn(w);}break;}
  if(S.picks[0]!=null&&S.picks[1]!=null)startIntro();}}
function drawSelect(){drawArena();R(0,0,W,H,'rgba(6,2,3,0.8)');const S=G.sel;
 T('CHOOSE YOUR WRESTLER',114,4,2,'#ffd35a','center','#5a0608');
 T(G.mode===3?'TUTORIAL: PICK YOUR WRESTLER':G.mode===2?(S.picks[0]==null?'ONLINE: PICK YOUR WRESTLER':'LOCKED IN • WAITING FOR OPPONENT...'):G.mode===0?(S.stage===0?'PLAYER 1: PICK YOUR WRESTLER':'NOW PICK YOUR CPU OPPONENT'):'P1: WASD + F     P2: ARROWS + J',114,15,1,G.mode===2&&S.picks[0]!=null?'#ffd35a':'#e9dcc6','center',null);
 BOX(...STAGE_BTN,'#8f0f14','#ffd35a');T('LEVEL: '+['THE DEN','OUTDOOR','BMF RANCH','RANCH: FULL'][G.stage],STAGE_BTN[0]+42,STAGE_BTN[1]+3,1,'#fff','center',null);
 if(S.page==null)S.page=0;
 {const P=PAGES();BOX(...PAGE_BTN,'#140a0c','#ffd35a');T('< PAGE '+(S.page+1)+'/'+P+' >',PAGE_BTN[0]+PAGE_BTN[2]/2,PAGE_BTN[1]+3,1,'#ffd35a','center',null);}
 ROSTER.forEach((ch,i)=>{if(pageOf(i)!==S.page)return;const[x,y,w,h]=cardRect(i);const bc=['#111111','#161616','#141414'].includes(ch.trunks)?ch.accent:ch.trunks;
  R(x,y,w,h,'#140a0c');for(let k=0;k<4;k++)R(x,y+k*14,w,14,shade(bc,-0.45-k*0.12));
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h-9);ctx.clip();const st=SETS[ch.id],fy=Math.max(y+h-12,y+4+(AY-(st.idle0_top||20)));ELL(x+w/2,fy,12,2,'rgba(0,0,0,0.35)');drawSpr(st,'idle'+(Math.floor(G.t*1.6+i)%2),x+w/2,fy,1);ctx.restore();
  R(x,y+h-9,w,9,'#0a0506');T(cardName(ch),x+w/2,y+h-7,1,'#fff','center',null);
  R(x+1,y+1,ch.align==='heel'?17:17,7,ch.align==='heel'?'#1c8f3a':'#8f0f14');T(ch.align==='heel'?'HEEL':'FACE',x+2,y+2,1,'#fff','left',null);
  for(let who=0;who<2;who++){if(G.mode===0&&S.stage<who&&S.picks[who]==null)continue;if(G.mode===3&&who===1)continue;if(G.mode===2&&who===1)continue;if(G.mode===0&&S.stage!==who&&S.picks[who]==null)continue;
   const isC=S.picks[who]==null?S.c[who]===i:S.picks[who]===i;if(!isC)continue;const col=who===0?'#ff4a3a':'#3a8bff',lk=S.picks[who]===i;
   const th=lk?2:1;R(x-th+who,y-th+who,w+th*2-who*2,th,col);R(x-th+who,y+h-who,w+th*2-who*2,th,col);R(x-th+who,y+who,th,h-who*2,col);R(x+w-who,y+who,th,h-who*2,col);
   const lbl=(who===0?'P1':(G.mode===0?'CPU':'P2'))+(lk?'✓':'');R(x+w-TW(lbl)-3,y+1+who*8,TW(lbl)+2,7,col);T(lbl,x+w-2,y+2+who*8,1,'#fff','right',null);}});
 for(let who=0;who<2;who++){if(G.mode===0&&S.stage<who&&S.picks[who]==null)continue;if(G.mode===3&&who===1)continue;if(G.mode===2&&who===1){BOX(194,184,186,22,'#140a0c','#3a8bff');T(NET.theirPick!=null?'OPPONENT IS LOCKED IN':'OPPONENT IS PICKING...',287,192,1,'#bfae98','center',null);continue;}const ch=ROSTER[S.picks[who]!=null?S.picks[who]:S.c[who]],px=who?194:4,py=184;
  BOX(px,py,186,22,'#140a0c',who?'#3a8bff':'#ff4a3a');T(ch.name,px+3,py+3,1,'#fff','left',null);T(ch.tag+' • '+(ch.align==='heel'?'HEEL':'FACE'),px+3,py+10,1,'#bfae98','left',null);
  [['POW',ch.pow/1.3],['SPD',ch.spd/1.25],['SIZ',ch.size/1.22]].forEach(([l,v],j)=>{const xx=px+112,yy=py+3+j*6;T(l,xx,yy,1,'#8a7a66','left',null);R(xx+14,yy,56,4,'#2a1a1c');R(xx+14,yy,Math.round(56*v),4,'#ffd35a');});
  T(ch.fin,px+3,py+16,1,ch.accent==='#141414'?'#fff':ch.accent,'left',null);}
 T(coarse?'TAP A WRESTLER • TAP PAGE OR LEVEL TO SWITCH':'MOVE • ENTER/F LOCK IN • Q/E PAGE • T LEVEL • ESC BACK',192,209,1,'#8a7a66','center',null);}
function startIntro(){const S=G.sel;const c0=ROSTER[S.picks[0]],c1=ROSTER[S.picks[1]];
 G.f=[makeFighter(c0,-40,32,1,false,0),makeFighter(c1,40,32,-1,G.mode===0,1)];G.f.forEach(f=>f.set=SETS[f.ch.id]);
 if(c0.id===c1.id){const alt=Object.assign({},c1,{trunks:c1.accent,accent:c1.trunks,name:c1.name+' II',short:c1.short+' II',id:c1.id+'_alt'});if(!SETS[alt.id])buildWrestler(alt);G.f[1].ch=alt;G.f[1].set=SETS[alt.id];}
 G.scene='intro';G.introT=0;sfx('roar');}
function beginFight(){const[a,b]=G.f;
 // every match gets a seed; a replay re-uses the recorded one
 const seed=G.replay&&G.replay.seed!=null?G.replay.seed:G.forceSeed!=null?G.forceSeed:G.net?G.net.seed:(Math.random()*4294967296)>>>0;SIM.seed=seed;if(G.net)G.net.onBegin();AIR.seed=seed^0x9E3779B9;
 G.t=0;G.rope={side:0,t:9};irpReset(); // the match clock starts at zero for everyone, so online players stay in step
 G.rec={v:1,seed,p:[a.ch.id,b.ch.id],cpu:[a.cpu,b.cpu],wide:wide(),inp:[]};G.fstep=0;
 if(wide()){XMIN=52;XMAX=262;ZMIN=125;ZMAX=154;}else{XMIN=-160;XMAX=160;ZMIN=3;ZMAX=61;}
 for(const f of [a,b]){const ch=f.ch,set=f.set;Object.assign(f,makeFighter(ch,f.idx===0?-40:40,32,f.idx===0?1:-1,f.cpu,f.idx));f.set=set;f.out=false;}
 G.co={t:0,n:0};
 if(wide()){a.x=110;b.x=205;a.z=b.z=140;a.hidden=b.hidden=true;G.entrance={i:0,t:0,phase:'show'};G.cam=264;}else G.entrance=null;
 G.ref={x:wide()?157:0,z:wide()?127:8,y:0,dir:1,mode:'idle',walkPh:0,slap:0,moving:false};
 G.pin=null;G.over=null;G.parts=[];G.pops=[];G.hype=0.35;G.paused=false;G.slow=1;G.slowT=0;G.hitStop=0;
 G.scene='fight';if(!G.entrance){sfx('bell');callout('DING DING DING!','#fff',1.3);}
 say(coarse?'THUMB PAD TO MOVE · PUNCH/KICK/GRAB · JUMP AT ROPES TO ROLL OUT':'WASD move · SPACE jump · F punch · G kick · H grab/pin · R finisher');}
function drawIntro(){drawArena();R(0,0,W,H,'rgba(6,2,3,0.75)');const t=G.introT,[a,b]=G.f,e=1-Math.pow(1-Math.min(1,t/0.4),3);
 T(G.stage>=2?"TONIGHT • LIVE FROM THE BMF RANCH":"TONIGHT • LIVE FROM THE 209 DRAGON'S DEN",192,10,1,'#bfae98','center',null);
 for(let y=24;y<180;y++){const k=(y-24)/156;R(0,y,Math.round(190-k*30),1,shade(a.ch.trunks==='#141414'?a.ch.accent:a.ch.trunks,-0.55));R(W-Math.round(190-k*30)+30*0,y,Math.round(190-k*30),1,shade(b.ch.trunks==='#141414'?b.ch.accent:b.ch.trunks,-0.55));}
 const ax=Math.round(lerp(-80,96,e)),bx=Math.round(lerp(W+80,W-96,e)),fr='win'+(Math.floor(t*2.5)%2);
 drawSpr(a.set,fr,ax,170,1,2);drawSpr(b.set,fr,bx,170,-1,2);
 T(a.ch.name,ax,182,1,'#fff','center');T(b.ch.name+(b.cpu?' (CPU)':''),bx,182,1,b.ch.align==='heel'?'#9cff57':'#fff','center');
 if(t>0.5)T('VS',192,90,t<0.62?6:4,'#ffd35a','center','#5a0608');
 T(coarse?'TAP TO SKIP':'ENTER TO SKIP',192,206,1,'#7a6a5a','center',null);}
const OVER_BTNS=[[122,128,140,14],[122,146,140,14],[122,164,140,14]];
const PAUSE_BTNS=[[132,136,120,14],[132,156,120,14]];
function updFight(dt){
 if(G.net){if(G.net.updFightMeta)G.net.updFightMeta();}
 else if(!G.over&&hit(['Escape','KeyP']))G.paused=!G.paused;
 if(G.paused){if(hit(['KeyQ'])){G.paused=false;G.scene='title';}if(clickQ){if(inRect(clickQ,PAUSE_BTNS[0]))G.paused=false;else if(inRect(clickQ,PAUSE_BTNS[1])){G.paused=false;G.scene='title';}}return;}
 if(hit(['KeyM']))toggleMute();
 if(G.tut){tutMeta();tutStep(dt);}
 if(G.over){G.over.t+=dt;if(G.over.t>1.8&&!G.net){
  if(confirmP()||(clickQ&&inRect(clickQ,OVER_BTNS[0])))beginFight();
  else if(hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1]))){G.scene='select';G.sel={c:[G.sel.picks[0],G.sel.picks[1]],stage:0,picks:[null,null]};}
  else if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,OVER_BTNS[2])))G.scene='title';}}
 if(wide()&&!G.paused){const E=G.entrance,ef=E?G.f[[1,0][Math.min(E.i,1)]]:null;const fx=E?(E.phase==='show'?513:ef.x):(G.f[0].x+G.f[1].x)/2;G.cam=lerp(G.cam,clamp(fx-192,0,MAPW-W),1-Math.exp(-dt*(E?3:5)));}
 if(G.entrance){updEntrance(dt);updRef(dt);return;}
 if(G.hitStop>0){G.hitStop-=dt;return;}
 if(wide()&&!G.over&&!G.pin){if(G.f[0].out||G.f[1].out){G.co.t+=dt;if(G.co.t>=1){G.co.t-=1;G.co.n++;sfx('count');pop(PX(G.ref.x,G.ref.z),G.ref.z-78,G.co.n+'!','#fff');
   if(G.co.n>=10){const[a,b]=G.f;if(a.out&&b.out){G.over={w:null,l:null,t:0,how:'DOUBLE COUNT-OUT'};callout('DOUBLE COUNT-OUT!','#ff4a3a',1.6);}else{const w=a.out?b:a,l=a.out?a:b;G.over={w,l,t:0,how:'COUNT-OUT'};setState(w,'win');G.ref.mode='raise';callout('COUNT-OUT!','#ff4a3a',1.6);say(`${l.ch.short} is counted out! Your winner... ${w.ch.name}!`);}setTimeout(()=>sfx('bell'),200);sfx('roar');}}}
  else G.co={t:0,n:0};}
 if(G.slowT>0){G.slowT-=dt;if(G.slowT<=0)G.slow=1;}
 const sdt=dt*G.slow;G.rope.t+=sdt;
 // this step's inputs: from the network / replay tape if there is one, otherwise from the controls and CPU
 let inp=G.stepInp?[unpackInp(G.stepInp[0]),unpackInp(G.stepInp[1])]:[G.f[0].cpu?aiInput(G.f[0],G.f[1],sdt):humanInput(0),G.f[1].cpu?aiInput(G.f[1],G.f[0],sdt):humanInput(1)];
 if(G.over)inp=[blank(),blank()];
 if(G.tut&&!G.stepInp&&!G.over)inp[1]=tutDummyInput();
 G.curInp=[packInp(inp[0]),packInp(inp[1])];G.f[0].inp=inp[0];G.f[1].inp=inp[1];
 if(G.pin)updPin(sdt,inp);
 if(G.scene!=='fight')return;
 updFighter(G.f[0],G.f[1],inp[0],sdt);updFighter(G.f[1],G.f[0],inp[1],sdt);separate(G.f[0],G.f[1]);updRef(sdt);
 // the crowd gets hotter as the match goes on and the wrestlers wear down
 {const[a,b]=G.f,floor=0.15+Math.min(0.25,G.fstep/12000)+clamp((200-a.hp-b.hp)/200,0,1)*0.25;G.hype=Math.max(floor,G.hype-sdt*0.07);}
 G.chantT-=dt;if(G.chantT<=0){G.chantT=rnd(3,7);if(G.hype>0.5)pop(rnd(90,300),rnd(64,78),pick(['2-0-9! 2-0-9!','THIS IS AWESOME!','DEN! DEN!',"LET'S GO!"]),'#f1e6d0');}}
function updEntrance(dt){const E=G.entrance;E.t+=dt;const order=[1,0],f=G.f[order[E.i]];
 const skip=G.net?(G.stepInp&&((G.stepInp[0]|G.stepInp[1])&(16|32))):(confirmP()||clickQ);
 if(E.t>0.3&&skip){finishEntrance();return;}
 if(E.phase==='show'){if(E.t<dt*1.5){callout(f.ch.name,'#fff',1.8);sfx('roar');G.hype=0.8;}if(E.t>1.8){E.phase='walk';E.t=0;f.hidden=false;f.out=true;f.x=513;f.z=160;f.dir=-1;setState(f,'walk');for(let k=0;k<30;k++)part(PX(513,160)+rnd(-20,20),160+rnd(-30,0),rnd(-30,30),rnd(-40,-5),rnd(0.6,1.2),pick(['#b050ff','#e0a0ff','#7a30c0']),2,'dust');}}
 else if(E.phase==='walk'){const tx=296,tz=168,dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);f.walkPh+=dt*11;f.state='walk';f.dir=dx<0?-1:1;
  if(d<3){startRoll(f,ringX(150)[1]-6,150,false);E.phase='roll';}else{f.x+=dx/d*120*dt;f.z+=dz/d*120*dt;}}
 else if(E.phase==='roll'){f.t+=dt;updRoll(f,dt);if(f.state!=='roll')E.phase='place';}
 else if(E.phase==='place'){const tx=order[E.i]===0?110:205,tz=140,dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);
  if(d<2){f.dir=order[E.i]===0?1:-1;setState(f,'win');E.i++;E.t=0;if(E.i>=2){finishEntrance();}else E.phase='show';}
  else{f.state='walk';f.walkPh+=dt*11;f.dir=dx<0?-1:1;f.x+=dx/d*90*dt;f.z+=dz/d*90*dt;}}}
function finishEntrance(){const[a,b]=G.f;a.x=110;b.x=205;a.z=b.z=140;a.dir=1;b.dir=-1;for(const f of G.f){f.hidden=false;f.out=false;f.y=0;setState(f,'idle');}G.entrance=null;sfx('bell');callout('DING DING DING!','#fff',1.3);
 say(coarse?'Roll out of the ring: push into the ropes + JUMP.':'WASD MOVE · SPACE JUMP · F/G/H ATTACK · R FINISHER · ROPES+SPACE: ROLL OUT');}
function toggleMute(){muted=!muted;if(master)master.gain.value=muted?0:0.5;}
function drawFight(){if(G.entrance&&G.entrance.phase==='show'){drawEntranceShow();return;}drawArena();drawRingBack();drawFighters();G.f.forEach(drawCtrIcon);drawParts();drawRingFront();drawPops();drawCallout();}
function drawEntranceShow(){const E=G.entrance,f=G.f[[1,0][E.i]];ctx.drawImage(ENT,0,0,W,H);
 const a=clamp(E.t/0.6,0,1);for(let k=0;k<5;k++){ctx.globalAlpha=0.18*a;ELL(192,186,60+k*6,10,'#c070ff');}ctx.globalAlpha=1;
 if(E.t>0.5)drawSpr(f.set,'win'+(Math.floor(G.t*2.5)%2),192,196,f.idx===1?-1:1,1.5*(f.ch.drawScale||1));
 if(E.t>0.4){R(0,170,W,30,'rgba(6,2,3,0.72)');T(f.ch.name,192,176,2,f.ch.align==='heel'?'#9cff57':'#ffd35a','center','#000');T(f.cpu?'CPU':(f.idx===0?'PLAYER 1':'PLAYER 2'),192,190,1,'#bfae98','center',null);}
 T(coarse?'TAP TO SKIP':'ENTER TO SKIP',W-4,206,1,'#7a6a5a','right',null);}
function drawOverlays(){if(G.scene!=='fight')return;if(G.entrance){if(G.entrance.phase!=='show'){R(0,207,W,9,'#0a0506');T('ENTRANCE • '+G.f[[1,0][Math.min(G.entrance.i,1)]].ch.name,192,209,1,'#ffd35a','center',null);}return;}drawHUD();
 if(wide()&&G.co.n>0&&!G.over){BOX(158,30,68,13,'#140a0c','#ffd35a');T('COUNT '+G.co.n,192,34,1,G.co.n>=7?'#ff4a3a':'#fff','center',null);}
 if(G.over&&G.over.t>1.8){const w=G.over.w||{ch:{name:'NO CONTEST'}};R(0,0,W,H,'rgba(6,2,3,0.65)');T('WINNER',192,62,1,'#bfae98','center',null);
  T(w.ch.name,192,74,TW(w.ch.name,3)>360?2:3,'#ffd35a','center','#5a0608');T(G.over.how&&G.over.how!=='PINFALL'?G.over.how:'BY PINFALL • 1-2-3',192,98,1,'#e9dcc6','center',null);
  ['REMATCH (ENTER)','CHANGE WRESTLERS (ESC)',G.net?'LEAVE ONLINE (Q)':'MAIN MENU (Q)'].forEach((s,i)=>{const r=OVER_BTNS[i];BOX(...r,i?'#140a0c':'#8f0f14','#ffd35a');T(s,192,r[1]+5,1,'#fff','center',null);});}
 if(G.paused){R(0,0,W,H,'rgba(6,2,3,0.8)');T('PAUSED',192,50,4,'#ffd35a','center','#5a0608');
  T('P1: WASD MOVE · SPACE JUMP · F PUNCH · G KICK · H GRAB/PIN · R FINISHER',192,80,1,'#e9dcc6','center',null);
  if(G.mode===1)T('P2: ARROWS · U JUMP · J PUNCH · K KICK · L GRAB/PIN · I FINISHER',192,90,1,'#e9dcc6','center',null);
  T('HOLD LEFT/RIGHT + GRAB TO WHIP INTO THE ROPES · CORNER + JUMP TO CLIMB',192,102,1,'#bfae98','center',null);T('PUSH INTO THE ROPES + JUMP TO ROLL OUT / BACK IN · BACK IN BY 10 OR LOSE!',192,110,1,'#bfae98','center',null);T('HOLD AWAY FROM YOUR OPPONENT TO BLOCK • WHIPPED? GRAB ON THE ICON TO REVERSE',192,118,1,'#ffd35a','center',null);T('DOUBLE-TAP TO RUN · RUNNING OR OFF THE ROPES: PUNCH = CLOTHESLINE, KICK = DROPKICK',192,126,1,'#ffd35a','center',null);
  [['RESUME (ESC)',0],['QUIT TO MENU (Q)',1]].forEach(([s,i])=>{const r=PAUSE_BTNS[i];BOX(...r,'#140a0c','#ffd35a');T(s,192,r[1]+5,1,'#fff','center',null);});}
 if(G.flash>0){R(0,0,W,H,`rgba(255,250,235,${G.flash.toFixed(2)})`);}}

