// ================= FREE ROAM (test link) =================
// Walk your wrestler anywhere on the map to check how he looks: no opponent (a hidden stand-in), no count-outs, no timer.
// Walk to the entrance to go into the barn (and out the big door to come back), or tap the top bar to switch maps instantly.
function freeStart(i){const S=G.sel;S.picks=[i,ROSTER.findIndex(c=>c.id===(ROSTER[i].id==='papi'?'bigmf':'papi'))];
 G.stage=3;G.hc=G.cage=false;G.mapPick='ranch';G.tut=null;startIntro();G.scene='fight';beginFight();finishEntrance();
 G.free=true;G.secretOn=true;G.map='ranch';G.mapArm=true;const[me,d]=G.f;d.cpu=false;d.freeHide=true;d.hidden=true;freePark();
 me.x=150;me.z=140;me.out=false;setState(me,'idle');G.ref.hidden=false;callout('FREE ROAM','#ffd35a',1.4);}
function freePark(){const d=G.f[1];if(!d.freeHide)return;d.hidden=true;if(!G.mapWalk){d.x=-400;d.z=150;d.vx=d.vz=0;d.hp=d.maxHp||100;}G.f[0].hp=G.f[0].maxHp||G.f[0].hp;}
const FREE_BAR=[92,52,200,11];
function freeTap(){if(!G.free||!clickQ||G.mapWalk||G.paused)return false;if(!inRect(clickQ,FREE_BAR))return false;
 G.map=G.map==='secret'?'ranch':'secret';const me=G.f[0];me.x=150;me.z=140;me.out=false;me.y=0;setState(me,'idle');G.mapArm=true;G.mapT=0;
 G.cam=clamp(me.x-192,...camLim());callout(G.map==='secret'?'THE BARN':'BMF RANCH','#ffd35a',1.0);sfx('punch');return true;}
function drawFreeHud(){if(!G.free)return;const me=G.f[0],[x,y,w,h]=FREE_BAR;
 ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(x,y,w,h);
 T(`${G.map==='secret'?'BARN':'RANCH'} X${Math.round(me.x)} Z${Math.round(me.z)}${me.out?' OUT':''} · TAP HERE: SWITCH MAP`,x+w/2,y+3,1,'#ffd35a','center');}
