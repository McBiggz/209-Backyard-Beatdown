// ================= CPU AI =================
// ---- Fighting styles (test link): each CPU wrestles like the real guy. Every number the CPU used to share is now per style,
// with a few personal touches on top. mix = how often it picks [punch, kick, grab, whip, back off] when in range.
const AI_DEF={react:1,block:0.4,rev:0.3,ropes:0.55,dodge:1,mix:[0.34,0.24,0.10,0.10,0.10],ground:0.3,outside:0.45,run:0.012,evade:0.25,climb:0.3,fin:1};
const AI_STYLES={
 powerhouse:{block:0.3,rev:0.2,ropes:0.35,dodge:0.5,mix:[0.28,0.12,0.24,0.16,0.04],ground:0.55,outside:0.4,run:0.006,evade:0.12,climb:0.1},
 highflyer: {block:0.35,rev:0.3,ropes:0.75,dodge:1.6,mix:[0.24,0.36,0.08,0.10,0.12],ground:0.2,outside:0.55,run:0.03,evade:0.35,climb:0.6},
 brawler:   {block:0.25,rev:0.2,ropes:0.6,dodge:0.8,mix:[0.46,0.24,0.08,0.08,0.04],ground:0.25,outside:0.75,run:0.015,evade:0.1,climb:0.2},
 technician:{block:0.55,rev:0.5,ropes:0.55,dodge:1.2,mix:[0.26,0.18,0.18,0.16,0.08],ground:0.45,outside:0.4,run:0.01,evade:0.3,climb:0.25},
 showman:   {block:0.3,rev:0.3,ropes:0.6,dodge:1,mix:[0.30,0.22,0.10,0.14,0.16],ground:0.3,outside:0.5,run:0.02,evade:0.3,climb:0.4}};
// Liam's picks (Nov 9 2026) + each wrestler's personal habit
const AI_WHO={
 viral:['technician',{mix:[0.24,0.18,0.22,0.16,0.06]}],            // snapmare into dropkick, suplexes, works the arm
 dragon:['technician',{block:0.6}],
 papi:['showman',{run:0.025}],
 mainevent:['showman',{mix:[0.36,0.18,0.14,0.14,0.10]}],             // cocky, hits hard
 razzle:['technician',{dodge:1.5,climb:0.4}],                         // flashy technician
 bigmf:['powerhouse',{}],
 asesino:['highflyer',{dodge:1.8,ropes:0.8,outside:0.65}],            // luchador, dives outside
 spektro:['highflyer',{dodge:1.8,ropes:0.8,evade:0.45}],             // luchador, hit and run
 jojo:['powerhouse',{block:0.15,run:0.02,evade:0.05}],                // wild, charges in
 cdiddy:['brawler',{outside:0.9}],                                    // takes it outside
 cjdirt:['brawler',{ground:0.3,outside:0.8}],                         // dirty, stomps
 necrosis:['highflyer',{climb:0.7,dodge:1.6}],                        // luchador, risky
 firebelly:['powerhouse',{run:0.004,react:1.1}],                      // slow to get going
 maverick:['showman',{climb:0.5,run:0.03}],                           // Danger Zone: big risks
 matsunaga:['highflyer',{mix:[0.18,0.48,0.06,0.08,0.10],react:0.9}],  // fastest, nonstop kicks
 zeke:['powerhouse',{react:1.25,block:0.2}],                          // biggest and slowest
 ghoulie:['brawler',{react:1.2,evade:0.2,block:0.35}],                // patient, stalks
 kliq:['brawler',{}]};
// ---- Balance rules (test link, same flag as the styles): size gives half as much reach, speed also makes strikes come out faster,
// and each wrestler has a small damage adjustment found by running every matchup CPU vs CPU until win rates sit near 50%.
const AI_BAL={"viral":1.154,"dragon":1.28,"papi":1.174,"mainevent":0.953,"razzle":1.187,"bigmf":0.715,"asesino":1.132,"spektro":1.232,"jojo":0.698,"cdiddy":1.02,"cjdirt":0.961,"necrosis":1.119,"firebelly":0.95,"maverick":1.192,"matsunaga":1.251,"zeke":0.802,"ghoulie":1.141,"kliq":0.947}; // from tests/balance_tune.py (Nov 9 2026); 1 = no change, <1 = toned down
const reachOf=f=>G.styleOn?1+(f.ch.size-1)*0.5:f.ch.size;
const balOf=f=>G.styleOn&&AI_BAL[f.ch.id.replace('_alt','')]||1;
const powOf=f=>f.ch.pow*balOf(f);
const spdOf=f=>f.ch.spd;
const aspdOf=f=>G.styleOn?1+(f.ch.spd-1)*0.6:1;
function aiProfile(f){if(!G.styleOn)return AI_DEF;if(f.aiP)return f.aiP;const w=AI_WHO[f.ch.id.replace('_alt','')]||['brawler',{}];
 return f.aiP=Object.assign({},AI_DEF,AI_STYLES[w[0]],w[1],{style:w[0]});}
