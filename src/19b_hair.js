// ---- moving hair, tassels and fringe (test link; looks only, never touches the sim) ----
// Each wrestler listed in HAIR_CFG gets the hanging bits of his sprite found by colour + place (behind the head,
// near the outline), cut onto their own layer, and bent row by row: roots still, tips swing. A spring per fighter
// makes it trail when he moves, lift and whip on landings, and sway a little when he stands still.
const HAIR_CFG={
 viral:[{h:[15,50],s:0.25,v:[0.15,1],y:[0.04,0.26],bh:0.02,e:9}],
 cjdirt:[{h:[265,325],s:0.45,v:[0.18,1],y:[0.18,0.72],bh:0.04,e:7},{h:[0,25],s:0.4,v:[0.12,0.45],y:[0.06,0.32],bh:0.03,e:7}],
};
const HAIR_SKIP=/^(down|pin|sfold|sshoul|sfall|simp|spick|telb|held|carried|ccrawl|cdrop|ctop|getup|situp|sit|tmount|rsit|frog|sup|ko|elim|dazed_f|flat|lie|roll)/;
let HAIRF=null;const HAIR_C=new Map();
function hairOn(f){return TEST_MODES&&f&&f.ch&&HAIR_CFG[artId(f)];}
function hairBuild(c,id){
 const cfg=HAIR_CFG[id];if(!cfg||!c.w||!c.h)return null;const w=c.w,h=c.h;
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');g.drawImage(c.a,c.x,c.y,w,h,0,0,w,h);
 let D;try{D=g.getImageData(0,0,w,h);}catch(e){return null;}const P=D.data,A=new Uint8Array(w*h);
 let top=h,bot=0;for(let i=0;i<w*h;i++)if(P[i*4+3]>0){A[i]=1;const y=(i/w)|0;if(y<top)top=y;if(y>bot)bot=y;}
 const H=bot-top;if(H<20)return null;
 // head centre: middle of the top 12% of the figure
 let sx=0,n=0;for(let y=top;y<top+H*0.12;y++)for(let x=0;x<w;x++)if(A[y*w+x]){sx+=x;n++;}const hx=n?sx/n:w/2;
 // distance (in px) to the nearest transparent pixel, by two passes (chessboard metric), capped
 const dist=new Uint8Array(w*h);for(let i=0;i<w*h;i++)dist[i]=A[i]?50:0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!dist[i])continue;let d=dist[i];if(x)d=Math.min(d,dist[i-1]+1);if(y)d=Math.min(d,dist[i-w]+1);if(x&&y)d=Math.min(d,dist[i-w-1]+1);if(y&&x<w-1)d=Math.min(d,dist[i-w+1]+1);if(x===0||y===0||x===w-1)d=1;dist[i]=d;}
 for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(!dist[i])continue;let d=dist[i];if(x<w-1)d=Math.min(d,dist[i+1]+1);if(y<h-1)d=Math.min(d,dist[i+w]+1);if(x<w-1&&y<h-1)d=Math.min(d,dist[i+w+1]+1);if(y<h-1&&x)d=Math.min(d,dist[i+w-1]+1);dist[i]=d;}
 const M=new Uint8Array(w*h);let y0=h,y1=0,cnt=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!A[i])continue;const r=P[i*4]/255,gg=P[i*4+1]/255,b=P[i*4+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),d=mx-mn+1e-9;
  let hu=mx===r?((gg-b)/d)%6:mx===gg?(b-r)/d+2:(r-gg)/d+4;hu*=60;if(hu<0)hu+=360;const s=d/(mx+1e-9),v=mx;
  for(const z of cfg){if(hu<z.h[0]||hu>z.h[1]||s<z.s||v<z.v[0]||v>z.v[1])continue;if(y<top+z.y[0]*H||y>top+z.y[1]*H||x>=hx-z.bh*H||dist[i]>z.e)continue;M[i]=1;break;}
  if(M[i]){cnt++;if(y<y0)y0=y;if(y>y1)y1=y;}}
 if(cnt<12||y1-y0<6)return null;
 // the hair layer, and the body with the hair's outer edge cut away (inner hair stays as the layer under the swinging copy)
 const hc=document.createElement('canvas');hc.width=w;hc.height=h;const HD=g.createImageData(w,h);
 for(let i=0;i<w*h;i++)if(M[i]){for(let k=0;k<4;k++)HD.data[i*4+k]=P[i*4+k];if(dist[i]<=4)P[i*4+3]=0;}
 hc.getContext('2d').putImageData(HD,0,0);g.putImageData(D,0,0);
 return {body:cv,hair:hc,y0,y1,w,h};}
function hairGet(c,id,name){const k=id+'|'+name;if(!HAIR_C.has(k)){let r=null;try{r=c.a&&(c.a.complete!==false)?hairBuild(c,id):null;}catch(e){r=null;}if(!r&&c.a&&c.a.complete===false)return null;HAIR_C.set(k,r);}return HAIR_C.get(k);}
// spring per fighter, run once per drawn frame (wall clock; looks only)
function hairStep(f){const now=performance.now()/1000,H=f._hair||(f._hair={x:0,v:0,t:now,y:f.y||0,ph:Math.random()*6});
 const dt=clamp(now-H.t,0,0.05);H.t=now;if(!dt)return;
 const vxl=(f.vx||0)*f.dir;   // speed in his facing direction
 const air=(f.y||0)>2,land=H.y>4&&(f.y||0)<=1;if(land)H.v+=55;H.y=f.y||0;
 const tgt=clamp(-vxl*0.02,-6,6)+(air?-2.5:0)+Math.sin(now*2.4+H.ph)*0.9;
 H.v+=((tgt-H.x)*85-H.v*8)*dt;H.x+=H.v*dt;H.x=clamp(H.x,-8,8);}
// draws the frame with the hair bent; returns false to fall back to the plain frame
function hairDraw(c,name,sx,sy,dir,sw,sh){const f=HAIRF;if(!f||HAIR_SKIP.test(name))return false;const id=artId(f);
 const r=hairGet(c,id,name);if(!r)return false;const H=f._hair;const off=H?H.x:0;
 const fx=sw*SW/320,fy=sh*SH/224,X=-AX*sw+c.ox*fx,Y=sy-AY*sh+c.oy*fy;
 ctx.save();if(dir>=0)ctx.translate(sx,0);else{ctx.translate(sx,0);ctx.scale(-1,1);}
 ctx.drawImage(r.body,X,Y,r.w*fx,r.h*fy);
 const span=Math.max(1,r.y1-r.y0),B=2;
 for(let y=r.y0;y<=r.y1;y+=B){const t=clamp((y-r.y0)/span,0,1),dx=off*Math.pow(t,1.4);
  ctx.drawImage(r.hair,0,y,r.w,B,X+dx*fx,Y+y*fy,r.w*fx,B*fy);}
 ctx.restore();return true;}
