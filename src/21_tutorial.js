// ================= TUTORIAL + PRACTICE =================
// Title > TUTORIAL & PRACTICE > pick a wrestler. Lessons walk through every move against a dummy that
// sets itself up for each lesson. After the last lesson (or SKIP) it becomes free practice: the dummy can
// STAND, BLOCK or FIGHT back, and you can refill your finisher meter. Nobody gets knocked out here.
const BTN=k=>coarse?{MOVE:'THE THUMB PAD',PUNCH:'PUNCH',KICK:'KICK',GRAB:'GRAB',JUMP:'JUMP',FINISH:'FINISH',DOWN:'DOWN ON THE PAD'}[k]:{MOVE:'W A S D',PUNCH:'F',KICK:'G',GRAB:'H',JUMP:'SPACE',FINISH:'R',DOWN:'S'}[k];
const say_=s=>s.replace(/\{(\w+)\}/g,(_,k)=>BTN(k));
const LESSONS=[
 {t:'MOVE AROUND THE RING WITH {MOVE}',ev:'move',n:1},
 {t:'PRESS {PUNCH} NEXT TO HIM TO THROW A PUNCH',ev:'punch',n:2},
 {t:'PRESS {KICK} TO KICK HIM',ev:'kick',n:2},
 {t:'HE IS SWINGING AT YOU. HOLD AWAY FROM HIM TO BLOCK',ev:'block',n:2,dummy:'attack'},
 {t:'HOLD LEFT OR RIGHT AND PRESS {GRAB} TO WHIP HIM INTO THE ROPES',ev:'whip',n:1},
 {t:'HE WILL WHIP YOU. PRESS {GRAB} WHEN THE ICON FLASHES TO REVERSE IT',ev:'reverse',n:1,dummy:'whip'},
 {t:'GET WHIPPED, THEN PRESS {PUNCH} OR {KICK} COMING OFF THE ROPES',ev:'ropeattack',n:1,dummy:'whip'},
 {t:'DOUBLE-TAP LEFT OR RIGHT TO RUN, THEN {PUNCH} FOR A CLOTHESLINE',ev:'runattack',n:1},
 // 5-by-5s (test link only while they're being cleaned up)
 ...(TEST_MODES?[
  {t:'HE WILL RUN AT YOU. PRESS {JUMP} JUST BEFORE HE GETS THERE TO LEAPFROG HIM',ev:'leapfrog',n:2,dummy:'run'},
  {t:'NOW HOLD {DOWN} AND PRESS {JUMP} TO DROP DOWN AND LET HIM RUN OVER YOU',ev:'dropdown',n:2,dummy:'run'}]:[]),
 {t:'WALK INTO A CORNER, PRESS {JUMP} TO CLIMB, THEN {PUNCH} TO FLY',ev:'dive',n:1},
 {t:'KNOCK HIM DOWN, THEN PRESS {GRAB} ON HIM TO PIN',ev:'pin',n:1},
 {t:'YOUR METER IS FULL. PRESS {FINISH} NEXT TO HIM',ev:'fin',n:1,setup:'meter'},
 {t:'PUSH INTO THE ROPES AND PRESS {JUMP} TO ROLL OUT OF THE RING',ev:'rollout',n:1},
];
const DUMMY_MODES=['STAND','BLOCK','FIGHT'].concat(TEST_MODES?['RUN']:[]);
const TUT_BTNS={dummy:[233,26,84,11],meter:[321,26,60,11],skip:[289,26,92,11]};
function tutStart(){G.tut={i:0,got:0,doneT:-1,free:false,dummy:0,moved:0,lx:null,lz:null,cool:0};tutRound();tutSetup();}
function tutRound(){beginFight();finishEntrance();G.f[1].cpu=false;if(G.tut&&!G.tut.free)tutSetup();}
function tutSetup(){const L=LESSONS[G.tut.i];if(L&&L.setup==='meter'){G.f[0].meter=100;G.f[0].readyAnn=true;}}
function tutEv(name,f){const T=G.tut;if(!T||T.free||f!==G.f[0]||T.doneT>=0)return;const L=LESSONS[T.i];if(!L||L.ev!==name)return;
 T.got++;if(T.got>=L.n){T.doneT=0;callout(T.i===LESSONS.length-1?'TUTORIAL DONE!':'NICE!','#5fe07a',1.0);sfx('roar');}}
// runs each fight step (before fighters move): lesson progress, refills, round resets
function tutStep(dt){const T=G.tut,[a,b]=G.f;
 if(T.lx!=null&&!T.free&&LESSONS[T.i].ev==='move'){T.moved+=Math.hypot(a.x-T.lx,a.z-T.lz);if(T.moved>90)tutEv('move',a);}T.lx=a.x;T.lz=a.z;
 if(a.out)tutEv('rollout',a);
 for(const f of G.f)if(f.hp<30&&!G.pin&&!G.over)f.hp=100;
 if(T.doneT>=0){T.doneT+=dt;if(T.doneT>1.3){T.doneT=-1;T.got=0;T.moved=0;T.i++;if(T.i>=LESSONS.length){T.free=true;tutRound();callout('FREE PRACTICE','#ffd35a',1.6);}else{if(a.out||G.over)tutRound();tutSetup();}}}
 if(G.over&&G.over.t>1.2)tutRound();
 T.cool=Math.max(0,T.cool-dt);}
