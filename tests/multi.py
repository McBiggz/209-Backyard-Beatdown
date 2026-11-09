import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1152,'height':648});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:200]))
    await pg.goto(URL+'?test=1');await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    for n,elim,seed in [(3,False,1),(3,True,2),(4,False,3),(4,True,4),(4,True,5),(3,True,6)]:
      r=await pg.evaluate(f"""(()=>{{const ev={{pins:0,breaks:0,elims:0}};const op=startPin;const oc=callout;
        window.startPin=function(f,o){{op(f,o);if(G.pin)ev.pins++;}};window.callout=function(t,...a){{if(t==='BROKEN UP!')ev.breaks++;if(/ELIMINATED/.test(t))ev.elims++;return oc(t,...a);}};
        G.forceSeed={seed};const ids=['viral','dragon','ghoulie','asesino'].slice(0,{n});startGroup({{type:'multi',ids,elim:{'true' if elim else 'false'},ctl:ids.map(()=>'cpu'),fromSetup:true}});G.forceSeed=null;
        const bad=[];let k=0;for(;k<60*600&&!(G.over&&G.over.t>0.5);k++){{simStep();for(const f of G.f)for(const q of ['x','z','y','hp'])if(!Number.isFinite(f[q]))bad.push(f.ch.id+q);}}
        window.callout=oc;window.startPin=op;
        return {{secs:Math.round(k/60),how:G.over&&G.over.how,winner:G.over&&G.over.w.ch.id,ev,bad:[...new Set(bad)].slice(0,4),elim:G.f.map(f=>!!f.elim)}};}})()""")
      print(n,elim,r)
    await pg.evaluate("G.forceSeed=3;startGroup({type:'multi',ids:['viral','dragon','ghoulie','asesino'],elim:true,ctl:[0,'cpu','cpu','cpu'],fromSetup:true});G.forceSeed=null;")
    await pg.wait_for_timeout(5000);await pg.screenshot(path='/home/claude/test3/multi.png')
    print('errors',errs[:5]);await b.close()
asyncio.run(main())
