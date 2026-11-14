// ---- MOVE CHECKER (test link only): step through the new move art one frame at a time.
// Uses the real fight drawing, but nothing is simulated: every frame the two wrestlers are posed from the viewer clock.
const VMOVES=[['SUPLEX',-1],['BACKSLIDE',1.6],['CRUCIFIX',1.6],['ROLL-UP',1.6],['LEAPFROG',1.2],['ENTRANCE POSE',1.0],['ALL FRAMES',0]];
const VNEW=['sig','sup0','sup1','situp','sup_v0','sup_v1','pinned_up','pin_bs0','pin_bs1','pin_cx','pin_ru','pin_bsv0','pin_bsv1','pin_cxv','frog0','frog1','frog_v0','frog_v1'];
const VSPD=[0.1,0.25,0.5,1];
let V=null;
// tap targets: [x,y,w,h]
const VB={edit:[170,1,44,15],a0:[2,2,14,13],a1:[124,2,14,13],b0:[246,2,14,13],b1:[368,2,14,13],
 m0:[2,200,14,14],m1:[118,200,14,14],back:[136,200,30,14],play:[168,200,34,14],fwd:[204,200,30,14],spd:[236,200,40,14],swap:[278,200,44,14],exit:[324,200,58,14]};
function viewerOpen(){const ids=ROSTER.map((c,i)=>i).filter(i=>SETS[ROSTER[i].id]);
 V={kf:vLoadKF(),sel:'him',ghost:false,clip:null,ids,a:Math.max(0,ids.findIndex(i=>ROSTER[i].id==='viral')),b:Math.max(0,ids.findIndex(i=>ROSTER[i].id==='papi')),m:0,t:0,play:true,spd:1,fi:0,ready:false};
 vSetup();}
function vSetup(){const ia=V.ids[V.a],ib=V.ids[V.b];
 G.forceSeed=5;G.mode=0;G.stage=3;G.hc=G.cage=false;G.mapPick=null;G.uniMatch=null;G.sel={c:[ia,ib],stage:2,picks:[ia,ib]};
 startIntro();beginFight();G.forceSeed=null;G.rec=null;G.net=null;G.entrance=null;G.pin=null;G.paused=false;
 G.f.forEach(f=>{f.hidden=false;f.cpu=false;setState(f,'idle');f.y=0;f.spin=0;});
 if(G.ref)G.ref.x=-9999;
 V.x0=G.f[0].x;V.z0=G.f[0].z;G.f[1].z=V.z0;V.t=0;V.pinMade=false;G.scene='viewer';vPose();}
function vPose(){const[f,o]=G.f,mv=VMOVES[V.m][0],t=V.t,x=V.x0;
 f.x=x;f.z=o.z=V.z0;f.y=o.y=0;f.spin=o.spin=0;f.dir=1;o.dir=-1;f.leap=false;f.dodge=null;o.r5t=null;f.hidden=o.hidden=false;
 if(mv!=='BACKSLIDE'&&mv!=='CRUCIFIX'&&mv!=='ROLL-UP')G.pin=null;
 if(mv==='SUPLEX'){
  const art=supArt(o),tl=art?supKF()[supKF().length-1].t:0.65;
  if(t<tl){setState(f,'grapple');f.t=t;setState(o,'grappled');o.dir=-1;updGrapple(f,o);}
  else{setState(f,'grapple');f.t=t;f.supAF=art?'situp':null;setState(o,'down');o.downDur=99;o.x=x-f.dir*(art?12+SUP_LAND*o.ch.size:20);o.dir=art?-f.dir:f.dir;o.supLand=art;}
 }else if(mv==='BACKSLIDE'||mv==='CRUCIFIX'||mv==='ROLL-UP'){
  if(!G.pin||G.pin.type!==mv.toLowerCase().replace('-','')){G.pin=null;setState(f,'idle');setState(o,'down');o.downDur=99;o.x=x+24;startPin(f,o);}
  if(G.pin){G.pin.type=mv.toLowerCase().replace('-','');G.pin.t=t;}
 }else if(mv==='LEAPFROG'){
  f.dir=-1;o.dir=1;setState(o,'run');o.x=x-70+140*Math.min(1,t/1.0);o.walkPh=t*14;
  if(t>=0.25&&t<0.75){setState(f,'jump');f.leap=true;f.t=t-0.25;f.y=Math.sin(Math.PI*(t-0.25)/0.5)*40;if(o.x<x)f.dodge={by:o.idx,side:-1};}
  else setState(f,'idle');
  const tp=0.5;if(t>=tp)o.r5t=G.t-(t-tp);
 }else if(mv==='ENTRANCE POSE'){setState(f,'entpose');setState(o,'entpose');o.x=x+60;}
 if(wide())G.cam=clamp((f.x+o.x)/2-192,0,MAPW-W);}
