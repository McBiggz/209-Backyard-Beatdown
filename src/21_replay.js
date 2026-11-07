// ================= INSTANT REPLAY =================
// When a match ends, the game rewinds to the last big moment (a finisher, else the last big knockdown)
// and plays it again in slow motion before the winner screen. It re-plays the recorded inputs from a saved
// snapshot, so it shows exactly what happened. Online, both players reach the same trigger on the same step,
// so both see it; the match itself is frozen while it plays and restored exactly afterwards.
const IRP={every:20,keep:75,lead:40,tail:140,bigLead:80,bigTail:90,slow:2};
function irpReset(){if(G.irp)G.replay=null;G.snaps=new Map();G.finAt=-1;G.bigAt=-1;G.irp=null;}
function irpMark(kind){if(G.resim||G.irp)return;if(kind==='fin')G.finAt=G.fstep;else G.bigAt=G.fstep;}
// called after every live fight step
function irpAfterStep(){if(G.resim||G.irp||!G.snaps||G.tut)return;
 if(G.fstep%IRP.every===0){G.snaps.set(G.fstep,getSnap());G.snaps.delete(G.fstep-IRP.every*IRP.keep);}
 // trigger: shortly after the bell, once per match
 if(G.over&&!G.over.irpDone&&G.over.t>=1.0){G.over.irpDone=true;irpStart();}}
function irpStart(){const now=G.fstep;let a,b;
 if(G.finAt>=0&&now-G.finAt<900){a=G.finAt-IRP.lead;b=G.finAt+IRP.tail;}
 else if(G.bigAt>=0&&now-G.bigAt<900){a=G.bigAt-IRP.bigLead;b=G.bigAt+IRP.bigTail;}
 else return;
 b=Math.min(b,now);let from=-1;for(const k of G.snaps.keys())if(k<=a&&k>from)from=k;if(from<0)return;
 G.irp={end:getSnap(),endStep:now,tape:{inp:G.rec.inp.slice()},from,a:Math.max(a,from),b,phase:'seek',k:0};
 setSnap(G.snaps.get(from));G.replay=G.irp.tape;
 // jump silently to just before the moment
 G.resim=true;for(let n=0;G.fstep<G.irp.a&&n<2000;n++)simStep();G.resim=false;G.parts=[];G.pops=[];G.callout=null;
 G.irp.phase='play';}
// called once per screen frame instead of the normal simulation while a replay is showing
function irpFrame(){const R=G.irp;R.k++;
 const skip=confirmP()||clickQ||hit(['Escape']);
 if(!skip&&R.k%IRP.slow===0&&G.fstep<R.b)simStep();
 for(const k in pressed)delete pressed[k];clickQ=null;
 if(skip||G.fstep>=R.b)irpFinish();}
function irpFinish(){const R=G.irp;G.replay=null;setSnap(R.end);G.rec.inp=R.tape.inp.slice(0,R.endStep);G.over.irpDone=true;G.irp=null;G.parts=[];G.pops=[];G.callout=null;}
function drawIRP(){if(!G.irp)return;R(0,0,W,16,'#000');R(0,H-16,W,16,'#000');
 if(Math.floor(G.t*3)%2===0){R(6,4,4,8,'#ff2a2a');}
 T('INSTANT REPLAY',14,5,1,'#fff','left',null);T(coarse?'TAP TO SKIP':'ENTER TO SKIP',W-6,H-11,1,'#bfae98','right',null);}
