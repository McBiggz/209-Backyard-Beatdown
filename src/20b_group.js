// ================= GROUP MATCHES (more than two wrestlers) =================
// One-on-one matches (and online) use the original two-wrestler loop in updFight and are untouched.
// Group matches run here: every wrestler fights a "target" (the nearest opponent, locked while grappling,
// whipping or pinning), so all the existing one-on-one move code works unchanged.
//   ROYAL RUMBLE: 8 wrestlers, 2 start, a new entrant on a countdown, out over the top rope = eliminated.
//   TAG TEAM (built, hidden from the menu until it's ready: open the game with ?tag=1): 2 vs 2, legal men
//   in the ring, partners on the apron, tag at your corner, partner can run in to break up a pin.
const GM=()=>DATA.moves.group||{};
const FREE=new Set(['idle','walk','run','block']);
const isActive=f=>!f.wait&&!f.elim&&!f.entering&&f.state!=='elim'&&f.state!=='elimdown'&&f.state!=='apron'&&!f.saving;
const sameTeam=(a,b)=>a.team!=null&&a.team===b.team;
function link(f,o){if(!G.mm||!o||o.ghost)return;f.tgt=o.idx;o.tgt=f.idx;}
function tgtOf(f){const o=f.tgt>=0?G.f[f.tgt]:null;return o&&isActive(o)&&!sameTeam(f,o)?o:null;}
function retarget(f){let cur=tgtOf(f);if(cur&&!FREE.has(f.state))return;
 let best=null,bs=1e9;for(const o of G.f){if(o===f||!isActive(o)||sameTeam(f,o))continue;if(G.mm.type==='tag'&&!o.legal)continue;
  let s=Math.abs(o.x-f.x)+2*Math.abs(o.z-f.z)+(o.out!==f.out?120:0)-(o.tgt===f.idx?20:0);if(s<bs){bs=s;best=o;}}
 if(!best){f.tgt=-1;return;}
 if(cur&&cur!==best){const sc=Math.abs(cur.x-f.x)+2*Math.abs(cur.z-f.z)+(cur.out!==f.out?120:0)-(cur.tgt===f.idx?20:0);if(sc<=bs+25)return;}
 f.tgt=best.idx;}
function ghostFor(f){const g=G.ghost;g.x=f.x<157?262:52;g.z=140;return g;}

