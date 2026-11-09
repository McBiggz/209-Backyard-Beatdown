// ================= UNIVERSE MODE (test link) =================
// A 10-week season at the Den. Each week: one training session with Mike Hayashi or CJ, then the weekly show match.
// Week 10 is the DEN CHAMPIONSHIP. Stats (Power / Speed / Technique, 0-100) are earned in training minigames and
// give up to about a 20% edge in matches. Saved on the device.
const UNI_KEY='bb_universe_v1',UNI_WEEKS=10;
const UNI_DRILLS=[
 {k:'bench',name:'BENCH PRESS',stat:'pow',label:'POWER',coach:'dragon',desc:'MASH TO PUSH THE BAR UP'},
 {k:'fivex5',name:'5-BY-5s',stat:'spd',label:'SPEED',coach:'cjdirt',desc:'LEAPFROG + DROP DOWN ON TIME'},
 {k:'chain',name:'CHAIN SPARRING',stat:'tec',label:'TECHNIQUE',coach:'dragon',desc:'HIT THE PROMPT TO REVERSE'}];
const STAT_LBL={pow:'POWER',spd:'SPEED',tec:'TECHNIQUE'};
function uniLoad(){try{const s=localStorage.getItem(UNI_KEY);return s?JSON.parse(s):null;}catch(e){return null;}}
function uniSave(){try{localStorage.setItem(UNI_KEY,JSON.stringify(G.uni));}catch(e){}}
function uniNew(pick){const me=ROSTER[pick].id,others=ROSTER.map(c=>c.id).filter(id=>id!==me&&!/^kliq|^mainevent/.test(id));
 for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 return{me,week:1,stats:{pow:10,spd:10,tec:10},rec:{w:0,l:0},sched:others.slice(0,UNI_WEEKS),trained:false,champ:false,log:[],sel:0};}
function uniStart(pick){const old=uniLoad();G.uni=old&&old.me===ROSTER[pick].id&&old.week<=UNI_WEEKS?old:uniNew(pick);uniSave();G.scene='uni';G.uni.sel=G.uni.trained?3:0;}
function uniOpp(){const U=G.uni;return ROSTER.find(c=>c.id===U.sched[(U.week-1)%U.sched.length])||ROSTER[1];}
// stats -> match boost. Power: damage dealt, Speed: movement, Technique: damage taken (up to ~20% each at 100)
function uniBoost(ch){const s=G.uni.stats;return Object.assign({},ch,{pow:ch.pow*(1+0.2*s.pow/100),spd:ch.spd*(1+0.12*s.spd/100)});}
function uniDef(){return 1-0.15*G.uni.stats.tec/100;}
function uniMatch(){const U=G.uni,me=ROSTER.findIndex(c=>c.id===U.me),op=ROSTER.indexOf(uniOpp());
 G.mode=0;G.hc=G.cage=false;G.stage=3;G.sel={c:[me,op],stage:2,picks:[me,op]};startIntro();
 G.f[0].ch=uniBoost(G.f[0].ch);G.f[0].uniDef=uniDef();G.uniMatch=true;}
function uniAfterMatch(){const U=G.uni,won=G.over&&G.over.w===G.f[0];G.uniMatch=false;
 if(won)U.rec.w++;else U.rec.l++;const title=U.week===UNI_WEEKS;
 U.log.unshift(`WK ${U.week}: ${won?'BEAT':'LOST TO'} ${uniOpp().short.toUpperCase()}`);U.log=U.log.slice(0,4);
 if(title&&won)U.champ=true;
 U.week++;U.trained=false;U.sel=0;uniSave();G.scene='uni';G.over=null;
 U.flash=title?(won?'YOU ARE THE DEN CHAMPION!':'SO CLOSE. THE SEASON IS OVER.'):won?'WIN! +1 ON YOUR RECORD':'LOSS. GET BACK IN THE GYM.';U.flashT=2.5;}
// ---------- hub ----------
function uniItems(){const U=G.uni;if(U.week>UNI_WEEKS)return[['NEW SEASON','new'],['MAIN MENU','quit']];
 return[...UNI_DRILLS.map(d=>[U.trained?'(TRAINED THIS WEEK)':'TRAIN: '+d.name,'train:'+d.k]),[U.week===UNI_WEEKS?'WRESTLE: TITLE MATCH':'WRESTLE THIS WEEK','match'],['MAIN MENU','quit']];}
