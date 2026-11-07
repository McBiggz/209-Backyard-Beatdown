// ================= WORLD / PROJECTION =================
// x: left/right (-96..96), z: depth (0 = back ropes, 64 = front ropes), y: height
let XMIN=-160,XMAX=160,ZMIN=3,ZMAX=61;const GRAV=1100,RX=175,RZB=-4,RZF=68;
const GEO=[{yB:96,yF:182,cB:192,cF:192,hB:162,hF:198},{yB:96,yF:182,cB:192,cF:192,hB:162,hF:198},{yB:146,yF:199,cB:212,cF:194,hB:94,hF:168}];
const geo=()=>GEO[G.stage]||GEO[0];
const wide=()=>G.stage===3,MAPW=648;
function ringX(z){const t=(z-121)/37;return[lerp(82,42,t)+18,lerp(227,271,t)-18];}
function insideRing(x,z){if(z<119||z>160)return false;const t=(z-121)/37;return x>lerp(82,42,t)-2&&x<lerp(227,271,t)+2;}
const RING_R=312;const footL=z=>31,footR=z=>RING_R;
function clampPos(f){
 if(!wide()){f.x=clamp(f.x,XMIN,XMAX);f.z=clamp(f.z,ZMIN,ZMAX);return;}
 if(!f.out){f.z=clamp(f.z,ZMIN,ZMAX);const[a,b]=ringX(f.z);f.x=clamp(f.x,a,b);return;}
 f.z=clamp(f.z,150,212);f.x=clamp(f.x,10,594);if(f.x>410&&f.x<476)f.z=Math.max(f.z,152);if(f.x>=476)f.z=Math.max(f.z,156);if(f.x>578)f.z=Math.min(f.z,168);
 if(f.z<190&&f.x<RING_R){const dr=RING_R-f.x,df=190-f.z;if(dr<df)f.x=RING_R;else f.z=190;}
 if(f.z<205&&(f.x<62||(f.x>250&&f.x<RING_R))){if(f.x>250&&f.z<190)f.x=RING_R;else f.z=205;}}
function cx(f,x){const k={x,z:f.z,out:f.out};clampPos(k);return k.x;}
function wbounds(f){if(!wide())return[XMIN,XMAX];return ringX(f.z);}
function startRoll(f,x1,z1,outAfter){setState(f,'roll');f.rx0=f.x;f.rz0=f.z;f.rx1=x1;f.rz1=z1;f.rollOut=outAfter;f.vx=f.vz=0;if(Math.abs(x1-f.x)>2)f.dir=x1>f.x?1:-1;sfx('whoosh');}
function updRoll(f,dt){const p=clamp(f.t/0.5,0,1);f.x=lerp(f.rx0,f.rx1,p);f.z=lerp(f.rz0,f.rz1,p);f.y=Math.sin(p*Math.PI)*14;if(p>=1){f.y=0;f.out=f.rollOut;setState(f,'idle');if(!f.out)dust(sx_(f),PY(f.z));}}
function tryRoll(f,mx,mz){
 if(!wide())return false;
 if(!f.out){const[a,b]=ringX(f.z);
  if(f.z>=ZMAX-2&&mz>0){startRoll(f,f.x,196,true);return true;}
  if(f.x<=a+3&&mx<0){startRoll(f,clamp(f.x-30,14,60),196,true);return true;}
  if(f.x>=b-3&&mx>0){startRoll(f,footR(f.z)+9,Math.max(f.z,132),true);return true;}
  return false;}
 if(f.z>=188&&mz<0&&f.x>20&&f.x<280){startRoll(f,clamp(f.x,ringX(ZMAX)[0],ringX(ZMAX)[1]),ZMAX-2,false);return true;}
 if(f.z<190&&f.x<=footR(f.z)+3&&mx<0){startRoll(f,ringX(f.z)[1]-4,clamp(f.z,ZMIN,ZMAX),false);return true;}
 return false;}
const PX=(x,z)=>{if(wide())return x-G.cam;const g=geo(),t=(z-RZB)/(RZF-RZB);return lerp(g.cB,g.cF,t)+x/RX*lerp(g.hB,g.hF,t);};
const PY=z=>{if(wide())return z;const g=geo();return g.yB+(z-RZB)/(RZF-RZB)*(g.yF-g.yB);};
const zAtY=y=>{const g=geo();return RZB+(y-g.yB)/(g.yF-g.yB)*(RZF-RZB);};