// the dummy's buttons for this step
function tutDummyInput(){const T=G.tut,[a,b]=G.f,inp=blank();
 const mode=T.free?DUMMY_MODES[T.dummy].toLowerCase():(LESSONS[T.i]&&LESSONS[T.i].dummy)||'stand';
 b.cpu=mode==='fight';if(mode==='fight')return aiInput(b,a,STEP);
 const dx=a.x-b.x,dz=a.z-b.z,close=Math.abs(dx)<26&&Math.abs(dz)<8;
 const walkTo=()=>{if(Math.abs(dz)>4){if(dz>0)inp.down=true;else inp.up=true;}if(Math.abs(dx)>22){if(dx>0)inp.right=true;else inp.left=true;}};
 if(mode==='run'&&b.state==='run'&&!a.out&&!b.out){inp[b.runDir>0?'right':'left']=true;
  if((a.x-b.x)*b.runDir>0&&Math.abs(a.x-b.x)<30&&Math.abs(a.z-b.z)<12&&['idle','walk'].includes(a.state))inp.punchP=true;return inp;}
 if(!['idle','walk'].includes(b.state)||a.out||b.out)return inp;
 if(mode==='run'){if(T.tap>0){T.tap++;const d=T.tapD;if(T.tap<=2||(T.tap>=5&&T.tap<=7))inp[d>0?'right':'left']=true;if(T.tap>8)T.tap=0;return inp;}
  if(!['idle','walk'].includes(a.state)||T.cool>0)return inp;
  const[r0,r1]=ringX(b.z),tx=a.x>(r0+r1)/2?r0+6:r1-6,far=Math.abs(dx)>70&&Math.abs(tx-b.x)<=10;
  if(Math.abs(dz)>4){if(dz>0)inp.down=true;else inp.up=true;}
  if(!far){if(Math.abs(tx-b.x)>6)inp[tx>b.x?'right':'left']=true;return inp;}
  if(Math.abs(dz)<=4){T.tap=1;T.tapD=Math.sign(dx);T.cool=1.6;}return inp;}
 if(mode==='block'){if(incoming(b,a)){if(dx>0)inp.left=true;else inp.right=true;}return inp;}
 if(mode==='attack'){if(!close)walkTo();else if(T.cool<=0){inp.punchP=true;T.cool=1.3;}return inp;}
 if(mode==='whip'){if(!['idle','walk'].includes(a.state))return inp;if(!close)walkTo();else if(T.cool<=0){inp.grabP=true;if(dx>0)inp.right=true;else inp.left=true;T.cool=2.6;}return inp;}
 return inp;}
// menu buttons on the fight screen (taps or keys)
function tutMeta(){const T=G.tut;if(!T)return;
 if(!T.free&&(hit(['KeyN'])||(clickQ&&inRect(clickQ,TUT_BTNS.skip)))){T.free=true;T.doneT=-1;callout('FREE PRACTICE','#ffd35a',1.4);clickQ=null;}
 if(T.free&&(hit(['KeyT'])||(clickQ&&inRect(clickQ,TUT_BTNS.dummy)))){T.dummy=(T.dummy+1)%DUMMY_MODES.length;sfx('punch');clickQ=null;}
 if(T.free&&(hit(['KeyY'])||(clickQ&&inRect(clickQ,TUT_BTNS.meter)))){G.f[0].meter=100;G.f[0].readyAnn=true;sfx('glitter');clickQ=null;}}
function drawTut(){const T=G.tut;if(!T||G.scene!=='fight'||G.paused)return;
 const btn=(r,label,on)=>{BOX(r[0],r[1],r[2],r[3],on?'#8f0f14':'#140a0c','#ffd35a');T_(label,r[0]+r[2]/2,r[1]+3);};
 if(!T.free){const L=LESSONS[T.i];if(!L)return;BOX(3,40,378,22,'#140a0c',T.doneT>=0?'#5fe07a':'#ffd35a');
  T_('LESSON '+(T.i+1)+' OF '+LESSONS.length+(L.n>1?'   ('+Math.min(T.got,L.n)+'/'+L.n+')':''),192,43,'#ffd35a');T_(say_(L.t),192,52,'#fff');
  btn(TUT_BTNS.skip,coarse?'SKIP TO PRACTICE':'N: SKIP LESSONS',false);}
 else{btn(TUT_BTNS.dummy,(coarse?'':'T: ')+'DUMMY: '+DUMMY_MODES[T.dummy],true);btn(TUT_BTNS.meter,(coarse?'':'Y: ')+'METER',false);}}
function T_(s,x,y,col='#fff'){T(s,x,y,1,col,'center',null);}
