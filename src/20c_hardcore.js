// ================= HARDCORE MATCH =================
// No count-outs, weapons around the ring. No new buttons:
//  GRAB next to a weapon       pick it up            GRAB while holding   set it down (chair opens, table and ladder stand up)
//  PUNCH while holding         swing it              getting hit          you drop it
//  JUMP at a standing ladder   climb it              PUNCH/KICK on top    dive off      JUMP on top   hop down
//  GRAB at a ladder someone's on: tip it over
//  Anyone knocked down onto a standing table goes through it.
const PROP_SRC={chair_open:"__ASSET(props/chair_open.png)__",chair_up:"__ASSET(props/chair_up.png)__",chair_flat:"__ASSET(props/chair_flat.png)__",chair_dent:"__ASSET(props/chair_dent.png)__",table_up:"__ASSET(props/table_up.png)__",table_edge:"__ASSET(props/table_edge.png)__",table_flat:"__ASSET(props/table_flat.png)__",table_broken:"__ASSET(props/table_broken.png)__",ladder_open:"__ASSET(props/ladder_open.png)__",ladder_up:"__ASSET(props/ladder_up.png)__",ladder_flat:"__ASSET(props/ladder_flat.png)__"};
const PROP_IMG={};for(const n of ['chair_open','chair_up','chair_flat','chair_dent','table_up','table_edge','table_flat','table_broken','ladder_open','ladder_up','ladder_flat']){const im=new Image();im.src=PROP_SRC[n];PROP_IMG[n]=im;}
const HC=()=>(DATA.moves.hardcore||{});
const HC_HOLD=new Set(['idle','walk','run','wswing','punch','kick','block','stomp','whiff','roll','wswing']);
const WPN={chair:{dmg:14,reach:38,name:'CHAIR SHOT!'},table:{dmg:16,reach:40,name:'TABLE SHOT!'},ladder:{dmg:18,reach:48,name:'LADDER SHOT!'}};
function hcProps(){let id=0;const P=(k,st,x,z,out)=>({id:id++,k,st,x,z,y:0,out,held:-1,hits:0,climber:-1});
 return[P('chair','open',232,148,false),P('table','flat',118,129,false),P('chair','open',118,198,true),P('chair','open',208,206,true),P('ladder','flat',380,180,true)];}
const propAt=i=>G.props&&G.props[i];
const pickable=p=>p.held<0&&p.st!=='broken'&&!p.dead&&p.climber<0;
function nearProp(f,test,rx=26,rz=12){let best=null,bd=1e9;for(const p of G.props||[]){if(p.out!==f.out||!test(p))continue;const dx=Math.abs(p.x-(f.x+f.dir*8)),dz=Math.abs(p.z-f.z);if(dx<rx&&dz<rz&&dx+dz*2<bd){bd=dx+dz*2;best=p;}}return best;}
function pickUp(f,p){p.held=f.idx;f.wpn=p.id;sfx('grab');if(!f.cpu)popOn(f,p.k.toUpperCase()+'!','#ffd35a');}
function setDown(f,stand){const p=propAt(f.wpn);if(!p)return;f.wpn=-1;p.held=-1;p.out=f.out;p.y=0;p.z=f.z;
 p.x=f.x+f.dir*(stand?(p.k==='table'?34:p.k==='ladder'?30:22):10);const k={x:p.x,z:p.z,out:p.out};clampPos(k);p.x=k.x;p.z=k.z;
 p.st=stand?(p.k==='chair'?(p.hits>=2?'dent':'open'):p.k==='table'?'up':'open'):(p.k==='chair'&&p.hits>=2?'dent':'flat');
 if(stand){sfx('grab');if(p.k==='table'&&!f.cpu)popOn(f,'TABLE SET UP!','#ffd35a');if(p.k==='ladder'){say(`${f.ch.short} sets up the ladder!`);heat(0.05);}}else sfx('hit');}
