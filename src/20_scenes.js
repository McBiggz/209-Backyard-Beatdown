// unfinished modes only show up on the test link: add ?test=1 (or the older ?tag=1) to the address
const TEST_MODES=(q=>q.has('test')||q.has('tag')||q.has('rumble'))(new URLSearchParams(location.search));
// ================= SCENES =================
// title menu: label -> what it opens. Tag Team is built but hidden until it's ready (open the game with ?tag=1 to test it).
// the test link gets the new menu: every match type is set up on one screen, and online takes up to 4 players
// (Universe is still test-link only)
const TITLE_ITEMS=[['PLAY','setup'],['PLAY ONLINE (UP TO 4)','party']].concat(TEST_MODES?[['UNIVERSE MODE',6]]:[]).concat([['TUTORIAL & PRACTICE',3],['CLASSIC ONLINE 1 VS 1','online']]);
// one column; when there are more than 5 options (the test link) the list scrolls: swipe, mouse wheel, arrows or keys
const MENU_VIS=5,MENU_Y=157,MENU_ROW=11.4,MENU_BOX=[122,156,140,MENU_VIS*MENU_ROW+1];
const menuMax=()=>Math.max(0,TITLE_ITEMS.length-MENU_VIS);
let menuS=0,menuSTarget=0,menuLast=0;
const TITLE_BTNS_NOW=()=>TITLE_ITEMS.map((_,i)=>[122,MENU_Y+(i-menuS)*MENU_ROW,140,10]);
const MENU_UP=[264,157,14,12],MENU_DN=[264,201,14,12];
function menuScroll(d){menuSTarget=clamp(menuSTarget+d,0,menuMax());}
// swipe on the menu to scroll it (a short tap still picks an option)
let menuDrag=null,menuTap=null;cv.style.touchAction='none';addEventListener('pointercancel',()=>{menuDrag=null;});
cv.addEventListener('pointerdown',e=>{if(G.scene!=='title')return;const r=cv.getBoundingClientRect(),y=(e.clientY-r.top)/r.height*H,x=(e.clientX-r.left)/r.width*W;menuDrag={y0:y,s0:menuSTarget,moved:false,x,y};});
cv.addEventListener('pointermove',e=>{if(!menuDrag||G.scene!=='title')return;const r=cv.getBoundingClientRect(),y=(e.clientY-r.top)/r.height*H,dy=y-menuDrag.y0;if(Math.abs(dy)>5)menuDrag.moved=true;
 if(menuDrag.moved){menuSTarget=clamp(menuDrag.s0-dy/MENU_ROW,0,menuMax());menuS=menuSTarget;}});
addEventListener('pointerup',()=>{if(menuDrag&&!menuDrag.moved&&G.scene==='title')menuTap={x:menuDrag.x,y:menuDrag.y};if(menuDrag&&menuDrag.moved)menuSTarget=Math.round(menuSTarget);menuDrag=null;});
cv.addEventListener('wheel',e=>{if(G.scene!=='title')return;e.preventDefault();menuScroll(e.deltaY>0?1:-1);},{passive:false});
let TITLE_F=null;
function updTitle(){G.tut=null;if(hit(['KeyW','ArrowUp']))G.menu=Math.max(0,G.menu-1);if(hit(['KeyS','ArrowDown']))G.menu=Math.min(TITLE_ITEMS.length-1,G.menu+1);let go=confirmP();
 // taps are read on release (so a swipe doesn't pick anything); the tap must land inside the visible list
 clickQ=null;if(menuTap){const q=menuTap;menuTap=null;
  if(menuMax()&&inRect(q,MENU_UP))menuScroll(-1);else if(menuMax()&&inRect(q,MENU_DN))menuScroll(1);
  else if(inRect(q,MENU_BOX))TITLE_BTNS_NOW().forEach((r,i)=>{if(inRect(q,r)){G.menu=i;go=true;}});}
 // keep the highlighted option on screen, and glide the list
 if(G.menu!==menuLast){menuLast=G.menu;if(G.menu<menuSTarget)menuSTarget=G.menu;if(G.menu>menuSTarget+MENU_VIS-1)menuSTarget=G.menu-MENU_VIS+1;}
 if(!menuDrag)menuS+=(menuSTarget-menuS)*0.35;if(Math.abs(menuS-menuSTarget)<0.01)menuS=menuSTarget;
 const it=TITLE_ITEMS[G.menu];
 G.fromSetup=false;G.mapPick=null;
 if(go&&it[1]==='online'){G.scene='lobby';netUI.show(true);sfx('punch');return;}
 if(go&&it[1]==='setup'){msOpen(false);sfx('punch');return;}
 if(go&&it[1]==='party'){G.scene='lobby';partyUI.show(true);sfx('punch');return;}
 if(go){G.mode=it[1];G.hc=it[2]==='hc';G.cage=it[2]==='cage';if(G.hc||G.cage)G.stage=3;G.scene='select';G.sel={c:[0,ROSTER.findIndex(c=>c.id==='papi')],stage:0,picks:[null,null]};sfx('punch');}}