// ---------- starting a group match ----------
function startGroup(cfg){G.mm=null;G.mmCfg=cfg;const seed=G.forceSeed!=null?G.forceSeed:(Math.random()*4294967296)>>>0;SIM.seed=seed;AIR.seed=seed^0x9E3779B9;
 G.stage=3;XMIN=52;XMAX=262;ZMIN=125;ZMAX=154;G.dodgeOn=TEST_MODES;
 G.f=cfg.ids.map((id,i)=>{const ch=ROSTER.find(c=>c.id===id);const ctl=cfg.ctl?cfg.ctl[i]:(i!==0||cfg.cpuAll?'cpu':0);const f=makeFighter(ch,110,140,1,ctl==='cpu',i);f.ctl=ctl;f.set=SETS[ch.id];f.tgt=-1;f.out=false;return f;});
 G.me=cfg.me!=null?cfg.me:0;G.map=cfg.map||'ranch';G.mapT=0;G.mapArm=false;G.mapFade=0;G.secretOn=false;G.hc=G.cage=false;G.props=[];
 G.ghost=makeFighter(G.f[0].ch,300,150,1,true,-1);G.ghost.ghost=true;G.ghost.hidden=true;
 G.t=0;G.rope={side:0,t:9};irpReset();musStop(0.4);G.rec={v:1,seed,group:cfg.type,ids:cfg.ids,inp:[]};G.fstep=0;G.co={t:0,n:0};G.entrance=null;
 G.ref={x:157,z:127,y:0,dir:1,mode:'idle',walkPh:0,slap:0,moving:false,hidden:cfg.type==='rumble'};G.rec.ctl=cfg.ctl;G.rec.elim=cfg.elim;G.rec.order=cfg.order;
 G.pin=null;G.over=null;G.parts=[];G.pops=[];G.hype=0.45;G.crowdHot=false;G.paused=false;G.slow=1;G.slowT=0;G.hitStop=0;G.cam=60;
 const mm={type:cfg.type,pinElim:!!cfg.elim,pins:cfg.type==='tag'||cfg.type==='multi',elim:cfg.type==='rumble',order:[],elimOrder:[],entered:0,nextT:0,ff:false,p1Out:0};G.mm=mm;
 for(const f of G.f){f.wait=true;f.hidden=true;}
 if(cfg.type==='rumble'){mm.order=cfg.order;mm.interval=GM().rumbleInterval||20;mm.nextT=mm.interval;
  for(let k=0;k<2;k++){const f=G.f[mm.order[k]];f.wait=false;f.hidden=false;f.x=k?205:110;f.z=140;f.dir=k?-1:1;mm.entered++;}
  callout('ROYAL RUMBLE!','#ffd35a',1.6);say(`Over the top rope to eliminate! Whip worn-down wrestlers into the ropes to throw them out!`);}
 else if(cfg.type==='multi'){// triple threat / fatal 4-way: everyone in at once, every man for himself
  const spots=[[110,132,1],[205,132,-1],[205,150,-1],[110,150,1]];
  G.f.forEach((f,i)=>{f.wait=false;f.hidden=false;[f.x,f.z,f.dir]=spots[i];});
  const nm=G.f.length===3?'TRIPLE THREAT':'FATAL 4-WAY';callout(nm+(mm.pinElim?' ELIMINATION!':'!'),'#ffd35a',1.8);
  say(mm.pinElim?'Every pin eliminates someone. Last one standing wins!':'First pinfall wins! Anyone can break up a pin!');}
 else{// tag: team 0 = wrestlers 0,1 (left corner), team 1 = 2,3 (right corner)
  G.f.forEach((f,i)=>{f.team=i<2?0:1;f.wait=false;f.hidden=false;});mm.legal=[0,2];
  for(const f of G.f){if(f.idx===0||f.idx===2){f.legal=true;f.x=f.team?205:110;f.z=140;f.dir=f.team?-1:1;}else{f.legal=false;toApron(f);}}
  callout('TAG TEAM MATCH!','#ffd35a',1.6);say('Tag at your corner! Partners can save a pin!');}
 G.scene='fight';sfx('bell');}
