# Universe rivalries: lose -> rematch 2 weeks later (singles) -> blow-off 2 weeks after (hardcore/cage) -> over.
import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    r=await pg.evaluate("""(()=>{localStorage.removeItem(UNI_KEY);uniStart(ROSTER.findIndex(c=>c.id==='viral'));const U=G.uni,log=[];
      // play the season: lose week 1, win everything else
      for(let wk=1;wk<=10;wk++){uniMatch();const kind=U.kind[U.week-1],opp=uniOpp().id,mode=G.cage?'cage':G.hc?'hardcore':'singles',hype=G.uniHype;
        beginFight();G.scene='fight';G.entrance=null;const iwin=wk!==1;endMatch(iwin?G.f[0]:G.f[1],iwin?G.f[1]:G.f[0]);G.over.t=2;uniAfterMatch();
        log.push(`wk${wk} ${opp} ${kind}/${mode} ${iwin?'W':'L'} | ${U.flash}`+(hype?' | '+hype:''));}
      return {log,rec:U.rec,riv:U.riv,done:U.rivDone};})()""")
    for l in r['log']:print(' ',l)
    print('record',r['rec'],'active',r['riv'],'finished',r['done'])
    await pg.evaluate("(()=>{localStorage.removeItem(UNI_KEY);uniStart(ROSTER.findIndex(c=>c.id==='viral'));const U=G.uni;uniMatch();beginFight();G.scene='fight';endMatch(G.f[1],G.f[0]);G.over.t=2;uniAfterMatch();U.flashT=0;})()")
    await pg.wait_for_timeout(300);await pg.screenshot(path='/home/claude/test3/uni_rival.png')
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
