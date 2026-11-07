// ================= CPU AI =================
function aiInput(f,o,dt){
 const inp=blank(),a=f.ai;a.t-=dt;
 const dx=o.x-f.x,dz=o.z-f.z,ad=Math.abs(dx),az=Math.abs(dz);
 const mv=m=>{if(!m)return;if(m.x>0)inp.right=true;if(m.x<0)inp.left=true;if(m.z>0)inp.down=true;if(m.z<0)inp.up=true;};
 if(f.state==='perch'){if(a.t<=0&&(o.state==='down'||HITTABLE.has(o.state)))inp.punchP=true;return inp;}
 if(!['idle','walk'].includes(f.state))return inp;
 if(wide()){
  if(f.out&&(!o.out||G.co.n>=5)){a.goal=null;
   if(f.z<186){mv({x:0,z:1});return inp;}
   const tx=clamp(f.x,70,240);if(Math.abs(tx-f.x)>4){mv({x:Math.sign(tx-f.x),z:0});return inp;}
   inp.up=true;inp.jumpP=true;return inp;}
  if(!f.out&&o.out){a.goal=null;if(a.chase===undefined)a.chase=Math.random()<0.45;
   if(!a.chase||G.co.n>=6)return inp;
   if(f.z<ZMAX-1){mv({x:0,z:1});return inp;}inp.down=true;inp.jumpP=true;return inp;}
  if(!o.out)a.chase=undefined;
 }
 if(a.goal==='perch'&&wide())a.goal=null;
 if(a.goal==='perch'){const cx=f.x<0?XMIN:XMAX,cz=f.z<32?ZMIN:ZMAX;
  if(o.state!=='down'){a.goal=null;}
  else{const m={x:Math.abs(cx-f.x)>2?Math.sign(cx-f.x):0,z:Math.abs(cz-f.z)>3?Math.sign(cz-f.z):0};mv(m);
   if(Math.abs(cx-f.x)<=3&&Math.abs(cz-f.z)<=6){if(cx<0)inp.left=true;else inp.right=true;inp.jumpP=true;a.goal=null;a.t=rnd(0.4,0.8);}return inp;}}
 if(a.t>0){mv(a.mv);return inp;}
 a.t=rnd(0.12,0.32);a.mv=null;
 if(o.state==='whipped'){if(az>5){a.mv={x:0,z:Math.sign(dz)};return inp;}const coming=Math.sign(o.vx)===-Math.sign(dx);if(coming&&ad<46)inp[Math.random()<0.5?'punchP':'kickP']=true;return inp;}
 if(o.state==='down'){const cdx=bodyX(o)-f.x;
  const cornerDist=Math.hypot(Math.min(f.x-XMIN,XMAX-f.x),Math.min(f.z-ZMIN,ZMAX-f.z));
  if(!wide()&&cornerDist<90&&Math.random()<0.3&&o.t<o.downDur-1.3&&Math.abs(cdx)>50){a.goal='perch';return inp;}
  if(Math.abs(cdx)>26||az>8){a.mv={x:Math.abs(cdx)>20?Math.sign(cdx):0,z:az>6?Math.sign(dz):0};return inp;}
  if(o.hp<48||Math.random()<0.3)inp.grabP=true;else inp.punchP=true;return inp;}
 if(!HITTABLE.has(o.state)&&o.state!=='getup'){a.mv=Math.random()<0.5?{x:-Math.sign(dx),z:0}:null;return inp;}
 if(f.meter>=100&&ad<40&&az<9&&GRABBABLE.has(o.state)){inp.finP=true;return inp;}
 if(az>6||ad>32){a.mv={x:ad>28?Math.sign(dx):0,z:az>4?Math.sign(dz):0};if(Math.random()<0.04&&ad<90&&az<8)inp.jumpP=true;return inp;}
 if(['punch','kick'].includes(o.state)&&Math.random()<0.25){a.mv={x:-Math.sign(dx),z:Math.random()<0.5?1:-1};return inp;}
 const r=Math.random();
 if(r<0.34)inp.punchP=true;else if(r<0.58)inp.kickP=true;else if(r<0.68)inp.grabP=true;
 else if(r<0.78){inp.grabP=true;if(f.x>(wide()?157:0))inp.left=true;else inp.right=true;}
 else if(r<0.88)a.mv={x:-Math.sign(dx),z:0};
 return inp;
}

