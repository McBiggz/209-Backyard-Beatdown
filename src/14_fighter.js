// ================= FIGHTER UPDATE =================
function makeFighter(ch,x,z,dir,cpu,idx){return{ch,set:null,x,z,y:0,vx:0,vz:0,vy:0,dir,hp:100,hpShow:100,meter:0,state:'idle',t:0,cpu,idx,combo:0,comboT:0,hitDone:false,
 walkPh:0,downDur:1.5,stun:0.3,ai:{t:0.6,mv:null,goal:null},wiggle:0,finHit:false,launched:false,readyAnn:false,spin:0,turn:1,finBy:''};}
function atCorner(f,mx){if(f.out)return false;const[a,b]=wbounds(f);return((f.x<=a+3&&mx<0)||(f.x>=b-3&&mx>0))&&(f.z<=ZMIN+6||f.z>=ZMAX-6);}
function updFighter(f,o,inp,dt){
 f.t+=dt;if(f.comboT>0){f.comboT-=dt;if(f.comboT<=0)f.combo=0;}
 f.hpShow=lerp(f.hpShow,f.hp,1-Math.exp(-dt*2.5));
 const S=f.state,dx=o.x-f.x;
 switch(S){
 case 'idle':case 'walk':{
  if(Math.abs(dx)>2)f.dir=dx>0?1:-1;
  if(f.y<2&&holdsAway(f,o,inp)&&incoming(f,o)){setState(f,'block');f.blockStun=0.12;f.vx=f.vz=0;break;}
  const mx=(inp.right?1:0)-(inp.left?1:0),mz=(inp.down?1:0)-(inp.up?1:0);
  // RUN: double-tap left or right
  if(mx&&f.pmx!==mx&&f.y<1){if(f.tapDir===mx&&G.t-f.tapT<CTR.run.doubleTap){f.tapDir=0;f.pmx=mx;setState(f,'run');f.runDir=mx;f.dir=mx;f.vx=mx*CTR.run.speed*f.ch.spd;f.vz=0;f.autoRun=0;sfx('whoosh');break;}f.tapDir=mx;f.tapT=G.t;}
  f.vx=mx*90*f.ch.spd;f.vz=mz*52*f.ch.spd;f.state=(mx||mz)?'walk':'idle';if(mx||mz)f.walkPh+=dt*11;
  const nearBody=Math.abs(bodyX(o)-f.x)<36&&Math.abs(o.z-f.z)<12;
  if(inp.jumpP&&runnerComing(f,o)){startDodge(f,o,inp.down);break;}
  if(inp.jumpP){
   if(atCorner(f,mx)){setState(f,'perch');if(wide()){const bk=f.z<140;f.x=mx<0?(bk?84:44):(bk?225:269);f.z=bk?121:157;f.y=bk?30:34;}else{f.x=mx<0?-(RX-2):(RX-2);f.z=f.z<32?RZB+1:RZF-1;f.y=26;}f.vx=f.vz=0;f.dir=mx<0?1:-1;sfx('whoosh');line('perch',f,o);G.hype=Math.min(1,G.hype+0.15);}
   else if(tryRoll(f,mx,mz)){}
   else{setState(f,'jump');f.vy=280;f.vx=mx*95*f.ch.spd;f.vz=mz*55*f.ch.spd;f.y=0.5;}}
  else if(inp.finP)tryFin(f,o);
  else if(inp.grabP){if(o.state==='down'&&nearBody&&!G.over&&!(wide()&&(f.out||o.out)))startPin(f,o);else tryGrab(f,o,mx);}
  else if(inp.punchP)setState(f,(o.state==='down'&&nearBody)?'stomp':'punch');
  else if(inp.kickP)setState(f,(o.state==='down'&&nearBody)?'stomp':'kick');
  break;}
 case 'punch':case 'kick':case 'stomp':{const A=ATK[S];f.vx=(S==='kick'&&f.t<0.15)?f.dir*30:0;f.vz=0;
  if(!f.hitDone&&f.t>=A.act[0]&&f.t<=A.act[1])tryHit(f,o,A);if(f.t>=A.dur)setState(f,'idle');break;}
 case 'jump':case 'dropkick':{f.vy-=GRAV*dt;f.y+=f.vy*dt;
  if(S==='jump'&&(inp.kickP||inp.punchP)){f.state='dropkick';f.hitDone=false;}
  if(f.state==='dropkick'&&!f.hitDone)tryHit(f,o,ATK.dropkick);
  if(f.y<=0){f.y=0;f.vx=f.vz=0;if(f.state==='dropkick'){setState(f,'down');f.downDur=0.5;sfx('slam');}else setState(f,'idle');dust(sx_(f),PY(f.z));}
  break;}
 case 'hit':f.vx*=Math.pow(0.02,dt);if(f.t>=f.stun)setState(f,'idle');break;
 case 'block':f.vx*=Math.pow(0.02,dt);f.vz=0;if(holdsAway(f,o,inp)&&incoming(f,o))f.blockStun=Math.max(f.blockStun,f.t+0.12);if(f.t>=f.blockStun)setState(f,'idle');break;
 case 'whiff':case 'whip':f.vx=f.vz=0;if(f.t>(S==='whip'?0.4+CTR.whipReverse:0.35))setState(f,'idle');break;
 case 'whipped':{
  if(f.ctrWin>0){f.vx=0;f.ctrWin-=dt;
   // REVERSAL: press GRAB during the wind-up and whip them instead
   if(inp.grabP&&f.canRev&&o.state==='whip'){f.ctrWin=0;startWhip(f,o,-f.whipDir,false);callout('REVERSAL!','#ffd35a',0.9);tutEv('reverse',f);line('rev',f,o);crowdReact(f,false);G.hype=Math.min(1,G.hype+0.12);break;}
   if(f.ctrWin<=0){f.vx=f.whipDir*CTR.whipSpeed;f.dir=f.whipDir;}
   break;}
  const nx=f.x+f.vx*dt;const[wb0,wb1]=wbounds(f);if((nx>wb1&&f.vx>0)||(nx<wb0&&f.vx<0)){f.vx=-f.vx;f.dir=f.vx>0?1:-1;G.rope={side:f.vx<0?1:-1,t:0};ropeSfx();shake(2);
   if(!f.bounced){f.bounced=true;f.runWin=CTR.ropeAttack;}
   if(G.mm&&G.mm.elim&&GM().randomElims&&rumbleOverTop(f,f.vx>0?-1:1,true))break;}
  // off the ropes: PUNCH = flying clothesline, KICK/JUMP = running dropkick
  if(f.runWin>0){f.runWin-=dt;
   if(inp.punchP){f.runWin=0;setState(f,'runline');sfx('whoosh');tutEv('ropeattack',f);break;}
   if(inp.kickP||inp.jumpP){f.runWin=0;setState(f,'dropkick');f.vy=230;f.y=0.5;sfx('whoosh');tutEv('ropeattack',f);break;}}
  f.walkPh+=dt*22;if(f.t>1.9+CTR.whipReverse){f.vx=0;setState(f,'idle');}break;}
 case 'run':{const mxh=(inp.right?1:0)-(inp.left?1:0);f.walkPh+=dt*20;f.vz=((inp.down?1:0)-(inp.up?1:0))*40*f.ch.spd;f.vx=f.runDir*CTR.run.speed*f.ch.spd;f.dir=f.runDir;
  if(inp.punchP){setState(f,'runline');sfx('whoosh');tutEv('runattack',f);break;}
  if(inp.kickP||inp.jumpP){setState(f,'dropkick');f.vy=230;f.y=0.5;sfx('whoosh');tutEv('runattack',f);break;}
  if(inp.grabP){f.vx=f.vz=0;setState(f,'idle');break;}
  if(!f.out){const nx=f.x+f.vx*dt,[wb0,wb1]=wbounds(f);if((nx>wb1&&f.vx>0)||(nx<wb0&&f.vx<0)){f.runDir=-f.runDir;f.vx=-f.vx;f.dir=f.runDir;G.rope={side:f.vx<0?1:-1,t:0};ropeSfx();shake(1);f.autoRun=CTR.run.afterRopes;}}
  f.autoRun-=dt;if((f.autoRun<=0&&mxh!==f.runDir)||f.t>CTR.run.maxTime){f.vx=f.vz=0;setState(f,'idle');}
  break;}
 case 'dropdown':f.vx=f.vz=0;if(f.t>CTR.dodge.dropTime)setState(f,'idle');break;
 case 'runline':f.walkPh+=dt*22;if(!f.hitDone)tryHit(f,o,ATK.runline);else f.vx*=Math.pow(0.05,dt);
  if(f.t>0.55){f.vx=0;setState(f,'idle');}break;
 case 'fall':f.vy-=GRAV*dt;f.y+=f.vy*dt;if(!f.out){const[r0,r1]=wbounds(f),nx=f.x+f.vx*dt;if((nx>r1&&f.vx>0)||(nx<r0&&f.vx<0)){f.vx=-f.vx*0.35;G.rope={side:nx>r1?1:-1,t:0};ropeSfx();shake(2);}}if(f.y<=0&&f.vy<0){f.y=0;f.vx=f.vz=0;setState(f,'down');sfx('slam');shake(4);dust(PX(bodyX(f),f.z),PY(f.z),true);}break;
 case 'down':f.vx=f.vz=0;f.y=0;if(f.t>=f.downDur)setState(f,'getup');break;
 case 'getup':f.vx=f.vz=0;if(f.t>=0.5){setState(f,'idle');if(G.over&&G.over.w===f)setState(f,'win');}break;
 case 'grapple':updGrapple(f,o);break;
 case 'perch':f.vx=f.vz=0;f.y=26;
  if(inp.punchP||inp.kickP)startDive(f,o);
  else if(inp.jumpP){setState(f,'jump');f.vy=180;f.vx=f.dir*70;f.vz=f.z<(wide()?140:32)?40:-40;f.x=cx(f,f.x);}
  break;
 case 'dive':f.vy-=GRAV*dt;f.y+=f.vy*dt;if(f.y<=0&&f.t>0.1)landDive(f,o);break;
 case 'finisher':updFinisher(f,o,dt);break;
 case 'win':f.vx=f.vz=0;break;
 case 'roll':updRoll(f,dt);break;
 }
 f.pmx=(inp.right?1:0)-(inp.left?1:0);
 if(!['grappled','finished','perch','pinned','pinning','roll'].includes(f.state)){f.x+=f.vx*dt;f.z+=f.vz*dt;}
 if(!['perch','dive','roll'].includes(f.state))clampPos(f);
 if(f.dodge)checkDodge(f,o);if(f.leap&&f.state!=='jump')f.leap=false;
 if(wide()&&f.state==='down'&&f.y<1)keepInRing([[f,'down']]);
 if(!wide()&&['down','pinned'].includes(f.state)&&f.y<1){const tip=f.x-f.dir*48*f.ch.size;if(tip<XMIN-8)f.x+=XMIN-8-tip;else if(tip>XMAX+8)f.x-=tip-(XMAX+8);}
}
// ---- 5-BY-5s: dodging a runner. JUMP = leapfrog over him, DOWN + JUMP = drop down flat and let him run over you.
// He bounces off the ropes and comes back, so the two of you can string them together; 5 in a row pops the crowd.
function runnerComing(f,o){return !!G.dodgeOn&&o.state==='run'&&o.out===f.out&&(o.x-f.x)*o.runDir<0&&Math.abs(o.x-f.x)<CTR.dodge.range&&Math.abs(o.z-f.z)<16;}
function startDodge(f,o,down){f.dodge={by:o.idx,side:Math.sign(o.x-f.x)||1,kind:down?'DROP DOWN!':'LEAPFROG!'};f.vx=f.vz=0;
 if(down)setState(f,'dropdown');else{setState(f,'jump');f.vy=CTR.dodge.leapVy;f.y=0.5;f.leap=true;}sfx('whoosh');}