function vLen(){const mv=VMOVES[V.m];return mv[1]<0?supKF()[supKF().length-1].t+0.3:mv[1];}
function updViewer(){const q=clickQ;clickQ=null;const mv=VMOVES[V.m],len=vLen();
 if(V.edit){vEditUpd(q);return;}
 const tap=k=>q&&inRect(q,VB[k]);let re=false;
 if(hit(['Escape','KeyQ'])||tap('exit')){G.pin=null;G.scene='title';return;}
 if(tap('a0')||hit(['KeyA'])){V.a=(V.a+V.ids.length-1)%V.ids.length;re=true;}
 if(tap('a1')||hit(['KeyD'])){V.a=(V.a+1)%V.ids.length;re=true;}
 if(tap('b0')){V.b=(V.b+V.ids.length-1)%V.ids.length;re=true;}
 if(tap('b1')){V.b=(V.b+1)%V.ids.length;re=true;}
 if(tap('swap')||hit(['KeyS'])){const k=V.a;V.a=V.b;V.b=k;re=true;}
 if(tap('m0')||hit(['ArrowUp'])){V.m=(V.m+VMOVES.length-1)%VMOVES.length;V.t=0;V.fi=0;re=true;}
 if(tap('m1')||hit(['ArrowDown'])){V.m=(V.m+1)%VMOVES.length;V.t=0;V.fi=0;re=true;}
 if(tap('play')||hit(['Space','Enter']))V.play=!V.play;
 if(mv[0]==='SUPLEX'&&tap('edit')){V.edit=true;V.play=false;V.t=Math.max(V.t,0.3);vPose();return;}
 if(tap('spd')||hit(['KeyF']))V.spd=(V.spd+1)%VSPD.length;
 const step=1/30;
 if(len===0){if(tap('back')||hit(['ArrowLeft']))V.fi=(V.fi+VNEW.length-1)%VNEW.length;if(tap('fwd')||hit(['ArrowRight']))V.fi=(V.fi+1)%VNEW.length;}
 else{if(tap('back')||hit(['ArrowLeft'])){V.play=false;V.t=Math.max(0,V.t-step);}
  if(tap('fwd')||hit(['ArrowRight'])){V.play=false;V.t=Math.min(len,V.t+step);}
  if(V.play){V.t+=STEP*VSPD[V.spd];if(V.t>len+0.4)V.t=0;}}
 if(re){vSetup();return;}
 if(len)vPose();}
