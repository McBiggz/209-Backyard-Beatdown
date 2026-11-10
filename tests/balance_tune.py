# Tunes AI_BAL (a damage multiplier per wrestler, test link only) until every wrestler's round-robin win rate is near 50%.
import asyncio,json,sys,itertools,re,time
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8766/index.html?test=1';WORKERS=6;ROUNDS=int(sys.argv[1]) if len(sys.argv)>1 else 6;REPS=int(sys.argv[2]) if len(sys.argv)>2 else 3
RUN="""(([a,b,seed,bal])=>{Object.assign(AI_BAL,bal);const ia=ROSTER.findIndex(c=>c.id===a),ib=ROSTER.findIndex(c=>c.id===b);
 G.forceSeed=seed;G.mode=0;G.stage=3;G.hc=G.cage=false;G.mapPick=null;G.sel={c:[ia,ib],stage:2,picks:[ia,ib]};startIntro();beginFight();G.forceSeed=null;
 G.entrance=null;G.scene='fight';G.f.forEach(f=>{f.hidden=false;f.cpu=true;setState(f,'idle');});
 let k=0;for(;k<60*300&&!G.over;k++)simStep();return G.over?G.over.w.ch.id:null;})"""
async def rr(pages,ids,bal,salt):
  jobs=[(a,b,salt*100003+s*7919+(sum(map(ord,a+b))%997)) for a,b in itertools.permutations(ids,2) for s in range(REPS)]
  q=asyncio.Queue();[q.put_nowait(j) for j in jobs];W={i:0 for i in ids};M={i:0 for i in ids}
  async def work(pg):
    while not q.empty():
      a,b,seed=q.get_nowait();w=await pg.evaluate(RUN,[a,b,seed,bal]);M[a]+=1;M[b]+=1
      if w:W[w]+=1
  await asyncio.gather(*[work(pg) for pg in pages]);return {i:W[i]/M[i] for i in ids}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pages=[]
    for _ in range(WORKERS):
      pg=await b.new_page();await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=90000);pages.append(pg)
    ids=await pages[0].evaluate("ROSTER.filter(c=>c.id!=='ref').map(c=>c.id)")
    bal={i:1.0 for i in ids}
    for r in range(ROUNDS):
      t=time.time();wr=await rr(pages,ids,bal,r)
      spread=max(wr.values())-min(wr.values())
      print(f'round {r}: {time.time()-t:.0f}s  spread {100*spread:.0f} pts  best {max(wr,key=wr.get)} {100*max(wr.values()):.0f}%  worst {min(wr,key=wr.get)} {100*min(wr.values()):.0f}%',flush=True)
      if r==ROUNDS-1:break
      step=0.3 if r<3 else 0.18
      for i in ids:bal[i]=round(min(1.4,max(0.65,bal[i]*(0.5/max(0.08,wr[i]))**step)),3)
    json.dump({'bal':bal,'wr':wr},open('/tmp/tune.json','w'),indent=1);await b.close()
  print(json.dumps({i:[bal[i],round(100*wr[i])] for i in sorted(ids,key=lambda i:-wr[i])}))
asyncio.run(main())
