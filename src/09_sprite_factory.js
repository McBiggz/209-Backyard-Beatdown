// ================= SPRITE FACTORY (vector skeleton -> real pixel art) =================
const SW=160,SH=112,AX=80,AY=106,VS=2,OUTLINE=[18,10,12];
const VEC=mk(SW*VS,SH*VS),vctx=VEC.getContext('2d',{willReadFrequently:true});
const FDEF=[['idle0','idle',0,{gt:0}],['idle1','idle',0,{gt:0.52}],
 ['walk0','walk',0,{ph:0}],['walk1','walk',0,{ph:1.5708}],['walk2','walk',0,{ph:3.1416}],['walk3','walk',0,{ph:4.7124}],
 ['punch0','punch',0],['punch1','punch',0.1],['kick0','kick',0],['kick1','kick',0.16],['stomp0','stomp',0.1],['stomp1','stomp',0.3],
 ['jump','jump',0],['dropkick','dropkick',0],['hit','hit',0],['fall','fall',0],['down','down',0],['downW','down',0,{wig:1,gt:Math.PI/100}],
 ['getup','getup',0],['grap0','grapple',0.1],['grap1','grapple',0.4],['whiff','whiff',0],['perch0','perch',0,{gt:0}],['perch1','perch',0,{gt:0.26}],
 ['dive','dive',0],['pinning','pinning',0],['win0','win',0,{gt:0}],['win1','win',0,{gt:0.4}],['dazed','finished',0,{gt:0.17}],['held','finished',0,{finBy:'slam'}],
 ['fk0','finisher',0.3,{ft:'kick'}],['fk1','finisher',0.7,{ft:'kick'}],['fs0','finisher',0.3,{ft:'slam'}],['fs1','finisher',0.9,{ft:'slam'}],
 ['fp0','finisher',0.1,{ft:'spin'}],['fp1','finisher',0.5,{ft:'spin'}],['fp2','finisher',0.5,{ft:'spin',fh:true}],
 ['fv0','finisher',0.2,{ft:'scream'}],['fv1','finisher',0.8,{ft:'scream'}]];
for(let k=0;k<8;k++)FDEF.push(['flip'+k,'grappled',0,{spin:k*Math.PI/4}]);
function poseOf(ch,state,t,o={}){const keep=G.t;G.t=o.gt||0;
 const f={ch:o.ft?Object.assign({},ch,{finType:o.ft}):ch,state,t,idx:0,walkPh:o.ph||0,wiggle:o.wig||0,finBy:o.finBy||'',finHit:!!o.fh};
 const T0=targetPose(f);G.t=keep;return{lean:T0.lean,af:[...T0.af],ab:[...T0.ab],lf:[...T0.lf],lb:[...T0.lb],rot:T0.rot,dy:T0.dy,plant:T0.plant,hipY:T0.hipY};}
function refPoseOf(kind,ph=0){const p=basePose();
 if(kind==='walk')return Object.assign(p,{lean:0.1,lf:[0.12+0.38*Math.sin(ph),-0.35-0.35*Math.max(0,Math.cos(ph))],lb:[0.12-0.38*Math.sin(ph),-0.35-0.35*Math.max(0,-Math.cos(ph))],af:[0.3,0.3],ab:[0.2,0.3]});
 if(kind==='kneel')return Object.assign(p,{lean:0.75,lf:[1.57,-1.57],lb:[0,-1.57],af:[2.6,0.1],ab:[0.6,0.4]});
 if(kind==='slap')return Object.assign(p,{lean:0.85,lf:[1.57,-1.57],lb:[0,-1.57],af:[0.9,0.1],ab:[0.6,0.4]});
 if(kind==='raise')return Object.assign(p,{lean:0,af:[2.9,0],ab:[0.2,0.3]});
 return Object.assign(p,{lean:0.45,lf:[0.45,-0.5],lb:[-0.1,-0.3],af:[0.7,0.2],ab:[0.6,0.3]});}
function rasterize(ch,pose,spin){
 vctx.setTransform(1,0,0,1,0,0);vctx.clearRect(0,0,VEC.width,VEC.height);
 const prev=ctx;ctx=vctx;try{SHADE=true;try{drawFighter({ch,pose,dir:1,turn:1,spin:spin||0},AX*VS,AY*VS,1.0);}finally{SHADE=false;}}finally{ctx=prev;}
 const src=vctx.getImageData(0,0,SW*VS,SH*VS).data,rgb=new Int32Array(SW*SH).fill(-1);
 const cols=[0,0,0,0];
 for(let y=0;y<SH;y++)for(let x=0;x<SW;x++){let n=0;
  for(let sy=0;sy<2;sy++)for(let sx=0;sx<2;sx++){const i=((y*2+sy)*SW*2+(x*2+sx))*4;if(src[i+3]>=128)cols[n++]=(src[i]<<16)|(src[i+1]<<8)|src[i+2];}
  if(n>=2){let best=cols[0],bc=0;for(let a=0;a<n;a++){let m=0;for(let b=0;b<n;b++)if(cols[b]===cols[a])m++;if(m>bc){bc=m;best=cols[a];}}rgb[y*SW+x]=best;}}
 // pixel shading: light from the upper-left, rim shadow lower-right
 const out=new Int32Array(rgb);
 for(let y=0;y<SH;y++)for(let x=0;x<SW;x++){const i=y*SW+x;if(rgb[i]<0)continue;
  const up=y>0&&rgb[i-SW]>=0,lf=x>0&&rgb[i-1]>=0,dn=y<SH-1&&rgb[i+SW]>=0,rt=x<SW-1&&rgb[i+1]>=0;let f=0;
  if(!up||!lf)f=0.14;else if(!dn||!rt)f=-0.22;
  if(f){let r=rgb[i]>>16,g=(rgb[i]>>8)&255,b=rgb[i]&255;if(f>0){r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f;}else{r*=1+f;g*=1+f;b*=1+f;}out[i]=((r|0)<<16)|((g|0)<<8)|(b|0);}}
 return out;
}
function medianCut(px,n){let boxes=[px];
 while(boxes.length<n){let bi=-1,bs=-1,bch=0;
  boxes.forEach((b,i)=>{if(b.length<2)return;let mn=[255,255,255],mx=[0,0,0];for(const c of b){const v=[c>>16,(c>>8)&255,c&255];for(let k=0;k<3;k++){if(v[k]<mn[k])mn[k]=v[k];if(v[k]>mx[k])mx[k]=v[k];}}
   const rg=[mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]],m=Math.max(...rg),sc=m*Math.sqrt(b.length);if(m>6&&sc>bs){bs=sc;bi=i;bch=rg.indexOf(m);}});
  if(bi<0)break;const b=boxes[bi],sh=[16,8,0][bch];b.sort((p,q)=>((p>>sh)&255)-((q>>sh)&255));const mid=b.length>>1;boxes.splice(bi,1,b.slice(0,mid),b.slice(mid));}
 return boxes.map(b=>{let r=0,g=0,bl=0;for(const c of b){r+=c>>16;g+=(c>>8)&255;bl+=c&255;}const k=b.length||1;return[r/k|0,g/k|0,bl/k|0];});}
