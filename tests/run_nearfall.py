import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
SETUP="""(()=>{const i=ROSTER.findIndex(c=>c.id==='viral'),j=ROSTER.findIndex(c=>c.id==='papi');G.stage=3;G.mode=1;
G.sel={c:[i,j],stage:2,picks:[i,j]};startIntro();G.f[0].cpu=false;G.f[1].cpu=false;G.forceSeed=5;beginFight();G.scene='fight';finishEntrance();
for(const f of G.f){f.z=140;setState(f,'idle');}G.f[0].x=120;G.f[1].x=230;for(const k in keys)keys[k]=false;
window.__k=(c,on)=>{if(on){if(!keys[c])pressed[c]=true;keys[c]=true;}else keys[c]=false;};window.__r=n=>{for(let i=0;i<n;i++)simStep();};})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(SETUP)
    st=await pg.evaluate("__k('KeyD',true);__r(2);__k('KeyD',false);__r(3);__k('KeyD',true);__r(2);[G.f[0].state,Math.round(G.f[0].vx)]")
    print('double-tap right ->',st)
    await pg.evaluate(SETUP);await pg.evaluate("G.f[0].x=120;G.f[1].x=200;__k('KeyD',true);__r(2);__k('KeyD',false);__r(3);__k('KeyD',true);__r(6)")
    st=await pg.evaluate("__k('KeyF',true);__r(1);__k('KeyF',false);const s=[];for(let i=0;i<40;i++){simStep();s.push(G.f[0].state+'/'+G.f[1].state);}__k('KeyD',false);[...new Set(s)].join(' ')")
    print('run + punch into Papi ->',st)
    await pg.evaluate(SETUP)
    st=await pg.evaluate("G.f[1].x=280;G.f[0].x=160;__k('KeyA',true);__r(2);__k('KeyA',false);__r(3);__k('KeyA',true);const s=[];for(let i=0;i<120;i++){if(G.f[0].autoRun>0)__k('KeyA',false);simStep();s.push(G.f[0].state+(G.f[0].vx>0?'>':G.f[0].vx<0?'<':''));}[...new Set(s)].join(' ')")
    print('run left into ropes, let go ->',st)
    await pg.evaluate(SETUP)
    st=await pg.evaluate("G.f[0].x=100;G.f[1].x=190;__k('KeyD',true);__r(2);__k('KeyD',false);__r(3);__k('KeyD',true);__r(8);const hp=G.f[0].hp;let s=new Set();for(let i=0;i<60;i++){if(Math.abs(G.f[1].x-G.f[0].x)<42&&!keys['KeyK'])__k('KeyK',true);simStep();s.add(G.f[0].state);if(G.f[0].state!=='run'&&G.f[0].state!=='walk')__k('KeyD',false);}[...s].join(','),Math.round(hp-G.f[0].hp)")
    st=await pg.evaluate("[...new Set([1])]") and st
    print('P2 big-boots the runner ->',await pg.evaluate("[G.f[0].state,Math.round(100-G.f[0].hp)]"))
    # near fall: CPU pinned at 2, forced kickout right before 3
    await pg.evaluate(SETUP)
    r=await pg.evaluate("""(()=>{const[a,b]=G.f;b.cpu=true;b.hp=80;setState(b,'down');b.downDur=9;a.x=b.x-20;startPin(a,b);G.pin.count=2;G.pin.t=G.pin.nextAt-0.05;kickout();return [G.callout&&G.callout.text,G.ticker,G.hype];})()""")
    print('kick-out at 2.9 ->',r)
    r=await pg.evaluate("""(()=>{const[a,b]=G.f;__r(120);setState(b,'down');b.downDur=9;a.x=b.x-20;startPin(a,b);G.pin.count=1;G.pin.t=G.pin.nextAt-0.6;kickout();return [G.callout&&G.callout.text];})()""")
    print('kick-out at 1 ->',r)
    # mash prompt for a pinned human + finish button visibility
    await pg.evaluate(SETUP)
    await pg.evaluate("""(()=>{const[a,b]=G.f;setState(a,'down');a.downDur=9;b.x=a.x+20;startPin(b,a);G.pin.presses=3;})()""")
    await pg.evaluate("__r(30)");await pg.wait_for_timeout(300)
    vis=await pg.evaluate("[getComputedStyle(FINBTN).visibility,G.f[0].meter]")
    await pg.screenshot(path='/home/claude/test3/mash.png')
    await pg.evaluate("G.f[0].meter=100");await pg.wait_for_timeout(200)
    vis2=await pg.evaluate("[getComputedStyle(FINBTN).visibility,G.f[0].meter]")
    print('finish button: meter low ->',vis,'| meter full ->',vis2)
    # CPU uses running in real matches
    r=await pg.evaluate("""(()=>{let runs=0,matches=0;for(let m=0;m<4;m++){const i=ROSTER.findIndex(c=>c.id==='asesino'),j=ROSTER.findIndex(c=>c.id==='spektro');G.mode=0;G.sel={c:[i,j],stage:2,picks:[i,j]};startIntro();G.f[0].cpu=G.f[1].cpu=true;G.forceSeed=100+m;beginFight();G.scene='fight';
      let was=[0,0];for(let n=0;n<5000&&!(G.over&&G.over.t>0.5);n++){simStep();G.f.forEach((f,k)=>{const r=f.state==='run';if(r&&!was[k])runs++;was[k]=r;});}matches++;}return [matches,runs];})()""")
    print('CPU matches / times the CPU ran:',r)
    print('errors',errs);await b.close()
asyncio.run(main())