function drawTitle(){drawArena();drawRingBack();
 if(!TITLE_F){TITLE_F=[makeFighter(ROSTER[0],-120,40,1,false,0),makeFighter(ROSTER.find(c=>c.id==='papi'),120,40,-1,false,1)];TITLE_F.forEach(f=>{f.set=SETS[f.ch.id];f.state='win';});}
 for(const f of TITLE_F){if(wide()){G.cam=0;f.x=f.idx?205:110;f.z=140;}else{f.x=f.idx?120:-120;f.z=40;}shadowOf(f,f.ch.size);drawSpr(f.set,'win'+(Math.floor(G.t*2.5+f.idx)%2),PX(f.x,f.z),PY(f.z),f.dir,f.ch.drawScale||1);}
 drawRingFront();R(0,0,W,H,'rgba(6,2,3,0.6)');
 logo('T',192,78+(Math.floor(G.t*2)%2));
 R(122,140,140,16,'#8f0f14');R(122,140,140,1,'#ffd35a');R(122,155,140,1,'#ffd35a');T('BACKYARD BRAWL',192,143,2,'#ffd35a','center','#2a0405');
 const B=TITLE_BTNS_NOW();ctx.save();ctx.beginPath();ctx.rect(MENU_BOX[0]-2,MENU_BOX[1],MENU_BOX[2]+4,MENU_BOX[3]);ctx.clip();
 TITLE_ITEMS.map(t=>t[0]).forEach((s,i)=>{const r=B[i];if(r[1]<MENU_BOX[1]-12||r[1]>MENU_BOX[1]+MENU_BOX[3])return;const on=G.menu===i;BOX(r[0],Math.round(r[1]),r[2],r[3],on?'#8f0f14':'#140a0c',on?'#ffd35a':'#5a4a40');T((on?'> ':'')+s,r[0]+r[2]/2,Math.round(r[1])+3,1,on?'#fff':'#bfae98','center',null);});
 ctx.restore();
 // scroll arrows (only when there's more to see), plus a little position bar
 if(menuMax()){const bl=Math.floor(G.t*3)%2;if(menuS>0.05){BOX(...MENU_UP,'#140a0c','#ffd35a');for(let k=0;k<4;k++)R(MENU_UP[0]+7-k,MENU_UP[1]+3+k,2*k+1,1,bl?'#ffd35a':'#fff');}
  if(menuS<menuMax()-0.05){BOX(...MENU_DN,'#140a0c','#ffd35a');for(let k=0;k<4;k++)R(MENU_DN[0]+7-k,MENU_DN[1]+8-k,2*k+1,1,bl?'#ffd35a':'#fff');}
  const th=Math.max(6,30*MENU_VIS/TITLE_ITEMS.length),ty=171+(28-th)*(menuS/menuMax());R(270,171,2,28,'#3a2a24');R(270,Math.round(ty),2,Math.round(th),'#ffd35a');}}
const CARD={x:4,y:24,w:52,h:78,gap:2,cols:7};
const PER=14,pageOf=i=>Math.floor(i/PER),PAGES=()=>Math.ceil(ROSTER.length/PER);
const PAGE_BTN=[226,3,66,11];
const cardRect=i=>(i=i%PER,[CARD.x+(i%CARD.cols)*(CARD.w+CARD.gap),CARD.y+Math.floor(i/CARD.cols)*(CARD.h+CARD.gap),CARD.w,CARD.h]);
const vmove=(c,d,n)=>{const v=c+d*CARD.cols;if(pageOf(v)!==pageOf(c))return c;return v>=0&&v<n?v:c;};
const STAGE_BTN=[296,3,84,11];
const SEL_BACK=[4,3,30,11];
function updSelect(){const S=G.sel,n=ROSTER.length;
 // BACK (tap or Esc): straight to the main menu from any mode's wrestler select
 if(clickQ&&inRect(clickQ,SEL_BACK)){if(G.mode===2)NET.leave();G.scene='title';sfx('punch');clickQ=null;return;}
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
 if(G.mode>=3){nav(0,['KeyA','ArrowLeft'],['KeyD','ArrowRight'],['KeyW','ArrowUp'],['KeyS','ArrowDown']);
  let lk=confirmP();if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){S.c[0]=i;lk=true;break;}
  if(lk){lockIn(0);if(G.mode===6){uniStart(S.c[0]);return;}if(G.mode===4){startRumble(S.c[0]);return;}if(G.mode===5){startTag(S.c[0]);return;}const dum=ROSTER.findIndex(c=>c.id===(ROSTER[S.c[0]].id==='bigmf'?'papi':'bigmf'));S.picks[1]=dum;startIntro();G.scene='fight';tutStart();}return;}
 if(G.mode===0){const w=S.stage;nav(w,['KeyA','ArrowLeft'],['KeyD','ArrowRight'],['KeyW','ArrowUp'],['KeyS','ArrowDown']);
  if(confirmP()||hit(['KeyJ'])){lockIn(w);S.stage++;if(S.stage<2)S.page=pageOf(S.c[1]);}
  if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){S.c[w]=i;lockIn(w);S.stage++;break;}
  if(S.stage>=2)startIntro();}
 else{if(S.picks[0]==null){nav(0,['KeyA'],['KeyD'],['KeyW'],['KeyS']);if(hit(['KeyF','Space']))lockIn(0);}
  if(S.picks[1]==null){nav(1,['ArrowLeft'],['ArrowRight'],['ArrowUp'],['ArrowDown']);if(hit(['KeyJ','Enter','NumpadEnter','Numpad1']))lockIn(1);}
  if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){const w=S.picks[0]==null?0:1;if(S.picks[w]==null){S.c[w]=i;lockIn(w);}break;}
  if(S.picks[0]!=null&&S.picks[1]!=null)startIntro();}}
