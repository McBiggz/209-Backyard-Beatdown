import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
SETUP="""(()=>{const i=ROSTER.findIndex(c=>c.id==='viral'),j=ROSTER.findIndex(c=>c.id==='papi');G.stage=3;G.mode=1;
G.sel={c:[i,j],stage:2,picks:[i,j]};startIntro();G.f[0].cpu=false;G.f[1].cpu=false;G.forceSeed=5;beginFight();G.scene='fight';G.entrance=null;
for(const f of G.f){f.hidden=false;f.z=140;setState(f,'idle');}G.f[0].x=140;G.f[1].x=160;})()"""
def steps(n,key=None,at=0): return f"""(()=>{{const log=[];for(let k=0;k<{n};k++){{ {'' if not key else f"if(k==={at}){{pressed['{key}']=true;keys['{key}']=true;}} if(k==={at}+2)keys['{key}']=false;"} simStep();log.push(G.f.map(f=>f.state).join('/'));}}return log;}})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1152,'height':648});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    # 1) P1 whips P2, P2 presses GRAB (L) in the window -> reversal
    await pg.evaluate(SETUP);await pg.evaluate("startWhip(G.f[0],G.f[1],-1,true)")
    log=await pg.evaluate(steps(30,'KeyL',6));print('reverse:',log[5],'->',log[8],'->',log[-1])
    await pg.wait_for_timeout(50);await pg.evaluate("drawFight()")
    # 2) no reversal, P2 waits for the ropes, then PUNCH (J) -> flying clothesline
    await pg.evaluate(SETUP);await pg.evaluate("startWhip(G.f[0],G.f[1],1,true)")
    for k in range(200):
      st=await pg.evaluate("(simStep(),[G.f[1].state,G.f[1].runWin||0,G.f[1].bounced])")
      if st[1]>0: break
    # show icon screenshot
    await pg.evaluate("ctx=SCR;ctx.setTransform(DPR,0,0,DPR,0,0);drawFight();");await pg.screenshot(path='/home/claude/test3/icon.png')
    hp0=await pg.evaluate("G.f[0].hp")
    log=await pg.evaluate(steps(60,'KeyJ',0));hp1=await pg.evaluate("G.f[0].hp")
    print('clothesline:',sorted(set(log)),'p1 hp',hp0,'->',round(hp1,1))
    # 3) same but KICK (K) -> dropkick
    await pg.evaluate(SETUP);await pg.evaluate("startWhip(G.f[0],G.f[1],1,true)")
    for k in range(200):
      st=await pg.evaluate("(simStep(),G.f[1].runWin||0)")
      if st>0: break
    log=await pg.evaluate(steps(60,'KeyK',0));hp2=await pg.evaluate("G.f[0].hp")
    print('dropkick:',sorted(set(log)),'p1 hp ->',round(hp2,1))
    # 4) reversed whip can't be reversed back
    await pg.evaluate(SETUP);await pg.evaluate("startWhip(G.f[0],G.f[1],-1,true)")
    await pg.evaluate(steps(10,'KeyL',3));log=await pg.evaluate(steps(10,'KeyH',2))
    print('re-reverse blocked:',log[-1])
    print('errors',errs);await b.close()
asyncio.run(main())
