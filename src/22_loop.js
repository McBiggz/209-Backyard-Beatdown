// ================= LOOP =================
function updFx(dt){
 for(const p of G.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='dust'){p.vy+=120*dt;p.vx*=0.95;}else if(p.type==='fire')p.vy-=30*dt;else if(p.type!=='ring')p.vy+=260*dt;}
 G.parts=G.parts.filter(p=>p.life>0);if(G.parts.length>500)G.parts.splice(0,G.parts.length-500);
 for(const p of G.pops){p.life-=dt;p.y-=18*dt;}G.pops=G.pops.filter(p=>p.life>0);
 if(G.callout){G.callout.t+=dt;if(G.callout.t>=G.callout.dur)G.callout=null;}
 G.shake=Math.max(0,G.shake-dt*30);G.flash=Math.max(0,G.flash-dt*1.6);G.tickerT+=dt;
 if(crowdG&&AC)crowdG.gain.setTargetAtTime(muted?0:(0.015+G.hype*0.11)*(MUS.cur?0.45:1)*(G.map==='secret'?0.25:1),AC.currentTime,0.25);}
// ---- Fixed-step simulation: the game always advances in exact 1/60 s steps, no matter the
// screen's refresh rate (60/90/120 Hz phones, slow laptops). Drawing happens once per screen frame.
// Same seed + same inputs per step => same match. This is what online play and replays are built on.
const STEP=1/60,MAX_STEPS=5;
let last=performance.now(),acc=0;G.step=0;
function simStep(){
 // online: wait until both players' inputs for this fight step have arrived (lockstep)
 if(G.net&&!G.resim&&!G.irp&&G.scene==='fight'&&!G.net.ready(G.fstep))return false;
 G.t+=STEP;G.step++;
 const inFight=G.scene==='fight',rec=G.rec;
 if(inFight){G.curInp=null;G.stepInp=G.replay?G.replay.inp[G.fstep]||[0,0]:G.net?G.net.take(G.fstep):null;}
 switch(G.scene){case 'loading':updLoading();break;case 'title':updTitle();break;case 'lobby':break;case 'select':updSelect();break;case 'setup':updSetup();break;case 'msel':updMsel();break;case 'party':updParty();break;case 'uni':updUni();break;case 'train':updTrain();break;case 'promo':updPromo();break;
  case 'intro':G.introT+=STEP;if(G.introT>2.8||(G.introT>0.4&&(confirmP()||clickQ)))beginFight();break;case 'fight':updFight(STEP);break;}
 // one input pair per fight step goes on the tape (steps where nobody could act record 0,0)
 if(inFight&&G.rec===rec&&rec){rec.inp.push(G.curInp||[0,0]);G.fstep++;if(G.net)G.net.afterStep(G.fstep);irpAfterStep();}
 G.stepInp=null;
 updFx(STEP);
 // a tap/press is consumed by the first step that sees it
 if(NET.st==='lost')updNetLost();
 if(PARTY.st==='lost')PARTY.updLost();
 for(const k in pressed)delete pressed[k];clickQ=null;
}
function frame(now){acc+=Math.min(0.25,(now-last)/1000);last=now;
 try{
  let n=0;if(G.net&&G.net.catchUp)G.net.catchUp();if(G.irp){irpFrame();acc=0;}
  else if(G.mm&&G.mm.ff&&G.scene==='fight'&&!G.over){for(let k=0;k<8&&!G.over;k++)simStep();acc=0;}
  else while(acc>=STEP&&n<MAX_STEPS&&!G.irp){if(simStep()===false){acc=Math.min(acc,STEP*2);break;}acc-=STEP;n++;}
  if(n===MAX_STEPS)acc=G.net?Math.min(acc,STEP*8):0; // tab was asleep: don't fast-forward (online: catch up a little)
  ctx=SCR;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
  const sx=G.shake?Math.round(rnd(-1,1)*G.shake):0,sy=G.shake?Math.round(rnd(-1,1)*G.shake):0;
  ctx.save();ctx.translate(sx,sy);
  if(G.scene==='loading')drawLoading();else if(G.scene==='title'||G.scene==='lobby')drawTitle();else if(G.scene==='select')drawSelect();else if(G.scene==='setup')drawSetup();else if(G.scene==='msel')drawMsel();else if(G.scene==='party')drawParty();else if(G.scene==='uni')drawUni();else if(G.scene==='train')drawTrain();else if(G.scene==='promo')drawPromo();else if(G.scene==='intro')drawIntro();else drawFight();
  ctx.restore();drawOverlays();if(G.scene!=='fight')drawPops();drawIRP();drawTut();drawNetHUD();musFrame();
 }catch(e){console.error(e);}
 {const me=G.net?G.net.me:0,f=G.scene==='fight'&&G.f&&G.f[me];FINBTN.classList.toggle('hide',!(f&&f.meter>=100));}
 fsUI();tc.classList.toggle('on',coarse&&(G.scene==='fight'||G.scene==='train')&&!G.paused&&!(G.over&&G.over.t>1.8));
 requestAnimationFrame(frame);}
