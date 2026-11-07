# Two browsers play an online match through a local PeerJS server, mashing random buttons.
# usage: python3 tests/online.py <lag_ms> [force_desync]
import asyncio,sys,json
from playwright.async_api import async_playwright
LAG=int(sys.argv[1]) if len(sys.argv)>1 else 0;FORCE=len(sys.argv)>2
URL=f'http://127.0.0.1:8766/index.html?peerhost=127.0.0.1&peerport=9000&lag={LAG}'
MASH="""(()=>{const K=['KeyW','KeyA','KeyS','KeyD','Space','KeyF','KeyG','KeyH','KeyR'];window.__mash=setInterval(()=>{for(const k of K.slice(0,4))keys[k]=false;
 const d=K[Math.floor(Math.random()*4)];keys[d]=Math.random()<0.7;if(Math.random()<0.5){const b=K[4+Math.floor(Math.random()*5)];pressed[b]=true;}},90);})()"""
async def main():
  async with async_playwright() as p:
    ba=await p.chromium.launch();bb=await p.chromium.launch()
    A=await ba.new_page();B=await bb.new_page();errs=[]
    for n,pg in (('A',A),('B',B)):
      pg.on('pageerror',lambda e,n=n:errs.append(n+':'+str(e)));pg.on('console',lambda m,n=n:m.type=='error' and errs.append(n+':'+m.text[:150]))
      await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    code=await A.evaluate("NET.host()");await A.wait_for_function("NET.peer&&NET.peer.open",timeout=10000)
    await B.evaluate(f"NET.join('{code}')")
    await A.wait_for_function("G.scene==='select'",timeout=15000);await B.wait_for_function("G.scene==='select'",timeout=15000)
    print('connected, code',code)
    await A.evaluate("(()=>{const i=ROSTER.findIndex(c=>c.id==='viral');G.sel.picks[0]=i;G.sel.stage=1;NET.pick(i);})()")
    await B.evaluate("(()=>{const i=ROSTER.findIndex(c=>c.id==='papi');G.sel.picks[0]=i;G.sel.stage=1;NET.pick(i);})()")
    await A.wait_for_function("G.scene==='fight'",timeout=15000);await B.wait_for_function("G.scene==='fight'",timeout=15000)
    print('fighters A',await A.evaluate("G.f.map(f=>f.ch.id)"),'B',await B.evaluate("G.f.map(f=>f.ch.id)"),'delay',await A.evaluate("NET.D"))
    await A.evaluate(MASH);await B.evaluate(MASH)
    forced=False
    for t in range(150):
      await A.wait_for_timeout(400)
      sa=await A.evaluate("[G.fstep,!!G.over,NET.desyncs,NET.repairs,Math.round(NET.rtt)]");sb=await B.evaluate("[G.fstep,!!G.over,NET.desyncs,NET.repairs]")
      if FORCE and not forced and sb[0]>900: await B.evaluate("G.f[0].hp-=7;G.f[1].x+=5");forced=True;print('forced desync on B at',sb[0])
      if t%10==0: print('A',sa,'B',sb)
      if sa[1] or sb[1]:
        await A.evaluate("clearInterval(__mash)");await B.evaluate("clearInterval(__mash)")
      if sa[1] and sb[1]: break
    await A.wait_for_timeout(1500)
    ha=await A.evaluate("Object.fromEntries(NET.hashes)");hb=await B.evaluate("Object.fromEntries(NET.hashes)")
    common=[k for k in ha if k in hb];bad=[k for k in common if ha[k]!=hb[k]]
    res=await A.evaluate("G.over?G.over.how+':'+(G.over.w?G.over.w.ch.id:'-'):'none'"),await B.evaluate("G.over?G.over.how+':'+(G.over.w?G.over.w.ch.id:'-'):'none'")
    print('result',res,'steps',await A.evaluate("G.fstep"),await B.evaluate("G.fstep"))
    print('hash checkpoints compared',len(common),'mismatched',bad[-5:] if bad else 'none (last mismatch-free)', 'last',max(map(int,common)) if common else None)
    print('A desyncs/repairs',await A.evaluate("[NET.desyncs,NET.repairs]"),'B',await B.evaluate("[NET.desyncs,NET.repairs]"))
    # rematch flow
    if res[0]!='none':
      await A.evaluate("NET.wantRematch=true;NET.send({t:'rematch'});NET.tryRematch()");await B.evaluate("NET.wantRematch=true;NET.send({t:'rematch'});NET.tryRematch()")
      await A.wait_for_timeout(1500);print('rematch: m',await A.evaluate("[NET.m,G.fstep,!!G.over]"),await B.evaluate("[NET.m,G.fstep,!!G.over]"))
    await A.screenshot(path='/home/claude/test3/onlineA.png')
    await ba.close();await B.wait_for_timeout(8000);print('B after A quits:',await B.evaluate("NET.st"))
    await B.screenshot(path='/home/claude/test3/onlineB_lost.png')
    print('errors',errs[:6]);await bb.close()
asyncio.run(main())