function startRumble(pick){const others=ROSTER.filter(c=>c.id!==ROSTER[pick].id&&c.id!=='kliq').map(c=>c.id);
 let r=(Math.random()*4294967296)>>>0;const R=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
 for(let i=others.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const ids=[ROSTER[pick].id,...others.slice(0,7)];const order=[1,2,3,4,5,6,7];
 for(let i=order.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 order.splice(Math.floor(R()*4),0,0); // you draw one of the first four numbers
 startGroup({type:'rumble',ids,order});}
function startTag(pick){const others=ROSTER.filter(c=>c.id!==ROSTER[pick].id&&c.id!=='kliq').map(c=>c.id);
 let r=(Math.random()*4294967296)>>>0;const R=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
 for(let i=others.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 startGroup({type:'tag',ids:[ROSTER[pick].id,...others.slice(0,3)]});}

// ---------- the group match loop (runs instead of the one-on-one loop) ----------
function updGroupFight(dt){const mm=G.mm;
 if(G.net&&!G.over)G.net.updFightMeta();
 else if(!G.over&&hit(['Escape','KeyP']))G.paused=!G.paused;
 if(G.paused){if(hit(['KeyQ'])){G.paused=false;G.scene='title';}if(clickQ){if(inRect(clickQ,PAUSE_BTNS[0]))G.paused=false;else if(inRect(clickQ,PAUSE_BTNS[1])){G.paused=false;G.scene='title';}}return;}
 if(hit(['KeyM']))toggleMute();
 if(G.over){G.over.t+=dt;if(G.over.t>1.8){mm.ff=false;
  if(G.net){G.net.updFightMeta();return;}
  if(confirmP()||(clickQ&&inRect(clickQ,OVER_BTNS[0]))){G.forceSeed=null;if(G.mmCfg.fromSetup){startGroup(Object.assign({},G.mmCfg));return;}G.mmCfg.type==='rumble'?startRumble(ROSTER.findIndex(c=>c.id===G.mmCfg.ids[0])):startTag(ROSTER.findIndex(c=>c.id===G.mmCfg.ids[0]));return;}
  else if((hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1])))&&G.mmCfg.fromSetup){G.scene='msel';return;}
  else if(hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1]))){G.scene='select';G.sel={c:[ROSTER.findIndex(c=>c.id===G.mmCfg.ids[0]),0],stage:0,picks:[null,null]};return;}
  else if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,OVER_BTNS[2]))){G.scene='title';return;}}}
 else if(mm.p1Out&&!mm.ff&&!G.net&&(confirmP()||clickQ)){mm.ff=true;callout('FAST FORWARD','#fff',0.8);}
 // camera: follow you; if you're out, follow the action
 {const me=G.f[G.me||0],act=G.f.filter(isActive);let fx=157;if(isActive(me))fx=me.x;else if(act.length)fx=act.reduce((s,f)=>s+f.x,0)/act.length;
  const en=G.f.find(f=>f.entering);if(en&&!isActive(me))fx=en.x;G.cam=lerp(G.cam,clamp(fx-192,0,MAPW-W),1-Math.exp(-dt*4));}
 if(G.hitStop>0){G.hitStop-=dt;return;}
 if(G.slowT>0){G.slowT-=dt;if(G.slowT<=0)G.slow=1;}
 const sdt=dt*G.slow;G.rope.t+=sdt;
 if(mm.type==='rumble')rumbleClock(sdt);
 for(const f of G.f){if(f.entering)updEntering(f,sdt);if(f.state==='elim'||f.state==='elimdown')updElim(f,sdt);if(f.saving)updSave(f,sdt);}
 // who's fighting whom
 for(const f of G.f)if(isActive(f))retarget(f);
 // this step's inputs (recorded so the instant replay can play the whole ring back)
 const n=G.f.length;let inp;
 const cpuIn=(f)=>{if(!isActive(f)||G.over)return blank();const o=tgtOf(f)||ghostFor(f);if(mm.type==='tag'&&wantsTag(f))return walkToTag(f);return aiInput(f,o,sdt);};
 if(G.stepInp)inp=G.f.map((f,i)=>(G.net&&f.cpu)?cpuIn(f):unpackInp(G.stepInp[i]||0)); // online: CPUs are worked out the same way on every device
 else inp=G.f.map((f,i)=>{const hi=humanInput(f.ctl===1?1:0);if(!G.over&&!f.cpu&&f.state==='apron'&&!f.saving)return hi;if(!isActive(f)||G.over)return blank();
  return f.cpu?cpuIn(f):hi;});
 G.curInp=inp.map(packInp);G.f.forEach((f,i)=>f.inp=inp[i]);
 if(G.pin){updPin(sdt,inp);if(mm.type==='tag')tagSaveCheck();if(mm.type==='multi'&&G.pin)multiBreak(sdt);}
 for(const f of G.f)if(f.elimT>0){f.elimT-=sdt;if(f.elimT<=0)f.hidden=true;}
 if(G.scene!=='fight'||G.mm!==mm)return;
 for(const f of G.f){if(!isActive(f))continue;const o=tgtOf(f)||ghostFor(f);
  if(mm.type==='tag'&&f.legal&&f.inp.grabP&&FREE.has(f.state)&&tryTag(f))continue;
  updFighter(f,o,f.inp,sdt);}
 const act=G.f.filter(isActive);for(let i=0;i<act.length;i++)for(let j=i+1;j<act.length;j++)if(act[i].out===act[j].out)separate(act[i],act[j]);
 for(const f of G.f)if(f.toss)updToss(f,sdt);
 if(mm.type==='tag'){const[a,b]=[G.f[mm.legal[0]],G.f[mm.legal[1]]];updRef(sdt,a,b);}
 if(mm.type==='multi'){const P=G.pin,ac=G.f.filter(isActive);const a=P?P.a:ac[0]||G.f[0],b=P?P.d:ac[1]||ac[0]||G.f[1];updRef(sdt,a,b);}
 // crowd
 {const hs=act.length?act.reduce((s,f)=>s+f.hp,0)/act.length:100,floor=0.2+Math.min(0.25,G.fstep/12000)+clamp((100-hs)/100,0,1)*0.2;G.hype=Math.max(floor,G.hype-sdt*(CTR.crowd.cool+Math.max(0,G.hype-floor)*CTR.crowd.coolHot));}
 // a winner?
 if(!G.over&&mm.type==='rumble'&&mm.entered>=G.f.length){const left=G.f.filter(f=>!f.elim&&f.state!=='elim'&&f.state!=='elimdown'&&!f.wait);
  if(left.length===1){const w=left[0];G.over={w,l:null,t:0,how:'ROYAL RUMBLE WINNER'};setState(w,'win');sfx('bell');sfx('roar');heat(0.4);callout(w.ch.short+' WINS THE RUMBLE!','#ffd35a',2.2);say(`${w.ch.name} has won the Royal Rumble!`);}}
 if(!G.f[G.me||0].elim&&!mm.p1Out&&(G.f[G.me||0].state==='elim')){mm.p1Out=1+G.f.filter(f=>!f.elim&&f.state!=='elim'&&f.state!=='elimdown').length;}}