function startSwing(f){setState(f,'wswing');f.vx=f.vz=0;sfx('whoosh');}
function updSwing(f,o){const p=propAt(f.wpn);if(!p){setState(f,'idle');return;}
 if(f.t>=0.2&&!f.hitDone){f.hitDone=true;const W0=WPN[p.k],dx=(o.x-f.x)*f.dir;
  const can=o.out===f.out&&dx>-6&&dx<W0.reach&&Math.abs(o.z-f.z)<14&&o.y<24&&(HITTABLE.has(o.state)||o.state==='down'||o.state==='getup');
  if(can){const lying=o.state==='down';damage(o,(lying?0.7:1)*W0.dmg*f.ch.pow,f);hitFx(sx_(o),sy_(o)-(lying?6:30),14);sfx('slam');tone(620,0.18,0.25,'square',300);shake(6);G.hitStop=0.1;irpMark('big');heat(0.1);crowdReact(f,true);
   if(!lying)knock(o,f.dir*170,190);else o.downDur=Math.max(o.downDur,1.2);
   popOn(o,W0.name,'#ffd35a');say(`${f.ch.short} with a ${p.k} shot on ${o.ch.short}!`);p.hits++;
   if(p.k==='chair'&&p.hits>=(HC().chairHits||4)){f.wpn=-1;p.held=-1;p.st='dent';p.dead=true;p.x=f.x+f.dir*12;p.z=f.z;p.out=f.out;popOn(f,'CHAIR DESTROYED!','#fff');}
   if(p.k==='table'){f.wpn=-1;p.held=-1;p.st='broken';p.x=o.x;p.z=o.z;p.out=o.out;callout('THE TABLE EXPLODES!','#ffd35a',1.2);dust(PX(o.x,o.z),PY(o.z),true);}}}
 if(f.t>0.5)setState(f,'idle');}
// the ladder: climbing up, standing on top
function updLadderMan(f,o,inp,dt){const p=propAt(f.lad);if(!p||p.st!=='open'){f.lad=-1;if(f.y>4)knock(f,-f.dir*60,40,true);else setState(f,'idle');return;}
 const top=HC().ladderTop||66;f.vx=f.vz=0;f.x=p.x;f.z=p.z+0.3;
 if(f.state==='lclimb'){f.y=top*Math.min(1,f.t/0.9);f.walkPh+=dt*12;if(f.t>=0.9){setState(f,'ltop');f.y=top;say(`${f.ch.short} is at the top of the ladder!`);heat(0.12);sfx('roar');}return;}
 f.y=top;f.dir=o.x>=f.x?1:-1;
 if(inp.punchP||inp.kickP){p.climber=-1;f.lad=-1;f.ladDive={hp:o.hp};startDive(f,o);callout('OFF THE LADDER!','#ff8a1f',1.2);}
 else if(inp.jumpP){p.climber=-1;f.lad=-1;setState(f,'jump');f.vy=150;f.vx=f.dir*70;}}
function tipLadder(f,p){const c=G.f[p.climber];p.climber=-1;p.st='flat';sfx('slam');shake(6);if(!c)return;c.lad=-1;damage(c,10,f);knock(c,(c.x>=f.x?1:-1)*90,60,true);
 callout('LADDER TIPPED!','#ff4a3a',1.1);say(`${f.ch.short} tips the ladder and ${c.ch.short} crashes down!`);heat(0.15);irpMark('big');}
function breakTable(f,p,by){p.st='broken';p.x=f.x;p.z=f.z;f.x=p.x;damage(f,(HC().tableDmg||12),by||f);f.downDur=Math.max(f.downDur,2.4);
 callout('THROUGH THE TABLE!','#ffd35a',1.6);say(`${f.ch.short} goes CRASHING through the table!`);sfx('slam');sfx('roar');shake(10);G.hitStop=0.14;G.flash=0.3;heat(0.25);irpMark('big');
 for(let k=0;k<3;k++)dust(PX(f.x+(k-1)*16,f.z),PY(f.z),true);}

