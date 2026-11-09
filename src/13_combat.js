// ================= COMBAT =================
const bodyX=o=>['down','pinned','held'].includes(o.state)||(o.state==='finished'&&o.finBy==='slam')?o.x-o.dir*24*o.ch.size:o.x;
// CROWD METER: G.hype (0-1). When the crowd is hot, both finisher meters fill faster.
const crowdMul=()=>G.hype>=CTR.crowd.hot?1+CTR.crowd.meterBonus:1;
const heat=v=>{G.hype=Math.min(1,G.hype+v);};
function damage(o,dmg,f){if(G.mm&&f&&f.idx>=0)o.tgt=f.idx;o.hp=Math.max(0,o.hp-dmg);f.meter=Math.min(100,f.meter+dmg*1.6*crowdMul());o.meter=Math.min(100,o.meter+dmg*0.7*crowdMul());G.hype=Math.min(1,G.hype+dmg*CTR.crowd.perDamage);
 if(f.meter>=100&&!f.readyAnn){f.readyAnn=true;popOn(f,'FINISHER READY!','#ffd35a');}}
function knock(o,vx,vy,long){if(G.mm&&G.mm.elim&&GM().randomElims&&rumbleOverTop(o,Math.sign(vx)||1,false))return;irpMark('big');heat(CTR.crowd.knockdown);setState(o,'fall');o.vx=vx;o.vz=0;o.vy=vy;o.y=Math.max(o.y,0.5);o.combo=0;o.downDur=long?3.2:1.25+(100-o.hp)/100*0.9;}
function setState(f,s){f.state=s;f.t=0;f.hitDone=false;f.sid=(f.sid||0)+1;}
// BLOCK: no button. Standing (or walking) while holding AWAY from the attacker blocks strikes. Grabs still beat a block.
// an attack is coming at f from o, up close
const incoming=(f,o)=>['punch','kick','runline','dropkick'].includes(o.state)&&Math.abs(o.x-f.x)<64*o.ch.size&&Math.abs(o.z-f.z)<14&&(!wide()||f.out===o.out);
const holdsAway=(f,o,inp)=>o.x<f.x?inp.right:inp.left;
const canBlock=(o,f)=>['idle','walk','block'].includes(o.state)&&o.y<2&&o.inp&&(f.x<o.x?o.inp.right:o.inp.left);
function tryHit(f,o,A){if(o.ghost)return;
 const tx=A.ground?bodyX(o):o.x,dx=(tx-f.x)*f.dir,reach=A.reach*f.ch.size;
 if(dx<-8||dx>reach)return;if(Math.abs(o.z-f.z)>(A.ground?12:10))return;
 if(A.ground){if(o.state!=='down')return;}
 else{if(!HITTABLE.has(o.state))return;if(o.state!=='perch'&&Math.abs(o.y-f.y)>(A.air?40:22))return;}
 if(wide()&&f.out!==o.out)return;
 if(!A.ground&&canBlock(o,f)){f.hitDone=true;const chip=A.dmg*f.ch.pow*CTR.block.chip;o.hp=Math.max(1,o.hp-chip);f.meter=Math.min(100,f.meter+chip);
  setState(o,'block');o.blockStun=CTR.block.stun+(A.knock?0.15:0);o.vx=f.dir*A.kb*CTR.block.push;o.vz=0;o.combo=0;
  if(f.state==='runline')f.vx*=0.3;sfx('block');tutEv('block',o);G.hitStop=0.03;part(PX(o.x,o.z)-f.dir*10,PY(o.z)-o.y-40*o.ch.size,-f.dir*30,-20,0.25,'#9fd4ff',2);
  if(o.blockN=(o.blockN||0)+1,o.blockN%3===1)popOn(o,'BLOCK','#9fd4ff');return;}
 f.hitDone=true;const whipped=o.state==='whipped'||o.state==='run';
 const dmg=A.dmg*f.ch.pow*srnd(0.9,1.1)*(whipped?1.5:1);damage(o,dmg,f);tutEv(A===ATK.punch?'punch':A===ATK.kick?'kick':'hit',f);
 hitFx((sx_(f)+PX(tx,o.z))/2,PY((f.z+o.z)/2)-Math.max(o.y,f.y)-(A.ground?8:36),A.ground?5:9);sfx(A.sfx);G.hitStop=A.hs+(whipped?0.06:0);shake(A.knock||whipped?5:2);
 if(A.ground){o.t=Math.max(0,o.t-0.35);if(Math.random()<0.4)line('stomp',f,o);return;}
 o.combo++;o.comboT=1.1;
 if(whipped){knock(o,f.dir*140,260);callout(A.sfx==='kick'?'BIG BOOT!':'CLOTHESLINE!','#fff',1.0);line('clothes',f,o);crowdReact(f,true);return;}
 if(o.state==='perch'){knock(o,f.dir*70,150);popOn(o,'KNOCKED OFF!','#fff');say(`${f.ch.short} knocks ${o.ch.short} off the top!`);return;}
 if(A.knock||o.combo>=4||o.y>5){knock(o,f.dir*A.kb*1.3,240);if(A.knock){line('drop',f,o);crowdReact(f,false);}}
 else{setState(o,'hit');o.stun=A.stun;o.vx=f.dir*A.kb;o.vz=0;if(Math.random()<0.3)line(A.sfx==='kick'?'kick':'punch',f,o);}
}
// Irish whip: a short wind-up first. That wind-up is the victim's counter window (GRAB reverses it).
function startWhip(f,o,mx,canRev){link(f,o);setState(f,'whip');setState(o,'whipped');o.whipDir=mx;o.vx=0;o.vz=0;o.dir=-mx;o.z=f.z;
 o.ctrWin=CTR.whipReverse;o.canRev=canRev;o.bounced=false;o.runWin=0;o.whipId=G.fstep;sfx('grab');}