// ---------- Royal Rumble pieces ----------
function rumbleClock(dt){const mm=G.mm;mm.sinceElim=(mm.sinceElim||0)+dt;if(G.over||mm.entered>=G.f.length)return;mm.nextT-=dt;
 if(mm.nextT<=0){mm.nextT=mm.interval;const f=G.f[mm.order[mm.entered]];mm.entered++;f.wait=false;f.hidden=false;f.entering={phase:'walk'};
  f.x=470;f.z=160;f.out=true;f.dir=-1;setState(f,'walk');callout('#'+mm.entered+' '+f.ch.name+'!','#fff',1.6);sfx('roar');heat(0.12);
  musPlay(f.ch.id,'theme',{quiet:0.6});say(`Entrant number ${mm.entered}: ${f.ch.name}!`);
  for(let k=0;k<20;k++)part(PX(470,160)+rnd(-20,20),160+rnd(-30,0),rnd(-30,30),rnd(-40,-5),rnd(0.6,1.2),pick(['#ffd35a','#ff8a1f','#fff']),2,'dust');}}
function updEntering(f,dt){const E=f.entering;
 if(E.phase==='walk'){const tx=296,tz=168,dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);f.walkPh+=dt*16;f.state='walk';f.dir=dx<0?-1:1;
  if(d<3){startRoll(f,ringX(150)[1]-6,150,false);E.phase='roll';}else{f.x+=dx/d*170*dt;f.z+=dz/d*170*dt;}}
 else if(E.phase==='roll'){f.t+=dt;updRoll(f,dt);if(f.state!=='roll'){f.entering=null;f.out=false;setState(f,'idle');}}}
// over the top rope? Called when someone is knocked flying or whipped into the ropes.
function rumbleOverTop(o,dir,whip){const mm=G.mm;if(!mm||!mm.elim||o.out||o.state==='elim'||o.y>30)return false;
 const[x0,x1]=ringX(o.z),edge=dir>0?x1-o.x:o.x-x0,g=GM();
 // worn-down wrestlers go over from further out; a long stretch with no elimination makes it easier too
 const reach=whip?8:34+clamp(50-o.hp,0,50)*(g.lowHpReach||1.1);if(edge>reach)return false;
 const stall=clamp((mm.sinceElim||0)-(g.stallAfter||45),0,60)/60;
 const p=o.hp<=0?1:clamp(clamp((g.elimHp||70)-o.hp,0,70)/70*(g.elimMax||0.85)+(whip&&o.hp<70?0.12:0)+stall*(o.hp<70?0.5:0.15),0,1);if(!schance(p))return false;
 eliminate(o,dir);return true;}
function eliminate(o,dir){const mm=G.mm;mm.sinceElim=0;setState(o,'elim');o.edir=dir;o.ex0=o.x;o.vx=o.vz=0;o.out=true;mm.elimOrder.push(o.idx);
 const left=G.f.filter(f=>!f.elim&&f.state!=='elim'&&f.state!=='elimdown'&&!f.wait).length;
 callout(o.ch.short+' IS OUT!','#ff4a3a',1.4);say(`${o.ch.name} goes over the top! ${left} left in the Rumble!`);sfx('roar');shake(5);heat(0.15);irpMark('big');}
function updElim(f,dt){if(f.state==='elim'){const p=clamp(f.t/0.7,0,1);f.x=f.ex0+f.edir*p*60;f.y=Math.sin(p*Math.PI)*38+(1-p)*10;if(p>=1){f.y=0;setState(f,'elimdown');sfx('slam');dust(sx_(f),PY(f.z),true);}}
 else if(f.t>1.6){f.elim=true;f.hidden=true;}}

