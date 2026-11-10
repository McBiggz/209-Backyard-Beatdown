# Round robin: every wrestler vs every other, CPU vs CPU (fighting styles on), both sides. Prints win rates.
import asyncio,json,sys,itertools,time
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8766/index.html?test=1'
REPS=int(sys.argv[2]) if len(sys.argv)>2 else 1
WORKERS=6
RUN="""(([a,b,seed])=>{const ia=ROSTER.findIndex(c=>c.id===a),ib=ROSTER.findIndex(c=>c.id===b);
 G.forceSeed=seed;G.mode=0;G.stage=3;G.hc=G.cage=false;G.mapPick=null;G.sel={c:[ia,ib],stage:2,picks:[ia,ib]};startIntro();beginFight();G.forceSeed=null;
 G.entrance=null;G.scene='fight';G.f.forEach(f=>{f.hidden=false;f.cpu=true;setState(f,'idle');});
 let k=0;for(;k<60*300&&!G.over;k++)simStep();return {w:G.over?G.over.w.ch.id:null,how:G.over&&G.over.how,secs:Math.round(k/60)};})"""
async def main():
  ids=None;res=[];t0=time.time()
  async with async_playwright() as p:
    b=await p.chromium.launch();pages=[]
    for _ in range(WORKERS):
      pg=await b.new_page();await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=90000);pages.append(pg)
    ids=await pages[0].evaluate("ROSTER.filter(c=>c.id!=='ref').map(c=>c.id)")
    jobs=[(a,b,s) for a,b in itertools.permutations(ids,2) for s in range(REPS)]
    if len(sys.argv)>3:jobs=jobs[:int(sys.argv[3])]
    q=asyncio.Queue();[q.put_nowait(j) for j in jobs]
    async def work(pg):
      while not q.empty():
        a,bb,s=q.get_nowait();r=await pg.evaluate(RUN,[a,bb,555555+s*7919+sum(map(ord,a+bb))%997]);res.append((a,bb,r))
    await asyncio.gather(*[work(pg) for pg in pages]);await b.close()
  W={i:0 for i in ids};M={i:0 for i in ids};draws=0;secs=[];hows={}
  for a,bb,r in res:
    M[a]+=1;M[bb]+=1;secs.append(r['secs'])
    if r['w']:W[r['w']]+=1;hows[r['how']]=hows.get(r['how'],0)+1
    else:draws+=1
  print(f'{len(res)} matches in {time.time()-t0:.0f}s, avg {sum(secs)/len(secs):.0f}s per match, no result {draws}, how {hows}')
  for i in sorted(ids,key=lambda i:-W[i]/max(1,M[i])):print(f'{i:10} {100*W[i]/max(1,M[i]):5.1f}%  ({W[i]}/{M[i]})')
  json.dump(res,open('/tmp/balance_last.json','w'))
asyncio.run(main())