// CPU: grab a weapon now and then, climb a ladder over a downed opponent, tip a ladder someone's climbing
function hcCpu(f,o,inp,dt){const a=f.ai;a.hcT=(a.hcT||0)-dt;
 if(f.state==='ltop'){if(f.t>0.4&&(o.state==='down'||o.state==='getup'||HITTABLE.has(o.state))&&Math.abs(o.x-f.x)<170&&arand()<0.06)inp.punchP=true;return;}
 if(o.state==='lclimb'||o.state==='ltop'){const p=propAt(o.lad);if(p&&p.out===f.out){const dx=p.x-f.x,dz=p.z-f.z;Object.assign(inp,blank());
  if(Math.abs(dx)>18)inp[dx>0?'right':'left']=true;if(Math.abs(dz)>8)inp[dz>0?'down':'up']=true;if(Math.abs(dx)<30&&Math.abs(dz)<12&&arand()<0.25)inp.grabP=true;return;}}
 if(f.wpn>=0){const p=propAt(f.wpn),reach=WPN[p.k].reach,dx=(o.x-f.x)*f.dir;
  // a table usually gets set up near the opponent (to put him through it later), sometimes swung
  if(p.k==='table'){if(a.tblFor!==p.id){a.tblFor=p.id;a.tblSet=arand()<0.75;}
   if(a.tblSet&&FREE.has(f.state)&&Math.abs(o.x-f.x)<140&&o.out===f.out){Object.assign(inp,blank());inp.grabP=true;a.tblFor=-1;return;}}
  if(inp.grabP){const tbl=p.k==='table'&&Math.abs(o.x-f.x)<90&&arand()<0.5;inp.grabP=tbl;if(!tbl&&dx>0&&dx<reach)inp.punchP=true;}
  // ladder: set it up next to a downed opponent and go up top
  if(p.k==='ladder'&&o.state==='down'&&FREE.has(f.state)&&Math.abs(o.x-f.x)<80&&arand()<0.2){Object.assign(inp,blank());inp.grabP=true;}
  // after a shot or two, toss it aside and wrestle
  if(inp.punchP&&f.state==='idle'&&p.hits>=1&&arand()<0.35){inp.punchP=false;inp.grabP=true;}
  return;}
 if(!FREE.has(f.state))return;
 // a table's set up: drag the opponent over and slam him through it
 {const t=G.props.find(t=>t.k==='table'&&t.st==='up'&&t.out===f.out&&Math.abs(t.x-f.x)<90&&Math.abs(t.z-f.z)<16);
  if(t&&o.out===f.out&&Math.abs(o.x-f.x)<30&&Math.abs(o.z-f.z)<10&&GRABBABLE.has(o.state)&&arand()<0.2){Object.assign(inp,blank());inp.grabP=true;return;}}
 const lad=nearProp(f,p=>p.k==='ladder'&&p.st==='open'&&p.climber<0,30,14);
 if(lad&&(o.state==='down'||o.state==='getup')&&o.out===f.out&&Math.abs(o.x-lad.x)<150&&arand()<0.3){Object.assign(inp,blank());inp.jumpP=true;return;}
 if(a.hcT<=0){a.hcT=arnd(1.6,3.2);a.hcGoal=-1;if(o.hp>=30&&o.state!=='down'&&arand()<(HC().cpuWeapon||0.35)){let best=null,bd=230;for(const p of G.props)if(pickable(p)&&p.out===f.out&&(p.k!=='ladder'||p.st==='flat')){const d=Math.abs(p.x-f.x)+2*Math.abs(p.z-f.z);if(d<bd){bd=d;best=p;}}if(best)a.hcGoal=best.id;}}
 const g=propAt(a.hcGoal);if(g&&pickable(g)&&g.out===f.out&&Math.abs(o.x-f.x)>36){const dx=g.x-f.x,dz=g.z-f.z;Object.assign(inp,blank());
  if(Math.abs(dx)>14)inp[dx>0?'right':'left']=true;if(Math.abs(dz)>6)inp[dz>0?'down':'up']=true;if(Math.abs(dx)<22&&Math.abs(dz)<10){inp.grabP=true;a.hcGoal=-1;}}}

// CPU weapon decisions: run before this step's buttons are recorded, so replays and online see the same presses
function hcCpuAll(inp,dt){if(G.over)return;for(let i=0;i<2;i++)if(G.f[i].cpu)hcCpu(G.f[i],G.f[1-i],inp[i],dt);}
// before the wrestlers move: weapon and ladder buttons take over from the normal moves
function hcPre(inp,dt){const[A,B]=G.f;for(let i=0;i<2;i++){const f=G.f[i],o=G.f[1-i],I=inp[i];if(f.wpn==null)f.wpn=-1;if(f.lad==null)f.lad=-1;
 if(G.over)continue;
 if(f.state==='lclimb'||f.state==='ltop'){updLadderMan(f,o,I,dt);Object.assign(I,blank());continue;}
 if(f.state==='wswing'){Object.assign(I,blank());continue;}
 if(!FREE.has(f.state))continue;
 if(f.wpn>=0){
  if(I.punchP){I.punchP=false;startSwing(f);continue;}
  if(I.grabP){const nearBody=Math.abs(bodyX(o)-f.x)<34&&Math.abs(o.z-f.z)<12;if(o.state==='down'&&nearBody&&!f.out&&!o.out){setDown(f,false);}else{I.grabP=false;setDown(f,true);}}
  continue;}
 if(I.grabP){const lad=G.props.find(p=>p.k==='ladder'&&p.climber>=0&&p.climber!==f.idx&&p.out===f.out&&Math.abs(p.x-f.x)<34&&Math.abs(p.z-f.z)<14);
  if(lad){I.grabP=false;tipLadder(f,lad);continue;}
  const inGrab=o.out===f.out&&Math.abs(o.x-f.x)<34*f.ch.size&&Math.abs(o.z-f.z)<12&&(GRABBABLE.has(o.state)||o.state==='down');
  if(!inGrab){const p=nearProp(f,pickable);if(p){I.grabP=false;pickUp(f,p);continue;}}}
 if(I.jumpP){const p=nearProp(f,p=>p.k==='ladder'&&p.st==='open'&&p.climber<0,24,12);
  if(p){I.jumpP=false;f.lad=p.id;p.climber=f.idx;setState(f,'lclimb');f.dir=o.x>=f.x?1:-1;sfx('whoosh');}}}}
