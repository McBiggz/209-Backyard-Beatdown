import asyncio,sys
from playwright.async_api import async_playwright
URL=f'http://127.0.0.1:8766/index.html?peerhost=127.0.0.1&peerport=9000&lag=60'
HOOK="""(()=>{window.__H={};const o=PARTY.afterStep.bind(PARTY);PARTY.afterStep=function(fs){o(fs);if(fs%60===0&&!G.resim)__H[fs]=simHash()+'|'+G.map;};})()"""
async def main():
  async with async_playwright() as p:
    br=[await p.chromium.launch() for _ in range(2)];P=[await b.new_page(viewport={'width':844,'height':390}) for b in br];errs=[]
    for n,pg in enumerate(P):
      pg.on('pageerror',lambda e,n=n:errs.append(f'{n}:'+str(e)))
      await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    A,B=P;await A.evaluate("PARTY.host()");await A.wait_for_function("PARTY.peer&&PARTY.peer.open",timeout=10000)
    code=await A.evaluate("PARTY.code");await B.evaluate(f"PARTY.join('{code}')");await B.wait_for_function("G.scene==='party'&&PARTY.L",timeout=20000)
    await A.wait_for_function("PARTY.humans().length===2",timeout=10000)
    await A.evaluate("PARTY.L.cfg.type=MS_TYPES.findIndex(t=>t[1]==='single');PARTY.L.cfg.map=0;PARTY.sendLobby()")
    for g,w in zip(P,['viral','papi']):await g.evaluate(f"PARTY.pick(ROSTER.findIndex(c=>c.id==='{w}'))")
    await A.wait_for_timeout(1500);await A.evaluate("PARTY.start()")
    for g in P:await g.wait_for_function("G.scene==='fight'&&G.net===PARTY",timeout=15000)
    print('fighters',await A.evaluate("G.f.map(f=>f.ch.id)"),'secretOn',await A.evaluate("G.secretOn"))
    for g in P:await g.evaluate(HOOK)
    # everyone holds right: out through the ropes and over to the ranch entrance
    for g in P:await g.evaluate("window.__hold=setInterval(()=>{const me=G.f[G.me];keys['KeyD']=me.out;keys['KeyS']=!me.out;if(!me.out&&me.z>=ZMAX-3&&me.state==='walk'&&Math.random()<0.5)pressed['Space']=true;},60)")
    seen=[]
    for t in range(120):
      await A.wait_for_timeout(250)
      s=[await g.evaluate("[G.fstep,G.map,G.mapWalk?G.mapWalk.phase:'-',G.f.map(f=>Math.round(f.x)+','+Math.round(f.z)+f.state+(f.out?'o':'')).join(' '),G.me]") for g in P]
      k=(s[0][1],s[0][2])
      if not seen or seen[-1]!=k or t%12==0:seen.append(k);print(s)
      if s[0][1]=='secret' and s[0][2]=='-' and s[1][1]=='secret':break
    for g in P:await g.evaluate("clearInterval(__hold);keys['KeyD']=false;keys['KeyS']=false")
    await A.wait_for_timeout(2500)
    H=[await g.evaluate("__H") for g in P];common=sorted(set(H[0])&set(H[1]),key=int);bad=[k for k in common if H[0][k]!=H[1][k]]
    print('checked',len(common),'mismatched',len(bad),bad[:4],'maps',await A.evaluate("G.map"),await B.evaluate("G.map"))
    await B.screenshot(path='/tmp/st/party_barn.png');print('errors',errs[:5])
    for b in br:await b.close()
asyncio.run(main())
