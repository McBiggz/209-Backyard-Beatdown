# Roll him back in: player move, then CPU chasing the player out and rolling him back in.
import asyncio,sys
from playwright.async_api import async_playwright
SRC=open('tests/hardcore_player.py').read()
SETUP=SRC.split('SETUP="""')[1].split('"""')[0].replace("G.hc=true","G.hc=false")
H=SRC.split('H="""')[1].split('"""')[0]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(SETUP);await pg.evaluate(H)
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;me.out=o.out=true;me.x=150;me.z=200;o.x=150;o.z=190;setState(me,'idle');setState(o,'idle');__run(2);
      window.__Q[0]=Object.assign(blank(),{up:true,grabP:true});__run(1);const st=o.state;__run(40);return {on:G.rollInOn,oppState:st,oppOut:o.out,oppZ:Math.round(o.z)};})()""")
    print('player rolls him in:',r)
    # CPU: player rolls out to the front floor and stands there; does the CPU come out and roll him back in?
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;o.cpu=true;o.ai.chase=undefined;o.out=false;me.out=true;me.x=170;me.z=196;o.x=170;o.z=140;setState(me,'idle');setState(o,'idle');
      const log=[];let outT=-1,backT=-1,cpuIn=-1;for(let n=0;n<60*20;n++){__run(1);if(o.out&&outT<0)outT=n;if(!me.out&&backT<0)backT=n;if(backT>=0&&!o.out&&cpuIn<0)cpuIn=n;if(cpuIn>=0)break;}
      return {cpuWentOut:(outT/60).toFixed(1),playerRolledIn:(backT/60).toFixed(1),cpuBackIn:(cpuIn/60).toFixed(1)};})()""")
    print('cpu brings him back:',r)
    await pg.evaluate("""(()=>{const[me,o]=G.f;me.out=o.out=true;me.x=200;me.z=198;o.x=200;o.z=210;setState(me,'idle');setState(o,'idle');let n=0;while(me.state!=='roll'&&n<400){__run(1);n++;}__run(12);G.cam=60;})()""")
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/rollin.png')
    reg=await b.new_page();await reg.goto(sys.argv[1].replace('?test=1',''));await reg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await reg.evaluate(SETUP);print('regular link on:',await reg.evaluate('G.rollInOn'))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
