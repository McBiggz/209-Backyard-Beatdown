// ================= FRAME SELECTION =================
function frameOf(f){const t=f.t,s=f.state,blink=Math.floor(G.t*2.5)%2;
 switch(s){
 case 'idle':return 'idle'+(Math.floor(G.t*1.6+f.idx)%2);
 case 'walk':return 'walk'+(Math.floor(f.walkPh/1.5708)%4);
 case 'whipped':return 'walk'+(Math.floor(f.walkPh/1.5708)%4);
 case 'punch':return t<0.07||t>0.24?'punch0':'punch1';
 case 'kick':return t<0.11||t>0.32?'kick0':'kick1';
 case 'stomp':return t<0.2?'stomp0':'stomp1';
 case 'down':case 'pinned':return f.wiggle>0&&Math.floor(G.t*20)%2?'downW':'down';
 case 'grapple':return t<0.3?'grap0':'grap1';
 case 'whip':return 'grap0';
 case 'block':return 'grap0';
 case 'runline':return f.t<0.1?'punch0':'punch1';
 case 'roll':return 'jump';
 case 'grappled':{const k=((Math.round((f.spin||0)/(Math.PI/4))%8)+8)%8;return 'flip'+k;}
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