function drawSelect(){drawArena();R(0,0,W,H,'rgba(6,2,3,0.8)');const S=G.sel;
 BOX(...SEL_BACK,'#140a0c','#5a4a40');T('< BACK',SEL_BACK[0]+15,SEL_BACK[1]+3,1,'#bfae98','center',null);
 T('CHOOSE YOUR WRESTLER',130,4,2,'#ffd35a','center','#5a0608');
 T(G.mode===6?'UNIVERSE: PICK YOUR WRESTLER':G.mode===4?'ROYAL RUMBLE: PICK YOUR WRESTLER':G.mode===5?'TAG TEAM: PICK YOUR WRESTLER':G.mode===3?'TUTORIAL: PICK YOUR WRESTLER':G.mode===2?(S.picks[0]==null?'ONLINE: PICK YOUR WRESTLER':'LOCKED IN • WAITING FOR OPPONENT...'):G.mode===0?(S.stage===0?'PLAYER 1: PICK YOUR WRESTLER':'NOW PICK YOUR CPU OPPONENT'):'P1: WASD + F     P2: ARROWS + J',130,15,1,G.mode===2&&S.picks[0]!=null?'#ffd35a':'#e9dcc6','center',null);
 BOX(...STAGE_BTN,'#8f0f14','#ffd35a');T('LEVEL: '+['THE DEN','OUTDOOR','BMF RANCH','RANCH: FULL'][G.stage],STAGE_BTN[0]+42,STAGE_BTN[1]+3,1,'#fff','center',null);
 if(S.page==null)S.page=0;
 {const P=PAGES();BOX(...PAGE_BTN,'#140a0c','#ffd35a');T('< PAGE '+(S.page+1)+'/'+P+' >',PAGE_BTN[0]+PAGE_BTN[2]/2,PAGE_BTN[1]+3,1,'#ffd35a','center',null);}
 ROSTER.forEach((ch,i)=>{if(pageOf(i)!==S.page)return;const[x,y,w,h]=cardRect(i);const bc=['#111111','#161616','#141414'].includes(ch.trunks)?ch.accent:ch.trunks;
  R(x,y,w,h,'#140a0c');for(let k=0;k<4;k++)R(x,y+k*14,w,14,shade(bc,-0.45-k*0.12));
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h-9);ctx.clip();const st=SETS[ch.id],fy=Math.max(y+h-12,y+4+(AY-(st.idle0_top||20)));ELL(x+w/2,fy,12,2,'rgba(0,0,0,0.35)');drawSpr(st,'idle'+(Math.floor(G.t*1.6+i)%2),x+w/2,fy,1);ctx.restore();
  R(x,y+h-9,w,9,'#0a0506');T(cardName(ch),x+w/2,y+h-7,1,'#fff','center',null);
  R(x+1,y+1,ch.align==='heel'?17:17,7,ch.align==='heel'?'#1c8f3a':'#8f0f14');T(ch.align==='heel'?'HEEL':'FACE',x+2,y+2,1,'#fff','left',null);
  for(let who=0;who<2;who++){if(G.mode===0&&S.stage<who&&S.picks[who]==null)continue;if(G.mode>=3&&who===1)continue;if(G.mode===2&&who===1)continue;if(G.mode===0&&S.stage!==who&&S.picks[who]==null)continue;
   const isC=S.picks[who]==null?S.c[who]===i:S.picks[who]===i;if(!isC)continue;const col=who===0?'#ff4a3a':'#3a8bff',lk=S.picks[who]===i;
   const th=lk?2:1;R(x-th+who,y-th+who,w+th*2-who*2,th,col);R(x-th+who,y+h-who,w+th*2-who*2,th,col);R(x-th+who,y+who,th,h-who*2,col);R(x+w-who,y+who,th,h-who*2,col);
   const lbl=(who===0?'P1':(G.mode===0?'CPU':'P2'))+(lk?'✓':'');R(x+w-TW(lbl)-3,y+1+who*8,TW(lbl)+2,7,col);T(lbl,x+w-2,y+2+who*8,1,'#fff','right',null);}});
 for(let who=0;who<2;who++){if(G.mode===0&&S.stage<who&&S.picks[who]==null)continue;if(G.mode>=3&&who===1)continue;if(G.mode===2&&who===1){BOX(194,184,186,22,'#140a0c','#3a8bff');T(NET.theirPick!=null?'OPPONENT IS LOCKED IN':'OPPONENT IS PICKING...',287,192,1,'#bfae98','center',null);continue;}const ch=ROSTER[S.picks[who]!=null?S.picks[who]:S.c[who]],px=who?194:4,py=184;
  BOX(px,py,186,22,'#140a0c',who?'#3a8bff':'#ff4a3a');T(ch.name,px+3,py+3,1,'#fff','left',null);T(ch.tag+' • '+(ch.align==='heel'?'HEEL':'FACE'),px+3,py+10,1,'#bfae98','left',null);
  [['POW',ch.pow/1.3],['SPD',ch.spd/1.25],['SIZ',ch.size/1.22]].forEach(([l,v],j)=>{const xx=px+112,yy=py+3+j*6;T(l,xx,yy,1,'#8a7a66','left',null);R(xx+14,yy,56,4,'#2a1a1c');R(xx+14,yy,Math.round(56*v),4,'#ffd35a');});
  T(ch.fin,px+3,py+16,1,ch.accent==='#141414'?'#fff':ch.accent,'left',null);}
 T(coarse?'TAP A WRESTLER • TAP PAGE OR LEVEL TO SWITCH':'MOVE • ENTER/F LOCK IN • Q/E PAGE • T LEVEL • ESC BACK',192,209,1,'#8a7a66','center',null);}