function checkDodge(f,o){const D=f.dodge;if(!D)return;if(f.state!=='dropdown'&&!(f.state==='jump'&&f.leap)){f.dodge=null;return;}if(o.idx!==D.by)return;
 if(!['run','runline','dropkick'].includes(o.state)||Math.sign(o.x-f.x)===D.side)return;
 const whiff=o.state!=='run';if(whiff)D.kind=D.kind==='LEAPFROG!'?'LEAPFROG! WHIFF!':'DUCKED IT!';
 // he went past: a clean dodge
 f.dodge=null;const n=(G.t-(f.r5t||-9)<CTR.dodge.chainGap?(f.r5n||0):0)+1;f.r5n=o.r5n=n;f.r5t=o.r5t=G.t;
 popOn(f,D.kind+(n>1?' x'+n:''),'#ffd35a');heat(0.03+0.015*n);sfx('whoosh');irpMark('big');
 if(!whiff){o.autoRun=Math.max(o.autoRun,CTR.run.afterRopes+0.8);o.t=Math.min(o.t,0.4);} // keep him running into the next one
 if(n===5){callout('5 BY 5!','#ffd35a',1.6);say(`A perfect 5-by-5 from ${f.ch.short} and ${o.ch.short}! Listen to this place!`);heat(0.25);sfx('roar');crowdReact(f,true);}
 else if(n>=3)say(`${n} in a row! These two are in sync!`);}
function separate(a,b){const st=s=>['idle','walk','punch','kick','hit','whiff','stomp','getup','win','whip'].includes(s);
 if(!st(a.state)||!st(b.state)||a.y>2||b.y>2||Math.abs(a.z-b.z)>9||(wide()&&a.out!==b.out))return;
 const min=17*(a.ch.size+b.ch.size)/2,d=b.x-a.x;if(Math.abs(d)<min){const p=(min-Math.abs(d))/2*(d>=0?1:-1);a.x=cx(a,a.x-p);b.x=cx(b,b.x+p);}}

