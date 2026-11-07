# Stress test: plays lots of matches as fast as possible and reports anything broken.
# usage: python3 tests/stress.py <url> [matches]
import asyncio, sys, json
from playwright.async_api import async_playwright
URL = sys.argv[1]; N = int(sys.argv[2]) if len(sys.argv) > 2 else 120
JS = r"""
(cfg)=>{
 const P1=['KeyW','KeyA','KeyS','KeyD','Space','KeyF','KeyG','KeyH','KeyR'],P2=['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','KeyU','KeyJ','KeyK','KeyL','KeyI'];
 let rs=cfg.seed>>>0;const R=()=>{rs=(rs*1664525+1013904223)>>>0;return rs/4294967296;};
 const mash=(K)=>{for(let i=0;i<4;i++)keys[K[i]]=false;if(R()<0.85){const d=Math.floor(R()*4);keys[K[d]]=true;if(R()<0.3){keys[K[d]]=false;}}
   if(R()<0.35){const b=K[4+Math.floor(R()*5)];pressed[b]=true;}};
 const out=[];
 for(const m of cfg.matches){
  for(const k in keys)keys[k]=false;
  G.stage=m.stage;G.mode=m.mode;G.sel={c:[m.a,m.b],stage:2,picks:[m.a,m.b]};startIntro();
  G.f[0].cpu=!m.mash1;G.f[1].cpu=!m.mash2;G.forceSeed=m.seed;beginFight();G.forceSeed=null;G.scene='fight';
  const prob=[];let lastChange=0,lastSig='',n=0;const LIM=60*240;
  for(;n<LIM&&!(G.over&&G.over.t>0.6);n++){
   if(m.mash1&&n%5===0)mash(P1);if(m.mash2&&n%5===0)mash(P2);
   try{simStep();}catch(e){prob.push('ERROR '+e.message+' @'+n);break;}
   for(const f of G.f){for(const k of ['x','z','y','hp','vx','vz','vy','meter'])if(!Number.isFinite(f[k])){prob.push('NaN '+f.ch.id+'.'+k+' state='+f.state+' @'+n);}
    if(wide()?(f.x<-60||f.x>MAPW+60||f.z<90||f.z>230):(Math.abs(f.x)>320||f.z<-40||f.z>120))prob.push('OFFMAP '+f.ch.id+' x='+Math.round(f.x)+' z='+Math.round(f.z)+' state='+f.state+' @'+n);
    if(f.y<-1||f.y>400)prob.push('Y '+f.ch.id+' y='+Math.round(f.y)+' state='+f.state+' @'+n);}
   const sig=G.f.map(f=>f.state+Math.round(f.x)+Math.round(f.z)).join('|')+(G.pin?'pin'+G.pin.count:'')+(G.entrance?'ent'+G.entrance.i+G.entrance.phase:'');
   if(sig!==lastSig){lastSig=sig;lastChange=n;}else if(n-lastChange>60*25&&!G.over){prob.push('FROZEN 25s: '+G.f.map(f=>f.ch.id+':'+f.state).join(' ')+' @'+n);break;}
   if(prob.length>3)break;}
  if(!(G.over)&&!m.mash1&&!m.mash2&&n>=LIM)prob.push('NO FINISH in 4 min (cpu v cpu)');
  out.push({m,steps:n,how:G.over?G.over.how:'none',prob:[...new Set(prob)].slice(0,4)});
 }
 for(const k in keys)keys[k]=false;G.scene='title';return out;}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'", timeout=60000)
        n = await pg.evaluate("ROSTER.length")
        import random; rnd = random.Random(int(sys.argv[3]) if len(sys.argv) > 3 else 209)
        plan = []
        for i in range(N):
            kind = ['cpu', 'mash', 'mash2'][i % 3]
            plan.append({'a': rnd.randrange(n), 'b': rnd.randrange(n), 'stage': [3, 3, 2, 1, 0][i % 5], 'mode': 0 if kind == 'cpu' else 1,
                         'mash1': kind != 'cpu', 'mash2': kind == 'mash2', 'seed': rnd.randrange(1 << 30)})
        res = []
        for k in range(0, N, 6):
            res += await pg.evaluate(JS, {'matches': plan[k:k+6], 'seed': k + 1})
        ids = await pg.evaluate("ROSTER.map(c=>c.id)")
        bad = [r for r in res if r['prob']]
        hows = {}
        for r in res: hows[r['how']] = hows.get(r['how'], 0) + 1
        print(f'{len(res)} matches, {len(bad)} with problems. Endings: {hows}')
        print('avg match length (s):', round(sum(r["steps"] for r in res) / len(res) / 60, 1))
        for r in bad[:25]:
            m = r['m']; print(f"- {ids[m['a']]} v {ids[m['b']]} stage {m['stage']} {'mash' if m['mash1'] else 'cpu'}/{'mash' if m['mash2'] else 'cpu'} seed {m['seed']}: {r['prob']}")
        print('page errors', errs[:5]); await b.close()
asyncio.run(main())