function vBtn(k,s,on){const r=VB[k];BOX(...r,on?'#3a1a10':'#140a0c','#ffd35a');T(s,r[0]+r[2]/2,r[1]+(r[3]-7)/2+1,1,'#fff','center',null);}
const vName=n=>n.replace(/_/g,' ').toUpperCase();
function drawViewer(){const mv=VMOVES[V.m],[f,o]=G.f;
 if(mv[1]===0){R(0,0,W,H,'#2a2a2e');const set=f.set,n=VNEW[V.fi];
  R(0,170,W,1,'#555');R(191,60,1,120,'#444');
  if(set&&set[n])drawSpr(set,n,120,170,1,1);else T('NO ART',120,120,1,'#f66','center');
  if(set&&set[n])drawSpr(set,n,270,170,-1,1);
  T(vName(n)+'  ('+(V.fi+1)+'/'+VNEW.length+')',192,24,1,'#ffd35a','center');T('FACING RIGHT',120,182,1,'#aaa','center');T('FACING LEFT',270,182,1,'#aaa','center');}
 else{const mx=mv[0]==='SUPLEX'?f.x-10:(f.x+o.x)/2,mz=(f.z+o.z)/2,px=PX(mx,mz),py=PY(mz)-(VMOVES[V.m][0]==='SUPLEX'?40:30),Z=2;
  ctx.save();ctx.translate(192,108);ctx.scale(Z,Z);ctx.translate(-Math.round(px),-Math.round(py));drawFight();if(V.edit&&V.ghost)vGhost();ctx.restore();
  const fa=(pinFrame(f)||frameOf(f)),fb=(pinFrame(o)||frameOf(o));
  R(0,170,W,26,'rgba(0,0,0,0.6)');
  T(f.ch.short+': '+vName(fa),6,174,1,'#fff','left');T(o.ch.short+': '+vName(fb),378,174,1,'#fff','right');
  T('TIME '+V.t.toFixed(2)+'s / '+vLen().toFixed(2)+'s',192,186,1,'#ffd35a','center');}
 R(0,0,W,17,'#0b0608');
 vBtn('a0','<');T(ROSTER[V.ids[V.a]].short,70,5,1,'#fff','center');vBtn('a1','>');
 vBtn('b0','<');T(ROSTER[V.ids[V.b]].short,314,5,1,'#9cf','center');vBtn('b1','>');
 if(mv[0]==='SUPLEX')vBtn('edit',V.edit?'EDITING':'EDIT',V.edit);else T('MOVE CHECKER',192,5,1,'#ffd35a','center');
 if(V.edit){vEditDraw();return;}
 R(0,198,W,18,'#0b0608');
 vBtn('m0','<');T(mv[0],67,203,1,'#ffd35a','center');vBtn('m1','>');
 vBtn('back','<<');vBtn('play',V.play?'PAUSE':'PLAY',V.play);vBtn('fwd','>>');vBtn('spd',VSPD[V.spd]+'X');vBtn('swap','SWAP');vBtn('exit','EXIT');}

// ---- keyframe editor (suplex): drag the man being suplexed, add/delete keys, pick frames, copy the result
const VE={sel:[2,19,58,12],flip:[62,19,40,12],front:[104,19,68,12],ghost:[174,19,48,12],cpy:[224,19,34,12],pst:[260,19,36,12],nl:[298,19,16,12],nu:[316,19,22,12],nd:[340,19,22,12],nr:[364,19,18,12],rl:[2,168,40,11],rr:[342,168,40,11],back:[2,200,24,14],fwd:[28,200,24,14],add:[54,200,34,14],del:[90,200,28,14],vf:[120,200,52,14],af:[174,200,52,14],copy:[228,200,40,14],reset:[270,200,44,14],done:[316,200,32,14],lay:[350,200,32,14],tl:[20,180,344,12]};
const VF_OPTS=['sup_v0','sup_v1','flip0'],AF_OPTS=['sup0','sup1','grap1'];
function vLoadKF(){try{const j=localStorage.getItem('bb_kf_suplex');if(j){const k=JSON.parse(j);if(Array.isArray(k)&&k.length>=2)return k;}}catch(e){}return SUP_KF.map(k=>({...k}));}
function vSaveKF(){try{localStorage.setItem('bb_kf_suplex',JSON.stringify(V.kf));}catch(e){}}
const vKeyAt=()=>V.kf.findIndex(k=>Math.abs(k.t-V.t)<0.017);
function vEnsureKey(){let i=vKeyAt();if(i>=0)return i;if(V.t<0.3)return -1;const k=kfAt(V.kf,V.t);
 V.kf.push({...k,t:+V.t.toFixed(3)});V.kf.sort((a,b)=>a.t-b.t);vSaveKF();return vKeyAt();}
const vKFtext=()=>JSON.stringify(V.kf.map(k=>{const o={t:+k.t.toFixed(3),dx:+k.dx.toFixed(1),dy:+k.dy.toFixed(1),r:Math.round(k.r||0),vf:k.vf,af:k.af};
 if(k.ax||k.ay){o.ax=+(k.ax||0).toFixed(1);o.ay=+(k.ay||0).toFixed(1);}if(k.ar)o.ar=Math.round(k.ar);if(k.fh)o.fh=1;if(k.fa)o.fa=1;if(k.lay==='you')o.lay='you';return o;}));
function vCopy(){const txt='SUPLEX KEYS '+vKFtext();let ok=false;
 try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ok=document.execCommand('copy');ta.remove();}catch(e){}
 try{if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>{},()=>{});ok=true;}}catch(e){}
 V.msg=ok?'COPIED! PASTE IT TO CLAUDE':'COPY FAILED';V.msgT=2.5;}