const UNI_BTN=i=>[198,92+i*15,176,13];
function updUni(){const U=G.uni,it=uniItems();G.pops.length=0;if(U.flashT>0)U.flashT-=STEP;
 if(hit(['KeyW','ArrowUp']))U.sel=(U.sel+it.length-1)%it.length;if(hit(['KeyS','ArrowDown']))U.sel=(U.sel+1)%it.length;
 let go=confirmP();if(clickQ)it.forEach((_,i)=>{if(inRect(clickQ,UNI_BTN(i))){U.sel=i;go=true;}});
 if(hit(['Escape'])){G.scene='title';return;}
 if(!go)return;const a=it[U.sel][1];sfx('punch');
 if(a==='quit'){G.scene='title';return;}
 if(a==='new'){G.uni=uniNew(ROSTER.findIndex(c=>c.id===U.me));uniSave();return;}
 if(a==='match'){uniMatch();return;}
 if(a.startsWith('train:')){if(U.trained){sfx('hit');return;}trainStart(a.slice(6));}}
function drawUni(){const U=G.uni,me=ROSTER.find(c=>c.id===U.me);
 if(SECRET.complete)ctx.drawImage(SECRET,-60,0,MAPW,H);R(0,0,W,H,'rgba(8,4,6,0.78)');
 T('UNIVERSE MODE',12,8,2,'#ffd35a','left','#5a0608');
 T(U.week>UNI_WEEKS?'SEASON OVER':'WEEK '+U.week+' OF '+UNI_WEEKS,372,10,1,'#fff','right',null);
 drawSpr(SETS[U.me],'idle0',70,178,1,1);if(U.champ)T('CHAMPION',70,182,1,'#ffd35a','center','#000');
 T(me.name,12,28,1,'#fff','left',null);T('RECORD  '+U.rec.w+' - '+U.rec.l,12,40,1,'#bfae98','left',null);
 let y=52;for(const k of ['pow','spd','tec']){T(STAT_LBL[k],124,y,1,'#e9dcc6','left',null);R(124,y+9,64,4,'#2a1a1c');R(124,y+9,Math.round(64*U.stats[k]/100),4,k==='pow'?'#ff4a3a':k==='spd'?'#3a8bff':'#5fe07a');T(''+U.stats[k],190,y+6,1,'#fff','left',null);y+=20;}
 if(U.week<=UNI_WEEKS){const op=uniOpp(),title=U.week===UNI_WEEKS;BOX(198,28,176,56,'#140a0c',title?'#ffd35a':'#5a4a40');
  T(title?'THIS WEEK: DEN CHAMPIONSHIP':'THIS WEEK AT THE DEN',286,32,1,title?'#ffd35a':'#bfae98','center',null);
  T('VS '+op.name,286,44,1,'#fff','center',null);drawSpr(SETS[op.id],'idle0',350,82,-1,0.32);
  T(U.trained?'TRAINED: READY TO WRESTLE':'TRAIN FIRST, THEN WRESTLE',286,70,1,U.trained?'#5fe07a':'#bfae98','center',null);}
 else{BOX(198,28,176,56,'#140a0c','#ffd35a');T(U.champ?'DEN CHAMPION!':'SEASON COMPLETE',286,44,2,'#ffd35a','center','#5a0608');T('FINAL RECORD '+U.rec.w+' - '+U.rec.l,286,66,1,'#fff','center',null);}
 uniItems().forEach(([s],i)=>{const r=UNI_BTN(i),on=U.sel===i;BOX(...r,on?'#8f0f14':'#140a0c',on?'#ffd35a':'#5a4a40');T((on?'> ':'')+s,r[0]+r[2]/2,r[1]+3,1,on?'#fff':'#bfae98','center',null);});
 U.log.forEach((l,i)=>T(l,124,118+i*10,1,'#8a7a6a','left',null));
 if(U.flashT>0)T(U.flash,192,196,1,Math.floor(G.t*6)%2?'#ffd35a':'#fff','center','#000');
 else T(coarse?'TAP AN OPTION':'W/S TO PICK • ENTER TO CHOOSE • ESC: MENU',192,200,1,'#6a5a4a','center',null);}

// ================= TRAINING MINIGAMES =================
const TR_FLOOR=172;
function trainStart(k){const d=UNI_DRILLS.find(x=>x.k===k);G.trn={k,d,t:0,phase:'intro',score:0,max:1,lines:[],msg:'',msgT:0,
 lift:0,reps:0,fatigue:0, n:0,cx:-40,cdir:1,pose:null,poseT:0,judged:false, round:0,want:null,win:0,res:null,resT:0};
 G.scene='train';sfx('roar');}