function startIntro(){const S=G.sel;const c0=ROSTER[S.picks[0]],c1=ROSTER[S.picks[1]];
 G.f=[makeFighter(c0,-40,32,1,false,0),makeFighter(c1,40,32,-1,G.mode===0,1)];G.f.forEach(f=>f.set=SETS[f.ch.id]);
 if(c0.id===c1.id){const alt=Object.assign({},c1,{trunks:c1.accent,accent:c1.trunks,name:c1.name+' II',short:c1.short+' II',id:c1.id+'_alt'});if(!SETS[alt.id])buildWrestler(alt);G.f[1].ch=alt;G.f[1].set=SETS[alt.id];}
 G.scene='intro';G.introT=0;sfx('roar');}
function beginFight(){G.mm=null;if(!G.uniMatch)G.f.forEach(f=>f.uniDef=null);const[a,b]=G.f;if(G.hc||G.cage)G.stage=3;
 // every match gets a seed; a replay re-uses the recorded one
 const seed=G.replay&&G.replay.seed!=null?G.replay.seed:G.forceSeed!=null?G.forceSeed:G.net?G.net.seed:(Math.random()*4294967296)>>>0;SIM.seed=seed;if(G.net)G.net.onBegin();AIR.seed=seed^0x9E3779B9;
 G.t=0;G.rope={side:0,t:9};irpReset();musStop(0.4); // the match clock starts at zero for everyone, so online players stay in step
 G.dodgeOn=G.replay?!!G.replay.dodge:(TEST_MODES&&!G.net);
 G.windOn=G.replay?!!G.replay.wind:(TEST_MODES&&!G.net); // wind-up beat before strikes (test link)
 G.entFx=TEST_MODES&&!G.net&&!G.replay;                    // fog + lights + pose entrance (test link)
 G.secretOn=G.replay?!!G.replay.secret:(TEST_MODES&&!G.net);G.rollInOn=G.replay?!!G.replay.rollin:(TEST_MODES&&!G.net);G.map=G.replay?(G.replay.map||'ranch'):(G.mapPick||'ranch');G.mapT=0;G.mapArm=true;G.mapFade=0;G.mapWalk=null;G.f.forEach(f=>f.mwA=1); // Secret Map: test link only for now // 5-by-5s: test link only while it's being cleaned up
 G.rec={v:1,seed,p:[a.ch.id,b.ch.id],cpu:[a.cpu,b.cpu],wide:wide(),hc:!!G.hc,cage:!!G.cage,dodge:G.dodgeOn,secret:G.secretOn,rollin:G.rollInOn,map:G.map,wind:G.windOn,inp:[]};G.fstep=0;
 if(wide()){XMIN=52;XMAX=262;ZMIN=125;ZMAX=154;}else{XMIN=-160;XMAX=160;ZMIN=3;ZMAX=61;}
 for(const f of [a,b]){const ch=f.ch,set=f.set;Object.assign(f,makeFighter(ch,f.idx===0?-40:40,32,f.idx===0?1:-1,f.cpu,f.idx));f.set=set;f.out=false;f.wpn=-1;f.lad=-1;f.ladDive=null;f.esc=0;f.escKind=null;}
 G.props=G.hc?hcProps():null;
 G.co={t:0,n:0};
 if(wide()){a.x=110;b.x=205;a.z=b.z=140;a.hidden=b.hidden=true;G.entrance={i:0,t:0,phase:'show'};G.cam=264;}else G.entrance=null;
 G.ref={x:wide()?157:0,z:wide()?127:8,y:0,dir:1,mode:'idle',walkPh:0,slap:0,moving:false};
 G.pin=null;G.over=null;G.parts=[];G.pops=[];G.hype=0.35;G.crowdHot=false;G.paused=false;G.slow=1;G.slowT=0;G.hitStop=0;
 G.scene='fight';if(!G.entrance){sfx('bell');callout('DING DING DING!','#fff',1.3);}
 if(G.uniMatch)smMatchStart();
 if(G.uniMatch&&G.uniHype){say(G.uniHype);if(G.hc||G.cage)callout(G.cage?'STEEL CAGE BLOW-OFF!':'HARDCORE BLOW-OFF!','#ff4a3a',2);}
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
function updFight(dt){if(G.mm)return updGroupFight(dt);
 if(G.net){if(G.net.updFightMeta)G.net.updFightMeta();}
 else if(!G.over&&hit(['Escape','KeyP']))G.paused=!G.paused;
 if(G.paused){if(hit(['KeyQ'])){G.paused=false;G.scene='title';}if(clickQ){if(inRect(clickQ,PAUSE_BTNS[0]))G.paused=false;else if(inRect(clickQ,PAUSE_BTNS[1])){G.paused=false;G.scene='title';}}return;}
 if(hit(['KeyM']))toggleMute();
 if(G.tut){tutMeta();tutStep(dt);}
 if(G.over){G.over.t+=dt;if(G.uniMatch){if(G.over.t>1.8&&(confirmP()||clickQ||hit(['Escape'])))uniAfterMatch();return;}if(G.over.t>1.8&&!G.net){
  if(confirmP()||(clickQ&&inRect(clickQ,OVER_BTNS[0])))beginFight();
  else if((hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1])))&&G.fromSetup)mselOpen();
  else if(hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1]))){G.scene='select';G.sel={c:[G.sel.picks[0],G.sel.picks[1]],stage:0,picks:[null,null]};}
  else if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,OVER_BTNS[2])))G.scene='title';}}
 if(wide()&&!G.paused){const E=G.entrance,ef=E?G.f[[1,0][Math.min(E.i,1)]]:null;const fx=E?(E.phase==='show'?513:ef.x):(G.f[0].x+G.f[1].x)/2;G.cam=lerp(G.cam,clamp(fx-192,0,MAPW-W),1-Math.exp(-dt*(E?3:5)));}
 if(G.entrance){updEntrance(dt);updRef(dt);return;}
 if(G.hitStop>0){G.hitStop-=dt;return;}
 if(wide()&&!G.over&&!G.pin&&!G.hc&&!G.cage&&!G.mapWalk){if(G.f[0].out||G.f[1].out){G.co.t+=dt;if(G.co.t>=1){G.co.t-=1;G.co.n++;sfx('count');pop(PX(G.ref.x,G.ref.z),G.ref.z-78,G.co.n+'!','#fff');
   if(G.co.n>=10){const[a,b]=G.f;if(a.out&&b.out){G.over={w:null,l:null,t:0,how:'DOUBLE COUNT-OUT'};callout('DOUBLE COUNT-OUT!','#ff4a3a',1.6);}else{const w=a.out?b:a,l=a.out?a:b;G.over={w,l,t:0,how:'COUNT-OUT'};setState(w,'win');G.ref.mode='raise';callout('COUNT-OUT!','#ff4a3a',1.6);say(`${l.ch.short} is counted out! Your winner... ${w.ch.name}!`);}setTimeout(()=>sfx('bell'),200);sfx('roar');}}}
  else G.co={t:0,n:0};}
 if(G.slowT>0){G.slowT-=dt;if(G.slowT<=0)G.slow=1;}
 const sdt=dt*G.slow;G.rope.t+=sdt;
 if(G.mapWalk){G.curInp=[0,0];updMapWalk(sdt);updRef(sdt);return;}
 // this step's inputs: from the network / replay tape if there is one, otherwise from the controls and CPU
 let inp=G.stepInp?[unpackInp(G.stepInp[0]),unpackInp(G.stepInp[1])]:[G.f[0].cpu?aiInput(G.f[0],G.f[1],sdt):humanInput(0),G.f[1].cpu?aiInput(G.f[1],G.f[0],sdt):humanInput(1)];
 if(G.over)inp=[blank(),blank()];
 if(G.tut&&!G.stepInp&&!G.over)inp[1]=tutDummyInput();
 if(G.hc&&G.props&&!G.stepInp)hcCpuAll(inp,sdt);
 if(G.cage&&!G.stepInp)cageCpuAll(inp,sdt);
 G.curInp=[packInp(inp[0]),packInp(inp[1])];G.f[0].inp=inp[0];G.f[1].inp=inp[1];
 if(G.hc&&G.props)hcPre(inp,sdt);
 if(G.cage)cagePre(inp,sdt);
 if(G.pin)updPin(sdt,inp);
 if(G.scene!=='fight')return;
 updFighter(G.f[0],G.f[1],inp[0],sdt);updFighter(G.f[1],G.f[0],inp[1],sdt);separate(G.f[0],G.f[1]);if(G.hc&&G.props)hcPost(sdt);if(G.cage)cagePost(sdt);secretCheck(sdt);updRef(sdt);
 // the crowd gets hotter as the match goes on and the wrestlers wear down
 {const[a,b]=G.f,floor=0.15+Math.min(0.25,G.fstep/12000)+clamp((200-a.hp-b.hp)/200,0,1)*0.25;G.hype=Math.max(floor,G.hype-sdt*(CTR.crowd.cool+Math.max(0,G.hype-floor)*CTR.crowd.coolHot));}
 if(!G.crowdHot&&G.hype>=CTR.crowd.hot&&!G.entrance&&!G.over){G.crowdHot=true;say('Listen to this crowd! The Ranch is ON FIRE!');sfx('roar');}else if(G.crowdHot&&G.hype<CTR.crowd.hot-0.15)G.crowdHot=false;
 G.chantT-=dt;if(G.chantT<=0){G.chantT=rnd(3,7);if(G.hype>0.5)pop(rnd(90,300),rnd(64,78),pick(['2-0-9! 2-0-9!','THIS IS AWESOME!','DEN! DEN!',"LET'S GO!"]),'#f1e6d0');}}
