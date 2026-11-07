// ================= POSES =================
function targetPose(f){
 const t=f.t,s=f.state;
 const base={lean:0.08+Math.sin(G.t*3+f.idx*2)*0.03,af:[0.55,1.9],ab:[0.3,2.0],lf:[0.3,-0.5],lb:[-0.22,0.12],rot:0,dy:0,plant:true,hipY:-52,snap:16};
 const o=x=>Object.assign(base,x);
 switch(s){
 case 'idle':return base;
 case 'walk':{const p=f.walkPh;return o({lf:[0.12+0.38*Math.sin(p),-0.35-0.35*Math.max(0,Math.cos(p))],lb:[0.12-0.38*Math.sin(p),-0.35-0.35*Math.max(0,-Math.cos(p))],lean:0.12});}
 case 'punch':{const A=ATK.punch,act=t>=A.act[0]*0.6&&t<A.act[1]+0.05;return o(act?{af:[1.57,0.05],ab:[0.2,2.1],lean:0.22,lf:[0.45,-0.35],snap:34}:{af:[0.3,2.4],lean:0,snap:24});}
 case 'kick':{const A=ATK.kick,act=t>=A.act[0]*0.7&&t<A.act[1]+0.06;return o(act?{lf:[1.55,0],lb:[-0.15,0.05],lean:-0.3,af:[0.2,1.4],ab:[-0.4,1.2],snap:30}:{lf:[1.0,-1.6],lean:-0.05,snap:22});}
 case 'stomp':return o(t<0.2?{lf:[1.1,-1.8],lean:0.1}:{lf:[0.5,-0.2],lean:0.35,af:[0.9,0.4],snap:30});
 case 'jump':return o({plant:false,lf:[0.9,-1.6],lb:[0.4,-1.3],af:[2.5,0.3],ab:[2.2,0.4]});
 case 'dropkick':return o({plant:false,rot:-1.25,lf:[1.55,0],lb:[1.45,0.1],af:[2.6,0.2],ab:[2.4,0.3],snap:22});
 case 'hit':return o({lean:-0.38,af:[-0.4,0.6],ab:[-0.5,0.5],lf:[0.45,-0.3],lb:[-0.35,0.3],snap:30});
 case 'fall':return o({plant:false,rot:-1.3,af:[2.6,0.3],ab:[2.2,0.6],lf:[0.6,-0.4],lb:[0.2,-0.3],snap:12});
 case 'down':case 'pinned':{const w=f.wiggle>0?Math.sin(G.t*50)*0.25:0;return o({plant:false,rot:-Math.PI/2,dy:-13+(w?Math.abs(w)*-6:0),lean:0,lf:[0.15,-0.1],lb:[-0.05,0.25],af:[1.3+w,0.5],ab:[2.6,0.3],snap:14});}
 case 'getup':return o({lean:0.7,lf:[1.1,-1.9],lb:[0.3,-1.9],af:[0.8,0.6],ab:[0.6,0.6],snap:10});
 case 'grapple':return o(t<0.3?{lean:0.25,af:[1.45,0.6],ab:[1.35,0.7]}:{lean:-0.55,af:[2.6,0.6],ab:[2.5,0.6],lf:[0.4,-0.6],lb:[-0.1,-0.4]});
 case 'grappled':return o({lean:0.1,af:[1.0,0.3],ab:[0.8,0.4],lf:[0.1,0],lb:[-0.1,0],plant:false,snap:20});
 case 'whiff':return o({lean:0.35,af:[1.4,0.3],ab:[1.3,0.3]});
 case 'perch':return o({lf:[0.9,-1.6],lb:[0.2,-1.0],af:[2.0,0.2+Math.sin(G.t*6)*0.2],ab:[1.8,0.3],lean:0.15});
 case 'dive':return o({plant:false,rot:1.35,af:[2.9,0.1],ab:[2.7,0.1],lf:[0.15,0],lb:[-0.1,0],snap:18});
 case 'pinning':return o({plant:false,rot:Math.PI/2,dy:-40,lf:[0.1,0],lb:[-0.1,0.1],af:[1.6,0.6],ab:[1.4,0.8]});
 case 'win':return o({af:[2.95,0.1],ab:[2.85,0.2],lean:-0.05+Math.sin(G.t*4)*0.03});
 case 'finished':
  if(f.finBy==='slam')return o({plant:false,rot:-Math.PI/2,dy:-13,lean:0,lf:[0.2,0],lb:[0,0],af:[2.0,0.5],ab:[2.6,0.3]});
  return o({lean:-0.2+Math.sin(G.t*9)*0.12,af:[0.2,0.4],ab:[0.1,0.4],snap:10});
 case 'finisher':{const ty=f.ch.finType;
  if(ty==='kick'){if(t<0.6)return o({lean:0.1,af:[1.2,0.8],ab:[1.0,0.9],lf:[0.6,-1.0],snap:20});if(t<0.85)return o({lf:[1.75,0],lb:[-0.2,0],lean:-0.45,af:[0.3,1.2],ab:[-0.6,1.0],snap:36});return base;}
  if(ty==='slam'){if(t<0.8)return o({af:[2.95,0.15],ab:[2.85,0.2],lean:-0.05,lf:[0.45,-0.6],lb:[-0.3,0.1]});return o({lean:0.7,af:[1.4,0.2],ab:[1.3,0.2],lf:[1.0,-1.6],lb:[0.3,-1.6],snap:26});}
  if(ty==='scream'){if(t<0.55)return o({lean:-0.4,af:[-0.7,0.9],ab:[-0.8,0.9],lf:[0.4,-0.4],lb:[-0.3,0.2]});return o({lean:0.3,af:[1.9,0.1],ab:[1.6,0.2],lf:[0.5,-0.3],lb:[-0.4,0.1],snap:30});}
  if(t<0.3)return o({lean:0.4,lf:[1.0,-1.8],lb:[0.4,-1.8],af:[-0.5,0.3],ab:[-0.6,0.3]});
  if(!f.finHit)return o({plant:false,af:[2.8,0.2],ab:[2.6,0.3],lf:[1.2,-1.4],lb:[0.8,-1.2]});
  return o({lean:0.6,lf:[1.0,-1.7],lb:[0.3,-1.7],af:[0.9,0.3],ab:[0.6,0.3]});}
 }
 return base;
}

