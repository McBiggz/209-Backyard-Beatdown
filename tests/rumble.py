import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1152,'height':648});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:200]))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    for seed in [1,2,3,4,5]:
      r=await pg.evaluate(f"""(()=>{{G.forceSeed={seed};startRumble(ROSTER.findIndex(c=>c.id==='viral'));G.forceSeed=null;G.f[0].cpu=true;
        const log=[];let n=0,lastE=0;for(;n<60*600&&!(G.over&&G.over.t>0.5);n++){{simStep();
         for(const f of G.f)for(const k of ['x','z','y','hp'])if(!Number.isFinite(f[k]))log.push('NaN '+f.ch.id+' '+k+' '+f.state);
         if(G.mm.elimOrder.length!==lastE){{lastE=G.mm.elimOrder.length;log.push(Math.round(n/60)+'s out:'+G.f[G.mm.elimOrder[lastE-1]].ch.id);}}
         if(log.length>40)break;}}
        return {{secs:Math.round(n/60),entered:G.mm.entered,winner:G.over&&G.over.w&&G.over.w.ch.id,elims:G.mm.elimOrder.length,log:log.slice(0,12)}};}})()""")
      print('seed',seed,r)
    await pg.evaluate("G.forceSeed=9;startRumble(ROSTER.findIndex(c=>c.id==='viral'));G.forceSeed=null;")
    await pg.wait_for_timeout(2500);await pg.screenshot(path='/home/claude/test3/rumble_start.png')
    r=await pg.evaluate("(()=>{let n=0;for(;n<60*300&&!G.mm.p1Out;n++)simStep();return [Math.round(n/60),G.mm.p1Out,G.mm.entered];})()")
    print('idle human eliminated after',r)
    await pg.wait_for_timeout(700);await pg.screenshot(path='/home/claude/test3/rumble_out.png')
    await pg.keyboard.press('Enter');await pg.wait_for_function("G.over&&G.over.t>2.5",timeout=60000);await pg.wait_for_timeout(800)
    print('fast forward winner:',await pg.evaluate("G.over.w.ch.id"));await pg.screenshot(path='/home/claude/test3/rumble_win.png')
    print('errors',errs[:5]);await b.close()
asyncio.run(main())