// drag + copy happen right in the touch handlers (copying needs a real tap)
let vDrag=null;
function vPt(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
cv.addEventListener('pointerdown',e=>{if(G.scene!=='viewer'||!V||!V.edit)return;const p=vPt(e);
 if(V.lay){vLayTap(p);return;}
 if(inRect(p,VE.copy)){vCopy();return;}
 if(p.y>33&&p.y<166&&V.t>=0.3&&V.t<supKF()[supKF().length-1].t+0.001){const i=vEnsureKey();if(i<0)return;const k=V.kf[i],me=V.sel==='you';vDrag={i,x:p.x,y:p.y,dx:me?(k.ax||0):k.dx,dy:me?(k.ay||0):k.dy};}});
cv.addEventListener('pointermove',e=>{if(!vDrag||G.scene!=='viewer'||!V)return;const p=vPt(e),f=G.f[0],s=f.ch.size,Z=2,k=V.kf[vDrag.i];if(!k)return;
 const nx=vDrag.dx+(p.x-vDrag.x)/Z/s*f.dir,ny=vDrag.dy-(p.y-vDrag.y)/Z/s;if(V.sel==='you'){k.ax=nx;k.ay=ny;}else{k.dx=nx;k.dy=ny;}vPose();});
addEventListener('pointerup',()=>{if(vDrag){vDrag=null;vSaveKF();}});
function vEditUpd(q){const tap=k=>q&&inRect(q,VE[k]);if(V.msgT>0)V.msgT-=STEP;
 if(V.lay){vLayUpd(q);return;}
 if(tap('lay')){V.lay=true;V.lp=0;vPose();return;}
 const last=V.kf[V.kf.length-1].t,step=1/30;
 if(hit(['Escape'])||tap('done')){V.edit=false;vPose();return;}
 if(tap('back')||hit(['ArrowLeft']))V.t=Math.max(0,+(V.t-step).toFixed(4));
 if(tap('fwd')||hit(['ArrowRight']))V.t=Math.min(last+0.3,+(V.t+step).toFixed(4));
 if(tap('tl')){V.t=Math.max(0,Math.min(last+0.3,(q.x-VE.tl[0])/VE.tl[2]*(last+0.3)));const n=V.kf.reduce((b,k,i)=>Math.abs(k.t-V.t)<Math.abs(V.kf[b].t-V.t)?i:b,0);if(Math.abs(V.kf[n].t-V.t)<0.05)V.t=V.kf[n].t;}
 if(tap('add')||hit(['KeyK']))vEnsureKey();
 for(const[n,dr,key]of[['rl',-5,'KeyQ'],['rr',5,'KeyE']])if(tap(n)||hit([key])){const i=vEnsureKey();if(i>=0){const k=V.kf[i],f=V.sel==='you'?'ar':'r';k[f]=(((k[f]||0)+dr+180)%360+360)%360-180;vSaveKF();}}
 if(tap('sel')||hit(['Tab']))V.sel=V.sel==='you'?'him':'you';
 if(tap('flip')||hit(['KeyH'])){const i=vEnsureKey();if(i>=0){const k=V.kf[i],f=V.sel==='you'?'fa':'fh';k[f]=k[f]?0:1;vSaveKF();}}
 if(tap('front')){const i=vEnsureKey();if(i>=0){const k=V.kf[i];k.lay=k.lay==='you'?'him':'you';vSaveKF();}}
 if(tap('ghost'))V.ghost=!V.ghost;
 if(tap('cpy')){const i=vKeyAt();const k=i>=0?V.kf[i]:kfAt(V.kf,Math.max(0.3,V.t));V.clip={...k};V.msg='POSE COPIED';V.msgT=1.2;}
 if(tap('pst')&&V.clip){const i=vEnsureKey();if(i>=0){V.kf[i]={...V.clip,t:V.kf[i].t};vSaveKF();V.msg='POSE PASTED';V.msgT=1.2;}}
 {const s=G.f[0].ch.size,u=1/s;for(const[n,ddx,ddy]of[['nl',-u,0],['nr',u,0],['nu',0,u],['nd',0,-u]])if(tap(n)){const i=vEnsureKey();if(i>=0){const k=V.kf[i];if(V.sel==='you'){k.ax=(k.ax||0)+ddx;k.ay=(k.ay||0)+ddy;}else{k.dx+=ddx;k.dy+=ddy;}vSaveKF();}}}
 if((tap('del')||hit(['Delete','Backspace']))&&V.kf.length>2){const i=vKeyAt();if(i>=0){V.kf.splice(i,1);vSaveKF();}}
 if(tap('vf')){const i=vEnsureKey();if(i>=0){const k=V.kf[i];k.vf=VF_OPTS[(VF_OPTS.indexOf(k.vf)+1)%VF_OPTS.length];vSaveKF();}}
 if(tap('af')){const i=vEnsureKey();if(i>=0){const k=V.kf[i];k.af=AF_OPTS[(AF_OPTS.indexOf(k.af)+1)%AF_OPTS.length];vSaveKF();}}
 if(tap('reset')){V.kf=SUP_KF.map(k=>({...k}));V.sel='him';try{localStorage.removeItem('bb_kf_suplex');}catch(e){}V.msg='BACK TO THE GAME\'S VERSION';V.msgT=2;}
 vPose();}
function B2(n,s){const r=VE[n];BOX(...r,'#140a0c','#9cf');T(s,r[0]+r[2]/2,r[1]+2,1,'#9cf','center',null);}
function vEditDraw(){if(V.lay){vLayDraw();return;}const tl=VE.tl,last=V.kf[V.kf.length-1].t,span=last+0.3,i=vKeyAt(),k=i>=0?V.kf[i]:kfAt(V.kf,Math.max(0.3,V.t));
 R(0,17,W,16,'rgba(0,0,0,0.7)');const me=V.sel==='you';
 B2('sel',me?'MOVE: YOU':'MOVE: HIM');B2('flip',(me?k.fa:k.fh)?'FLIP ON':'FLIP');B2('front',(k.lay==='you'?'YOU':'HIM')+' IN FRONT');B2('ghost',V.ghost?'GHOST ON':'GHOST');
 B2('cpy','COPY');B2('pst','PASTE');B2('nl','<');B2('nu','UP');B2('nd','DN');B2('nr','>');
 R(0,168,W,30,'rgba(0,0,0,0.75)');
 T(i>=0?'KEY '+(i+1)+'/'+V.kf.length+'  - DRAG '+(V.sel==='you'?'YOURSELF':'HIM')+' TO MOVE':(V.t<0.3?'GRAB (NOT EDITABLE)':V.t>=last?'LANDED':'BETWEEN KEYS - DRAG TO ADD ONE'),192,170,1,i>=0?'#ffd35a':'#ccc','center');
 B2('rl','<ROT');B2('rr','ROT>');T(Math.round((V.sel==='you'?k.ar:k.r)||0)+' DEG',330,170,1,'#9cf','right');
 R(tl[0],tl[1]+5,tl[2],2,'#666');
 R(tl[0]+0.3/span*tl[2],tl[1]+2,1,8,'#888');
 V.kf.forEach((q,j)=>{const x=tl[0]+q.t/span*tl[2];R(x-2,tl[1]+1,5,10,j===i?'#ffd35a':'#c84');});
 R(tl[0]+V.t/span*tl[2],tl[1]-1,1,14,'#fff');
 T(V.t.toFixed(2)+'s',366,182,1,'#fff','left');
 R(0,198,W,18,'#0b0608');
 const B=(n,s,on)=>{const r=VE[n];BOX(...r,on?'#3a1a10':'#140a0c','#ffd35a');T(s,r[0]+r[2]/2,r[1]+4,1,'#fff','center',null);};
 B('back','<');B('fwd','>');B('add','KEY+');B('del','DEL');B('vf','HIM:'+(k.vf||'').replace('sup_','').replace('flip0','STAND').toUpperCase());B('af','YOU:'+(k.af||'').toUpperCase());
 B('copy','SEND');B('reset','RESET');B('done','DONE');B('lay','PARTS');
 if(V.msgT>0){BOX(92,90,200,18,'#140a0c','#ffd35a');T(V.msg,192,96,1,'#fff','center');}}

// ghost: faint copies of the man being suplexed at the keys either side of now
function vGhost(){const[f,o]=G.f,K=V.kf,s=f.ch.size,d=f.dir,ds=depthS(o.z),dsc=ds*(o.ch.drawScale||1);
 let pi=-1;for(let i=0;i<K.length;i++)if(K[i].t<V.t-0.01)pi=i;const ni=K.findIndex(k=>k.t>V.t+0.01);
 for(const[i,a]of[[pi,0.28],[ni,0.18]]){if(i<0)continue;const k=K[i];if(!o.set||!o.set[k.vf])continue;
  const x=PX(f.x+d*k.dx*s,o.z),y=PY(o.z)-k.dy*s*ds,gd=o.dir*(k.fh?-1:1);ctx.globalAlpha=a;
  if(k.r){ctx.save();ctx.translate(Math.round(x),Math.round(y-28*dsc));ctx.rotate(k.r*Math.PI/180*o.dir);drawSpr(o.set,k.vf,0,28*dsc,gd,dsc);ctx.restore();}
  else drawSpr(o.set,k.vf,x,y,gd,dsc);}
 ctx.globalAlpha=1;}

// ---- PARTS: cut out a body part (arms, head...) and draw it in FRONT of or BEHIND the other wrestler
const VL={lsel:[2,19,62,12],lnew:[66,19,30,12],lfb:[98,19,46,12],lprev:[146,19,16,12],lnext:[164,19,16,12],lundo:[182,19,36,12],ldel:[220,19,30,12],lall:[252,19,62,12],lclr:[316,19,66,12],
 back:[2,200,24,14],fwd:[28,200,24,14],lsend:[228,200,40,14],ldone:[316,200,66,14]};
const vLF=()=>V.sel==='you'?G.f[0]:G.f[1];
const vLKey=()=>{const f=vLF();return artId(f)+'|'+(f._fr||frameOf(f));};
function vLList(make){const k=vLKey();if(!LAYERS_LOCAL)LAYERS_LOCAL={};
 if(!LAYERS_LOCAL[k]){if(!make)return LAYERS_DEF[k]||[];LAYERS_LOCAL[k]=JSON.parse(JSON.stringify(LAYERS_DEF[k]||[]));}return LAYERS_LOCAL[k];}
function vLSave(){try{localStorage.setItem('bb_layers',JSON.stringify(LAYERS_LOCAL||{}));}catch(e){}}
function vLayTap(p){
 if(inRect(p,VL.lsend)){const txt='LAYER KEYS '+JSON.stringify(LAYERS_LOCAL||{});let ok=false;
  try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ok=document.execCommand('copy');ta.remove();}catch(e){}
  try{if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>{},()=>{});ok=true;}}catch(e){}
  V.msg=ok?'COPIED! PASTE IT TO CLAUDE':'COPY FAILED';V.msgT=2.5;return;}
 if(p.y<=33||p.y>=166)return;const f=vLF();if(!f._M)return;
 const q=f._M.inverse().transformPoint(new DOMPoint(p.x*DPR,p.y*DPR)),L=vLList(true);
 if(!L.length||V.lpNew){L.push({front:true,pts:[]});V.lp=L.length-1;V.lpNew=false;}
 V.lp=Math.min(V.lp,L.length-1);L[V.lp].pts.push([Math.round(q.x*2)/2,Math.round(q.y*2)/2]);vLSave();}