function updEntrance(dt){const E=G.entrance;E.t+=dt;const order=[1,0],f=G.f[order[E.i]];
 const skip=G.net?(G.stepInp&&((G.stepInp[0]|G.stepInp[1])&(16|32))):(confirmP()||clickQ);
 if(E.t>0.3&&skip){finishEntrance();return;}
 if(E.phase==='show'){if(E.t<dt*1.5){callout(f.ch.name,'#fff',1.8);sfx('roar');G.hype=0.8;musPlay(f.ch.id.replace('_alt',''),'theme');}if(E.t>1.8){E.t=0;f.hidden=false;f.out=true;f.dir=-1;
   if(G.entFx&&G.map!=='secret'){E.phase='emerge';f.x=533;f.z=139;f.mwA=0;setState(f,'walk');entFog.burst=1;} // test link: out of the tunnel through the fog
   else{E.phase='walk';f.x=513;f.z=160;setState(f,'walk');for(let k=0;k<30;k++)part(PX(513,160)+rnd(-20,20),160+rnd(-30,0),rnd(-30,30),rnd(-40,-5),rnd(0.6,1.2),pick(['#b050ff','#e0a0ff','#7a30c0']),2,'dust');}}}
 else if(E.phase==='emerge'){f.state='walk';f.walkPh+=dt*8;f.dir=1;f.z=Math.min(158,f.z+dt*16);f.mwA=clamp((f.z-139)/12,0,1);
  if(f.z>=158){f.mwA=1;f.dir=-1;f.state='entpose';f.t=0;E.phase='pose';E.t=0;sfx('roar');shake(3);heat(0.15);entFog.burst=1;
   pop(PX(533,158),92,pick(['2-0-9! 2-0-9!','LET\'S GO!','DEN! DEN!']),'#f1e6d0');}}
 else if(E.phase==='pose'){f.state='entpose';if(E.t>1.5){E.phase='walk';E.t=0;setState(f,'walk');}}
 else if(E.phase==='walk'){const tx=296,tz=168,dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);f.walkPh+=dt*11;f.state='walk';f.dir=dx<0?-1:1;
  if(d<3){startRoll(f,ringX(150)[1]-6,150,false);E.phase='roll';}else{f.x+=dx/d*120*dt;f.z+=dz/d*120*dt;}}
 else if(E.phase==='roll'){f.t+=dt;updRoll(f,dt);if(f.state!=='roll')E.phase='place';}
 else if(E.phase==='place'){const tx=order[E.i]===0?110:205,tz=140,dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);
  if(d<2){f.dir=order[E.i]===0?1:-1;setState(f,'win');E.i++;E.t=0;if(E.i>=2){finishEntrance();}else E.phase='show';}
  else{f.state='walk';f.walkPh+=dt*11;f.dir=dx<0?-1:1;f.x+=dx/d*90*dt;f.z+=dz/d*90*dt;}}}
