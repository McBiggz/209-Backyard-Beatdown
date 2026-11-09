# Test link tutorial: the running dummy, leapfrog + drop down lessons complete, free-practice RUN dummy exists.
import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    print('lessons',await pg.evaluate("LESSONS.map(l=>l.ev).join(' ')"),'| dummy modes',await pg.evaluate("DUMMY_MODES.join(',')"))
    r=await pg.evaluate("""(()=>{G.stage=3;G.mode=3;const iA=ROSTER.findIndex(c=>c.id==='viral'),iB=ROSTER.findIndex(c=>c.id==='bigmf');G.sel={c:[iA,iB],stage:2,picks:[iA,iB]};startIntro();G.f[0].cpu=false;tutStart();G.scene='fight';
      let Q=blank();window.humanInput=i=>{const q=i?blank():Q;Q=blank();return q;};const log=[];
      for(const ev of ['leapfrog','dropdown']){G.tut.i=LESSONS.findIndex(l=>l.ev===ev);G.tut.got=0;G.tut.doneT=-1;const me=G.f[0],d=G.f[1];
       let steps=0;for(;steps<60*40&&G.tut.i===LESSONS.findIndex(l=>l.ev===ev);steps++){
        // the 'player': dodge when the runner is ~55px away and coming
        if(d.state==='run'&&(me.x-d.x)*d.runDir>0&&Math.abs(me.x-d.x)<58&&['idle','walk'].includes(me.state))Q=ev==='leapfrog'?Object.assign(blank(),{jumpP:true}):Object.assign(blank(),{jumpP:true,down:true});
        simStep();}
       log.push([ev,'done in',Math.round(steps/60)+'s',G.tut.i>LESSONS.findIndex(l=>l.ev===ev)]);}
      return log;})()""")
    print(r);print('errors',errs[:3]);await b.close()
asyncio.run(main())