function vLayUpd(q){const tap=k=>q&&inRect(q,VL[k]);if(V.msgT>0)V.msgT-=STEP;const last=V.kf[V.kf.length-1].t,step=1/30;
 if(hit(['Escape'])||tap('ldone')){V.lay=false;vPose();return;}
 if(tap('back')||hit(['ArrowLeft']))V.t=Math.max(0,+(V.t-step).toFixed(4));
 if(tap('fwd')||hit(['ArrowRight']))V.t=Math.min(last+0.3,+(V.t+step).toFixed(4));
 if(q&&inRect(q,VE.tl))V.t=Math.max(0,Math.min(last+0.3,(q.x-VE.tl[0])/VE.tl[2]*(last+0.3)));
 if(tap('lsel')){V.sel=V.sel==='you'?'him':'you';V.lp=0;}
 const L=vLList(false);
 if(tap('lnew')){V.lpNew=true;V.msg='TAP AROUND THE BODY PART';V.msgT=1.5;}
 if(tap('lprev')&&L.length)V.lp=(V.lp+L.length-1)%L.length;
 if(tap('lnext')&&L.length)V.lp=(V.lp+1)%L.length;
 if(tap('lfb')&&L.length){const M=vLList(true);M[V.lp].front=!M[V.lp].front;vLSave();}
 if(tap('lundo')&&L.length){const M=vLList(true),P=M[V.lp];P.pts.pop();if(!P.pts.length){M.splice(V.lp,1);V.lp=Math.max(0,V.lp-1);}vLSave();}
 if(tap('ldel')&&L.length){const M=vLList(true);M.splice(V.lp,1);V.lp=Math.max(0,V.lp-1);vLSave();}
 if(tap('lall')&&L.length){const fr=vLKey().split('|')[1];let n=0;for(const c of ROSTER){const st=SETS[c.id];if(!st||!st[fr]||c.id===artId(vLF()))continue;LAYERS_LOCAL[c.id+'|'+fr]=JSON.parse(JSON.stringify(L));n++;}vLSave();V.msg='COPIED TO '+n+' WRESTLERS';V.msgT=1.8;}
 if(tap('lclr')){if(V.clrArm&&G.t-V.clrArm<2){LAYERS_LOCAL={};vLSave();V.msg='ALL PARTS CLEARED';V.msgT=1.5;V.clrArm=0;}else{V.clrArm=G.t;V.msg='TAP CLEAR ALL AGAIN TO CONFIRM';V.msgT=2;}}
 vPose();}
