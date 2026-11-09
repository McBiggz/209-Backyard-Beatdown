# Steel cage: CPU vs CPU endings + replays, then scripted player escapes and pull-downs, with screenshots.
import asyncio,sys
from playwright.async_api import async_playwright
SRC=open('tests/hardcore_player.py').read()
SETUP=SRC.split('SETUP="""')[1].split('"""')[0].replace("G.hc=true","G.hc=false;G.cage=true")
H=SRC.split('H="""')[1].split('"""')[0]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    r=await pg.evaluate("""(()=>{const out=[];let tries=0,pulls=0,slams=0;const os=startEscape;window.startEscape=function(...a){tries++;return os(...a);};
      const ox=stopEscape;window.stopEscape=function(o,b){if(o.state==='cclimb')pulls++;else slams++;return ox(o,b);};
      for(const[s,a,c] of [[1,'viral','papi'],[2,'jojo','zeke'],[3,'dragon','spektro'],[4,'cdiddy','maverick'],[5,'bigmf','asesino'],[6,'necrosis','matsunaga']]){
       const r=DD.runMatch(a,c,{seed:s,steps:60*240,cage:true});const rp=DD.runMatch(a,c,{replay:r.rec,steps:60*240});
       out.push([a+' v '+c,G.over?G.over.how:r.result,Math.round(r.steps/60)+'s',rp.hash===r.hash]);}
      window.startEscape=os;window.stopEscape=ox;return {out,tries,pulls,slams};})()""")
    for x in r['out']:print(' ',x)
    print('escape attempts',r['tries'],'pulled down',r['pulls'],'door slams',r['slams'])
    await pg.evaluate(SETUP);await pg.evaluate(H)
    # 1. climb out, opponent kept down
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;const[a]=ringX(140);__place(me,a+2,140);__place(o,200,140,'down');o.downDur=99;__run(2);
      window.__Q[0]=Object.assign(blank(),{left:true,jumpP:true});__run(1);const st=me.state;let n=0;
      while(!G.over&&n<60*8){if(n%6===0)__press(0,'punchP');__run(1);n++;}return {started:st,secs:(n/60).toFixed(1),how:G.over&&G.over.how,winner:G.over&&G.over.w.ch.id};})()""")
    print('climb out',r)
    # 2. get pulled down halfway
    await pg.evaluate(SETUP);await pg.evaluate(H)
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;const[a]=ringX(140);__place(me,a+2,140);__place(o,a+40,140);o.cpu=false;__run(2);
      window.__Q[0]=Object.assign(blank(),{left:true,jumpP:true});__run(90);const y=Math.round(me.y),hp=me.hp;G.cam=0;return {y,hp};})()""")
    await pg.wait_for_timeout(250);await pg.screenshot(path='/home/claude/test3/cage_climb.png')
    r2=await pg.evaluate("""(()=>{const[me,o]=G.f;__place(o,me.x+20,me.z);__press(1,'grabP');__run(1);const st=me.state;__run(80);return {pulled:st,dmg:Math.round(r_hp-me.hp),now:me.state,y:Math.round(me.y)};})()""".replace('r_hp',str(r['hp'])))
    print('pulled down from',r['y'],r2)
    # 3. door escape
    await pg.evaluate(SETUP);await pg.evaluate(H)
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;__place(me,DOOR_X,ZMAX);__place(o,120,130,'down');o.downDur=99;__run(2);__press(0,'grabP');__run(1);const st=me.state;let n=0;
      while(!G.over&&n<60*8){__run(1);n++;if(n===60){G.cam=0;}}return {started:st,secs:(n/60).toFixed(1),how:G.over&&G.over.how};})()""")
    print('door',r)
    await pg.evaluate(SETUP);await pg.evaluate(H)
    await pg.evaluate("""(()=>{const[me,o]=G.f;__place(me,130,140);__place(o,180,145);__run(5);G.cam=0;})()""")
    await pg.wait_for_timeout(250);await pg.screenshot(path='/home/claude/test3/cage_ring.png')
    print('errors',errs[:4]);await b.close()
asyncio.run(main())
