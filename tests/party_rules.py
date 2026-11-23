# Two browsers play a 1 on 1 HARDCORE then STEEL CAGE match through the online lobby (classic engine on the party lockstep), mashing buttons.
import asyncio,sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8766/index.html?peerhost=127.0.0.1&peerport=9000'
MASH="""(()=>{const K=['KeyW','KeyA','KeyS','KeyD','Space','KeyF','KeyG','KeyH','KeyR'];window.__mash=setInterval(()=>{for(const k of K.slice(0,4))keys[k]=false;
 const d=K[Math.floor(Math.random()*4)];keys[d]=Math.random()<0.7;if(Math.random()<0.5){const b=K[4+Math.floor(Math.random()*5)];pressed[b]=true;}},90);})()"""
HOOK="""(()=>{window.__H={};const o=PARTY.afterStep.bind(PARTY);PARTY.afterStep=function(fs){o(fs);if(fs%120===0&&!G.resim)__H[fs]=simHash()+'|'+(G.props||[]).map(p=>Math.round(p.x)+','+Math.round(p.z)+','+(p.held!=null?p.held:'')).join(';');};})()"""
async def main():
  async with async_playwright() as p:
    br=[await p.chromium.launch() for _ in range(2)];P=[await b.new_page() for b in br];errs=[]
    for n,pg in enumerate(P):
      pg.on('pageerror',lambda e,n=n:errs.append(f'{n}:'+str(e)))
      await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    A,B=P;await A.evaluate("PARTY.host()");await A.wait_for_function("PARTY.peer&&PARTY.peer.open",timeout=10000)
    code=await A.evaluate("PARTY.code")
    await B.evaluate(f"PARTY.join('{code}')");await B.wait_for_function("G.scene==='party'&&PARTY.L",timeout=20000)
    await A.wait_for_function("PARTY.humans().length===2",timeout=10000)
    for g,w in zip(P,['viral','asesino']):await g.evaluate(f"PARTY.pick(ROSTER.findIndex(c=>c.id==='{w}'))")
    for rules,name in [(1,'HARDCORE'),(2,'STEEL CAGE')]:
      await A.evaluate(f"PARTY.L.cfg.type=0;PARTY.L.cfg.rules={rules};PARTY.sendLobby()")
      await A.wait_for_function("!PARTY.canStart()",timeout=10000);await A.wait_for_timeout(800)
      print(name,'lobby rows on guest:',await B.evaluate("plRows()"))
      await A.evaluate("PARTY.start()")
      for g in P:await g.wait_for_function("G.scene==='fight'&&G.net===PARTY",timeout=20000)
      print(' started',[await g.evaluate("[G.f.map(f=>f.ch.id).join(','),G.hc,G.cage,!!G.mm,G.net.me]") for g in P])
      for g in P:await g.evaluate(HOOK);await g.evaluate(MASH)
      for t in range(240):
        await A.wait_for_timeout(500)
        st=[await g.evaluate("[G.fstep,!!G.over,G.over&&G.over.t]") for g in P]
        if all(s[1] and s[2]>0.5 for s in st) or st[0][0]>60*90:break
      H=[await g.evaluate("__H") for g in P];common=sorted(set(H[0])&set(H[1]),key=int);bad=[k for k in common if H[0][k]!=H[1][k]]
      print(' checked',len(common),'fingerprints, mismatched',len(bad),bad[:3])
      print(' result',[await g.evaluate("G.over?[G.over.how,G.over.w.ch.id,G.fstep]:['running',G.fstep]") for g in P],'props',await A.evaluate("(G.props||[]).length"))
      for g in P:await g.evaluate("clearInterval(__mash)")
      await A.screenshot(path=f'/tmp/st/party_{rules}.png')
      await A.evaluate("PARTY.toLobby()");await B.wait_for_function("G.scene==='party'",timeout=10000)
    print('errors',errs[:6])
    for b in br:await b.close()
asyncio.run(main())
