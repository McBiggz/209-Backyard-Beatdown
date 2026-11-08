# CPU vs CPU hardcore matches: weapons get used, tables break, ladders get climbed, nothing breaks, replays match.
import asyncio,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1]
JS="""(({a,b,seed})=>{const ev={pick:0,swing:0,shot:0,table:0,climb:0,dive:0,tip:0};
 const w=(n,k)=>{const o=window[n];window[n]=function(...x){ev[k]++;return o.apply(this,x);};return o;};
 const o1=w('pickUp','pick'),o2=w('startSwing','swing'),o3=w('breakTable','table'),o4=w('tipLadder','tip');
 const oc=callout;window.callout=function(t,...r){if(t==='OFF THE LADDER!')ev.dive++;return oc(t,...r);};
 const op=popOn;window.popOn=function(f,t,...r){if(/SHOT!/.test(t))ev.shot++;return op(f,t,...r);};
 const os=setState;let bad=[];window.setState=function(f,s){if(s==='lclimb')ev.climb++;return os(f,s);};
 const r=DD.runMatch(a,b,{seed,steps:60*240,hc:true});
 for(const f of G.f)for(const k of ['x','z','y','hp'])if(!Number.isFinite(f[k]))bad.push(f.ch.id+k);
 for(const p of G.props||[])for(const k of ['x','z'])if(!Number.isFinite(p[k]))bad.push('prop'+k);
 window.pickUp=o1;window.startSwing=o2;window.breakTable=o3;window.tipLadder=o4;window.callout=oc;window.popOn=op;window.setState=os;
 // replay the tape: must end the same
 const rp=DD.runMatch(a,b,{replay:r.rec,steps:60*240});
 return {secs:Math.round(r.steps/60),result:r.result,hp:r.hp,ev,snapOK:r.snapOK,replayOK:rp.hash===r.hash,bad};})"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    tot={}
    pairs=[('viral','bigmf'),('papi','jojo'),('dragon','zeke'),('spektro','mainevent'),('cdiddy','necrosis'),('asesino','maverick')]
    for i,(a,c) in enumerate(pairs):
      r=await pg.evaluate(JS,{'a':a,'b':c,'seed':i+11});print(a,c,r)
      for k,v in r['ev'].items():tot[k]=tot.get(k,0)+v
    print('TOTAL',tot);print('errors',errs[:5]);await b.close()
asyncio.run(main())