// ---------- Tag team pieces ----------
const apronSpot=t=>({x:t?ringX(158)[1]+12:ringX(158)[0]-12,z:160});
// the team's corner, just inside the ropes where a fighter can actually stand
const cornerSpot=t=>{const r=ringX(146);return{x:t?r[1]-2:r[0]+2,z:146};};
function toApron(f){const a=apronSpot(f.team);f.x=a.x;f.z=a.z;f.out=true;f.dir=f.team?-1:1;f.legal=false;setState(f,'apron');}
function partnerOf(f){return G.f.find(p=>p!==f&&p.team===f.team);}
function tryTag(f){const c=cornerSpot(f.team),p=partnerOf(f);if(!p||p.state!=='apron'||f.out)return false;
 if(Math.abs(f.x-c.x)>26||Math.abs(f.z-c.z)>14)return false;
 // tag!
 const mm=G.mm;p.legal=true;mm.legal[f.team]=p.idx;f.legal=false;
 startRoll(p,f.team?ringX(150)[1]-10:ringX(150)[0]+10,150,false);p.saving={phase:'tagin'};
 const a=apronSpot(f.team);startRoll(f,a.x,a.z,true);f.saving={phase:'tagout'};
 callout('TAG!','#5fe07a',1.0);sfx('grab');say(`${f.ch.short} tags in ${p.ch.short}!`);heat(0.06);
 for(const o of G.f)if(o.tgt===f.idx)o.tgt=-1;return true;}
function wantsTag(f){const p=partnerOf(f);if(!f.legal||!p||p.state!=='apron'||!FREE.has(f.state)||f.out)return false;
 if(f.ai==null)f.ai={};if(f.hp<(f.ai.tagAt||(f.ai.tagAt=45+Math.floor(arand()*25)))&&p.hp>f.hp+15)return true;return false;}
function walkToTag(f){const c=cornerSpot(f.team),inp=blank(),dx=c.x-f.x,dz=c.z-f.z;
 if(Math.abs(dx)>20)inp[dx>0?'right':'left']=true;if(Math.abs(dz)>10)inp[dz>0?'down':'up']=true;if(Math.abs(dx)<=26&&Math.abs(dz)<=14)inp.grabP=true;return inp;}
function tagSaveCheck(){const P=G.pin;if(!P)return;const p=partnerOf(P.d);if(!p||p.state!=='apron'||p.saving)return;
 if(p.cpu&&P.count>=1&&!P.saveTried){P.saveTried=true;const mm=G.mm;mm.saves=mm.saves||[0,0];
  // every save a team makes, the next one gets less likely, so matches still end
  if(schance(Math.max(0.12,0.7-0.1*mm.saves[p.team]))){mm.saves[p.team]++;p.saving={phase:'in',who:P.a.idx};startRoll(p,clamp(P.a.x+(p.team?24:-24),ringX(150)[0]+6,ringX(150)[1]-6),P.a.z,false);}}
 else if(!p.cpu&&p.inp&&p.inp.grabP){p.saving={phase:'in',who:P.a.idx};startRoll(p,P.a.x,P.a.z,false);}}
function updSave(f,dt){const S=f.saving;
 if(S.phase==='tagin'||S.phase==='tagout'){f.t+=dt;updRoll(f,dt);if(f.state!=='roll'){f.saving=null;if(S.phase==='tagout')toApron(f);else{f.out=false;setState(f,'idle');}}return;}
 if(S.phase==='in'){f.t+=dt;updRoll(f,dt);if(f.state!=='roll'){S.phase='hit';setState(f,'stomp');f.out=false;}return;}
 if(S.phase==='hit'){f.t+=dt;if(f.t>0.25&&!S.done){S.done=true;const a=G.f[S.who];if(G.pin&&G.pin.a===a){kickout();callout('SAVE!','#5fe07a',1.2);say(`${f.ch.short} breaks up the pin!`);heat(0.15);knock(a,(a.x>f.x?1:-1)*120,180);}}
  if(f.t>0.7){S.phase='out';const ap=apronSpot(f.team);startRoll(f,ap.x,ap.z,true);}return;}
 if(S.phase==='out'){f.t+=dt;updRoll(f,dt);if(f.state!=='roll'){f.saving=null;toApron(f);}}}

