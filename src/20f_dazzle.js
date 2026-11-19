// ================= DAZZLE (test link) =================
// Entrance: when he hits the pose, a spinning rainbow burst behind him, a glint off his shades, and "DAZZLED!" in 90s lettering.
// In a match: the first time the crowd goes ON FIRE, Razzle slides in at the corner of the screen and they throw up "TEAM RAD!".
// All looks only: nothing here touches the sim (own clock, own state).
const DAZ_ID='razzle',RAZ_ID='razz',RAD_COLS=['#ff3fb4','#ffe13a','#2fe0d6','#9b5cff'];
const isDazzle=f=>!!(f&&f.ch&&f.ch.id.replace('_alt','')===DAZ_ID);
function figBox(set,n,x,y,dir,sc){const q=set&&set[n];if(!q||!q.w)return null;const l=(q.ox*0.5-AX)*sc,w=q.w*0.5*sc;
 return {l:dir>=0?x+l:x-l-w,t:y+(q.oy*0.5-AY)*sc,w,h:q.h*0.5*sc};}
// bubbly 90s word: every letter its own neon colour, black outline, teal drop shadow, a little bounce, tilted, slams in
function rad90s(word,cx,cy,sc,k,t){const n=word.length,lw=TW('W',sc)+sc;let x0=cx-n*lw/2;
 const s=k<1?1+1.4*(1-k)*(1-k):1;ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.1);ctx.scale(s,s);ctx.translate(-cx,-cy);ctx.globalAlpha=Math.min(1,k*2);
 for(let i=0;i<n;i++){const ch=word[i];if(ch===' '){x0+=lw;continue;}const by=Math.round(Math.sin(t*7+i*0.8)*1.5),x=x0+lw/2;
  T(ch,x+2,cy+by+2,sc,'#1a8f9a','center',null);T(ch,x,cy+by,sc,RAD_COLS[i%4],'center','#000');x0+=lw;}
 ctx.restore();ctx.globalAlpha=1;}
function rainbowBurst(cx,cy,r,a,t){if(a<=0.01)return;ctx.save();ctx.globalAlpha=a;ctx.translate(cx,cy);ctx.rotate(t*0.6);const N=16;
 for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+0.5)/N*Math.PI*2;ctx.fillStyle=RAD_COLS[i%4];ctx.beginPath();ctx.moveTo(0,0);
  ctx.lineTo(Math.cos(a0)*r,Math.sin(a0)*r);ctx.lineTo(Math.cos(a1)*r,Math.sin(a1)*r);ctx.closePath();ctx.fill();}
 const g=ctx.createRadialGradient(0,0,4,0,0,r*0.55);g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();}
function glint(x,y,k){if(k<=0||k>=1)return;const s=Math.sin(k*Math.PI),L=3+14*s;ctx.save();ctx.translate(x,y);ctx.rotate(k*1.2);ctx.globalAlpha=s;ctx.fillStyle='#fff';
 for(const r of [0,Math.PI/2]){ctx.save();ctx.rotate(r);ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(0,-1.6);ctx.lineTo(L,0);ctx.lineTo(0,1.6);ctx.closePath();ctx.fill();ctx.restore();}
 ctx.beginPath();ctx.arc(0,0,1.5+2*s,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;}
// entrance hooks (called from drawEntranceShowFx)
function dazBehind(f,fr,x,y,sc,t){if(!TEST_MODES||!isDazzle(f)||t<ENT_POSE)return;const b=figBox(f.set,fr,x,y,1,sc);if(!b)return;
 const k=clamp((t-ENT_POSE)/0.3,0,1);rainbowBurst(b.l+b.w*0.5,b.t+b.h*0.38,40+70*k,0.55*k,G.t);}
function dazFront(f,fr,x,y,sc,t){if(!TEST_MODES||!isDazzle(f)||t<ENT_POSE)return;const b=figBox(f.set,fr,x,y,1,sc);if(!b)return;
 const p=t-ENT_POSE,gx=b.l+b.w*(fr==='entp'?0.62:0.55),gy=b.t+b.h*(fr==='entp'?0.11:0.12);
 if(p<0.02&&!f._dazTing){f._dazTing=1;sfx('count');}glint(gx,gy,(p-0.08)/0.4);glint(gx,gy,(p-1.3)/0.4);
 if(p>0.25)rad90s('DAZZLED!',b.l+b.w*0.5,Math.max(48,b.t-18),3,clamp((p-0.25)/0.18,0,1),G.t);}
// in a match: TEAM RAD cameo
const teamRad={m:null,t0:-1};
function drawTeamRad(){if(!TEST_MODES||G.scene!=='fight'||G.entrance||!G.f||!G.f[0])return;
 if(teamRad.m!==G.f[0]){teamRad.m=G.f[0];teamRad.t0=-1;}
 const daz=G.f.find(isDazzle),R=SETS[RAZ_ID];if(!daz||!R||G.f.some(f=>f&&f.ch&&f.ch.id===RAZ_ID))return;
 const now=performance.now()/1000;if(teamRad.t0<0){if(G.crowdHot&&!G.over&&!G.pin){teamRad.t0=now;sfx('roar');}else return;}
 const p=now-teamRad.t0;if(p>3.6)return;
 const slide=p<0.3?p/0.3:p>3.2?1-(p-3.2)/0.4:1,e=slide*slide*(3-2*slide),fr=R.sig?'sig':'win0',sc=1.25*((ROSTER.find(c=>c.id===RAZ_ID)||{}).drawScale||1);
 const x=lerp(-60,58,e),y=H-14,b=figBox(R,fr,x,y,1,sc);
 if(b)rainbowBurst(b.l+b.w/2,b.t+b.h*0.4,30+40*e,0.5*e,now);
 drawSpr(R,fr,x,y,1,sc);
 if(p>0.35&&p<3.3)rad90s('TEAM RAD!',W/2,62,3,clamp((p-0.35)/0.18,0,1),now);}
