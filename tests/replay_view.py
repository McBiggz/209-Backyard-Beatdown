import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1152,'height':648});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:200]))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    for a,c,seed in [('bigmf','viral',777),('papi','dragon',42)]:
      r=await pg.evaluate(f"""(()=>{{const iA=ROSTER.findIndex(c=>c.id==='{a}'),iB=ROSTER.findIndex(c=>c.id==='{c}');G.stage=3;G.mode=0;G.sel={{c:[iA,iB],stage:2,picks:[iA,iB]}};startIntro();
        G.f[0].cpu=G.f[1].cpu=true;G.forceSeed={seed};beginFight();G.forceSeed=null;G.scene='fight';
        let n=0;for(;n<6000&&!(G.over&&G.over.t>0.9);n++)simStep();return [n,G.over&&G.over.how,G.finAt,G.bigAt,G.fstep,G.snaps.size];}})()""")
      print(a,c,'sim to bell:',r)
      h0=await pg.evaluate("(()=>{let s=0;while(!G.irp&&s<30){simStep();s++;}return [!!G.irp,G.irp&&G.irp.endStep,G.irp&&[G.irp.a,G.irp.b],G.fstep]})()")
      print(' replay started:',h0)
      endHashBefore=await pg.evaluate("(()=>{const cur=getSnap();setSnap(G.irp.end);const h=simHash();setSnap(cur);return h;})()")
      await pg.wait_for_timeout(1500);await pg.screenshot(path=f'/home/claude/test3/irp_{a}.png')
      await pg.wait_for_function("!G.irp",timeout=20000)
      after=await pg.evaluate("[simHash(),G.fstep,!!G.over,G.over&&G.over.irpDone]")
      print(' after replay: same state as before =',after[0]==endHashBefore,'| step',after[1],'| over',after[2],after[3])
      await pg.wait_for_timeout(1500);await pg.screenshot(path=f'/home/claude/test3/irp_{a}_after.png')
    print('errors',errs);await b.close()
asyncio.run(main())
