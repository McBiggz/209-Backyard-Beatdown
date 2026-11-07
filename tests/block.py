import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
SETUP="""(()=>{const i=ROSTER.findIndex(c=>c.id==='viral'),j=ROSTER.findIndex(c=>c.id==='papi');G.stage=3;G.mode=1;
G.sel={c:[i,j],stage:2,picks:[i,j]};startIntro();G.f[0].cpu=false;G.f[1].cpu=false;G.forceSeed=5;beginFight();G.scene='fight';G.entrance=null;
for(const f of G.f){f.hidden=false;f.z=140;setState(f,'idle');}G.f[0].x=150;G.f[1].x=170;for(const k in keys)keys[k]=false;})()"""
def run(hold,atk,n=40): return f"""(()=>{{ {f"keys['{hold}']=true;" if hold else ''} const hp=G.f[1].hp;const st=new Set();
 for(let k=0;k<{n};k++){{ if(k===3){{pressed['{atk}']=true;}} simStep();st.add(G.f[1].state);}}
 for(const k in keys)keys[k]=false;return [ [...st].join(','), Math.round((hp-G.f[1].hp)*10)/10 ];}})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    for name,hold,atk in [('punch, P2 holds away','ArrowRight','KeyF'),('punch, P2 holds nothing',None,'KeyF'),('punch, P2 holds TOWARD','ArrowLeft','KeyF'),
                          ('kick, P2 holds away','ArrowRight','KeyG'),('grab, P2 holds away','ArrowRight','KeyH')]:
      await pg.evaluate(SETUP);print(name,'->',await pg.evaluate(run(hold,atk)))
    # flying clothesline off the ropes into a blocker
    await pg.evaluate(SETUP);await pg.evaluate("G.f[0].x=120;G.f[1].x=190;startWhip(G.f[1],G.f[0],-1,true)")
    for k in range(240):
      r=await pg.evaluate("(simStep(),G.f[0].runWin||0)")
      if r>0:break
    await pg.evaluate("keys['ArrowRight']=true")
    print('clothesline into blocker ->',await pg.evaluate(run(None,'KeyF',60).replace("pressed['KeyF']","pressed['KeyF']")))
    print('errors',errs);await b.close()
asyncio.run(main())