// ---- Roll him back in: both outside, opponent next to the ring. GRAB while pushing toward the ring (UP at the front, LEFT on the right side)
// shoves him under the bottom rope. Test link only for now.
function rollInDir(f,o){if(!G.rollInOn||!wide()||G.mm||!f.out||!o.out||G.over||G.pin)return 0;
 if(Math.abs(o.x-f.x)>36*f.ch.size||Math.abs(o.z-f.z)>12||o.y>2||!(GRABBABLE.has(o.state)||o.state==='down'))return 0;
 if(o.z>=186&&o.x>40&&o.x<260)return -1;           // front apron: push UP
 if(o.z<190&&o.x>=RING_R-4&&o.x<=RING_R+30)return 1; // right side: push LEFT
 return 0;}
function rollIn(f,o){const front=o.z>=186;link(f,o);
 if(front)startRoll(o,clamp(o.x,ringX(ZMAX)[0]+6,ringX(ZMAX)[1]-6),ZMAX-3,false);else startRoll(o,ringX(o.z)[1]-8,clamp(o.z,ZMIN+4,ZMAX-4),false);
 setState(f,'whip');f.t=0.25;damage(o,3,f);sfx('grab');heat(0.06);
 callout('BACK IN THE RING!','#ffd35a',1.0);say(`${f.ch.short} rolls ${o.ch.short} back into the ring!`);}