// ---------- Over the top: the toss struggle ----------
// Grab a worn-down opponent while pushing left or right: you drag him to those ropes and it's a mash-off.
// Win it and he goes over the top. Lose it (or run out of time) and he hangs on and shoves you off.
// Anyone else in the ring can break it up by hitting the thrower.
HITTABLE.add('toss');
const canToss=(f,o)=>!!(G.mm&&G.mm.elim&&!f.out&&!o.out&&o.idx>=0&&o.hp<=(GM().tossHp||40));
const mashed=i=>!!(i&&(i.punchP||i.kickP||i.grabP||i.jumpP||i.finP));
function startToss(f,o,dir){const g=GM(),w=clamp(((g.tossHp||40)-o.hp)/(g.tossHp||40),0,1);link(f,o);
 setState(f,'toss');setState(o,'tossed');f.vx=f.vz=o.vx=o.vz=0;o.y=0;o.z=f.z;f.dir=dir;o.dir=-dir;
 f.toss={d:o.idx,dir,bar:0.42+w*0.22,phase:'drag',t:0};o.tossBy=f.idx;sfx('grab');heat(0.05);irpMark('big');
 if(f.idx===0||o.idx===0)callout('OVER THE TOP?','#ffd35a',0.9);say(`${f.ch.short} is trying to throw ${o.ch.short} over the top!`);}
function freeToss(f,o){f.toss=null;if(o)o.tossBy=-1;}
function updToss(f,dt){const T=f.toss,o=G.f[T.d],g=GM();
 // broken up: someone hit the thrower, or the man being thrown got knocked loose
 if(f.state!=='toss'||o.state!=='tossed'){freeToss(f,o);if(o.state==='tossed')setState(o,'idle');if(f.state==='toss')setState(f,'idle');
  if(f.idx===0||o.idx===0)callout('BROKEN UP!','#fff',0.9);return;}
 const[x0,x1]=ringX(o.z),ex=T.dir>0?x1:x0,gap=T.dir*22*(f.ch.size||1);
 if(T.phase==='drag'){const d=ex-o.x,st=150*dt;o.x+=clamp(d,-st,st);f.x=o.x-gap;f.z=o.z;
  if(Math.abs(d)<1||f.t>1.2){T.phase='mash';T.t=0;}return;}
 T.t+=dt;o.x=ex;f.x=o.x-gap;f.z=o.z;
 const rate=g.tossCpuRate||6.5,a=f.cpu?schance(dt*rate):mashed(f.inp),d=o.cpu?schance(dt*rate*(0.75+o.hp/160)):mashed(o.inp),k=g.tossPush||0.06;
 if(a){T.bar+=k;f.wiggle=0.12;}if(d){T.bar-=k;o.wiggle=0.12;}if(f.wiggle>0)f.wiggle-=dt;if(o.wiggle>0)o.wiggle-=dt;
 // the longer nobody's been eliminated, and the more beaten down he is, the closer he slides to going over
 const stall=clamp((G.mm.sinceElim||0)-(g.stallAfter||45),0,60)/60;T.bar+=dt*(0.04+stall*0.1+(o.hp<=0?0.1:0));
 if(T.bar>=1){freeToss(f,o);setState(f,'idle');eliminate(o,T.dir);return;}
 if(T.bar<=0||T.t>(g.tossTime||5)){freeToss(f,o);setState(o,'idle');setState(f,'hit');f.stun=0.6;f.vx=-T.dir*120;sfx('hit');
  if(f.idx===0||o.idx===0)callout(o.ch.short+' HANGS ON!','#5fe07a',1.0);say(`${o.ch.short} hangs on and fights ${f.ch.short} off!`);heat(0.06);}}
function drawTossBars(){for(const f of G.f){const T=f.toss;if(!T||T.phase!=='mash')continue;const o=G.f[T.d];
 const x=clamp(PX((f.x+o.x)/2,o.z),40,W-40),y=PY(o.z)-96*(o.ch.size||1);
 R(x-31,y-1,62,7,'#000');R(x-30,y,60*clamp(T.bar,0,1),5,'#ff4a3a');R(x+29,y-2,2,9,'#ffd35a');
 TossT('OVER THE TOP',x,y-10,1,'#fff');
 if(f.idx===0||o.idx===0){const me=f.idx===0;TossT((coarse?'TAP FAST TO ':'MASH ATTACK TO ')+(me?'THROW HIM OVER!':'HANG ON!'),x,y+16,1,Math.floor(G.t*8)%2?'#ffd35a':'#fff');}}}
