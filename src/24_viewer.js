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
 V={kf:vLoadKF(),ids,a:Math.max(0,ids.findIndex(i=>ROSTER[i].id==='viral')),b:Math.max(0,ids.findIndex(i=>ROSTER[i].id==='papi')),m:0,t:0,play:true,spd:1,fi:0,ready:false};
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
  ctx.save();ctx.translate(192,108);ctx.scale(Z,Z);ctx.translate(-px,-py);drawFight();ctx.restore();
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
const VE={back:[2,200,24,14],fwd:[28,200,24,14],add:[54,200,34,14],del:[90,200,28,14],vf:[120,200,52,14],af:[174,200,52,14],copy:[228,200,40,14],reset:[270,200,44,14],done:[316,200,66,14],tl:[20,180,344,12]};
const VF_OPTS=['sup_v0','sup_v1','flip0'],AF_OPTS=['sup0','sup1','grap1'];
function vLoadKF(){try{const j=localStorage.getItem('bb_kf_suplex');if(j){const k=JSON.parse(j);if(Array.isArray(k)&&k.length>=2)return k;}}catch(e){}return SUP_KF.map(k=>({...k}));}
function vSaveKF(){try{localStorage.setItem('bb_kf_suplex',JSON.stringify(V.kf));}catch(e){}}
const vKeyAt=()=>V.kf.findIndex(k=>Math.abs(k.t-V.t)<0.017);
function vEnsureKey(){let i=vKeyAt();if(i>=0)return i;if(V.t<0.3)return -1;const k=kfAt(V.kf,V.t);
 V.kf.push({t:+V.t.toFixed(3),dx:k.dx,dy:k.dy,vf:k.vf,af:k.af});V.kf.sort((a,b)=>a.t-b.t);vSaveKF();return vKeyAt();}
const vKFtext=()=>JSON.stringify(V.kf.map(k=>({t:+k.t.toFixed(3),dx:+k.dx.toFixed(1),dy:+k.dy.toFixed(1),vf:k.vf,af:k.af})));
function vCopy(){const txt='SUPLEX KEYS '+vKFtext();let ok=false;
 try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ok=document.execCommand('copy');ta.remove();}catch(e){}
 try{if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>{},()=>{});ok=true;}}catch(e){}
 V.msg=ok?'COPIED! PASTE IT TO CLAUDE':'COPY FAILED';V.msgT=2.5;}
// drag + copy happen right in the touch handlers (copying needs a real tap)
let vDrag=null;
function vPt(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
cv.addEventListener('pointerdown',e=>{if(G.scene!=='viewer'||!V||!V.edit)return;const p=vPt(e);
 if(inRect(p,VE.copy)){vCopy();return;}
 if(p.y>18&&p.y<176&&V.t>=0.3&&V.t<supKF()[supKF().length-1].t+0.001){const i=vEnsureKey();if(i<0)return;const k=V.kf[i];vDrag={i,x:p.x,y:p.y,dx:k.dx,dy:k.dy};}});
cv.addEventListener('pointermove',e=>{if(!vDrag||G.scene!=='viewer'||!V)return;const p=vPt(e),f=G.f[0],s=f.ch.size,Z=2,k=V.kf[vDrag.i];if(!k)return;
 k.dx=vDrag.dx+(p.x-vDrag.x)/Z/s*f.dir;k.dy=vDrag.dy-(p.y-vDrag.y)/Z/s;vPose();});
addEventListener('pointerup',()=>{if(vDrag){vDrag=null;vSaveKF();}});
function vEditUpd(q){const tap=k=>q&&inRect(q,VE[k]);if(V.msgT>0)V.msgT-=STEP;
 const last=V.kf[V.kf.length-1].t,step=1/30;
 if(hit(['Escape'])||tap('done')){V.edit=false;vPose();return;}
 if(tap('back')||hit(['ArrowLeft']))V.t=Math.max(0,+(V.t-step).toFixed(4));
 if(tap('fwd')||hit(['ArrowRight']))V.t=Math.min(last+0.3,+(V.t+step).toFixed(4));
 if(tap('tl')){V.t=Math.max(0,Math.min(last+0.3,(q.x-VE.tl[0])/VE.tl[2]*(last+0.3)));const n=V.kf.reduce((b,k,i)=>Math.abs(k.t-V.t)<Math.abs(V.kf[b].t-V.t)?i:b,0);if(Math.abs(V.kf[n].t-V.t)<0.05)V.t=V.kf[n].t;}
 if(tap('add')||hit(['KeyK']))vEnsureKey();
 if((tap('del')||hit(['Delete','Backspace']))&&V.kf.length>2){const i=vKeyAt();if(i>=0){V.kf.splice(i,1);vSaveKF();}}
 if(tap('vf')){const i=vEnsureKey();if(i>=0){const k=V.kf[i];k.vf=VF_OPTS[(VF_OPTS.indexOf(k.vf)+1)%VF_OPTS.length];vSaveKF();}}
 if(tap('af')){const i=vEnsureKey();if(i>=0){const k=V.kf[i];k.af=AF_OPTS[(AF_OPTS.indexOf(k.af)+1)%AF_OPTS.length];vSaveKF();}}
 if(tap('reset')){V.kf=SUP_KF.map(k=>({...k}));try{localStorage.removeItem('bb_kf_suplex');}catch(e){}V.msg='BACK TO THE GAME\'S VERSION';V.msgT=2;}
 vPose();}
function vEditDraw(){const tl=VE.tl,last=V.kf[V.kf.length-1].t,span=last+0.3,i=vKeyAt(),k=i>=0?V.kf[i]:kfAt(V.kf,Math.max(0.3,V.t));
 R(0,168,W,30,'rgba(0,0,0,0.75)');
 T(i>=0?'KEY '+(i+1)+'/'+V.kf.length+'  - DRAG HIM TO MOVE':(V.t<0.3?'GRAB (NOT EDITABLE)':V.t>=last?'LANDED':'BETWEEN KEYS - DRAG TO ADD ONE'),192,170,1,i>=0?'#ffd35a':'#ccc','center');
 R(tl[0],tl[1]+5,tl[2],2,'#666');
 R(tl[0]+0.3/span*tl[2],tl[1]+2,1,8,'#888');
 V.kf.forEach((q,j)=>{const x=tl[0]+q.t/span*tl[2];R(x-2,tl[1]+1,5,10,j===i?'#ffd35a':'#c84');});
 R(tl[0]+V.t/span*tl[2],tl[1]-1,1,14,'#fff');
 T(V.t.toFixed(2)+'s',366,182,1,'#fff','left');
 R(0,198,W,18,'#0b0608');
 const B=(n,s,on)=>{const r=VE[n];BOX(...r,on?'#3a1a10':'#140a0c','#ffd35a');T(s,r[0]+r[2]/2,r[1]+4,1,'#fff','center',null);};
 B('back','<');B('fwd','>');B('add','KEY+');B('del','DEL');B('vf','HIM:'+(k.vf||'').replace('sup_','').replace('flip0','STAND').toUpperCase());B('af','YOU:'+(k.af||'').toUpperCase());
 B('copy','COPY');B('reset','RESET');B('done','DONE');
 if(V.msgT>0){BOX(92,90,200,18,'#140a0c','#ffd35a');T(V.msg,192,96,1,'#fff','center');}}
