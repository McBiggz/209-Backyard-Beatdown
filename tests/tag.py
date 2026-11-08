import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1152,'height':648});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:200]))
    await pg.goto(URL+'?tag=1');await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    print('menu:',await pg.evaluate("TITLE_ITEMS.map(t=>t[0])"))
    for seed in [1,2,3,4]:
      r=await pg.evaluate(f"""(()=>{{const ev={{tags:0,saves:0,pins:0}};const ot=tryTag,os=updSave,op=startPin;
        window.tryTag=function(f){{const r=ot(f);if(r)ev.tags++;return r;}};window.startPin=function(f,o){{op(f,o);if(G.pin)ev.pins++;}};const oc=callout;window.callout=function(t,...a){{if(t==='SAVE!')ev.saves++;return oc(t,...a);}};
        G.forceSeed={seed};startTag(ROSTER.findIndex(c=>c.id==='viral'));G.forceSeed=null;G.f[0].cpu=true;
        const bad=[];let n=0;for(;n<60*480&&!(G.over&&G.over.t>0.5);n++){{simStep();if(G.pin&&G.pin.count===0&&G.pin.t<0.02){{}}
          for(const f of G.f)for(const k of ['x','z','y','hp'])if(!Number.isFinite(f[k]))bad.push(f.ch.id+k);
          const L=G.f.filter(f=>f.legal&&!f.out&&f.state!=='apron');if(G.f.filter(f=>f.legal).length!==2)bad.push('legal count');}}
        window.callout=oc;window.tryTag=ot;window.startPin=op;
        return {{secs:Math.round(n/60),how:G.over&&G.over.how,winner:G.over&&G.over.w&&G.over.w.ch.id,team:G.over&&G.over.w&&G.over.w.team,ev,bad:[...new Set(bad)].slice(0,4),hp:G.f.map(f=>Math.round(f.hp))}};}})()""")
      print('seed',seed,r)
    await pg.evaluate("G.forceSeed=3;startTag(ROSTER.findIndex(c=>c.id==='viral'));G.forceSeed=null;");await pg.wait_for_timeout(4000)
    await pg.screenshot(path='/home/claude/test3/tag.png')
    print('errors',errs[:5]);await b.close()
asyncio.run(main())