function buildSet(ch,defs,colors=15){
 const raw=defs.map(d=>({name:d[0],px:rasterize(ch,d[1],d[2])}));
 const sample=[];let stride=1,total=0;raw.forEach(r=>{for(const v of r.px)if(v>=0)total++;});stride=Math.max(1,Math.floor(total/40000));let k=0;
 raw.forEach(r=>{for(const v of r.px)if(v>=0&&(k++%stride===0))sample.push(v);});
 const pal=medianCut(sample,colors),cache=new Map();
 const near=v=>{let c=cache.get(v);if(c!==undefined)return c;const r=v>>16,g=(v>>8)&255,b=v&255;let bi=0,bd=1e9;pal.forEach((p,i)=>{const d=(p[0]-r)**2*0.3+(p[1]-g)**2*0.59+(p[2]-b)**2*0.11;if(d<bd){bd=d;bi=i;}});cache.set(v,bi);return bi;};
 const set={pal};
 for(const r of raw){const c=mk(SW,SH),g=c.getContext('2d'),im=g.createImageData(SW,SH),d=im.data;let top=SH;
  for(let i=0;i<SW*SH;i++){const v=r.px[i];if(v<0)continue;const p=pal[near(v)];d[i*4]=p[0];d[i*4+1]=p[1];d[i*4+2]=p[2];d[i*4+3]=255;const y=(i/SW)|0;if(y<top)top=y;}
  for(let y=0;y<SH;y++)for(let x=0;x<SW;x++){const i=y*SW+x;if(d[i*4+3])continue;
   if((x>0&&d[(i-1)*4+3]===255)||(x<SW-1&&d[(i+1)*4+3]===255)||(y>0&&d[(i-SW)*4+3]===255)||(y<SH-1&&d[(i+SW)*4+3]===255)){d[i*4]=OUTLINE[0];d[i*4+1]=OUTLINE[1];d[i*4+2]=OUTLINE[2];d[i*4+3]=254;}}
  for(let i=3;i<d.length;i+=4)if(d[i]===254)d[i]=255;
  g.putImageData(im,0,0);set[r.name]=c;set[r.name+'_top']=top;}
 return set;
}
const SETS={};
function buildWrestler(ch){const defs=FDEF.filter(d=>!(d[3]&&d[3].ft&&d[3].ft!==ch.finType)).map(d=>[d[0],d[3]&&d[3].spin!==undefined?poseOf(ch,d[1],d[2],d[3]):poseOf(ch,d[1],d[2],d[3]||{}),d[3]&&d[3].spin]);
 // rasterize expects (ch,pose,spin)
 const set=buildSet(ch,defs.map(d=>[d[0],d[1],d[2]]));SETS[ch.id]=set;return set;}
function buildRef(){const defs=[['ridle',refPoseOf('stand')],['rkneel',refPoseOf('kneel')],['rslap',refPoseOf('slap')],['rraise',refPoseOf('raise')]];
 for(let k=0;k<4;k++)defs.push(['rwalk'+k,refPoseOf('walk',k*Math.PI/2)]);SETS.ref=buildSet(REF,defs.map(d=>[d[0],d[1],0]),12);}
function variantSetKey(ch){return ch.vid||ch.id;}
const depthS=z=>wide()?clamp(1+(z-154)*0.0036,0.9,1.15):1;
// ky: squash (<1) / stretch (>1) from the feet up; width changes the other way so the body keeps its bulk
function drawSpr(set,name,sx,sy,dir,scale=1,ky=1){const c=set&&set[name];if(!c)return;sx=Math.round(sx);sy=Math.round(sy);
 const sh=scale*ky,sw=scale/Math.sqrt(ky);
 if(dir>=0)ctx.drawImage(c,sx-AX*sw,sy-AY*sh,SW*sw,SH*sh);
 else{ctx.save();ctx.translate(sx,0);ctx.scale(-1,1);ctx.drawImage(c,-AX*sw,sy-AY*sh,SW*sw,SH*sh);ctx.restore();}}