function finishEntrance(){musStop(1.2);G.hype=0.3;for(const f of G.f)f.mwA=1; // the crowd settles in at the bell
const[a,b]=G.f;a.x=110;b.x=205;a.z=b.z=140;a.dir=1;b.dir=-1;for(const f of G.f){f.hidden=false;f.out=false;f.y=0;setState(f,'idle');}G.entrance=null;sfx('bell');callout('DING DING DING!','#fff',1.3);
 say(coarse?'Roll out of the ring: push into the ropes + JUMP.':'WASD MOVE · SPACE JUMP · F/G/H ATTACK · R FINISHER · ROPES+SPACE: ROLL OUT');}
function toggleMute(){muted=!muted;if(master)master.gain.value=muted?0:0.5;musMute();}
function drawFight(){if(G.entrance&&G.entrance.phase==='show'){drawEntranceShow();return;}const efx=G.entrance&&G.entFx&&G.map!=='secret';drawArena();drawRingBack();if(efx)R(0,0,W,H,`rgba(5,2,12,${(0.45*entK()).toFixed(2)})`);drawFighters();if(efx)drawEntFx();if(G.mm)drawGroupMarkers();drawDodgeHint();if(G.hc&&G.props)drawHCHint();if(G.mapFade>0){R(0,0,W,H,`rgba(0,0,0,${Math.min(1,G.mapFade*1.6).toFixed(2)})`);G.mapFade=Math.max(0,G.mapFade-1/60);}if(G.cage){drawCageFront();drawCageHint();}G.f.forEach(drawCtrIcon);drawParts();drawRingFront();drawPops();drawCallout();}
function drawEntranceShow(){const E=G.entrance,f=G.f[[1,0][E.i]];ctx.drawImage(ENT,0,0,W,H);
 const a=clamp(E.t/0.6,0,1);for(let k=0;k<5;k++){ctx.globalAlpha=0.18*a;ELL(192,186,60+k*6,10,'#c070ff');}ctx.globalAlpha=1;
 if(E.t>0.5)drawSpr(f.set,'win'+(Math.floor(G.t*2.5)%2),192,196,f.idx===1?-1:1,1.5*(f.ch.drawScale||1));
 if(E.t>0.4){R(0,170,W,30,'rgba(6,2,3,0.72)');T(f.ch.name,192,176,2,f.ch.align==='heel'?'#9cff57':'#ffd35a','center','#000');T(f.cpu?'CPU':(f.idx===0?'PLAYER 1':'PLAYER 2'),192,190,1,'#bfae98','center',null);}
 T(coarse?'TAP TO SKIP':'ENTER TO SKIP',W-4,206,1,'#7a6a5a','right',null);}
