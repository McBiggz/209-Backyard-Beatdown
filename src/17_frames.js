// ================= FRAME SELECTION =================
function frameOf(f){const t=f.t,s=f.state,blink=Math.floor(G.t*2.5)%2;
 switch(s){
 case 'idle':return 'idle'+(Math.floor(G.t*1.6+f.idx)%2);
 case 'walk':return 'walk'+(Math.floor(f.walkPh/1.5708)%4);
 case 'run':if(hasArt(f,'frog_v0')){ // 5x5 art: duck under a leapfrog, then skid
   if(G.f.some(q=>q!==f&&q.leap&&q.state==='jump'&&q.dodge&&q.dodge.by===f.idx&&Math.abs(q.x-f.x)<45))return 'frog_v0';
   if(f.r5t!=null&&G.t-f.r5t<0.35)return 'frog_v1';}
 case 'whipped':return 'walk'+(Math.floor(f.walkPh/1.5708)%4);
 case 'punch':{const w=windOf('punch');return t<0.07+w||t>0.24+w?'punch0':'punch1';}
 case 'kick':{const w=windOf('kick');return t<0.11+w||t>0.32+w?'kick0':'kick1';}
 case 'stomp':return t<0.2+windOf('stomp')?'stomp0':'stomp1';
 case 'entpose':return hasArt(f,'sig')?'sig':'win0';
 case 'pinning':return pinFrame(f)||'pinning';
 case 'pinned':{const pf=pinFrame(f);if(pf)return pf;} // fall through to the normal lying frames
 case 'down':if(f.supLand&&hasArt(f,'pin_cxv'))return 'pin_cxv'; // landed on his back from a suplex
  return f.wiggle>0&&Math.floor(G.t*20)%2?'downW':'down';
 case 'grapple':if(hasArt(f,'sup0'))return t<0.3?'grap0':t<0.45?'sup0':t<0.65?'sup1':'situp'; // suplex art: lift, go over, sit up
  return t<0.3?'grap0':'grap1';
 case 'whip':return 'grap0';
 case 'block':return 'grap0';
 case 'apron':return 'idle'+(Math.floor(G.t*2+f.idx)%2);
 case 'elim':return 'fall';
 case 'dropdown':return f.t<CTR.dodge.dropTime-0.15?'pinning':'getup'; // flat on the stomach (the pin cover pose)
 case 'cclimb':return 'walk'+(Math.floor((f.walkPh||0)/1.5708)%4);
 case 'cdoor':return f.wiggle>0?'grap1':'grap0';
 case 'wswing':return t<0.18?'grap0':'punch1';
 case 'lclimb':return 'walk'+(Math.floor(f.walkPh/1.5708)%4);
 case 'ltop':return 'perch'+blink;
 case 'toss':return f.wiggle>0?'grap1':'grap0';
 case 'tossed':return f.wiggle>0?'hit':'dazed';
 case 'elimdown':return 'down';
 case 'runline':return f.t<0.1?'punch0':'punch1';
 case 'roll':return 'jump';
 case 'jump':return f.leap&&hasArt(f,'frog1')?(f.t<0.12?'frog0':'frog1'):'jump'; // leapfrog art: take-off, straddle
 case 'grappled':if(hasArt(f,'sup_v0')&&supArt(f)&&f.spin>0.01)return f.spin<=Math.PI?'sup_v0':'sup_v1'; // suplex art: upside down overhead, then flat going over
 {const k=((Math.round((f.spin||0)/(Math.PI/4))%8)+8)%8;return 'flip'+k;}
 case 'perch':return 'perch'+blink;
 case 'win':return 'win'+blink;
 case 'finished':return f.finBy==='slam'?'held':'dazed';
 case 'finisher':{const ty=f.ch.finType;
  if(ty==='kick')return t<0.6?'fk0':(t<0.85?'fk1':'idle0');
  if(ty==='slam')return t<0.8?'fs0':'fs1';
  if(ty==='scream')return t<0.55?'fv0':'fv1';
  return t<0.3?'fp0':(f.finHit?'fp2':'fp1');}
 default:return s;}
}