function trSay(s,c='#fff'){const T=G.trn;T.msg=s;T.msgC=c;T.msgT=1.1;}
const TR_BTNS=['punchP','kickP','grabP','jumpP'],TR_BTN_LBL=k=>({punchP:coarse?'PUNCH':'F',kickP:coarse?'KICK':'G',grabP:coarse?'GRAB':'H',jumpP:coarse?'JUMP':'SPACE'})[k];
function updTrain(){const T=G.trn,dt=STEP,inp=humanInput(0);G.pops.length=0;T.t+=dt;if(T.msgT>0)T.msgT-=dt;
 if(hit(['Escape'])){G.scene='uni';return;}
 const anyP=confirmP()||clickQ||inp.punchP||inp.kickP||inp.grabP||inp.jumpP;
 if(T.phase==='intro'){if(T.t>2.2||(T.t>0.5&&anyP)){T.phase='go';T.t=0;}return;}
 if(T.phase==='done'){if(T.t>1.2&&anyP){const U=G.uni,s=T.d.stat,gain=Math.round(3+9*clamp(T.score/T.max,0,1));
   U.stats[s]=Math.min(100,U.stats[s]+gain);U.trained=true;U.sel=3;U.flash=`${STAT_LBL[s]} +${gain}!`;U.flashT=2.5;uniSave();G.scene='uni';}return;}
 if(T.k==='bench')trBench(T,inp,dt);else if(T.k==='fivex5')trFive(T,inp,dt);else trChain(T,inp,dt);}
function trDone(T){T.phase='done';T.t=0;sfx('bell');}
// --- BENCH PRESS: mash to push the bar up; it keeps sinking, faster as you tire. 20 seconds, as many reps as you can (8 = max)
function trBench(T,inp,dt){T.max=8;const m=inp.punchP||inp.kickP||inp.grabP||inp.jumpP;
 if(m){T.lift+=0.075;T.pose=0.08;}T.lift=Math.max(0,T.lift-dt*(0.32+T.fatigue*0.05));
 if(T.lift>=1){T.reps++;T.score=T.reps;T.lift=0;T.fatigue++;sfx('slam');shake(3);trSay(['GOOD!','LOCK IT OUT!','ONE MORE!','THAT\'S POWER!','KEEP GOING!'][T.reps%5],'#ffd35a');}
 if(T.t>20)trDone(T);}
// --- 5-BY-5s: CJ runs across 10 times. First 5: LEAPFROG (JUMP). Last 5: DROP DOWN (DOWN + JUMP). Time it as he gets close.
function trFive(T,inp,dt){T.max=10;const px=192,sp=150+T.n*8;if(T.poseT>0)T.poseT-=dt;
 if(T.n>=10){if(T.poseT<=0)trDone(T);return;}
 T.cx+=T.cdir*sp*dt;const d=(px-T.cx)*T.cdir,drop=T.n>=5;
 if(!T.judged&&inp.jumpP&&d>0){T.judged=true;const ok=d<=46&&d>=6&&(drop?inp.down:!inp.down);
  T.pose=drop?'drop':'leap';T.poseT=0.55;
  if(ok){T.score++;trSay(d>=14&&d<=32?'PERFECT!':'GOOD!','#5fe07a');sfx('whoosh');}else trSay(d>46?'TOO EARLY!':drop?'DOWN + JUMP!':'JUST JUMP!','#ff4a3a');}
 if(!T.judged&&d<4){T.judged=true;trSay('OOF! TOO LATE!','#ff4a3a');sfx('hit');shake(4);T.pose='hit';T.poseT=0.4;}
 if((T.cdir>0&&T.cx>W+40)||(T.cdir<0&&T.cx<-40)){T.cdir*=-1;T.n++;T.judged=false;if(T.n===5)trSay('NOW DROP DOWN!','#ffd35a');}}
// --- CHAIN SPARRING: Hayashi puts a hold on; hit the button shown before the bar runs out to reverse it. 8 rounds, faster each time.
const HOLDS=['HEADLOCK','WRISTLOCK','HAMMERLOCK','CHIN LOCK','HEADLOCK','WRISTLOCK','HAMMERLOCK','SNAPMARE'];
function trChain(T,inp,dt){T.max=8;
 if(T.res){T.resT-=dt;if(T.resT<=0){T.res=null;T.round++;T.want=null;if(T.round>=8)trDone(T);}return;}
 if(!T.want){T.want=TR_BTNS[Math.floor(Math.random()*4)];T.win=1.5-T.round*0.1;T.left=T.win;T.wait=0.35;return;}
 if(T.wait>0){T.wait-=dt;return;}
 T.left-=dt;const pressed=TR_BTNS.find(k=>inp[k]);
 if(pressed){if(pressed===T.want){T.score++;T.res='win';sfx('slam');trSay('REVERSED!','#5fe07a');}else{T.res='lose';sfx('hit');trSay('WRONG MOVE!','#ff4a3a');}T.resT=0.7;}
 else if(T.left<=0){T.res='lose';T.resT=0.7;sfx('hit');trSay('TOO SLOW!','#ff4a3a');}}