function drawTossHints(me){if(!isActive(me)||!FREE.has(me.state))return;
 for(const o of G.f){if(o===me||!isActive(o)||!canToss(me,o)||!GRABBABLE.has(o.state))continue;if(Math.abs(o.x-me.x)>90||Math.abs(o.z-me.z)>20)continue;
  const x=PX(o.x,o.z),y=PY(o.z)-o.y-80*(o.ch.size||1);if(Math.floor(G.t*3)%2)TossT(coarse?'GRAB + PUSH: TOSS!':'GRAB + ←/→: TOSS!',x,y,1,'#ffd35a');}}
const TossT=(s,x,y,sc,c)=>T(s,x,y,sc,c,'center','#000');

// ---------- drawing ----------
function drawGroupHUD(){const mm=G.mm;
 const slot=(f,x,y,right)=>{const w=94,on=isActive(f)||f.entering,col=f.elim||f.state==='elim'||f.state==='elimdown'?'#7a3030':f.wait?'#5a4a40':'#f1e6d0';
  const label=f.wait?'#'+(mm.order?mm.order.indexOf(f.idx)+1:'?')+' ???':(f.ch.short||f.ch.name).slice(0,13)+(f.idx===0?' (YOU)':'')+(mm.type==='tag'&&!f.legal&&!f.elim?' •':'');
  T(label,right?x+w:x,y,1,f.idx===0?'#ffd35a':col,right?'right':'left','#000');
  if(!f.wait){R(x,y+6,w,3,'#000');if(!(f.elim||f.state==='elim'||f.state==='elimdown'))R(right?x+w-Math.round(w*clamp(f.hp,0,100)/100):x,y+6,Math.round(w*clamp(f.hp,0,100)/100),3,f.hp>50?'#5fe07a':f.hp>25?'#ffd35a':'#ff4a3a');else R(x,y+7,w,1,'#ff4a3a');}};
 const L=mm.type==='tag'?[0,1]:G.f.map((f,i)=>i).filter(i=>i%2===0),Rr=mm.type==='tag'?[2,3]:G.f.map((f,i)=>i).filter(i=>i%2===1);
 const ord=mm.type==='rumble'?mm.order:null;const lst=ord?ord.slice(0,4):L,rst=ord?ord.slice(4):Rr;
 lst.forEach((i,k)=>slot(G.f[i],3,3+k*11,false));rst.forEach((i,k)=>slot(G.f[i],W-97,3+k*11,true));
 drawCrowd();
 R(0,207,W,9,'#0a0506');R(0,207,20,9,'#8f0f14');T('LIVE',10,209,1,'#fff','center',null);
 const vis=Math.min(G.ticker.length,Math.floor(G.tickerT*60));T(G.ticker.slice(0,vis),24,209,1,'#f1e6d0','left',null);
 if(mm.type==='rumble'&&!G.over){const left=G.f.filter(f=>!f.elim&&f.state!=='elim'&&f.state!=='elimdown'&&!f.wait).length;
  const msg=mm.entered<G.f.length?'NEXT ENTRANT 0:'+String(Math.ceil(mm.nextT)).padStart(2,'0')+'  •  '+left+' IN THE RING':'ALL IN! LAST ONE STANDING  •  '+left+' LEFT';
  BOX(110,194,164,11,'#140a0c','#ffd35a');T(msg,192,197,1,'#fff','center',null);
  if(mm.p1Out){BOX(92,90,200,34,'#140a0c','#ff4a3a');T("YOU'RE ELIMINATED!",192,95,2,'#ff4a3a','center',null);T('YOU FINISHED #'+mm.p1Out+' OF '+G.f.length,192,108,1,'#e9dcc6','center',null);T(mm.ff?'FAST FORWARDING...':(coarse?'TAP TO FAST FORWARD':'ENTER TO FAST FORWARD'),192,116,1,'#ffd35a','center',null);}}}