function drawOverlays(){if(G.scene!=='fight')return;if(G.entrance){if(G.entrance.phase!=='show'){R(0,207,W,9,'#0a0506');T('ENTRANCE • '+G.f[[1,0][Math.min(G.entrance.i,1)]].ch.name,192,209,1,'#ffd35a','center',null);}return;}drawHUD();
 if(wide()&&G.co.n>0&&!G.over){BOX(158,30,68,13,'#140a0c','#ffd35a');T('COUNT '+G.co.n,192,34,1,G.co.n>=7?'#ff4a3a':'#fff','center',null);}
 if(G.over&&G.over.t>1.8){const w=G.over.w||{ch:{name:'NO CONTEST'}};R(0,0,W,H,'rgba(6,2,3,0.65)');T('WINNER',192,62,1,'#bfae98','center',null);
  T(w.ch.name,192,74,TW(w.ch.name,3)>360?2:3,'#ffd35a','center','#5a0608');T(G.over.how&&G.over.how!=='PINFALL'?G.over.how:'BY PINFALL • 1-2-3',192,98,1,'#e9dcc6','center',null);
  if(G.uniMatch){BOX(...OVER_BTNS[0],'#8f0f14','#ffd35a');T(coarse?'TAP TO CONTINUE':'CONTINUE (ENTER)',192,OVER_BTNS[0][1]+5,1,'#fff','center',null);}
  else ['REMATCH (ENTER)','CHANGE WRESTLERS (ESC)',G.net?'LEAVE ONLINE (Q)':'MAIN MENU (Q)'].forEach((s,i)=>{const r=OVER_BTNS[i];BOX(...r,i?'#140a0c':'#8f0f14','#ffd35a');T(s,192,r[1]+5,1,'#fff','center',null);});}
 if(G.paused){R(0,0,W,H,'rgba(6,2,3,0.8)');T('PAUSED',192,50,4,'#ffd35a','center','#5a0608');
  T('P1: WASD MOVE · SPACE JUMP · F PUNCH · G KICK · H GRAB/PIN · R FINISHER',192,80,1,'#e9dcc6','center',null);
  if(G.mode===1)T('P2: ARROWS · U JUMP · J PUNCH · K KICK · L GRAB/PIN · I FINISHER',192,90,1,'#e9dcc6','center',null);
  T('HOLD LEFT/RIGHT + GRAB TO WHIP INTO THE ROPES · CORNER + JUMP TO CLIMB',192,102,1,'#bfae98','center',null);T('PUSH INTO THE ROPES + JUMP TO ROLL OUT / BACK IN · BACK IN BY 10 OR LOSE!',192,110,1,'#bfae98','center',null);T('HOLD AWAY FROM YOUR OPPONENT TO BLOCK • WHIPPED? GRAB ON THE ICON TO REVERSE',192,118,1,'#ffd35a','center',null);T('DOUBLE-TAP TO RUN · RUNNING OR OFF THE ROPES: PUNCH = CLOTHESLINE, KICK = DROPKICK',192,126,1,'#ffd35a','center',null);
  [['RESUME (ESC)',0],['QUIT TO MENU (Q)',1]].forEach(([s,i])=>{const r=PAUSE_BTNS[i];BOX(...r,'#140a0c','#ffd35a');T(s,192,r[1]+5,1,'#fff','center',null);});}
 if(G.flash>0){R(0,0,W,H,`rgba(255,250,235,${G.flash.toFixed(2)})`);}}


// ================= SECRET MAP =================
// Both wrestlers walk out to the entrance together and the fight moves inside the barn.
// Inside, both walking to the barn door takes it back outside.
// trigger areas: the open floor in front of the entrance / barn doors (any depth). Reaching it starts the walk-through.
const MAPZONE={ranch:{x0:455,x1:600,z1:212},secret:{x0:520,x1:600,z1:212}};
const MAPOK=new Set(['idle','walk','run','punch','kick','stomp','hit','block','grab','grapple','grabbed','held','whiff','dazed']);
function inMapZone(f){const Z=MAPZONE[G.map||'ranch'];return f.out&&!f.hidden&&MAPOK.has(f.state)&&f.y<2&&f.x>=Z.x0&&f.x<=Z.x1&&f.z<=Z.z1;}
function secretCheck(dt){if(!G.secretOn||!wide()||G.mm||G.cage||G.over||G.pin||G.entrance||G.mapWalk)return;
 const both=G.f.every(inMapZone);
 if(!both){G.mapT=0;if(!G.f.some(inMapZone))G.mapArm=true;return;}
 if(!G.mapArm)return;
 G.mapT+=dt;if(G.mapT<0.4)return;
 // both wrestlers walk through the doorway together: into the dark, a moment of black, then out the other side
 const toSecret=G.map!=='secret';G.mapT=0;G.mapArm=false;G.co.n=0;G.co.t=0;
 const lead=G.f[0].x>=G.f[1].x?0:1; // whoever is nearer the door goes first
 G.mapWalk={to:toSecret?'secret':'ranch',phase:'out',t:0,lead};
 G.f.forEach((f,i)=>{setState(f,'walk');f.vx=f.vz=0;f.y=0;f.mwA=1;f.mwK=0;f.mwD=(i===lead?0:0.7);f.mwOff=(i===lead?5:-5);});
 irpMark('big');}
// door spots on each map (map x, depth z): walk to the threshold, then through it while fading
const MW_DOOR={ranch:{door:[533,158],through:[533,139],out:[[512,164],[484,166]]},
 secret:{door:[588,170],through:[628,162],out:[[532,170],[502,172]]}};
function mwMove(f,tx,tz,dt,sp=62){const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d<1){f.x=tx;f.z=tz;return true;}
 const s=Math.min(d,sp*dt);f.x+=dx/d*s;f.z+=dz/d*s;if(Math.abs(dx)>0.5)f.dir=dx>0?1:-1;f.walkPh+=dt*11;f.state='walk';return false;}