requestAnimationFrame(frame);
// ---- Determinism tools (used by the test runner; harmless in normal play)
function simHash(){let h=2166136261>>>0;const mix=v=>{const s=typeof v==='number'?v.toFixed(6):String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
 for(const f of G.f||[]){mix(f.x);mix(f.z);mix(f.y);mix(f.hp);mix(f.meter);mix(f.state);mix(f.t);mix(f.dir);mix(f.out);}
 if(G.ref){mix(G.ref.x);mix(G.ref.z);mix(G.ref.mode);}mix(G.pin?G.pin.count:-1);mix(G.over?G.over.how+(G.over.w?G.over.w.idx:'-'):'');mix(G.fstep);mix(SIM.seed);
 return h.toString(16);}
// Run a whole match off-screen as fast as possible: CPU vs CPU, or replaying a recorded tape.
window.DD={simHash,
 runMatch(p1,p2,{seed,steps=60*90,replay=null,wideMap=true,hc=false,cage=false}={}){
  G.hc=replay?!!replay.hc:hc;G.cage=replay?!!replay.cage:cage;
  const iA=ROSTER.findIndex(c=>c.id===p1),iB=ROSTER.findIndex(c=>c.id===p2);
  if(wideMap)G.stage=3;
  G.mode=0;G.sel={c:[iA,iB],stage:2,picks:[iA,iB]};startIntro();G.f[0].cpu=replay?replay.cpu[0]:true;G.f[1].cpu=replay?replay.cpu[1]:true;
  G.replay=replay||null;G.forceSeed=replay?null:seed;beginFight();G.forceSeed=null;G.scene='fight';
  const hashes=[];let n=0,snap=null,snapAt=-1;for(;n<steps&&!(G.over&&G.over.t>0.5);n++){simStep();if(n%60===0)hashes.push(simHash());if(n===600){snap=getSnap();snapAt=G.fstep;}}
  const out={steps:n,hash:simHash(),hashes,rec:G.rec,result:G.over?G.over.how+':'+(G.over.w?G.over.w.ch.id:'none'):'none',hp:G.f.map(f=>Math.round(f.hp))};
  // snapshot test: rewind to step ~600 and re-simulate from the tape; must land on the same final state
  if(snap){const tape={inp:G.rec.inp.slice()},end=G.fstep,endHash=out.hash;setSnap(snap);G.replay=tape;G.resim=true;
   for(let k=0;G.fstep<end&&k<20000;k++)simStep();G.resim=false;out.snapOK=simHash()===endHash;}
  G.replay=null;G.scene='title';return out;}};

// ---- Save / restore the whole match (everything that decides what happens next).
// Used online to repair a desync: the host's copy wins, the other side jumps to it and re-plays its inputs.
function encSim(v,top){if(v===null||typeof v!=='object')return typeof v==='function'?undefined:v;
 const fi=G.f.indexOf(v);if(fi>=0&&!top)return{$f:fi};
 for(let i=0;i<G.f.length;i++){if(G.f[i].ch===v)return{$ch:i};if(G.f[i].set===v)return{$set:i};}
 if(v===REF)return{$ref:1};
 if(Array.isArray(v))return v.map(x=>encSim(x));
 if(v.constructor!==Object)return undefined;
 const o={};for(const k in v){const e=encSim(v[k]);if(e!==undefined)o[k]=e;}return o;}
function decSim(v){if(v===null||typeof v!=='object')return v;if(Array.isArray(v))return v.map(decSim);
 if('$f' in v)return G.f[v.$f];if('$ch' in v)return G.f[v.$ch].ch;if('$set' in v)return G.f[v.$set].set;if('$ref' in v)return REF;
 const o={};for(const k in v)o[k]=decSim(v[k]);return o;}
const SNAP_KEYS=['ref','pin','over','hype','crowdHot','mm','hitStop','slow','slowT','cam','entrance','rope','co','fstep','t','stage','props','hc','dodgeOn','cage','map','mapT','mapArm','secretOn','rollInOn'];
function getSnap(){const s={f:G.f.map(f=>encSim(f,true)),seed:SIM.seed,aseed:AIR.seed,b:[XMIN,XMAX,ZMIN,ZMAX]};
 for(const k of SNAP_KEYS)s[k]=encSim(G[k]);return JSON.stringify(s);}
function setSnap(str){const s=JSON.parse(str);
 G.f.forEach((f,i)=>{const d=s.f[i];for(const k in f)if(!(k in d)&&k!=='ch'&&k!=='set')delete f[k];for(const k in d)f[k]=decSim(d[k]);});
 for(const k of SNAP_KEYS)G[k]=decSim(s[k]);SIM.seed=s.seed;AIR.seed=s.aseed;[XMIN,XMAX,ZMIN,ZMAX]=s.b;
 if(G.rec)G.rec.inp.length=G.fstep;}
