# Universe Mode: hub, 3 training drills (scripted), a weekly match, saving.
import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    print('menu has universe:',await pg.evaluate("TITLE_ITEMS.some(t=>t[1]===6)"))
    await pg.evaluate("""(()=>{localStorage.removeItem(UNI_KEY);uniStart(ROSTER.findIndex(c=>c.id==='viral'));
      window.__Q=blank();window.humanInput=()=>{const q=window.__Q;window.__Q=blank();return q;};window.__tick=n=>{for(let k=0;k<n;k++){switch(G.scene){case 'uni':updUni();break;case 'train':updTrain();break;case 'intro':G.introT+=STEP;if(G.introT>2.8)beginFight();break;case 'fight':simStep();break;}G.t+=STEP;}};return 1;})()""")
    await pg.wait_for_timeout(300);await pg.screenshot(path='/home/claude/test3/uni_hub.png')
    # bench: mash every 5 frames
    r=await pg.evaluate("""(()=>{trainStart('bench');__tick(140);G.trn.phase='go';G.trn.t=0;let n=0;while(G.trn.phase!=='done'&&n<60*25){if(n%5==0)window.__Q.punchP=true;__tick(1);n++;}return [G.trn.reps,G.trn.score];})()""")
    print('bench reps',r)
    await pg.evaluate("(()=>{G.trn.phase='go';G.trn.t=10;G.trn.lift=0.7;G.trn.pose=0.05;})()");await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/uni_bench.png')
    await pg.evaluate("(()=>{G.trn.phase='done';G.trn.t=2;})()");await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/uni_done.png')
    print('after bench',await pg.evaluate("(()=>{window.__Q.punchP=true;updTrain();return [G.scene,G.uni.stats,G.uni.trained]})()"))
    # 5x5: perfect-timed player
    r=await pg.evaluate("""(()=>{G.uni.trained=false;trainStart('fivex5');G.trn.phase='go';G.trn.t=0;let n=0;
      while(G.trn.phase!=='done'&&n<60*60){const T=G.trn,d=(192-T.cx)*T.cdir;if(!T.judged&&d>20&&d<26){window.__Q.jumpP=true;if(T.n>=5)window.__Q.down=true;}__tick(1);n++;}return [G.trn.score,(n/60).toFixed(1)];})()""")
    print('5x5 score',r)
    await pg.evaluate("""(()=>{G.trn.phase='go';G.trn.n=6;G.trn.cx=150;G.trn.cdir=1;G.trn.pose='drop';G.trn.poseT=0.3;})()""");await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/uni_5x5.png')
    # chain: answer correctly 6 of 8
    r=await pg.evaluate("""(()=>{trainStart('chain');G.trn.phase='go';G.trn.t=0;let n=0,seen=0;
      while(G.trn.phase!=='done'&&n<60*40){const T=G.trn;if(T.want&&T.wait<=0&&!T.res&&T.left<T.win-0.3){if(T.round%4!==3)window.__Q[T.want]=true;}__tick(1);n++;}return G.trn.score;})()""")
    print('chain score',r)
    await pg.evaluate("""(()=>{G.trn.phase='go';G.trn.round=2;G.trn.res=null;G.trn.want='kickP';G.trn.wait=0;G.trn.win=1.2;G.trn.left=0.6;})()""");await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/uni_chain.png')
    # weekly match: start it, force a win, continue
    r=await pg.evaluate("""(()=>{G.scene='uni';uniMatch();const boosted=G.f[0].ch.pow,def=G.f[0].uniDef;beginFight();G.scene='fight';G.entrance=null;endMatch(G.f[0],G.f[1]);G.over.t=2;window.__Q=blank();
      const keyed=()=>{};uniAfterMatch();return {pow:boosted.toFixed(3),def:def.toFixed(3),week:G.uni.week,rec:G.uni.rec,scene:G.scene,saved:!!localStorage.getItem(UNI_KEY)};})()""")
    print('match',r)
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/uni_hub2.png')
    print('reload keeps progress:',await pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem(UNI_KEY));return [s.week,s.rec,s.stats];})()"))
    print('errors',errs[:4]);await b.close()
asyncio.run(main())
