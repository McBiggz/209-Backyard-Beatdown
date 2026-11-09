# Universe promos: post, followers, heat (win bonus / ratio'd), social media title shot.
import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate("""(()=>{localStorage.removeItem(UNI_KEY);uniStart(ROSTER.findIndex(c=>c.id==='viral'));window.__Q=blank();window.humanInput=()=>{const q=window.__Q;window.__Q=blank();return q;};return 1;})()""")
    print('hub items',await pg.evaluate("uniItems().map(x=>x[0])"))
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/promo_hub.png')
    # write a trash-talk post: pick the 'trash' option each line
    await pg.evaluate("(()=>{promoStart();})()");await pg.evaluate("(()=>{const P=G.pr;P.sel=P.slots[0].findIndex(o=>o.t==='trash');window.__Q.punchP=true;updPromo();})()")
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/promo_write.png')
    r=await pg.evaluate("""(()=>{const P=G.pr;for(let i=0;i<2;i++){P.sel=P.slots[P.pick.length].findIndex(o=>o.t==='trash');window.__Q.punchP=true;updPromo();}
      for(let n=0;n<170;n++)updPromo();return {fol:G.uni.fol,heat:G.uni.heat,res:P.res,body:P.pick.map(p=>p.s)};})()""")
    print('trash post',r)
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/promo_post.png')
    r=await pg.evaluate("""(()=>{window.__Q.punchP=true;updPromo();const U=G.uni,before=U.fol;uniMatch();const meter=null;beginFight();G.scene='fight';const m=G.f[0].meter,hy=G.hype.toFixed(2);
      endMatch(G.f[1],G.f[0]);G.over.t=2;uniAfterMatch();return {scene:G.scene,meterStart:m,hype:hy,before,after:U.fol,flash:U.flash};})()""")
    print('lost after trash talk',r)
    r=await pg.evaluate("""(()=>{const U=G.uni;U.fol=3200;smCheckTitle(U);return {shot:U.sm.shot,holder:U.sm.holder,kind:U.kind,flash:U.flash};})()""")
    print('title shot',r)
    print('errors',errs[:4]);await b.close()
asyncio.run(main())
