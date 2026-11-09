# A guest's tab goes to the background (game paused there) for 10 s, then the host's does. The others must keep playing,
# the paused window must catch up when it comes back, and everyone must still agree.
import asyncio
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8766/index.html?test=1&peerhost=127.0.0.1&peerport=9000'
HIDE="""(()=>{window.__real=window.__real||simStep;simStep=()=>false;Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));})()"""
SHOW="""(()=>{simStep=window.__real;Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));})()"""
HOOK="""(()=>{window.__H={};const o=PARTY.afterStep.bind(PARTY);PARTY.afterStep=function(fs){o(fs);if(fs%120===0&&!G.resim)__H[fs]=simHash();};})()"""
async def main():
  async with async_playwright() as p:
    br=[await p.chromium.launch() for _ in range(3)];P=[await b.new_page() for b in br];errs=[]
    for n,pg in enumerate(P):
      pg.on('pageerror',lambda e,n=n:errs.append(f'{n}:'+str(e)))
      await pg.goto(URL+('&bot=1' if n else ''));await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    A=P[0];await A.evaluate("PARTY.host()");await A.wait_for_function("PARTY.peer&&PARTY.peer.open",timeout=10000);code=await A.evaluate("PARTY.code")
    for g in P[1:]:await g.evaluate(f"PARTY.join('{code}')");await g.wait_for_function("G.scene==='party'&&PARTY.L",timeout=20000)
    await A.wait_for_function("PARTY.humans().length===3",timeout=10000)
    for i,g in enumerate(P):await g.evaluate(f"PARTY.pick({i})")
    await A.wait_for_timeout(800);await A.evaluate("PARTY.L.cfg.type=2;PARTY.L.cfg.elim=0;PARTY.start()")
    for g in P:await g.wait_for_function("G.scene==='fight'",timeout=15000);await g.evaluate(HOOK)
    step=lambda:asyncio.gather(*[g.evaluate("G.fstep") for g in P])
    await A.wait_for_timeout(3000);print('start',await step())
    for who,name in ((1,'guest'),(0,'host')):
      await P[who].evaluate(HIDE);a=await step();await A.wait_for_timeout(10000);b=await step()
      print(f'{name} hidden 10s: steps',a,'->',b,' others moved',[b[i]-a[i] for i in range(3) if i!=who])
      await P[who].evaluate(SHOW);await A.wait_for_timeout(4000);print(f'{name} back 4s later:',await step(),'away now',await A.evaluate('[...PARTY.away]'))
    await A.wait_for_timeout(3000)
    H=[await g.evaluate("__H") for g in P];common=sorted(set(H[0])&set(H[1])&set(H[2]),key=int)
    print('fingerprints',len(common),'mismatched',[k for k in common if not H[0][k]==H[1][k]==H[2][k]][:5],'errors',errs[:4])
    for b in br:await b.close()
asyncio.run(main())