function tryGrab(f,o,mx){if(o.ghost){setState(f,'whiff');return;}
 if(wide()&&f.out)mx=0;
 if((!wide()||f.out===o.out)&&Math.abs(o.x-f.x)<30*f.ch.size&&Math.abs(o.z-f.z)<10&&o.y<2&&GRABBABLE.has(o.state)){
  if(mx&&canToss(f,o)){startToss(f,o,mx);return;}
  if(mx){startWhip(f,o,mx,true);line('whip',f,o);tutEv('whip',f);return;}
  link(f,o);setState(f,'grapple');setState(o,'grappled');f.vx=f.vz=o.vx=o.vz=0;o.z=f.z+0.2;sfx('grab');}
 else setState(f,'whiff');
}
function updGrapple(f,o){
 const t=f.t,d=f.dir,s=f.ch.size;
 if(o.state!=='grappled'){if(t>0.85)setState(f,'idle');return;}
 if(t<0.3){o.x=f.x+d*18*s;o.y=0;o.spin=0;}
 else if(t<0.65){const p=(t-0.3)/0.35,a=Math.PI*p;o.x=f.x+d*18*s*Math.cos(a);o.y=42*s*Math.sin(a);o.spin=a;}
 else{o.spin=0;o.y=0;o.x=cx(o,f.x-d*20);o.dir=d;setState(o,'down');o.downDur=1.6;
  damage(o,13*f.ch.pow,f);sfx('slam');shake(6);dust(PX(o.x-o.dir*24,o.z),PY(o.z),true);G.hitStop=0.09;line('grab',f,o);crowdReact(f,false);}
}
function tryFin(f,o){if(o.ghost)return;
 if(f.meter<100){popOn(f,'NO MOMENTUM','#bbb');return;}
 if(Math.abs(o.x-f.x)>44||Math.abs(o.z-f.z)>10||(wide()&&f.out!==o.out)||!GRABBABLE.has(o.state)||o.y>2){popOn(f,'GET CLOSER!','#fff');return;}
 link(f,o);irpMark('fin');tutEv('fin',f);heat(CTR.crowd.finisher);f.meter=0;f.readyAnn=false;setState(f,'finisher');setState(o,'finished');o.finBy=f.ch.finType;f.vx=f.vz=o.vx=o.vz=0;f.finHit=false;f.launched=false;f.dir=o.x>f.x?1:-1;o.dir=-f.dir;o.z=f.z+0.3;
 callout(f.ch.fin+'!!',f.ch.accent,1.7);G.slow=0.8;G.slowT=1.3;G.flash=0.3;sfx('whoosh');
 if(f.ch.finType==='kick')sfx('fire');if(f.ch.finType==='spin')sfx('glitter');crowdReact(f,true);
}
function finContact(f,o){damage(o,27*f.ch.pow,f);shake(9);G.hitStop=0.14;G.slow=0.35;G.slowT=0.5;G.flash=0.35;sfx('slam');line('fin',f,o);crowdReact(f,true);}
function updFinisher(f,o,dt){
 const t=f.t,ty=f.ch.finType;
 if(ty==='kick'){
  if(t<0.6){f.turn=Math.cos(t/0.6*Math.PI*4)>=0?1:-1;if(Math.random()<0.7)fireFx(sx_(f),sy_(f)-28,2);}else f.turn=1;
  if(t>=0.66&&!f.finHit){f.finHit=true;finContact(f,o);knock(o,f.dir*300,280,true);fireFx(sx_(o),sy_(o)-36,24);sfx('kick');sfx('fire');}
  if(t>=1.15)setState(f,'idle');
 }else if(ty==='slam'){
  const fs=f.ch.size,os=o.ch.size;
  if(t<0.55){const p=t/0.55,e=p*p*(3-2*p);o.x=lerp(o.x,f.x+o.dir*24*os,0.25);o.y=lerp(0,66*fs,e);}
  else if(t<0.8){o.x=f.x+o.dir*24*os;o.y=66*fs+(Math.sin(G.t*20)>0?1:0);}
  else if(t<0.92){const p=(t-0.8)/0.12;o.y=lerp(66*fs,0,p*p);}
  else if(!f.finHit){f.finHit=true;o.y=0;o.dir=-f.dir;o.x=cx(o,f.x+f.dir*14);setState(o,'down');o.downDur=3.2;
   finContact(f,o);dust(PX(bodyX(o),o.z),PY(o.z),true);}
  if(t>=1.45)setState(f,'idle');
 }else if(ty==='scream'){
  if(t<0.55&&Math.random()<0.3)part(sx_(f)+f.dir*6,sy_(f)-52*f.ch.size,f.dir*20,-12,0.4,'#fff',1);
  if(t>=0.55&&!f.finHit){f.finHit=true;sfx('scream');finContact(f,o);knock(o,f.dir*330,280,true);}
  if(f.finHit&&t<1.0&&Math.random()<0.55)part(sx_(f)+f.dir*8*f.ch.size,sy_(f)-52*f.ch.size,f.dir*220,0,0.6,pick(['#1fb5b0','#ffffff','#ffd35a']),3,'ring');
  if(t>=1.25)setState(f,'idle');
 }else{
  if(t<0.3){if(Math.random()<0.5)glitterFx(sx_(f),sy_(f)-24,1);}
  else if(!f.launched){f.launched=true;const T0=0.8;f.vy=0.5*GRAV*T0;f.vx=(o.x-f.dir*6-f.x)/T0;f.vz=(o.z-f.z)/T0;f.y=0.5;}
  else if(!f.finHit){f.vy-=GRAV*dt;f.y+=f.vy*dt;f.turn=Math.cos((t-0.3)*Math.PI*6)>=0?1:-1;glitterFx(sx_(f),sy_(f)-30,1);
   if(f.y<=0){f.y=0;f.vx=f.vz=0;f.turn=1;f.finHit=true;f.landT=t;setState(o,'down');o.downDur=3.2;finContact(f,o);glitterFx(PX(bodyX(o),o.z),PY(o.z)-10,40);sfx('glitter');dust(sx_(o),PY(o.z),true);}}
  else if(t-f.landT>0.45)setState(f,'idle');
 }
}
function startDive(f,o){link(f,o);irpMark('big');heat(CTR.crowd.dive);tutEv('dive',f);setState(f,'dive');const T0=0.65;f.vx=clamp((o.x-f.x)/T0,-420,420);f.vz=((wide()?o.z:clamp(o.z,ZMIN,ZMAX))-f.z)/T0;f.vy=(0.5*GRAV*T0*T0-f.y)/T0;sfx('whoosh');callout('OFF THE TOP!','#fff',1.0);crowdReact(f,true);line('dive',f,o);}
function landDive(f,o){
 f.y=0;f.vx=f.vz=0;if(wide())f.out=!insideRing(f.x,f.z);clampPos(f);
 const hitIt=Math.abs(bodyX(o)-f.x)<28&&Math.abs(o.z-f.z)<12&&(HITTABLE.has(o.state)||o.state==='down'||o.state==='getup');
 if(hitIt){damage(o,17*f.ch.pow,f);hitFx(sx_(o),sy_(o)-12,12);
  if(o.state==='down'||o.state==='getup'){setState(o,'down');o.downDur=1.9;}else knock(o,f.dir*60,150);
  setState(f,'down');f.downDur=0.45;sfx('slam');shake(7);G.hitStop=0.1;dust(sx_(f),PY(f.z),true);callout('SPLASH!!','#ffd35a',1.0);crowdReact(f,true);}
 else{damage(f,7,o);setState(f,'down');f.downDur=1.7;sfx('slam');shake(5);dust(sx_(f),PY(f.z),true);popOn(f,'CRASH!','#ff5a5a');line('crash',f,o);crowdReact(o,false);}
}
function nearRopes(o){if(wide()&&o.out)return false;const s=o.ch.size,pts=[o.x,o.x-o.dir*52*s];
 for(const x of pts){const[a,b]=wbounds(o);if(x<a+6||x>b-6)return true;}return o.z<=ZMIN+4||o.z>=ZMAX-4;}
