import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    res={}
    for (a,b2,seed) in [('asesino','spektro',12345),('bigmf','viral',777),('papi','dragon',42)]:
      r1=await pg.evaluate(f"DD.runMatch('{a}','{b2}',{{seed:{seed}}})")
      r2=await pg.evaluate(f"DD.runMatch('{a}','{b2}',{{seed:{seed}}})")
      # replay: feed recorded tape back in
      tape=r1['rec']
      r3=await pg.evaluate("t=>DD.runMatch(t.p[0],t.p[1],{replay:t})",tape)
      r4=await pg.evaluate(f"DD.runMatch('{a}','{b2}',{{seed:{seed+1}}})")
      res[f'{a} v {b2}']=dict(steps=r1['steps'],result=r1['result'],hp=r1['hp'],same_seed=r1['hash']==r2['hash'] and r1['hashes']==r2['hashes'],
        replay=r1['hash']==r3['hash'] and r1['hashes']==r3['hashes'],diff_seed_differs=r1['hash']!=r4['hash'],tape_steps=len(tape['inp']))
    print(json.dumps(res,indent=1));print('errors',errs[:5]);await b.close()
asyncio.run(main())
