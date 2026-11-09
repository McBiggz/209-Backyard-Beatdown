# Four browsers play a Fatal 4-Way online (host + 3 guests) through a local PeerJS server, mashing buttons.
# One guest quits mid-match (a CPU must take over on the same step everywhere). Checks every device agrees.
import asyncio,sys
from playwright.async_api import async_playwright
LAG=int(sys.argv[1]) if len(sys.argv)>1 else 0
TYPE=int(sys.argv[2]) if len(sys.argv)>2 else 2
URL0='http://127.0.0.1:8766/index.html?test=1&peerhost=127.0.0.1&peerport=9000'
MASH="""(()=>{const K=['KeyW','KeyA','KeyS','KeyD','Space','KeyF','KeyG','KeyH','KeyR'];window.__mash=setInterval(()=>{for(const k of K.slice(0,4))keys[k]=false;
 const d=K[Math.floor(Math.random()*4)];keys[d]=Math.random()<0.7;if(Math.random()<0.5){const b=K[4+Math.floor(Math.random()*5)];pressed[b]=true;}},90);})()"""
HOOK="""(()=>{window.__H={};const o=PARTY.afterStep.bind(PARTY);PARTY.afterStep=function(fs){o(fs);if(fs%120===0&&!G.resim)__H[fs]=simHash();};})()"""
async def main():
  async with async_playwright() as p:
    br=[await p.chromium.launch() for _ in range(4)];P=[await b.new_page() for b in br];errs=[]
    for n,pg in enumerate(P):
      pg.on('pageerror',lambda e,n=n:errs.append(f'{n}:'+str(e)));pg.on('console',lambda m,n=n:m.type=='error' and errs.append(f'{n}:'+m.text[:150]))
      await pg.goto(URL0+('' if n==0 else f'&bot=1&lag={LAG}'));await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    A=P[0];await A.evaluate("PARTY.host()");await A.wait_for_function("PARTY.peer&&PARTY.peer.open",timeout=10000)
    code=await A.evaluate("PARTY.code");print('room',code)
    for g in P[1:]:
      await g.evaluate(f"PARTY.join('{code}')");await g.wait_for_function("G.scene==='party'&&PARTY.L",timeout=20000)
    await A.wait_for_function("PARTY.humans().length===4",timeout=10000);print('seats',[await g.evaluate("PARTY.seat") for g in P])
    await A.evaluate(f"PARTY.L.cfg.type={TYPE};PARTY.L.cfg.elim=1;PARTY.sendLobby()")
    for i,(g,w) in enumerate(zip(P,['viral','dragon','ghoulie','asesino'])):
      await g.evaluate(f"PARTY.pick(ROSTER.findIndex(c=>c.id==='{w}'))")
    await A.wait_for_function("!PARTY.canStart()",timeout=10000);await A.wait_for_timeout(1500)
    await A.evaluate("PARTY.start()")
    for g in P:await g.wait_for_function("G.scene==='fight'&&G.net===PARTY",timeout=15000)
    print('fighters',[await g.evaluate("G.f.map(f=>f.ch.id).join(',')+' me='+G.me") for g in P],'D',await A.evaluate("PARTY.D"))
    for g in P:await g.evaluate(HOOK);await (g.evaluate(MASH) if g==P[0] else asyncio.sleep(0))
    quit_done=False
    for t in range(200):
      await A.wait_for_timeout(400)
      st=[await g.evaluate("[G.fstep,!!G.over,G.over&&G.over.t]") for g in P[:3]]
      if not quit_done and st[0][0]>600:
        await P[3].evaluate("PARTY.leave()");quit_done=True;print('guest 4 left at step',st[0][0])
      if all(s[1] and s[2]>0.5 for s in st):break
    H=[await g.evaluate("__H") for g in P[:3]]
    common=sorted(set(H[0])&set(H[1])&set(H[2]),key=int);bad=[k for k in common if not (H[0][k]==H[1][k]==H[2][k])]
    print('checked',len(common),'fingerprints, mismatched',len(bad),bad[:5])
    print('results',[await g.evaluate("G.over&&[G.over.how,G.over.w.ch.id,G.fstep,G.f.map(f=>f.cpu?'C':'H').join('')]") for g in P[:3]])
    # rematch from the host
    await A.wait_for_timeout(2000);await A.evaluate("PARTY.start()")
    for g in P[:3]:await g.wait_for_function("G.scene==='fight'&&G.fstep>60",timeout=15000)
    print('rematch running, humans',await A.evaluate("PARTY.humans()"),'fighters',await P[1].evaluate("G.f.map(f=>f.ch.id+(f.cpu?'(cpu)':''))"))
    await A.screenshot(path='/home/claude/test3/party_host.png');await P[1].screenshot(path='/home/claude/test3/party_guest.png')
    print('errors',errs[:6])
    for b in br:await b.close()
asyncio.run(main())