// after the wrestlers move: swings land, weapons get dropped, people go through tables
function hcPost(dt){for(let i=0;i<2;i++){const f=G.f[i],o=G.f[1-i];
 if(f.state==='wswing')updSwing(f,o);
 const p=propAt(f.wpn);if(p){p.x=f.x;p.z=f.z;p.out=f.out;if(!HC_HOLD.has(f.state)||G.over)setDown(f,false);}
 if(f.lad>=0&&(f.state==='lclimb'||f.state==='ltop')){const l=propAt(f.lad);if(l){f.x=l.x;f.z=l.z+0.3;}}
 if(f.lad>=0&&f.state!=='lclimb'&&f.state!=='ltop'){const l=propAt(f.lad);if(l)l.climber=-1;f.lad=-1;}
 if(f.ladDive&&f.state!=='dive'){if(o.hp<f.ladDive.hp){damage(o,HC().ladderBonus||8,f);shake(8);heat(0.2);}f.ladDive=null;}
 // landed on a table?
 if(f.state==='down'&&f.t<=dt*1.5&&!f.tbl){f.tbl=true;const slam=o.state==='grapple'||o.state==='finisher'||o.state==='dive'||o.state==='wswing';
  const r=slam?72:30;let best=null,bd=1e9;for(const t of G.props)if(t.k==='table'&&t.st==='up'&&t.out===f.out&&Math.abs(t.z-f.z)<16){const d=Math.abs(t.x-f.x);if(d<r&&d<bd){bd=d;best=t;}}
  if(best)breakTable(f,best,o);}
 if(f.state!=='down')f.tbl=false;}}

// ---------- drawing ----------
function propImg(p){if(p.held>=0)return p.k==='chair'?'chair_up':p.k==='table'?'table_edge':'ladder_flat';return p.k+'_'+p.st;}
function drawPropAt(name,x,y,s,rot,ax=0.5,ay=1){const im=PROP_IMG[name];if(!im||!im.complete||!im.naturalWidth)return;const w=im.naturalWidth/2*s,h=im.naturalHeight/2*s;
 if(!rot){ctx.drawImage(im,Math.round(x-w*ax),Math.round(y-h*ay),w,h);return;}ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(rot);ctx.drawImage(im,-w*ax,-h*ay,w,h);ctx.restore();}
function drawProp(p){const s=depthS(p.z);drawPropAt(propImg(p),PX(p.x,p.z),PY(p.z)-p.y*s,s,0);}
function drawHeld(f){const p=propAt(f.wpn);if(!p)return;const s=depthS(f.z),bx=PX(f.x,f.z),gy=PY(f.z)-f.y*s,d=f.dir,sw=f.state==='wswing'?f.t:-1;
 if(p.k==='chair'){const hx=bx+d*(sw>=0?16:12)*s,hy=gy-(sw>=0?50:34)*s;let a=0;if(sw>=0)a=sw<0.18?(sw/0.18)*Math.PI*0.95:Math.min(1.6,0.95+(sw-0.18)/0.12*0.65)*Math.PI;
  // the chair hangs from the hand (top at the hand); swinging rotates it around the hand
  drawPropAt('chair_up',hx,hy,s,d>0?a:-a,0.5,0);return;}
 const push=sw>=0.18&&sw<0.34?14:0;
 if(p.k==='table'){drawPropAt('table_edge',bx+d*(14+push)*s,gy-4*s,s,0);return;}
 drawPropAt('ladder_flat',bx+d*(18+push)*s,gy-26*s,s,0);}
function drawHCHint(){const me=G.f[0];if(me.cpu||G.over||!FREE.has(me.state))return;let txt=null;
 if(me.wpn>=0)txt=coarse?'PUNCH: SWING · GRAB: SET DOWN':'F: SWING · H: SET DOWN';
 else if(nearProp(me,p=>p.k==='ladder'&&p.st==='open'&&p.climber<0,24,12))txt=coarse?'JUMP: CLIMB THE LADDER':'SPACE: CLIMB THE LADDER';
 else if(nearProp(me,pickable))txt=coarse?'GRAB: PICK IT UP':'H: PICK IT UP';
 if(txt){const y=PY(me.z)-me.y-84*(me.ch.size||1);if(Math.floor(G.t*3)%2)T(txt,clamp(PX(me.x,me.z),70,W-70),y,1,'#ffd35a','center','#000');}
 if(me.state==='ltop')T(coarse?'PUNCH: DIVE!':'F: DIVE!',clamp(PX(me.x,me.z),50,W-50),PY(me.z)-me.y-84,1,Math.floor(G.t*8)%2?'#ff8a1f':'#fff','center','#000');}