function ropeBreak(){const{a,d}=G.pin;G.pin=null;G.ref.mode='idle';setState(d,'getup');d.y=0;d.wiggle=0;setState(a,'getup');a.x=cx(a,d.x-d.dir*36);
 callout('ROPE BREAK!','#ffd35a',1.2);say(`${d.ch.short} gets a foot on the ropes! The ref breaks the count!`);sfx('count');G.hype=Math.min(1,G.hype+0.2);}
function bodySpan(f,frame){const e=(f.set&&f.set[frame+'_ext'])||(frame==='pinning'?[8,52*f.ch.size]:[52*f.ch.size,8]);return f.dir>=0?[f.x-e[0],f.x+e[1]]:[f.x-e[1],f.x+e[0]];}
function keepInRing(list){if(!wide())return;const live=list.filter(([f])=>!f.out);if(!live.length)return;const z=live[0][0].z,[a0,b0]=ringX(z),a=a0-6,b=b0+6;
 let lo=1e9,hi=-1e9;for(const[f,fr]of live){const[s0,s1]=bodySpan(f,fr);lo=Math.min(lo,s0);hi=Math.max(hi,s1);}
 let sh=0;if(hi-lo>b-a)sh=(a+b)/2-(lo+hi)/2;else if(lo<a)sh=a-lo;else if(hi>b)sh=b-hi;if(sh)for(const[f]of live)f.x+=sh;}
