import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
SETUP="""(cpuD)=>{const i=ROSTER.findIndex(c=>c.id==='viral'),j=ROSTER.findIndex(c=>c.id==='papi');G.stage=3;G.mode=1;
G.sel={c:[i,j],stage:2,picks:[i,j]};startIntro();G.f[0].cpu=false;G.f[1].cpu=cpuD;G.forceSeed=5;beginFight();G.scene='fight';finishEntrance();for(const k in keys)keys[k]=false;
const[a,b]=G.f;a.z=b.z=140;setState(a,'idle');a.x=150;b.x=180;
window.__k=(c,on)=>{if(on){if(!keys[c])pressed[c]=true;keys[c]=true;}else keys[c]=false;};window.__r=n=>{for(let i=0;i<n;i++)simStep();};}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1152,'height':648});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    # human Viral at 0 HP pinned by Papi, meter full -> press R
    await pg.evaluate(SETUP,False)
    await pg.evaluate("(()=>{const[a,b]=G.f;a.hp=0;a.meter=100;setState(a,'down');a.downDur=9;b.x=bodyX(a)+14;startPin(b,a);})()")
    await pg.evaluate("__r(70)");await pg.screenshot(path='/home/claude/test3/sw_prompt.png')
    r=await pg.evaluate("__k('KeyR',true);__r(1);__k('KeyR',false);[!!G.pin,G.callout&&G.callout.text,Math.round(G.f[0].hp),G.f[0].meter,G.f[0].usedSW,!!G.over]")
    print('human second wind ->',r)
    r=await pg.evaluate("(()=>{const[a,b]=G.f;__r(120);a.hp=0;a.meter=100;setState(a,'down');a.downDur=9;b.x=bodyX(a)+14;startPin(b,a);__k('KeyR',true);__r(1);__k('KeyR',false);__r(200);return [!!G.pin,G.over&&G.over.how,G.over&&G.over.w&&G.over.w.ch.id];})()")
    print('second time (already used) ->',r)
    # CPU Papi pinned at 0 HP with meter -> should second-wind at the 2.9
    await pg.evaluate(SETUP,True)
    r=await pg.evaluate("(()=>{const[a,b]=G.f;b.hp=0;b.meter=100;setState(b,'down');b.downDur=9;a.x=bodyX(b)-14;startPin(a,b);const log=[];for(let n=0;n<300&&G.pin;n++){simStep();}return [G.pin?'still pinned':'out',G.callout&&G.callout.text,Math.round(b.hp),b.meter,!!G.over];})()")
    print('cpu second wind ->',r)
    print('errors',errs);await b.close()
asyncio.run(main())
