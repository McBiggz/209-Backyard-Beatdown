# Scripted player actions in a hardcore match: ladder climb + dive, ladder tip, chair shot, table spot.
import asyncio,sys
from playwright.async_api import async_playwright
SETUP="""(()=>{G.hc=true;G.stage=3;G.mode=0;const iA=ROSTER.findIndex(c=>c.id==='viral'),iB=ROSTER.findIndex(c=>c.id==='papi');
 G.sel={c:[iA,iB],stage:2,picks:[iA,iB]};startIntro();G.f[0].cpu=false;G.f[1].cpu=false;G.forceSeed=5;beginFight();G.forceSeed=null;G.scene='fight';G.entrance=null;G.f.forEach(f=>f.hidden=false);
 window.__Q=[blank(),blank()];window.humanInput=i=>{const q=window.__Q[i];window.__Q[i]=blank();return q;};return true;})()"""
H="""(()=>{window.__press=(i,k)=>{const b=blank();b[k]=true;window.__Q[i]=b;};window.__run=n=>{for(let k=0;k<n;k++)simStep();};
 window.__place=(f,x,z,st)=>{f.x=x;f.z=z;f.out=false;f.y=0;f.vx=f.vz=0;setState(f,st||'idle');};return 1;})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':844,'height':390},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(sys.argv[1]);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    await pg.evaluate(SETUP);await pg.evaluate(H)
    # 1. ladder: set up in the ring, opponent down nearby, climb + dive
    r=await pg.evaluate("""(()=>{const[me,o]=G.f,L=G.props.find(p=>p.k==='ladder');L.st='open';L.out=false;L.x=150;L.z=140;
      __place(me,152,140);__place(o,200,140,'down');o.downDur=99;__run(2);__press(0,'jumpP');__run(1);const s1=me.state;__run(70);const s2=[me.state,Math.round(me.y)];
      const hp=o.hp;__press(0,'punchP');__run(80);return {climb:s1,top:s2,diveDamage:Math.round(hp-o.hp),after:me.state};})()""")
    print('ladder dive',r)
    # screenshot on top of a ladder
    await pg.evaluate("""(()=>{const[me,o]=G.f,L=G.props.find(p=>p.k==='ladder');L.st='open';L.climber=-1;L.x=150;L.z=140;__place(me,152,140);__place(o,220,140,'down');o.downDur=99;o.hp=60;__run(2);__press(0,'jumpP');__run(70);G.cam=0;})()""")
    await pg.wait_for_timeout(300);await pg.screenshot(path='/home/claude/test3/hc_ladder.png')
    # 2. tip: opponent climbs, I grab the ladder
    r=await pg.evaluate("""(()=>{const[me,o]=G.f,L=G.props.find(p=>p.k==='ladder');me.lad=-1;L.climber=-1;L.st='open';L.x=150;L.z=140;__place(o,152,140);__place(me,175,140);o.hp=80;__run(2);
      __press(1,'jumpP');__run(40);const st=o.state;const hp=o.hp;__press(0,'grabP');__run(2);const tipped=[L.st,o.state];__run(90);return {oppWas:st,tipped,dmg:Math.round(hp-o.hp)};})()""")
    print('ladder tip',r)
    # 3. chair: pick up the in-ring chair, swing at the opponent
    r=await pg.evaluate("""(()=>{const[me,o]=G.f,C=G.props.find(p=>p.k==='chair'&&!p.out&&!p.dead);C.held=-1;C.st='open';C.x=150;C.z=140;__place(me,140,140);me.dir=1;__place(o,190,140);o.hp=80;__run(2);
      __press(0,'grabP');__run(2);const held=me.wpn===C.id;__place(o,170,140);__run(1);const hp=o.hp;__press(0,'punchP');__run(40);return {held,hit:Math.round(hp-o.hp),opp:o.state};})()""")
    print('chair shot',r)
    await pg.evaluate("""(()=>{const[me,o]=G.f;__place(o,230,140);__run(60);__place(me,150,140);me.dir=1;__press(0,'punchP');__run(13);})()""")
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/hc_chair.png')
    # 4. table: pick up the table, set it up, then slam the opponent near it
    r=await pg.evaluate("""(()=>{const[me,o]=G.f;__run(90);if(me.wpn>=0){setDown(me,false);}const T=G.props.find(p=>p.k==='table'&&p.st!=='broken');T.held=-1;T.st='flat';T.x=140;T.z=140;T.out=false;
      __place(me,130,140);me.dir=1;__place(o,240,140);o.hp=80;__run(2);__press(0,'grabP');__run(2);const held=me.wpn===T.id;__press(0,'grabP');__run(2);const up=T.st;
      // opponent in front of me, with the table behind me (where a slam lands)
      __place(me,200,140);me.dir=1;__place(o,222,140);__run(1);const hp=o.hp;__press(0,'grabP');__run(70);return {held,setUp:up,table:T.st,dmg:Math.round(hp-o.hp)};})()""")
    print('table',r)
    await pg.wait_for_timeout(200);await pg.screenshot(path='/home/claude/test3/hc_table.png')
    print('errors',errs[:4]);await b.close()
asyncio.run(main())