function vLayDraw(){const f=vLF(),L=vLList(false),M=f._M;
 if(M){ctx.save();ctx.setTransform(M);const lw=2/Math.hypot(M.a,M.b);
  L.forEach((q,i)=>{const on=i===V.lp,c=q.front?'#ffd35a':'#5ad0ff';ctx.strokeStyle=c;ctx.lineWidth=lw*(on?1.6:1);ctx.setLineDash(on?[]:[lw*3,lw*3]);
   ctx.beginPath();q.pts.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(q.pts.length>2)ctx.closePath();ctx.stroke();
   if(on){ctx.fillStyle=c;for(const p of q.pts)ctx.fillRect(p[0]-lw*1.5,p[1]-lw*1.5,lw*3,lw*3);}});
  ctx.restore();}
 const tl=VE.tl,last=V.kf[V.kf.length-1].t,span=last+0.3;
 R(0,17,W,16,'rgba(0,0,0,0.7)');const P=L[V.lp];
 const B=(n,s,on)=>{const r=VL[n];BOX(...r,on?'#3a1a10':'#140a0c','#9cf');T(s,r[0]+r[2]/2,r[1]+2,1,'#9cf','center',null);};
 B('lsel','PART OF: '+(V.sel==='you'?'YOU':'HIM'));B('lnew','NEW',V.lpNew);B('lfb',P?(P.front?'FRONT':'BACK'):'FRONT');B('lprev','<');B('lnext','>');B('lundo','UNDO');B('ldel','DEL');B('lall','ALL GUYS');B('lclr','CLEAR ALL');
 R(0,168,W,30,'rgba(0,0,0,0.75)');
 T(f.ch.short+' / '+vName(vLKey().split('|')[1])+'  -  '+(L.length?'PART '+(V.lp+1)+'/'+L.length+(P&&P.pts.length<3?' (TAP 3+ POINTS)':''):'TAP AROUND A BODY PART'),192,170,1,'#ffd35a','center');
 R(tl[0],tl[1]+5,tl[2],2,'#666');R(tl[0]+V.t/span*tl[2],tl[1]-1,1,14,'#fff');T(V.t.toFixed(2)+'s',366,182,1,'#fff','left');
 R(0,198,W,18,'#0b0608');
 const B3=(n,s)=>{const r=VL[n];BOX(...r,'#140a0c','#ffd35a');T(s,r[0]+r[2]/2,r[1]+4,1,'#fff','center',null);};
 B3('back','<');B3('fwd','>');B3('lsend','SEND');B3('ldone','DONE');
 T('YELLOW=FRONT  BLUE=BEHIND',140,204,1,'#aaa','center');
 if(V.msgT>0){BOX(92,90,200,18,'#140a0c','#ffd35a');T(V.msg,192,96,1,'#fff','center');}}