function drawGroupMarkers(){const me=G.f[G.me||0];drawTossBars();drawTossHints(me);
 if(G.mm.type==='tag'&&me.legal&&isActive(me)&&FREE.has(me.state)&&!me.out){const p=partnerOf(me),c=cornerSpot(me.team);
  if(p&&p.state==='apron'&&Math.abs(me.x-c.x)<60&&Math.abs(me.z-c.z)<24){const x=clamp(PX(me.x,me.z),70,W-70),y=PY(me.z)-me.y-100*(me.ch.size||1);
   TossT(Math.abs(me.x-c.x)<=26&&Math.abs(me.z-c.z)<=14?(coarse?'TAP GRAB TO TAG!':'PRESS GRAB TO TAG!'):'GET TO YOUR CORNER',x,y,1,Math.floor(G.t*8)%2?'#5fe07a':'#fff');}}
 if(G.mm.type==='tag'&&me.state==='apron'&&!me.saving&&G.pin&&G.pin.d.team===me.team){const x=clamp(PX(me.x,me.z),70,W-70),y=PY(me.z)-me.y-84;
  TossT(coarse?'TAP GRAB TO SAVE HIM!':'PRESS GRAB TO SAVE HIM!',x,y,1,Math.floor(G.t*8)%2?'#ffd35a':'#fff');}if(!isActive(me)&&!me.entering)return;const x=PX(me.x,me.z),y=PY(me.z)-me.y-74*(me.ch.size||1);
 const b=Math.floor(G.t*4)%2;R(x-1,y-6+b,3,4,'#ffd35a');R(x-3,y-3+b,7,1,'#ffd35a');R(x-2,y-2+b,5,1,'#ffd35a');R(x-1,y-1+b,3,1,'#ffd35a');T('YOU',x,y-13+b,1,'#ffd35a','center','#000');}

// ---------- Triple Threat / Fatal 4-Way ----------
// a pin in a multi-man match: first pin wins, or (elimination) knocks that wrestler out until one is left
function multiPin(w,l){const mm=G.mm;G.pin=null;G.ref.mode='idle';
 if(!mm.pinElim){G.over={w,l,t:0,how:'PINFALL'};l.downDur=999;setState(w,'getup');G.ref.mode='raise';sfx('bell');sfx('roar');crowdReact(w,true);
  callout(w.ch.short+' WINS!','#ffd35a',2.2);say(`${w.ch.name} pins ${l.ch.name} and wins it!`);return;}
 l.elim=true;l.elimT=1.6;mm.elimOrder.push(l.idx);setState(w,'getup');sfx('bell');heat(0.25);
 callout(l.ch.short+' ELIMINATED!','#ff4a3a',1.8);say(`${l.ch.name} has been eliminated by ${w.ch.name}!`);
 const left=G.f.filter(f=>!f.elim);
 if(left.length===1){const W=left[0];G.over={w:W,l,t:0,how:'LAST ONE STANDING'};G.ref.mode='raise';sfx('roar');crowdReact(W,true);
  callout(W.ch.short+' WINS!','#ffd35a',2.4);say(`${W.ch.name} is the last one standing!`);}
 if(l.idx===(G.me||0)&&left.length>1&&!G.net)mm.p1Out=left.length+1;}
// anyone not in the pin can break it up: hit the man on top. CPUs decide once per pin (sim RNG, so replays and online agree)
function multiBreak(dt){const P=G.pin;if(!P)return;P.br=P.br||{};
 for(const f of G.f){if(!isActive(f)||f===P.a||f===P.d||!FREE.has(f.state)&&!['punch','kick','stomp'].includes(f.state))continue;
  if(f.cpu){if(P.br[f.idx]==null)P.br[f.idx]=schance(G.f.filter(isActive).length>3?0.4:0.55)?0.5+srnd()*1.2:-1;
   if(P.br[f.idx]>=0&&P.t>=P.br[f.idx]){const dx=P.a.x-f.x,dz=P.a.z-f.z,I=blank();
    if(Math.abs(dx)>24)I[dx>0?'right':'left']=true;if(Math.abs(dz)>6)I[dz>0?'down':'up']=true;if(Math.abs(dx)<32&&Math.abs(dz)<12)I.punchP=true;f.inp=I;}}
  const near=Math.abs(P.a.x-f.x)<34*f.ch.size&&Math.abs(P.a.z-f.z)<12,att=f.inp&&(f.inp.punchP||f.inp.kickP||f.inp.grabP);
  if(near&&att){const a=P.a,d=P.d;G.pin=null;G.ref.mode='idle';setState(d,'getup');d.y=0;damage(a,6,f);knock(a,(a.x>=f.x?1:-1)*120,90);link(f,a);
   callout('BROKEN UP!','#ffd35a',1.1);say(`${f.ch.short} breaks up the pin!`);sfx('slam');heat(0.15);irpMark('big');return;}}}
