# 5-by-5s: leapfrog and drop down a runner as the player, then CPU vs CPU counts + replay check.
import asyncio,sys
from playwright.async_api import async_playwright
SETUP="""(()=>{G.hc=false;G.stage=3;G.mode=0;const iA=ROSTER.findIndex(c=>c.id==='viral'),iB=ROSTER.findIndex(c=>c.id==='papi');
 G.sel={c:[iA,iB],stage:2,picks:[iA,iB]};startIntro();G.f[0].cpu=false;G.f[1].cpu=false;G.forceSeed=7;beginFight();G.forceSeed=null;G.scene='fight';G.entrance=null;G.f.forEach(f=>f.hidden=false);
 window.__Q=[blank(),blank()];window.humanInput=i=>{const q=window.__Q[i];window.__Q[i]=Object.assign(blank(),{left:q.left,right:q.right,down:false});return q;};
 window.__set=(i,o)=>{window.__Q[i]=Object.assign(blank(),o);};window.__run=n=>{for(let k=0;k<n;k++)simStep();};return 1;})()"""
TRY="""((down)=>{const[me,o]=G.f;const pops=[];const op=popOn;window.popOn=function(f,t,...r){pops.push(t);return op(f,t,...r);};
 me.x=100;me.z=140;o.x=230;o.z=140;me.out=o.out=false;setState(me,'idle');setState(o,'run');o.runDir=-1;o.dir=-1;o.vx=-CTR.run.speed*o.ch.spd;o.autoRun=2;
 // wait until he's about 60px away, then dodge (keep him running by holding left)
 let n=0;while(Math.abs(o.x-me.x)>60&&n<200){__set(1,{left:true});__run(1);n++;}
 __set(0,down?{jumpP:true,down:true}:{jumpP:true});__set(1,{left:true});__run(1);const st=me.state;for(let k=0;k<40;k++){__set(1,{left:true});__run(1);}
 window.popOn=op;return {dodgeState:st,pops,runnerStill:o.state};})"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(SETUP)
    print('leapfrog',await pg.evaluate(TRY,False))
    print('drop down',await pg.evaluate(TRY,True))
    # screenshot mid-leapfrog
    await pg.evaluate("""(()=>{const[me,o]=G.f;me.x=100;me.z=140;o.x=200;o.z=140;setState(me,'idle');setState(o,'run');o.runDir=-1;o.dir=-1;o.vx=-CTR.run.speed*o.ch.spd;o.autoRun=2;
      let n=0;while(Math.abs(o.x-me.x)>55&&n<200){__set(1,{left:true});__run(1);n++;}__set(0,{jumpP:true});__run(14);G.cam=0;})()""")
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/leapfrog.png')
    # CPU vs CPU: do they dodge, and do replays still match?
    r=await pg.evaluate("""(()=>{let pops={};const op=popOn;window.popOn=function(f,t,...r){if(/LEAPFROG|DROP|DUCKED/.test(t))pops[t]=(pops[t]||0)+1;return op(f,t,...r);};
      const out=[];for(const[s,a,b] of [[1,'viral','papi'],[2,'jojo','zeke'],[3,'dragon','spektro'],[4,'cdiddy','maverick']]){const r=DD.runMatch(a,b,{seed:s,steps:60*120});const rp=DD.runMatch(a,b,{replay:r.rec,steps:60*120});out.push([r.result,r.snapOK,rp.hash===r.hash]);}
      window.popOn=op;return {pops,out};})()""")
    print('cpu',r);print('errors',errs[:3]);await b.close()
asyncio.run(main())
