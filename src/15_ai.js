// ================= CPU AI =================
function aiInput(f,o,dt){
 const inp=blank(),a=f.ai;a.t-=dt;
 const dx=o.x-f.x,dz=o.z-f.z,ad=Math.abs(dx),az=Math.abs(dz);
 const mv=m=>{if(!m)return;if(m.x>0)inp.right=true;if(m.x<0)inp.left=true;if(m.z>0)inp.down=true;if(m.z<0)inp.up=true;};
 if(f.state==='perch'){if(a.t<=0&&(o.state==='down'||HITTABLE.has(o.state)))inp.punchP=true;return inp;}
 if(f.state==='whipped'){
  if(f.ctrWin>0&&f.canRev){if(a.ctrRoll!==f.whipId){a.ctrRoll=f.whipId;a.ctrDo=arand()<0.3;a.ctrAt=arnd(0.08,CTR.whipReverse-0.05);}
   if(a.ctrDo&&CTR.whipReverse-f.ctrWin>=a.ctrAt)inp.grabP=true;return inp;}
  if(f.runWin>0){if(a.runDo===undefined)a.runDo=arand();const coming=Math.sign(f.vx)===Math.sign(dx);
   if(coming&&ad<90&&a.runDo<0.55)inp[a.runDo<0.3?'punchP':'kickP']=true;}else if(f.bounced===false)a.runDo=undefined;
  return inp;}
 if(f.state==='run'){if(f.runDir>0)inp.right=true;else inp.left=true;const coming=Math.sign(dx)===f.runDir;
  if(coming&&ad<46&&az<10){if(a.rnSid!==f.sid){a.rnSid=f.sid;a.rnDo=arand();}if(a.rnDo<0.5)inp.punchP=true;else if(a.rnDo<0.8)inp.kickP=true;else{inp.left=inp.right=false;inp.grabP=true;}}
  else if(!coming&&f.autoRun<=0){inp.left=inp.right=false;}return inp;}
 if(a.tap>0){a.tap++;const d=a.tapD;if(a.tap<=2||a.tap>=5){if(d>0)inp.right=true;else inp.left=true;}if(a.tap>8)a.tap=0;return inp;}
 if(!['idle','walk'].includes(f.state))return inp;
 // a runner coming: sometimes leapfrog him or drop down and let him go over
 if(o.state==='run'&&o.out===f.out&&(o.x-f.x)*o.runDir<0&&ad<CTR.dodge.cpuAt&&ad>18&&az<14){const k=o.sid+'/'+o.runDir;if(a.dgK!==k){a.dgK=k;a.dgDo=arand()<CTR.dodge.cpu;a.dgDn=arand()<0.5;}
  if(a.dgDo){inp.jumpP=true;if(a.dgDn)inp.down=true;return inp;}}
 // Royal Rumble: grab a worn-down target and try to throw him over the nearest side ropes
 if(G.mm&&G.mm.elim&&ad<28&&az<8&&GRABBABLE.has(o.state)&&o.y<2&&canToss(f,o)){if(a.elSid!==o.sid){a.elSid=o.sid;a.elDo=arand()<0.55;}
  if(a.elDo){inp.grabP=true;if(o.x<157)inp.left=true;else inp.right=true;return inp;}}
 if(ad>130&&az<8&&!(wide()&&(f.out||o.out))&&arand()<0.012){a.tap=1;a.tapD=Math.sign(dx);return inp;}
 if(['punch','kick','runline'].includes(o.state)&&ad<70&&az<12){if(a.blkSid!==o.sid){a.blkSid=o.sid;a.blkDo=arand()<0.4;}
  if(a.blkDo){if(dx>0)inp.left=true;else inp.right=true;return inp;}}
 if(wide()){
  if(f.out&&(!o.out||G.co.n>=5)){a.goal=null;
   if(f.z<186){mv({x:0,z:1});return inp;}
   const tx=clamp(f.x,70,240);if(Math.abs(tx-f.x)>4){mv({x:Math.sign(tx-f.x),z:0});return inp;}
   inp.up=true;inp.jumpP=true;return inp;}
  if(!f.out&&o.out){a.goal=null;if(a.chase===undefined)a.chase=arand()<0.45;
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
 a.t=arnd(0.12,0.32);a.mv=null;
 if(o.state==='whipped'){if(az>5){a.mv={x:0,z:Math.sign(dz)};return inp;}const coming=Math.sign(o.vx)===-Math.sign(dx);if(coming&&ad<46)inp[arand()<0.5?'punchP':'kickP']=true;return inp;}
 if(o.state==='down'){const cdx=bodyX(o)-f.x;
  const cornerDist=Math.hypot(Math.min(f.x-XMIN,XMAX-f.x),Math.min(f.z-ZMIN,ZMAX-f.z));
  if(!wide()&&cornerDist<90&&arand()<0.3&&o.t<o.downDur-1.3&&Math.abs(cdx)>50){a.goal='perch';return inp;}
  if(Math.abs(cdx)>26||az>8){a.mv={x:Math.abs(cdx)>20?Math.sign(cdx):0,z:az>6?Math.sign(dz):0};return inp;}
  if(o.hp<48||arand()<0.3)inp.grabP=true;else inp.punchP=true;return inp;}
 if(!HITTABLE.has(o.state)&&o.state!=='getup'){a.mv=arand()<0.5?{x:-Math.sign(dx),z:0}:null;return inp;}
 if(f.meter>=100&&ad<40&&az<9&&GRABBABLE.has(o.state)){inp.finP=true;return inp;}
 if(az>6||ad>32){a.mv={x:ad>28?Math.sign(dx):0,z:az>4?Math.sign(dz):0};if(arand()<0.04&&ad<90&&az<8)inp.jumpP=true;return inp;}
 if(['punch','kick'].includes(o.state)&&arand()<0.25){a.mv={x:-Math.sign(dx),z:arand()<0.5?1:-1};return inp;}
 const r=arand();
 if(r<0.34)inp.punchP=true;else if(r<0.58)inp.kickP=true;else if(r<0.68)inp.grabP=true;
 else if(r<0.78){inp.grabP=true;if(f.x>(wide()?157:0))inp.left=true;else inp.right=true;}
 else if(r<0.88)a.mv={x:-Math.sign(dx),z:0};
 return inp;
}

