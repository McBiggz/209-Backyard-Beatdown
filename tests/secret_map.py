# Secret Map: both wrestlers at the entrance -> barn; both at the barn door -> back outside. Off on the regular link.
import asyncio,sys
from playwright.async_api import async_playwright
SRC=open('tests/hardcore_player.py').read()
SETUP=SRC.split('SETUP="""')[1].split('"""')[0].replace("G.hc=true","G.hc=false")
H=SRC.split('H="""')[1].split('"""')[0]
async def run(b,url,shots):
    pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(url);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(SETUP);await pg.evaluate(H)
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;me.out=o.out=true;me.x=505;me.z=160;o.x=530;o.z=162;setState(me,'idle');setState(o,'idle');const m0=G.map;__run(75+60*5);return [G.secretOn,m0,G.map,Math.round(me.x),G.co.n];})()""")
    print(url.split('?')[-1] if '?' in url else 'regular','-> after both at entrance:',r)
    if shots:
      await pg.evaluate("(()=>{__run(40);const[me,o]=G.f;__place(me,140,140);__place(o,180,142);__run(40);G.cam=0;})()");await pg.wait_for_timeout(250)
      await pg.screenshot(path='/home/claude/test3/secret_ring.png')
      await pg.evaluate("(()=>{const[me,o]=G.f;me.out=o.out=true;me.x=380;me.z=190;o.x=420;o.z=200;setState(me,'idle');setState(o,'idle');__run(20);G.cam=200;})()");await pg.wait_for_timeout(250)
      await pg.screenshot(path='/home/claude/test3/secret_floor.png')
      r=await pg.evaluate("""(()=>{const[me,o]=G.f;me.out=o.out=true;me.x=566;me.z=166;o.x=585;o.z=164;setState(me,'idle');setState(o,"idle");__run(75+60*5);return G.map;})()""")
      print('  both at the barn door ->',r)
    print('  errors',errs[:3]);await pg.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    await run(b,sys.argv[1]+'?test=1',True);await run(b,sys.argv[1],False);await b.close()
asyncio.run(main())
