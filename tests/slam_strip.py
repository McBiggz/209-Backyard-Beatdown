# frame-by-frame strip of the slam finisher (and the snap suplex): python3 tests/slam_strip.py <url> <out.png> [attacker] [victim] [move]
import asyncio,sys
from playwright.async_api import async_playwright
SRC=open('tests/hardcore_player.py').read()
SETUP=SRC.split('SETUP="""')[1].split('"""')[0].replace("G.hc=true","G.hc=false")
H=SRC.split('H="""')[1].split('"""')[0]
URL,OUT=sys.argv[1],sys.argv[2];A=sys.argv[3] if len(sys.argv)>3 else 'papi';D=sys.argv[4] if len(sys.argv)>4 else 'viral';MV=sys.argv[5] if len(sys.argv)>5 else 'fin';SKIP=int(sys.argv[7]) if len(sys.argv)>7 else 0;LOW=len(sys.argv)>8
N=int(sys.argv[6]) if len(sys.argv)>6 else 45;STEP=2  # 36 shots, every 2 sim steps (1/30 s)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(SETUP);await pg.evaluate(H)
    await pg.evaluate("(()=>{window.__real=simStep;window.simStep=function(){return false;};window.__run=n=>{for(let k=0;k<n;k++)__real();};})()")
    await pg.evaluate(f"""(()=>{{const A=ROSTER.find(c=>c.id==='{A}'),D=ROSTER.find(c=>c.id==='{D}');
      for(const [k,c] of [[0,A],[1,D]]){{const f=makeFighter(c,0,140,k?-1:1,false,k);f.set=SETS[c.id];G.f[k]=f;}}
      G.paused=false;G.pin=null;const[me,o]=G.f;__place(me,140,150);__place(o,166,150);me.dir=1;o.dir=-1;__run(4);G.ref.x=-999;
      if('{MV}'==='fin'){{me.meter=100;tryFin(me,o);}}else{{link(me,o);setState(me,'grapple');setState(o,'grappled');}}
      __run({SKIP});G.cam=0;const r=document.querySelector('canvas').getBoundingClientRect(),k=r.width/W;window.__clip={{x:r.left+(PX(150,150)-80)*k,y:r.top+(PY(150)-({60 if LOW else 125}))*k,width:150*k,height:({80 if LOW else 140})*k}};}})()""")
    shots=[]
    for i in range(N):
      await pg.wait_for_timeout(30)
      fn=f'/tmp/st/slam_{i}.png';await pg.screenshot(path=fn,clip=await pg.evaluate('__clip'));shots.append(fn)
      await pg.evaluate(f"(()=>{{G.slowT=0;G.hitStop=0;__run({STEP});}})()")
    print('errors',errs[:3])
    from PIL import Image,ImageDraw
    cols=6 if LOW else 9;W_=330 if LOW else 220;H_=int(W_*(80 if LOW else 140)/150)+14;o=Image.new('RGB',(cols*W_,((N+cols-1)//cols)*H_),(30,30,30));d=ImageDraw.Draw(o)
    for k,fn in enumerate(shots):
      im=Image.open(fn);x,y=(k%cols)*W_,(k//cols)*H_;o.paste(im.resize((W_,int(W_*im.height/im.width))),(x,y+14));d.text((x+4,y+2),f'{(SKIP+k*STEP)/60:.2f}s',fill=(255,230,80))
    o.save(OUT)
    fr=[Image.open(fn).convert('RGB').resize((450,int(450*Image.open(fn).height/Image.open(fn).width))) for fn in shots];fr[0].save(OUT.replace('.png','.gif'),save_all=True,append_images=fr[1:],duration=33,loop=0)
    await b.close()
asyncio.run(main())