function drawTrain(){const T=G.trn,me=G.uni.me,coach=T.d.coach,cs=SETS[coach],ms=SETS[me];
 if(SECRET.complete)ctx.drawImage(SECRET,-250,0,MAPW,H);R(0,0,W,H,'rgba(0,0,0,0.25)');
 if(T.k==='bench'){const lifted=T.lift>0.5||T.pose>0;if(T.pose>0)T.pose-=STEP;
  drawSpr(ms,lifted?'win0':'grap0',170,TR_FLOOR,1,1);const by=TR_FLOOR-70-Math.round(T.lift*34);
  R(120,by,100,3,'#c8c8d4');R(114,by-8,8,19,'#2a2a30');R(218,by-8,8,19,'#2a2a30');R(110,by-6,4,15,'#3a3a44');R(226,by-6,4,15,'#3a3a44');
  drawSpr(cs,'idle0',300,TR_FLOOR,-1,1);
  R(30,40,8,100,'#1a1012');R(30,40+100-Math.round(100*T.lift),8,Math.round(100*T.lift),'#ff4a3a');
  UT('REPS '+T.reps,192,30,2,'#fff');UT('TIME '+Math.max(0,Math.ceil(20-T.t)),330,30,1,'#bfae98');}
 else if(T.k==='fivex5'){let f='idle0',y=TR_FLOOR;
  if(T.poseT>0){if(T.pose==='leap'){f='jump';y-=Math.round(Math.sin((1-T.poseT/0.55)*Math.PI)*40);}else if(T.pose==='drop'){f='pinning';y+=CTR.dodge.dropDy;}else f='hit';}
  drawSpr(ms,f,192,y,1,1);if(T.n<10)drawSpr(cs,'walk'+(Math.floor(T.t*10)%4),T.cx,TR_FLOOR+6,T.cdir,1);
  UT((T.n<5?'LEAPFROG ':'DROP DOWN ')+Math.min(10,T.n+1)+' / 10',192,30,1,'#fff');UT('HITS '+T.score,330,30,1,'#5fe07a');
  UT(T.n<5?(coarse?'TAP JUMP AS HE GETS CLOSE':'PRESS SPACE AS HE GETS CLOSE'):(coarse?'HOLD DOWN + TAP JUMP':'HOLD S + PRESS SPACE'),192,44,1,'#bfae98');}
 else{const r=T.res;drawSpr(ms,r==='win'?'grap1':r==='lose'?'grabbed':'grap0',176,TR_FLOOR,1,1);drawSpr(cs,r==='win'?'grabbed':r==='lose'?'grap1':'grap0',214,TR_FLOOR,-1,1);
  UT('ROUND '+Math.min(8,T.round+1)+' / 8',192,26,1,'#fff');UT('REVERSALS '+T.score,330,26,1,'#5fe07a');
  if(T.want&&!T.res){UT(HOLDS[T.round],192,40,2,'#ffd35a');if(T.wait<=0){BOX(152,58,80,18,'#8f0f14','#ffd35a');UT('PRESS '+TR_BTN_LBL(T.want),192,63,1,'#fff');
   R(152,78,80,3,'#2a1a1c');R(152,78,Math.round(80*clamp(T.left/T.win,0,1)),3,'#ffd35a');}}}
 if(T.msgT>0)UT(T.msg,192,110,2,T.msgC||'#fff');
 if(T.phase==='intro'){R(0,0,W,H,'rgba(6,2,3,0.75)');const c=ROSTER.find(x=>x.id===coach);
  UT('TRAINING WITH '+(coach==='dragon'?'MIKE HAYASHI':'CJ'),192,58,1,'#bfae98');UT(T.d.name,192,72,3,'#ffd35a');UT(T.d.desc,192,104,1,'#fff');UT('RAISES '+T.d.label,192,118,1,'#5fe07a');}
 if(T.phase==='done'){R(0,0,W,H,'rgba(6,2,3,0.75)');const p=clamp(T.score/T.max,0,1),gain=Math.round(3+9*p);
  UT(p>=0.8?'GREAT SESSION!':p>=0.5?'SOLID WORK':'KEEP AT IT',192,62,2,'#ffd35a');UT('SCORE '+T.score+' / '+T.max,192,90,1,'#fff');
  UT(T.d.label+' +'+gain,192,104,2,'#5fe07a');if(T.t>1.2)UT(coarse?'TAP TO CONTINUE':'PRESS ENTER',192,140,1,'#bfae98');}}
const UT=(s,x,y,sc,c)=>T(s,x,y,sc,c,'center','#000');