function startPin(f,o){if(o.ghost||(G.mm&&!G.mm.pins)){setState(f,'whiff');return;}link(f,o);tutEv('pin',f);setState(f,'pinning');setState(o,'pinned');f.dir=-o.dir;f.x=o.x;f.z=o.z;f.vx=f.vz=0;
 keepInRing([[o,'down'],[f,'pinning']]);f.x=o.x;
 G.pin={ropes:nearRopes(o),a:f,d:o,t:0,count:0,need:o.hp<=0?999:Math.round(4+(100-o.hp)/5),presses:0,nextAt:0.6};G.ref.mode='pin';sfx('grab');line('pin',f,o);}
function kickout(){const P=G.pin,{a,d}=P,near=P.count>=2&&P.nextAt-P.t<0.3;G.pin=null;G.ref.mode='idle';setState(d,'getup');d.y=0;setState(a,'getup');a.x=cx(a,d.x-d.dir*36);
 if(near){callout('NEAR FALL!','#ffd35a',1.4);say(`${d.ch.short} kicked out at 2.9! This place is going crazy!`);heat(CTR.crowd.nearFall);crowdReact(d,false);sfx('roar');sfx('roar');shake(5);irpMark('big');}
 else{callout('KICK OUT!','#fff',1.1);line('kickout',a,d);heat(CTR.crowd.kickout);sfx('roar');shake(3);}}
// SECOND WIND: pinned with a full finisher meter? Press FINISH to burn the whole meter and kick out, even at
// zero health (you come back with a sliver). Once per match per wrestler. The CPU saves it for the 2.9.
function secondWind(){const{a,d}=G.pin;d.meter=0;d.readyAnn=false;d.usedSW=true;if(d.hp<12)d.hp=12;kickout();
 callout('SECOND WIND!','#ff8a1f',1.6);say(`${d.ch.short} burns everything left to kick out! We're not done yet!`);G.flash=0.5;heat(CTR.crowd.nearFall);sfx('fire');
 fireFx(PX(d.x,d.z),PY(d.z)-20,30);if(!d.cpu)popOn(d,'METER USED','#ff8a1f');}
function updPin(dt,inp){
 const P=G.pin;P.t+=dt;P.a.x=P.d.x;P.a.z=P.d.z;const di=inp[P.d.idx];
 if(!P.d.cpu&&di.finP&&P.d.meter>=100&&!P.d.usedSW&&!P.d.out){secondWind();return;}
 if(!P.d.cpu&&(di.punchP||di.kickP||di.grabP||di.jumpP||di.finP)){P.presses++;P.d.wiggle=0.15;}
 if(P.d.wiggle>0)P.d.wiggle-=dt;
 if(P.ropes&&!P.d.cpu&&(di.left||di.right||di.up||di.down)&&P.t>0.3){ropeBreak();return;}
 if(!P.d.cpu&&P.presses>=P.need){kickout();return;}
 if(P.t>=P.nextAt){
  if(P.ropes&&P.d.cpu&&P.count>=1&&schance(0.8)){ropeBreak();return;}
  if(P.d.cpu&&P.count===2&&P.d.meter>=100&&!P.d.usedSW&&schance(0.85)){secondWind();return;}
  if(P.d.cpu&&P.count>=1){const p=clamp((P.d.hp-5)/55,0,0.97);if(schance(P.count===1?p*0.4:p)){kickout();return;}}
  P.count++;P.nextAt+=0.8;sfx('count');G.ref.slap=0.25;callout(P.count===3?'3!!!':P.count+'!',P.count===3?'#ff4a3a':'#fff',0.75);shake(2);heat(CTR.crowd.pinCount);
  if(P.count===3)endMatch(P.a,P.d);}
}
function endMatch(w,l){G.pin=null;G.over={w,l,t:0,how:'PINFALL'};l.downDur=999;setState(w,'getup');G.ref.mode='raise';setTimeout(()=>sfx('bell'),250);sfx('roar');crowdReact(w,true);say(`Here is your winner... ${w.ch.name}!`);}