function aiInput(f,o,dt){
 const inp=blank(),a=f.ai,P=aiProfile(f);a.t-=dt;
 const dx=o.x-f.x,dz=o.z-f.z,ad=Math.abs(dx),az=Math.abs(dz);
 const mv=m=>{if(!m)return;if(m.x>0)inp.right=true;if(m.x<0)inp.left=true;if(m.z>0)inp.down=true;if(m.z<0)inp.up=true;};
 if(f.state==='perch'){if(a.t<=0&&(o.state==='down'||HITTABLE.has(o.state)))inp.punchP=true;return inp;}
 if(f.state==='whipped'){
  if(f.ctrWin>0&&f.canRev){if(a.ctrRoll!==f.whipId){a.ctrRoll=f.whipId;a.ctrDo=arand()<P.rev;a.ctrAt=arnd(0.08,CTR.whipReverse-0.05);}
   if(a.ctrDo&&CTR.whipReverse-f.ctrWin>=a.ctrAt)inp.grabP=true;return inp;}
  if(f.runWin>0){if(a.runDo===undefined)a.runDo=arand();const coming=Math.sign(f.vx)===Math.sign(dx);
   if(coming&&ad<90&&a.runDo<P.ropes)inp[a.runDo<P.ropes*0.55?'punchP':'kickP']=true;}else if(f.bounced===false)a.runDo=undefined;
  return inp;}
 if(f.state==='run'){if(f.runDir>0)inp.right=true;else inp.left=true;const coming=Math.sign(dx)===f.runDir;
  if(coming&&ad<46&&az<10){if(a.rnSid!==f.sid){a.rnSid=f.sid;a.rnDo=arand();}if(a.rnDo<0.5)inp.punchP=true;else if(a.rnDo<0.8)inp.kickP=true;else{inp.left=inp.right=false;inp.grabP=true;}}
  else if(!coming&&f.autoRun<=0){inp.left=inp.right=false;}return inp;}
 if(a.tap>0){a.tap++;const d=a.tapD;if(a.tap<=2||a.tap>=5){if(d>0)inp.right=true;else inp.left=true;}if(a.tap>8)a.tap=0;return inp;}
 if(!['idle','walk'].includes(f.state))return inp;
 // a runner coming: sometimes leapfrog him or drop down and let him go over
 if(G.dodgeOn&&o.state==='run'&&o.out===f.out&&(o.x-f.x)*o.runDir<0&&ad<CTR.dodge.cpuAt&&ad>18&&az<14){const k=o.sid+'/'+o.runDir;if(a.dgK!==k){a.dgK=k;a.dgDo=arand()<Math.min(0.95,CTR.dodge.cpu*P.dodge);a.dgDn=arand()<0.5;}
  if(a.dgDo){inp.jumpP=true;if(a.dgDn)inp.down=true;return inp;}}
 // Royal Rumble: grab a worn-down target and try to throw him over the nearest side ropes
 if(G.mm&&G.mm.elim&&ad<28&&az<8&&GRABBABLE.has(o.state)&&o.y<2&&canToss(f,o)){if(a.elSid!==o.sid){a.elSid=o.sid;a.elDo=arand()<0.55;}
  if(a.elDo){inp.grabP=true;if(o.x<157)inp.left=true;else inp.right=true;return inp;}}
 if(ad>130&&az<8&&!(wide()&&(f.out||o.out))&&arand()<P.run){a.tap=1;a.tapD=Math.sign(dx);return inp;}
 if(['punch','kick','runline'].includes(o.state)&&ad<70&&az<12){if(a.blkSid!==o.sid){a.blkSid=o.sid;a.blkDo=arand()<P.block;}
  if(a.blkDo){if(dx>0)inp.left=true;else inp.right=true;return inp;}}
 if(wide()){
  // both outside: go get him and roll him back in (test link)
  if(f.out&&o.out)a.outT=(a.outT||0)+dt;else a.outT=0;
  if(G.secretOn&&f.out&&o.out&&!G.mm&&o.x>=MAPZONE[G.map||'ranch'].x0-60){a.goal=null;
   if(ad>26||az>8){mv({x:Math.sign(dx)||1,z:Math.sign(o.z-f.z)});return inp;}
   if(arand()<0.04)inp.punchP=true;return inp;}
  if(G.rollInOn&&f.out&&o.out&&G.co.n<6&&!G.mm&&(a.outT>2.2||o.state==='down'||G.co.n>=3)){a.goal=null;const d=rollInDir(f,o);
   if(d){inp.grabP=true;if(d<0)inp.up=true;else inp.left=true;return inp;}
   if(ad<34&&az<10&&(GRABBABLE.has(o.state)||o.state==='down')){
    // line up between him and the crowd so the push goes toward the ring
    if(o.z>=180){if(f.z<o.z+3)mv({x:0,z:1});else if(o.x<44||o.x>256)mv({x:Math.sign(150-o.x),z:0});}
    else if(o.x>=RING_R-6){if(f.x<o.x+12)mv({x:1,z:0});}
    else mv({x:o.x<RING_R?1:-1,z:o.z<186?1:0});
    if(arand()<0.5)return inp;}}
  if(f.out&&(!o.out||G.co.n>=5)){a.goal=null;
   if(f.z<194){mv({x:0,z:1});return inp;} // clear the front corner of the ring before walking along the apron
   const tx=clamp(f.x,70,240);if(Math.abs(tx-f.x)>4){mv({x:Math.sign(tx-f.x),z:0});return inp;}
   inp.up=true;inp.jumpP=true;return inp;}
  if(!f.out&&o.out){a.goal=null;if(a.chase===undefined)a.chase=arand()<(G.rollInOn?Math.min(0.95,P.outside+0.4):P.outside);
   if(!a.chase||G.co.n>=6)return inp;
   if(f.z<ZMAX-1){mv({x:0,z:1});return inp;}inp.down=true;inp.jumpP=true;return inp;}
  if(!o.out)a.chase=undefined;
 }
 if(a.goal==='perch'&&wide())a.goal=null;
 if(a.goal==='perch'){const cx=f.x<0?XMIN:XMAX,cz=f.z<32?ZMIN:ZMAX;
  if(o.state!=='down'){a.goal=null;}
  else{const m={x:Math.abs(cx-f.x)>2?Math.sign(cx-f.x):0,z:Math.abs(cz-f.z)>3?Math.sign(cz-f.z):0};mv(m);
   if(Math.abs(cx-f.x)<=3&&Math.abs(cz-f.z)<=6){if(cx<0)inp.left=true;else inp.right=true;inp.jumpP=true;a.goal=null;a.t=arnd(0.4,0.8);}return inp;}}
 if(a.t>0){mv(a.mv);return inp;}
 a.t=arnd(0.12,0.32)*P.react;a.mv=null;
 if(o.state==='whipped'){if(az>5){a.mv={x:0,z:Math.sign(dz)};return inp;}const coming=Math.sign(o.vx)===-Math.sign(dx);if(coming&&ad<46)inp[arand()<0.5?'punchP':'kickP']=true;return inp;}
 if(o.state==='down'){const cdx=bodyX(o)-f.x;
  const cornerDist=Math.hypot(Math.min(f.x-XMIN,XMAX-f.x),Math.min(f.z-ZMIN,ZMAX-f.z));
  if(!wide()&&cornerDist<90&&arand()<P.climb&&o.t<o.downDur-1.3&&Math.abs(cdx)>50){a.goal='perch';return inp;}
  if(Math.abs(cdx)>26||az>8){a.mv={x:Math.abs(cdx)>20?Math.sign(cdx):0,z:az>6?Math.sign(dz):0};return inp;}
  if(o.hp<48||arand()<P.ground)inp.grabP=true;else inp.punchP=true;return inp;}
 if(!HITTABLE.has(o.state)&&o.state!=='getup'){a.mv=arand()<0.5?{x:-Math.sign(dx),z:0}:null;return inp;}
 if(f.meter>=100&&ad<40&&az<9&&GRABBABLE.has(o.state)){inp.finP=true;return inp;}
 if(az>6||ad>32){a.mv={x:ad>28?Math.sign(dx):0,z:az>4?Math.sign(dz):0};if(arand()<0.04&&ad<90&&az<8)inp.jumpP=true;return inp;}
 if(['punch','kick'].includes(o.state)&&arand()<P.evade){a.mv={x:-Math.sign(dx),z:arand()<0.5?1:-1};return inp;}
 const r=arand(),M=P.mix,c1=M[0],c2=c1+M[1],c3=c2+M[2],c4=c3+M[3],c5=c4+M[4];
 if(r<c1)inp.punchP=true;else if(r<c2)inp.kickP=true;else if(r<c3)inp.grabP=true;
 else if(r<c4){inp.grabP=true;if(f.x>(wide()?157:0))inp.left=true;else inp.right=true;}
 else if(r<c5)a.mv={x:-Math.sign(dx),z:0};
 return inp;
}

