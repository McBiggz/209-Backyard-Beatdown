# every wrestler pinning a fixed opponent, and every wrestler pinned by a fixed pinner; one PNG grid each
import asyncio,sys,json
from playwright.async_api import async_playwright
SRC=open('tests/hardcore_player.py').read()
SETUP=SRC.split('SETUP="""')[1].split('"""')[0].replace("G.hc=true","G.hc=false")
H=SRC.split('H="""')[1].split('"""')[0]
URL=sys.argv[1];MODE=sys.argv[2];OUT=sys.argv[3];TYPE=sys.argv[4] if len(sys.argv)>4 else 'cover'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    ids=await pg.evaluate("ROSTER.filter(c=>c.id!=='kliq').map(c=>c.id)")
    await pg.evaluate(SETUP);await pg.evaluate(H)
    shots=[]
    for i,w in enumerate(ids):
      a,d=(w,'viral') if MODE=='pinner' else ('bigmf' if w!='bigmf' else 'viral',w)
      ok=await pg.evaluate(f"""(()=>{{const A=ROSTER.find(c=>c.id==='{a}'),D=ROSTER.find(c=>c.id==='{d}');
        for(const [k,c] of [[0,A],[1,D]]){{const f=makeFighter(c,0,140,k?-1:1,false,k);f.set=SETS[c.id];G.f[k]=f;}}
        G.paused=false;G.pin=null;const[me,o]=G.f;__place(me,140,140);__place(o,160,140);setState(o,'down');o.downDur=99;o.hp=60;__run(20);
        startPin(me,o);if(G.pin){{G.pin.type='{TYPE}';G.pin.need=999;}}__run(Math.round(60*0.9));G.cam=0;G.ref.x=60;G.ref.z=125;
        const r=document.querySelector('canvas').getBoundingClientRect(),k=r.width/W;window.__clip={{x:r.left+(PX(o.x,o.z)-75)*k,y:r.top+(PY(o.z)-105)*k,width:150*k,height:120*k}};return G.pin?[G.pin.type,frameOf(me),frameOf(o)]:null;}})()""")
      await pg.wait_for_timeout(60)
      fn=f'/tmp/st/pin_{MODE}_{i}.png';await pg.screenshot(path=fn,clip=await pg.evaluate('__clip'));shots.append((w,fn,ok))
    print(json.dumps([(s[0],s[2]) for s in shots]));print('errors',errs[:3])
    from PIL import Image,ImageDraw
    cols=6;W_,H_=260,226;o=Image.new('RGB',(cols*W_,((len(shots)+cols-1)//cols)*H_),(30,30,30));d=ImageDraw.Draw(o)
    for k,(w,fn,ok) in enumerate(shots):
      im=Image.open(fn);x,y=(k%cols)*W_,(k//cols)*H_;o.paste(im.resize((W_,H_-18)),(x,y+18));d.text((x+4,y+3),w+(' '+str(ok[1]) if ok else ' NO PIN'),fill=(255,230,80))
    o.save(OUT);await b.close()
asyncio.run(main())
