// ================= LOOP =================
function updFx(dt){
 for(const p of G.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='dust'){p.vy+=120*dt;p.vx*=0.95;}else if(p.type==='fire')p.vy-=30*dt;else if(p.type!=='ring')p.vy+=260*dt;}
 G.parts=G.parts.filter(p=>p.life>0);if(G.parts.length>500)G.parts.splice(0,G.parts.length-500);
 for(const p of G.pops){p.life-=dt;p.y-=18*dt;}G.pops=G.pops.filter(p=>p.life>0);
 if(G.callout){G.callout.t+=dt;if(G.callout.t>=G.callout.dur)G.callout=null;}
 G.shake=Math.max(0,G.shake-dt*30);G.flash=Math.max(0,G.flash-dt*1.6);G.tickerT+=dt;
 if(crowdG&&AC)crowdG.gain.setTargetAtTime(muted?0:0.025+G.hype*0.16,AC.currentTime,0.25);}
// ---- Fixed-step simulation: the game always advances in exact 1/60 s steps, no matter the
// screen's refresh rate (60/90/120 Hz phones, slow laptops). Drawing happens once per screen frame.
// Same seed + same inputs per step => same match. This is what online play and replays are built on.
const STEP=1/60,MAX_STEPS=5;
let last=performance.now(),acc=0;G.step=0;
function simStep(){
 G.t+=STEP;G.step++;
 switch(G.scene){case 'loading':updLoading();break;case 'title':updTitle();break;case 'select':updSelect();break;
  case 'intro':G.introT+=STEP;if(G.introT>2.8||(G.introT>0.4&&(confirmP()||clickQ)))beginFight();break;case 'fight':updFight(STEP);break;}
 updFx(STEP);
 // a tap/press is consumed by the first step that sees it
 for(const k in pressed)delete pressed[k];clickQ=null;
}
function frame(now){acc+=Math.min(0.25,(now-last)/1000);last=now;
 try{
  let n=0;while(acc>=STEP&&n<MAX_STEPS){simStep();acc-=STEP;n++;}
  if(n===MAX_STEPS)acc=0; // tab was asleep: don't fast-forward
  ctx=SCR;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
  const sx=G.shake?Math.round(rnd(-1,1)*G.shake):0,sy=G.shake?Math.round(rnd(-1,1)*G.shake):0;
  ctx.save();ctx.translate(sx,sy);
  if(G.scene==='loading')drawLoading();else if(G.scene==='title')drawTitle();else if(G.scene==='select')drawSelect();else if(G.scene==='intro')drawIntro();else drawFight();
  ctx.restore();drawOverlays();if(G.scene!=='fight')drawPops();
 }catch(e){console.error(e);}
 fsUI();tc.classList.toggle('on',coarse&&G.scene==='fight'&&!G.paused&&!(G.over&&G.over.t>1.8));
 requestAnimationFrame(frame);}
requestAnimationFrame(frame);
// ---- Determinism tools (used by the test runner; harmless in normal play)
function simHash(){let h=2166136261>>>0;const mix=v=>{const s=typeof v==='number'?v.toFixed(6):String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
 for(const f of G.f||[]){mix(f.x);mix(f.z);mix(f.y);mix(f.hp);mix(f.meter);mix(f.state);mix(f.t);mix(f.dir);mix(f.out);}
 if(G.ref){mix(G.ref.x);mix(G.ref.z);mix(G.ref.mode);}mix(G.pin?G.pin.count:-1);mix(G.over?G.over.how+(G.over.w?G.over.w.idx:'-'):'');mix(G.fstep);mix(SIM.seed);
 return h.toString(16);}
// Run a whole match off-screen as fast as possible: CPU vs CPU, or replaying a recorded tape.
window.DD={simHash,
 runMatch(p1,p2,{seed,steps=60*90,replay=null,wideMap=true}={}){
  const iA=ROSTER.findIndex(c=>c.id===p1),iB=ROSTER.findIndex(c=>c.id===p2);
  if(wideMap)G.stage=3;
  G.mode=0;G.sel={c:[iA,iB],stage:2,picks:[iA,iB]};startIntro();G.f[0].cpu=replay?replay.cpu[0]:true;G.f[1].cpu=replay?replay.cpu[1]:true;
  G.replay=replay||null;G.forceSeed=replay?null:seed;beginFight();G.forceSeed=null;G.scene='fight';
  const hashes=[];let n=0;for(;n<steps&&!(G.over&&G.over.t>0.5);n++){simStep();if(n%60===0)hashes.push(simHash());}
  const out={steps:n,hash:simHash(),hashes,rec:G.rec,result:G.over?G.over.how+':'+(G.over.w?G.over.w.ch.id:'none'):'none',hp:G.f.map(f=>Math.round(f.hp))};
  G.replay=null;G.scene='title';return out;}};
