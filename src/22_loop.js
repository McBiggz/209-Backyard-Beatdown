// ================= LOOP =================
function updFx(dt){
 for(const p of G.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='dust'){p.vy+=120*dt;p.vx*=0.95;}else if(p.type==='fire')p.vy-=30*dt;else if(p.type!=='ring')p.vy+=260*dt;}
 G.parts=G.parts.filter(p=>p.life>0);if(G.parts.length>500)G.parts.splice(0,G.parts.length-500);
 for(const p of G.pops){p.life-=dt;p.y-=18*dt;}G.pops=G.pops.filter(p=>p.life>0);
 if(G.callout){G.callout.t+=dt;if(G.callout.t>=G.callout.dur)G.callout=null;}
 G.shake=Math.max(0,G.shake-dt*30);G.flash=Math.max(0,G.flash-dt*1.6);G.tickerT+=dt;
 if(crowdG&&AC)crowdG.gain.setTargetAtTime(muted?0:0.025+G.hype*0.16,AC.currentTime,0.25);}
let last=performance.now();
function frame(now){const dt=Math.min(0.034,(now-last)/1000);last=now;G.t+=dt;
 try{
  switch(G.scene){case 'loading':updLoading();break;case 'title':updTitle();break;case 'select':updSelect();break;
   case 'intro':G.introT+=dt;if(G.introT>2.8||(G.introT>0.4&&(confirmP()||clickQ)))beginFight();break;case 'fight':updFight(dt);break;}
  updFx(dt);
  ctx=SCR;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
  const sx=G.shake?Math.round(rnd(-1,1)*G.shake):0,sy=G.shake?Math.round(rnd(-1,1)*G.shake):0;
  ctx.save();ctx.translate(sx,sy);
  if(G.scene==='loading')drawLoading();else if(G.scene==='title')drawTitle();else if(G.scene==='select')drawSelect();else if(G.scene==='intro')drawIntro();else drawFight();
  ctx.restore();drawOverlays();if(G.scene!=='fight')drawPops();
 }catch(e){console.error(e);}
 fsUI();tc.classList.toggle('on',coarse&&G.scene==='fight'&&!G.paused&&!(G.over&&G.over.t>1.8));
 for(const k in pressed)delete pressed[k];clickQ=null;requestAnimationFrame(frame);}
requestAnimationFrame(frame);

