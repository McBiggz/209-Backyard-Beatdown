// Skinny Omega is 5'5" (Viral 6'0" = 72.6 drawn); his art at scale 1 is 71 tall
const REF_SCALE=0.923;
// ================= REF =================
function updRef(dt,a=G.f[0],b=G.f[1]){const R0=G.ref;let tx,tz;
 if(R0.mode==='pin'&&G.pin){const d=G.pin.d,hd=SETS.ref&&SETS.ref.rcount;
  // the drawn ref (Skinny Omega) lies flat in FRONT of the pin so you can see him count; the old one kneels behind
  if(hd){tx=d.x-d.dir*30*d.ch.size;tz=d.z+10;if(tz>ZMAX)tz=d.z-12;}else{tx=d.x-d.dir*44*d.ch.size;tz=d.z-6;}}
 else if(R0.mode==='raise'&&G.over&&G.over.w){const w=G.over.w;tx=w.x+(w.x<0?16:-16);tz=w.z-3;}
 else{const m=(a.x+b.x)/2;if(wide()){const mm=clamp(m,60,250);tx=mm+(mm<157?50:-50);tz=ZMIN+2;}else{tx=m+(m<0?80:-80);tz=Math.max(ZMIN,Math.min(a.z,b.z)-14);}}
 if(wide()){tz=clamp(tz,ZMIN,ZMAX);const rb=ringX(tz);tx=clamp(tx,rb[0],rb[1]);}else{tx=clamp(tx,XMIN,XMAX);tz=clamp(tz,ZMIN-1,ZMAX);}
 const sp=95*dt,ddx=clamp(tx-R0.x,-sp,sp),ddz=clamp(tz-R0.z,-sp*0.6,sp*0.6);R0.x+=ddx;R0.z+=ddz;R0.moving=Math.abs(ddx)+Math.abs(ddz)>0.4;if(R0.moving)R0.walkPh+=dt*10;
 if(R0.mode==='pin'&&G.pin)R0.dir=G.pin.d.dir;else if(R0.mode==='raise'&&G.over&&G.over.w)R0.dir=G.over.w.x>R0.x?1:-1;else R0.dir=((a.x+b.x)/2)>R0.x?1:-1;
 if(R0.slap>0)R0.slap-=dt;
 // Skinny Omega gets down to his knees, lies flat to count, and comes back up through the kneel
 if(R0.mode==='pin'){R0.pinT=(R0.pinT||0)+dt;R0.upT=0;}else{if(R0.pinT>0)R0.upT=0.3;R0.pinT=0;if(R0.upT>0)R0.upT-=dt;}
 if(R0.mode==='raise'){if(!R0.moving)R0.raiseT=(R0.raiseT||0)+dt;}else R0.raiseT=0;}
function refFrame(R0){const hd=SETS.ref&&SETS.ref.rcount;if(R0.moving)return 'rwalk'+(Math.floor(R0.walkPh/1.5708)%4);
 if(R0.mode==='pin')return !hd?(R0.slap>0?'rslap':'rkneel'):R0.pinT<0.22?'rkneel':R0.slap>0?'rslap':'rcount';
 if(hd&&R0.upT>0)return 'rkneel';
 if(hd&&R0.mode==='raise'&&R0.raiseT<1.1)return 'rbell';
 if(R0.mode==='raise')return 'rraise';return 'ridle';}

