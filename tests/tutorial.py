import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
H="""window.__k=(code,on)=>{if(on){if(!keys[code])pressed[code]=true;keys[code]=true;}else keys[code]=false;};
window.__run=(n)=>{for(let i=0;i<n;i++)simStep();};
window.__near=()=>{const[a,b]=G.f;if(a.out||b.out){a.out=b.out=false;}a.z=b.z=140;a.x=b.x-20;a.dir=1;setState(a,'idle');if(['idle','walk'].includes(b.state)){}};
window.__st=()=>[G.tut.i,G.tut.got,G.tut.free,G.f[0].state,G.f[1].state];0;"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(H)
    await pg.evaluate("G.menu=3;__k('Enter',true);__run(1);__k('Enter',false);__run(1);")
    print('select mode',await pg.evaluate("[G.scene,G.mode]"))
    await pg.evaluate("__k('Enter',true);__run(1);__k('Enter',false);__run(5);")
    print('started',await pg.evaluate("[G.scene,!!G.tut,G.f.map(f=>f.ch.id)]"))
    await pg.screenshot(path='/home/claude/test3/tut0.png')
    async def lesson(name,js,steps=240,pre=True):
      if pre: await pg.evaluate("__run(90)")
      before=await pg.evaluate("G.tut.i")
      await pg.evaluate(js)
      for k in range(steps):
        await pg.evaluate("__run(1)")
        if await pg.evaluate(f"G.tut.i>{before}||G.tut.free"):break
      print(f'{name:12}', 'PASSED' if await pg.evaluate(f"G.tut.i>{before}||G.tut.free") else 'stuck', await pg.evaluate("__st()"))
    await lesson('move',"__k('KeyD',true);setTimeout(()=>{},0)",400);await pg.evaluate("__k('KeyD',false)")
    await lesson('punch',"__near();__k('KeyF',true);__run(1);__k('KeyF',false);__run(30);__near();__k('KeyF',true);__run(1);__k('KeyF',false)",200)
    await lesson('kick',"__near();__k('KeyG',true);__run(1);__k('KeyG',false);__run(40);__near();__k('KeyG',true);__run(1);__k('KeyG',false)",200)
    await pg.screenshot(path='/home/claude/test3/tut_block.png')
    await lesson('block',"__near();__k('KeyA',true)",500);await pg.evaluate("__k('KeyA',false)")
    await lesson('whip',"__near();__k('KeyA',true);__k('KeyH',true);__run(1);__k('KeyH',false);__k('KeyA',false)",200)
    # reverse: wait until the dummy whips us, then press grab during the window
    await pg.evaluate("__run(90);__near()")
    for k in range(400):
      await pg.evaluate("__run(1)")
      if await pg.evaluate("G.f[0].state==='whipped'&&G.f[0].ctrWin>0.1"):break
    await pg.screenshot(path='/home/claude/test3/tut_reverse.png')
    await lesson('reverse',"__k('KeyH',true);__run(1);__k('KeyH',false)",200,pre=False)
    await pg.evaluate("__run(120);__near()")
    for k in range(600):
      await pg.evaluate("__run(1)")
      if await pg.evaluate("G.f[0].state==='whipped'&&G.f[0].runWin>0"):break
    await lesson('rope attack',"__k('KeyF',true);__run(1);__k('KeyF',false)",200,pre=False)
    await lesson('dive',"__run(60);const a=G.f[0];setState(a,'perch');a.x=84;a.z=121;a.y=30;a.dir=1;__k('KeyF',true);__run(1);__k('KeyF',false)",300)
    await lesson('pin',"__run(60);__near();const b=G.f[1];setState(b,'down');b.downDur=5;__k('KeyH',true);__run(1);__k('KeyH',false)",300)
    await pg.evaluate("__run(200)")
    print('meter at finisher lesson',await pg.evaluate("G.f[0].meter"))
    await lesson('finisher',"__near();__k('KeyR',true);__run(1);__k('KeyR',false)",300)
    await lesson('roll out',"__run(200);G.f[0].out=true",200)
    await pg.evaluate("__run(120)")
    print('free practice:',await pg.evaluate("[G.tut.free,G.tut.dummy]"))
    await pg.evaluate("__k('KeyT',true);__run(1);__k('KeyT',false);__k('KeyT',true);__run(1);__k('KeyT',false);__run(240)")
    print('dummy FIGHT mode -> cpu:',await pg.evaluate("[G.tut.dummy,G.f[1].cpu,G.f[1].state]"))
    await pg.evaluate("__run(1)");await pg.wait_for_timeout(300);await pg.screenshot(path='/home/claude/test3/tut_free.png')
    print('errors',errs);await b.close()
asyncio.run(main())