function updMapWalk(dt){const M=G.mapWalk;M.t+=dt;
 if(M.phase==='out'){const D=MW_DOOR[G.map==='secret'?'secret':'ranch'];let gone=0;
  for(const f of G.f){if(M.t<f.mwD){f.state='idle';continue;}
   if(f.mwK===0){if(mwMove(f,D.door[0]+f.mwOff,D.door[1],dt))f.mwK=1;}
   else{const sx=D.door[0]+f.mwOff,tx=D.through[0]+f.mwOff,arrived=mwMove(f,tx,D.through[1],dt,48);
    const tot=Math.hypot(tx-sx,D.through[1]-D.door[1]),left=Math.hypot(tx-f.x,D.through[1]-f.z);f.mwA=clamp(left/tot,0,1);if(arrived){f.mwA=0;gone++;}}}
  if(gone===G.f.length||M.t>6){M.phase='black';M.t=0;for(const f of G.f){f.mwA=0;f.hidden=true;}}}
 else if(M.phase==='black'){G.mapFade=0.7;
  if(M.t>=0.45){const toSecret=M.to==='secret';G.map=M.to;M.phase='in';M.t=0;const D=MW_DOOR[M.to];
   G.f.forEach((f,i)=>{f.hidden=false;f.mwA=0;f.mwK=0;f.x=D.through[0]+f.mwOff;f.z=D.through[1];f.mwD=(i===M.lead?0:0.7);});
   G.cam=clamp(D.door[0]-230,0,MAPW-W);
   if(toSecret){if(!G.secretFound){G.secretFound=true;callout('SECRET MAP DISCOVERED!','#ffd35a',2.4);}else callout('INTO THE BARN!','#ffd35a',1.6);
    say(`They've taken this fight into the barn! Nobody's supposed to be back here!`);}
   else{callout('BACK OUTSIDE!','#ffd35a',1.6);say('And they spill back out to the BMF Ranch!');}
   sfx('roar');heat(0.25);}}
 else{const D=MW_DOOR[G.map];let done=0;
  G.f.forEach((f,i)=>{if(M.t<f.mwD){f.mwA=0;return;}
   if(f.mwK===0){const sx=D.through[0]+f.mwOff;const ok=mwMove(f,D.door[0]+f.mwOff,D.door[1],dt,48);
    const tot=Math.hypot(D.door[0]-D.through[0],D.door[1]-D.through[1]);f.mwA=clamp(1-Math.hypot(D.door[0]+f.mwOff-f.x,D.door[1]-f.z)/tot,0,1);if(ok){f.mwK=1;f.mwA=1;}}
   else if(f.mwK===1){if(mwMove(f,D.out[i===M.lead?0:1][0],D.out[i===M.lead?0:1][1],dt))f.mwK=2;}
   else done++;});
  if(done===G.f.length){G.mapWalk=null;const[a,b]=G.f;for(const f of G.f){f.mwA=1;setState(f,'idle');}a.dir=b.x>a.x?1:-1;b.dir=-a.dir;}}}

// ================= ENTRANCE FOG + LIGHTS (test link) =================
// The yard dims, the four truss lamps throw beams down onto the stage, fog rolls out of the tunnel,
// and the lights strobe while the wrestler hits his pose.
const entFog={p:[],burst:0};
function entK(){const E=G.entrance,ph=E.phase;return ph==='emerge'?clamp(E.t/0.4,0,1):ph==='pose'?1:ph==='walk'?clamp(1-E.t/1.2,0,1):0.6;}
function drawEntFx(){const E=G.entrance,ph=E.phase,cx=533-G.cam,pose=ph==='pose';
 const k=entK(); // (the yard is darkened before the wrestlers are drawn, so they stay bright)
 // light beams from the lamps (map x 512-558, y 52) down to the stage floor
 ctx.save();ctx.globalCompositeOperation='lighter';
 [512,527,543,558].forEach((lx,i)=>{const on=pose?(Math.floor(G.t*10+i)%2?1:0.35):0.7;const a=0.16*k*on;if(a<=0.01)return;
  const x=lx-G.cam,g=ctx.createLinearGradient(0,54,0,165);g.addColorStop(0,`rgba(235,200,255,${a*1.6})`);g.addColorStop(1,'rgba(160,80,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-2,54);ctx.lineTo(x+2,54);ctx.lineTo(cx+(lx-535)*0.6+16,165);ctx.lineTo(cx+(lx-535)*0.6-16,165);ctx.closePath();ctx.fill();});
 if(k>0.05){const g=ctx.createRadialGradient(cx,158,2,cx,158,46);g.addColorStop(0,`rgba(255,230,255,${0.35*k})`);g.addColorStop(1,'rgba(160,80,255,0)');ctx.fillStyle=g;ctx.fillRect(cx-50,140,100,36);}
 ctx.restore();
 // fog: soft puffs that drift out of the tunnel and spread across the stage
 const want=pose||ph==='emerge'?40:ph==='walk'?24:12;if(entFog.burst){entFog.burst=0;for(let i=0;i<14;i++)entFog.p.push(newFog(true));}
 while(entFog.p.length<want)entFog.p.push(newFog(false));
 ctx.save();for(const p of entFog.p){p.t+=1/60;p.x+=p.vx/60;p.y+=p.vy/60;p.r+=4/60;const life=p.t/p.life,a=Math.sin(Math.min(1,life)*Math.PI)*p.a*Math.max(k,0.35);
  if(a<=0.005)continue;const g=ctx.createRadialGradient(p.x-G.cam,p.y,0,p.x-G.cam,p.y,p.r);g.addColorStop(0,`rgba(${p.c},${a})`);g.addColorStop(1,`rgba(${p.c},0)`);ctx.fillStyle=g;ctx.fillRect(p.x-G.cam-p.r,p.y-p.r,p.r*2,p.r*2);}
 ctx.restore();entFog.p=entFog.p.filter(p=>p.t<p.life);}
function newFog(burst){return{x:533+rnd(-22,22),y:rnd(146,166),vx:rnd(-16,16)*(burst?2:1),vy:rnd(-2,3),r:rnd(9,16),t:0,life:rnd(1.6,3.2),a:rnd(0.18,0.32),c:pick(['220,200,255','190,150,255','240,235,255'])};}
