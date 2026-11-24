# Frame audit: plays scripted moments for a few pairs and saves a frame strip of each (every 3 sim steps = 20 fps).
# python3 tests/frame_audit.py <url> <outdir> [scene ...]
import asyncio,sys,os,json
from playwright.async_api import async_playwright
URL,OUT=sys.argv[1],sys.argv[2];ONLY=set(sys.argv[3:]);os.makedirs(OUT,exist_ok=True)
# scene: name, pair, setup js (me=G.f[0], o=G.f[1]), tape [(steps, p1 keys, p2 keys)], capture every
K=lambda **k:k
SCENES=[
 ('walk','viral','cjdirt',"me.x=90;o.x=260;",[(40,K(right=1),{}),(30,K(down=1),{}),(30,K(up=1),{}),(40,K(left=1),{}),(20,{},{})]),
 ('run','viral','cjdirt',"me.x=90;o.x=270;",[(2,K(right=1),{}),(2,{},{}),(2,K(right=1),{}),(40,K(right=1),{}),(20,{},{})]),
 ('strikes','viral','cjdirt',"",[(1,K(punchP=1),{}),(24,{},{}),(1,K(kickP=1),{}),(30,{},{}),(1,{},K(punchP=1)),(30,{},{})]),
 ('block','viral','cjdirt',"",[(1,{},K(punchP=1)),(2,K(left=1),{}),(26,K(left=1),{}),(20,{},{})]),
 ('suplex','viral','cjdirt',"",[(1,K(grabP=1),{}),(80,{},{}),(40,{},{})]),
 ('suplex_big','matsunaga','zeke',"",[(1,K(grabP=1),{}),(80,{},{}),(30,{},{})]),
 ('whip_clothes','viral','cjdirt',"",[(1,K(grabP=1,right=1),K()),(60,{},{}),(1,K(punchP=1),{}),(60,{},{})]),
 ('knockdown_getup','viral','cjdirt',"o.hp=60;",[(1,K(punchP=1),{}),(14,{},{}),(1,K(punchP=1),{}),(14,{},{}),(1,K(kickP=1),{}),(150,{},{})]),
 ('stomp','viral','cjdirt',"setState(o,'down');o.downDur=6;o.x=me.x+24;",[(1,K(punchP=1),{}),(30,{},{}),(1,K(kickP=1),{}),(30,{},{})]),
 ('pin_cover','viral','cjdirt',"setState(o,'down');o.downDur=9;o.x=me.x+22;o.hp=5;",[(1,K(down=1,grabP=1),{}),(240,{},{})]),
 ('dropkick','viral','cjdirt',"o.x=me.x+70;",[(1,K(jumpP=1,right=1),{}),(4,K(right=1),{}),(1,K(kickP=1,right=1),{}),(60,{},{})]),
 ('fin_slam','papi','viral',"me.meter=100;",[(1,K(finP=1),{}),(150,{},{})]),
 ('fin_spin','spektro','viral',"me.meter=100;",[(1,K(finP=1),{}),(150,{},{})]),
 ('fin_kick','dragon','viral',"me.meter=100;",[(1,K(finP=1),{}),(150,{},{})]),
 ('fin_scream','viral','cjdirt',"me.meter=100;",[(1,K(finP=1),{}),(150,{},{})]),
 ('fin_big_on_small','bigmf','matsunaga',"me.meter=100;",[(1,K(finP=1),{}),(150,{},{})]),
 ('fin_small_on_big','matsunaga','zeke',"me.meter=100;",[(1,K(finP=1),{}),(150,{},{})]),
 ('corner_dive','viral','cjdirt',"me.x=268;me.z=160;o.x=200;setState(o,'down');o.downDur=9;",[(30,K(right=1,up=1),{}),(1,K(jumpP=1),{}),(20,{},{}),(1,K(jumpP=1,left=1),{}),(80,{},{})]),
 ('rollout','viral','cjdirt',"me.x=280;me.z=190;o.x=150;",[(60,K(down=1,right=1),{}),(40,K(right=1),{}),(30,{},{})]),
]
PAIRS_SETUP="""([a,b])=>{G.forceSeed=4;startGroup({type:'multi',ids:[a,b],elim:false,ctl:[0,1],fromSetup:true});G.forceSeed=null;
 window.__real=window.__real||simStep;window.simStep=()=>false;let k=0;while(G.f.some(f=>f.entering)&&k<2400){__real();k++;}
 for(let i=0;i<20;i++)__real();const[me,o]=G.f;me.x=150;me.z=165;o.x=180;o.z=165;me.dir=1;o.dir=-1;for(const q of G.f){q.vx=q.vz=0;q.y=0;setState(q,'idle');q.hp=100;q.meter=0;}
 G.ref.x=40;G.ref.z=130;window.__R={inp:[]};G.replay=__R;return 1;}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=3);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    from PIL import Image,ImageDraw
    for name,a,bb,setup,tape in SCENES:
      if ONLY and name not in ONLY:continue
      print('start',name,flush=True)
      await pg.evaluate(PAIRS_SETUP,[a,bb]);await pg.evaluate("(()=>{const[me,o]=G.f;"+setup+"})()")
      box=await pg.evaluate("(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return [c.left,c.top,c.width/W];})()")
      L,T,k=box;shots=[];step=0;EV=int(os.environ.get('EV','6'));HW=100 if name in ('walk','run','rollout','corner_dive') else 72
      async def snap():
        cx,cy=await pg.evaluate("(()=>{const f=G.f;const x=(PX(f[0].x,f[0].z)+PX(f[1].x,f[1].z))/2;return [clamp(x,72,W-72),Math.min(PY((f[0].z+f[1].z)/2),216-20)];})()")
        await pg.evaluate("(()=>{frame._ds=null;if(G.callout&&/WAY|THREAT|FIGHT/.test(G.callout.text))G.callout=null;})()")
        await pg.wait_for_timeout(40)
        fn=f'/tmp/st/fa_{len(shots)}.png';await pg.screenshot(path=fn,clip={'x':L+(cx-HW)*k,'y':T+(cy-112)*k,'width':2*HW*k,'height':124*k});shots.append(fn)
      for n,k1,k2 in tape:
        js1=json.dumps({kk:True for kk in k1});js2=json.dumps({kk:True for kk in k2})
        for i in range(n):
          held1={kk:True for kk in k1 if not kk.endswith('P')} if i>0 else json.loads(js1);held2={kk:True for kk in k2 if not kk.endswith('P')} if i>0 else json.loads(js2)
          await pg.evaluate(f"(()=>{{__R.inp[G.fstep]=[packInp({json.dumps(held1)}),packInp({json.dumps(held2)})];__real();}})()")
          step+=1
          if step%EV==0:await snap()
          if step%30==0:print(' step',step,flush=True)
      cols=4;w=520;h=int(300*124/(2*HW));o=Image.new('RGB',(cols*w,((len(shots)+cols-1)//cols)*(h+12)),(20,16,22));d=ImageDraw.Draw(o)
      for i,fn in enumerate(shots):
        im=Image.open(fn).convert('RGB').resize((w,h));x,y=(i%cols)*w,(i//cols)*(h+12);o.paste(im,(x,y+12));d.text((x+3,y),f'{i*EV/60:.2f}s',fill=(255,220,80))
      o.save(f'{OUT}/{name}.png');print(name,len(shots),'frames',await pg.evaluate("G.f.map(f=>f.state).join('/')"))
    print('errors',errs[:5]);await b.close()
asyncio.run(asyncio.wait_for(main(),400))
