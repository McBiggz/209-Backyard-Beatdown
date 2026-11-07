// ================= DRAW: FIGHTER =================
let SHADE=false;
function parseCol(c){if(c[0]==='#'){const n=parseInt(c.slice(1),16);return[n>>16,(n>>8)&255,n&255,1];}const m=c.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]===undefined?1:+m[3]]:null;}
const mixc=(p,f)=>f<0?`rgb(${p[0]*(1+f)|0},${p[1]*(1+f)|0},${p[2]*(1+f)|0})`:`rgb(${p[0]+(255-p[0])*f|0},${p[1]+(255-p[1])*f|0},${p[2]+(255-p[2])*f|0})`;
function seg0(x1,y1,x2,y2,w,c){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function seg(x1,y1,x2,y2,w,c){
 if(!SHADE)return seg0(x1,y1,x2,y2,w,c);
 const p=parseCol(c);w*=1.12;if(!p||p[3]<1||w<7)return seg0(x1,y1,x2,y2,w,c);
 seg0(x1,y1,x2,y2,w,mixc(p,-0.3));
 const ox=w*0.1,oy=-w*0.13;seg0(x1+ox,y1+oy,x2+ox,y2+oy,w*0.7,c);
 const hx=w*0.2,hy=-w*0.25;seg0(x1+hx,y1+hy,x2+hx,y2+hy,w*0.26,mixc(p,0.3));}
function limb(x,y,a1,a2,l1,l2){const jx=x+Math.sin(a1)*l1,jy=y+Math.cos(a1)*l1,a=a1+a2;return[jx,jy,jx+Math.sin(a)*l2,jy+Math.cos(a)*l2];}
function drawFighter(f,sx,sy,sc=1,alpha=1){
 const ch=f.ch,P=f.pose,s=sc*ch.size;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(sx,sy);ctx.scale(f.dir*s*(f.turn==null?1:f.turn),s);
 ctx.translate(0,P.dy);ctx.rotate(P.rot);
 if(f.spin){ctx.translate(0,-58);ctx.rotate(f.spin);ctx.translate(0,58);}
 ctx.lineCap='round';ctx.lineJoin='round';
 const L1=27,L2=27,A1=21,A2=20,TL=44;
 const legEnd=a=>Math.cos(a[0])*L1+Math.cos(a[0]+a[1])*L2;
 const hipY=P.plant?-Math.max(legEnd(P.lf),legEnd(P.lb))-2:P.hipY;
 const lx=Math.sin(P.lean),ly=Math.cos(P.lean);
 const shx=lx*TL*0.88,shy=hipY-ly*TL*0.88, hdx=lx*(TL+13),hdy=hipY-ly*(TL+13);
 const skin=ch.skin,skinD=shade(ch.skin,-0.22);
 const leg=(a,back)=>{const[jx,jy,ex,ey]=limb(0,hipY,a[0],a[1],L1,L2);const c=back?skinD:skin;
  if(ch.jeans){const jb=typeof ch.jeans==='string'?ch.jeans:'#40597e',jc=back?shade(jb,-0.3):jb;seg(0,hipY,jx,jy,14,jc);seg(jx,jy,ex,ey,13,jc);if(!ch.jumpsuit&&!ch.noRip){ctx.fillStyle=back?shade(ch.skin,-0.25):ch.skin;ctx.fillRect(jx-3,jy-2,6,4);seg(jx-4,jy-3,jx+4,jy-3,1.2,'#dfe6ef');}}
  else if(ch.tights){const tc=back?shade(ch.trunks,-0.3):ch.trunks,sc=back?shade(ch.tights.stripe,-0.35):ch.tights.stripe;
   seg(0,hipY,jx,jy,13.5,tc);seg(jx,jy,ex,ey,12.5,tc);seg(0,hipY,jx,jy,4.5,sc);seg(jx,jy,ex,ey,4.5,sc);seg(0,hipY,jx,jy,1.3,ch.tights.line);seg(jx,jy,ex,ey,1.3,ch.tights.line);
   if(ch.tights.zebra){const zc=['#ff5ad8','#2fd3e0','#ffd35a','#a77bff'];for(let k=0;k<8;k++){const t0=0.08+k*0.11,onT=t0<0.5,u=onT?t0*2:(t0-0.5)*2,px=onT?jx*u:jx+(ex-jx)*u,py=onT?hipY+(jy-hipY)*u:jy+(ey-jy)*u;seg(px-4,py-1,px+3,py+2,2,back?shade(zc[k%4],-0.35):zc[k%4]);}}
   if(ch.tights.flames){ctx.fillStyle=sc;for(let k=0;k<3;k++){const t0=0.15+k*0.25,px=jx*t0,py=hipY+(jy-hipY)*t0;ctx.beginPath();ctx.moveTo(px-5,py+4);ctx.lineTo(px+1,py-7);ctx.lineTo(px+5,py+4);ctx.fill();}}}
  else if(ch.pants){const pc=back?'#0a0a0a':'#1d1d1d';seg(0,hipY,jx,jy,13,pc);seg(jx,jy,ex,ey,12,pc);}
  else{seg(0,hipY,jx,jy,13,c);seg(jx,jy,ex,ey,12,c);seg(0,hipY,jx*(ch.longShorts?0.8:0.4),hipY+(jy-hipY)*(ch.longShorts?0.8:0.4),14.5,back?shade(ch.trunks,-0.3):ch.trunks);
   if(ch.knee)seg(jx,jy,jx+(ex-jx)*0.4,jy+(ey-jy)*0.4,13.5,back?shade(ch.knee,-0.2):ch.knee);else{ctx.fillStyle=back?shade(ch.boots,-0.2):ch.boots;ctx.beginPath();ctx.arc(jx,jy,6.5,0,7);ctx.fill();}}
  const bx=jx+(ex-jx)*0.45,by=jy+(ey-jy)*0.45;seg(bx,by,ex,ey,14,back?shade(ch.boots,-0.25):ch.boots);
  const fa=a[0]+a[1];seg(ex,ey,ex+Math.cos(fa)*9,ey-Math.sin(fa)*9+0,10,back?shade(ch.boots,-0.25):ch.boots);
  if(!ch.pants&&ch.accent){seg(bx,by,bx+(ex-bx)*0.12,by+(ey-by)*0.12,14.5,back?shade(ch.accent,-0.3):ch.accent);}
 };
 const arm=(a,back)=>{const[jx,jy,ex,ey]=limb(shx,shy,a[0],a[1],A1,A2);const c=back?skinD:skin;
  seg(shx,shy,jx,jy,11,c);seg(jx,jy,ex,ey,10,c);
  if(ch.tats){seg(shx+(jx-shx)*0.2,shy+(jy-shy)*0.2,jx,jy,7.5,ch.tatC||(back?'rgba(20,70,70,0.55)':'rgba(25,115,108,0.55)'));if(ch.yinyang&&!back){const mx=(shx+jx)/2,my=(shy+jy)/2;ctx.fillStyle='#eee';ctx.beginPath();ctx.arc(mx,my,3.4,0,7);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(mx,my,3.4,-1.57,1.57);ctx.fill();}seg(jx+(ex-jx)*0.25,jy+(ey-jy)*0.25,jx+(ex-jx)*0.6,jy+(ey-jy)*0.6,6.5,'rgba(40,45,60,0.5)');}
  if(ch.openShirt&&!ch.openShirt.vest){const sc=back?shade(ch.openShirt.c,-0.3):ch.openShirt.c;if(ch.openShirt.long){seg(shx,shy,jx,jy,13.5,sc);if(ch.openShirt.star&&!back){const mx=shx+(jx-shx)*0.35,my=shy+(jy-shy)*0.35;ctx.fillStyle='#f2f2f2';ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?1.6:4,a=k*Math.PI/5-1.57;ctx.lineTo(mx+Math.cos(a)*r,my+Math.sin(a)*r);}ctx.fill();}seg(jx,jy,jx+(ex-jx)*0.8,jy+(ey-jy)*0.8,12.5,sc);seg(jx+(ex-jx)*0.72,jy+(ey-jy)*0.72,jx+(ex-jx)*0.8,jy+(ey-jy)*0.8,13,back?shade(ch.openShirt.trim,-0.3):ch.openShirt.trim);}
   else{seg(shx,shy,shx+(jx-shx)*0.7,shy+(jy-shy)*0.7,14,sc);seg(shx+(jx-shx)*0.62,shy+(jy-shy)*0.62,shx+(jx-shx)*0.72,shy+(jy-shy)*0.72,14.5,back?shade(ch.openShirt.trim,-0.3):ch.openShirt.trim);}}
  if(ch.armWrap&&!back){seg(shx+(jx-shx)*0.15,shy+(jy-shy)*0.15,shx+(jx-shx)*0.75,shy+(jy-shy)*0.75,12,'#eeeeee');seg(shx+(jx-shx)*0.4,shy+(jy-shy)*0.4,shx+(jx-shx)*0.5,shy+(jy-shy)*0.5,12.5,'#2fa6a0');}
  if(ch.armSleeve){const ac=back?'#2a4fb0':'#121212';seg(jx,jy,jx+(ex-jx)*0.85,jy+(ey-jy)*0.85,11.5,ac);if(!back)for(let k=0;k<3;k++){const t0=0.2+k*0.2;seg(jx+(ex-jx)*t0,jy+(ey-jy)*t0,jx+(ex-jx)*(t0+0.07),jy+(ey-jy)*(t0+0.07),12,'#f2f2f2');}else{ctx.fillStyle='#c0161d';ctx.fillRect(jx+(ex-jx)*0.4-2,jy+(ey-jy)*0.4-2,4,4);}}
  if(ch.elbow)seg(jx-(jx-shx)*0.18,jy-(jy-shy)*0.18,jx+(ex-jx)*0.22,jy+(ey-jy)*0.22,12,back?shade(ch.elbow,-0.2):ch.elbow);
  if(ch.shirt)seg(shx,shy,shx+(jx-shx)*0.55,shy+(jy-shy)*0.55,12.5,back?'#cfcfcf':'#f2f2f2');
  ctx.fillStyle=back?'#bbb':'#f4f4f4';if(!ch.shirt&&!(ch.openShirt&&ch.openShirt.long)){const wc=ch.wrist?(back?shade(ch.wrist,-0.2):ch.wrist):(back?'#c9c9c9':'#f4f4f4');seg(jx+(ex-jx)*(ch.bigTape?0.5:0.72),jy+(ey-jy)*(ch.bigTape?0.5:0.72),ex,ey,ch.bigTape?12.5:11,wc);}
  ctx.fillStyle=ch.gloves?'#141414':ch.bigTape?(back?'#cfcfcf':'#f4f4f4'):c;ctx.beginPath();ctx.arc(ex,ey,6.2,0,7);ctx.fill();
 };
 arm(P.ab,true);leg(P.lb,true);
 // torso
 ctx.save();ctx.translate(0,hipY);ctx.rotate(P.lean);
 const tw=13*(ch.id==='bigmf'?1.15:1);
 ctx.fillStyle=ch.shirt?'#f2f2f2':(ch.tee||skin);rr(-tw,-TL-4,tw*2,TL+8,9);ctx.fill();
 if(ch.shirt){ctx.fillStyle='#111';for(const x of [-9,-3,3,9]){ctx.fillRect(x-1.5,-TL-2,3,TL+2);}}
 else{if(SHADE){ctx.fillStyle=shade(ch.skin,-0.3);ctx.fillRect(-tw,-TL-2,5,TL+2);ctx.fillStyle=shade(ch.skin,0.28);ctx.fillRect(tw-6,-TL+2,3,14);ctx.fillRect(tw-7,-TL+20,2,3);ctx.fillRect(tw-7,-TL+27,2,3);
   ctx.fillStyle=shade(ch.skin,-0.25);ctx.fillRect(-2,-TL+17,tw+1,2);ctx.fillRect(2,-TL+24,tw-4,1.4);ctx.fillRect(2,-TL+31,tw-4,1.4);}
  ctx.strokeStyle=shade(ch.skin,-0.18);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-2,-TL+12);ctx.quadraticCurveTo(6,-TL+18,tw-1,-TL+13);ctx.stroke();
  ctx.beginPath();ctx.moveTo(2,-TL+24);ctx.lineTo(2,-10);ctx.stroke();
  if(ch.tats&&ch.tights){ctx.fillStyle='rgba(30,32,42,0.7)';ctx.beginPath();ctx.ellipse(-4,-TL+13,9,3.6,-0.35,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(6,-TL+13,8,3.6,0.35,0,7);ctx.fill();
   ctx.fillStyle='rgba(160,28,38,0.85)';ctx.beginPath();ctx.arc(1,-TL+15,3.4,0,7);ctx.fill();ctx.fillStyle='rgba(30,110,100,0.5)';ctx.fillRect(-tw+2,-TL+28,5,10);}}
 if(!ch.pants){ctx.fillStyle=ch.trunks;rr(-tw-1,-14,tw*2+2,18,5);ctx.fill();ctx.fillStyle=ch.accent;ctx.fillRect(-tw-1,-14,tw*2+2,3.5);
  if(ch.sparkle){ctx.fillStyle='#fff';for(let i=0;i<4;i++){const px=-8+i*5.5,py=-8+((i*7)%5);ctx.fillRect(px,py,2,2);}}}
 else{ctx.fillStyle='#1d1d1d';rr(-tw-1,-10,tw*2+2,14,4);ctx.fill();}
 if(ch.jeans){ctx.fillStyle=typeof ch.jeans==='string'?ch.jeans:'#40597e';rr(-tw-1,-12,tw*2+2,16,4);ctx.fill();if(!ch.jumpsuit&&!ch.noRip){ctx.fillStyle='#d8d8d8';ctx.fillRect(-tw-1,-13,tw*2+2,3);}}
 if(ch.jumpsuit){ctx.fillStyle='#141414';ctx.beginPath();ctx.moveTo(tw-9,-TL-3);ctx.lineTo(tw,-TL-3);ctx.lineTo(tw-3,-TL+8);ctx.fill();ctx.fillStyle='#f4efe0';ctx.fillRect(tw-10,-TL+16,8,4);}
 if(ch.belly){ctx.fillStyle=ch.tee||ch.skin;ctx.beginPath();ctx.ellipse(tw-3,-19,7,11,0,0,7);ctx.fill();ctx.fillStyle=shade(ch.skin,-0.2);ctx.fillRect(tw+1,-18,1.5,1.5);}
 if(ch.camo){ctx.fillStyle='#1a1f3a';for(let k=0;k<6;k++)ctx.fillRect(-tw+1+((k*7)%(tw*2-3)),-12+((k*5)%12),3,2);}
 if(ch.teeArt){ctx.fillStyle='#e8e8e8';ctx.fillRect(-tw*0.2+3,-TL+12,tw*0.9,7);ctx.fillStyle='#c0161d';ctx.fillRect(-tw*0.2+3,-TL+10,tw*0.9,1.6);ctx.fillRect(-tw*0.2+4,-TL+14,2,3);}
 if(ch.waistBelt){ctx.fillStyle='#1a1a1a';ctx.fillRect(-tw-1.5,-17,tw*2+3,6);ctx.fillStyle='#c9cdd4';rr(tw-11,-21,13,13,3);ctx.fill();ctx.fillStyle='#2d6fd6';ctx.beginPath();ctx.ellipse(tw-4.5,-14.5,3.5,3,0,0,7);ctx.fill();}
 if(ch.singlet){ctx.fillStyle='#7a4a32';rr(tw-11,-TL+16,10,11,2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(tw-9,-TL+19,2,1.5);ctx.fillRect(tw-5,-TL+19,2,1.5);ctx.fillStyle='#2fa6e0';ctx.fillRect(tw-12,-TL+30,11,2);ctx.fillRect(tw-12,-TL+33.5,11,2);}
 if(ch.gigaTop){ctx.fillStyle='#f2f2f2';ctx.fillRect(-tw,-TL-4,tw*2,15);ctx.fillStyle='#2a5fd0';ctx.fillRect(-tw,-TL-4,tw*2,3);ctx.fillRect(-tw,-TL+10,tw*2,1.5);ctx.fillStyle='#f2c230';ctx.fillRect(tw-3,-TL-2,1.6,TL-8);}
 if(ch.beads){ctx.fillStyle='#2a2a30';for(let k=0;k<6;k++){ctx.beginPath();ctx.arc(tw-9+k*1.6,-TL+1+k*2.4,1.5,0,7);ctx.fill();}}
 if(ch.trunkText){ctx.fillStyle='#f2f2f2';ctx.fillRect(-tw+3,-8,tw*2-6,2);ctx.fillRect(-tw+5,-4,tw*2-12,2);}
 if(ch.openShirt){const O=ch.openShirt;ctx.fillStyle=O.c;rr(-tw-1.5,-TL-5,tw*1.3,TL+9,7);ctx.fill();ctx.fillStyle=O.trim;ctx.fillRect(-tw*0.2-1,-TL-3,4,TL+6);rr(-tw-1.5,-TL-7,tw*1.6,7,3);ctx.fill();
  if(O.spots){ctx.fillStyle='#2a1a0a';for(let k=0;k<7;k++)ctx.fillRect(-tw*0.2+((k*5)%3)-0.5,-TL+k*6,1.6,1.6);for(let k=0;k<4;k++)ctx.fillRect(-tw+2+k*5,-TL-5+(k%2)*2,1.6,1.6);ctx.fillStyle='rgba(255,215,120,0.55)';ctx.fillRect(-tw+3,-TL+12,5,2);ctx.fillRect(-tw+6,-TL+26,4,2);}
  if(O.tie){ctx.fillStyle='#ff7ab8';ctx.fillRect(-tw+1,-TL+4,6,7);ctx.fillStyle='#2fd3e0';ctx.fillRect(-tw+4,-TL+18,7,6);ctx.fillStyle='#a7e06b';ctx.fillRect(-tw+1,-TL+30,5,5);}
  if(O.fringe){const fc=['#2fd3e0','#ff7ab8','#f2c94c','#ffffff'];for(let k=0;k<6;k++){ctx.fillStyle=fc[k%4];ctx.fillRect(-tw+k*3.6,4,1.6,5+(k%3)*2);}}
  if(O.emb){ctx.fillStyle=O.emb;ctx.fillRect(-tw*0.2+5,-TL+10,6,1.5);}}
 if(ch.chain){ctx.strokeStyle='#d6dae0';ctx.lineWidth=1.6;for(let k=0;k<7;k++){const a=-1.2+k*0.42;ctx.beginPath();ctx.ellipse(Math.sin(a)*tw*0.95+2,-TL+6+Math.cos(a)*-1+k*2.6,2,1.5,a,0,7);ctx.stroke();}}
 if(ch.belt){ctx.strokeStyle='#e8b923';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-tw+2,-TL+2);ctx.lineTo(tw-2,-16);ctx.stroke();
  ctx.fillStyle='#ffd84a';ctx.strokeStyle='#8a6a10';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(1,-TL*0.55,7.5,5.5,-0.6,0,7);ctx.fill();ctx.stroke();}
 ctx.restore();
 leg(P.lf,false);
 // head
 ctx.save();ctx.translate(hdx,hdy);ctx.rotate(P.lean*0.4);drawHead(ch);ctx.restore();
 arm(P.af,false);
 ctx.restore();
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawHead(ch){
 const R=12;
 if(ch.hair==='hood'){ctx.fillStyle=ch.hood;ctx.beginPath();ctx.arc(-1,-1,R+3.5,Math.PI*0.45,Math.PI*1.95);ctx.lineTo(-4,16);ctx.closePath();ctx.fill();}
 if(ch.hair==='long'||ch.hair==='mask'||ch.hair==='skull'){ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.moveTo(-4,-12);ctx.quadraticCurveTo(-22,-6,-18,22);ctx.lineTo(-6,16);ctx.quadraticCurveTo(-2,0,6,-11);ctx.closePath();ctx.fill();}
 ctx.fillStyle=ch.skin;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();
 ctx.beginPath();ctx.moveTo(10,-2);ctx.lineTo(14.5,3);ctx.lineTo(10,5);ctx.fill(); // nose
 ctx.fillStyle='#1b1b1b';
 switch(ch.hair){
  case 'spiky':ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.arc(0,-1,R+0.5,Math.PI*1.02,Math.PI*1.95);ctx.fill();
   for(let i=0;i<5;i++){const a=Math.PI*(1.05+i*0.2);ctx.fillStyle=i%2?'#c0161d':ch.hairC;ctx.beginPath();ctx.moveTo(Math.cos(a-0.2)*R,Math.sin(a-0.2)*R);ctx.lineTo(Math.cos(a)*(R+10)-3,Math.sin(a)*(R+10));ctx.lineTo(Math.cos(a+0.2)*R,Math.sin(a+0.2)*R);ctx.fill();}
   ctx.fillStyle='#ff9a1f';ctx.beginPath();ctx.moveTo(-2,-10);ctx.lineTo(-8,-22);ctx.lineTo(2,-11);ctx.fill();ctx.beginPath();ctx.moveTo(4,-11);ctx.lineTo(4,-24);ctx.lineTo(8,-10);ctx.fill();break;
  case 'mullet':ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.arc(0,-2,R+2,Math.PI*0.9,Math.PI*1.88);ctx.fill();ctx.beginPath();ctx.moveTo(-6,-10);ctx.quadraticCurveTo(-24,0,-16,24);ctx.lineTo(-10,20);ctx.quadraticCurveTo(-14,10,-3,4);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(-4,-13);ctx.quadraticCurveTo(9,-17,12,-8);ctx.quadraticCurveTo(6,-11,1,-9);ctx.fill();break;
  case 'skull':ctx.fillStyle='#d4d8de';ctx.beginPath();ctx.arc(0,0,R+0.6,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(10,-2);ctx.lineTo(14.5,3);ctx.lineTo(10,5);ctx.fill();
   ctx.fillStyle='#0b0b0b';ctx.beginPath();ctx.moveTo(1,-1);ctx.lineTo(14,1);ctx.lineTo(12,12);ctx.lineTo(2,10);ctx.closePath();ctx.fill();
   ctx.fillStyle='#fff';for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(3+k*3.5,-1);ctx.lineTo(4.5+k*3.5,4);ctx.lineTo(6+k*3.5,-0.5);ctx.fill();ctx.beginPath();ctx.moveTo(3+k*3.5,10);ctx.lineTo(4.5+k*3.5,6);ctx.lineTo(6+k*3.5,10.5);ctx.fill();}
   ctx.fillStyle='#111';ctx.fillRect(4,-6,4,2);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(2,-12);ctx.lineTo(5,-8);ctx.lineTo(2,-6);ctx.lineTo(-1,-8);ctx.fill();
   ctx.fillStyle='#d6283a';ctx.beginPath();ctx.arc(-6,3,2.6,0,7);ctx.arc(-3,7,2.2,0,7);ctx.fill();break;
  case 'mask':ctx.fillStyle='#0d0d0f';ctx.beginPath();ctx.arc(0,0,R+0.6,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(10,-2);ctx.lineTo(14.5,3);ctx.lineTo(10,5);ctx.fill();
   ctx.fillStyle='#d8dde4';ctx.beginPath();ctx.moveTo(6,-8);ctx.lineTo(10,-3);ctx.lineTo(6,2);ctx.lineTo(2,-3);ctx.closePath();ctx.fill();ctx.fillRect(4,5,8,3.5);
   ctx.strokeStyle='#c0161d';ctx.lineWidth=1.3;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-3+k*2.2,4);ctx.lineTo(-1+k*2.2,9);ctx.stroke();}ctx.strokeStyle='#888';ctx.beginPath();ctx.moveTo(-11,-2);ctx.lineTo(9,-11);ctx.stroke();break;
  case 'fade':ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.arc(0,-1,R+0.8,Math.PI*1.0,Math.PI*1.9);ctx.fill();ctx.fillStyle='rgba(18,16,16,0.45)';ctx.fillRect(-R,-4,7,8);break;
  case 'hood':ctx.fillStyle=ch.hairC;ctx.fillRect(-4,-12,14,4);ctx.fillStyle=ch.hood;ctx.beginPath();ctx.arc(-1,-1,R+3.5,Math.PI*1.05,Math.PI*1.72);ctx.lineTo(2,-11);ctx.closePath();ctx.fill();
   if(ch.oni){ctx.fillStyle='#aeb6cc';ctx.fillRect(1,1,13,10);ctx.fillStyle='#3a5ab8';ctx.fillRect(3,3,9,1.5);ctx.fillRect(2,7,11,1.2);ctx.fillStyle='#fff';ctx.fillRect(4,8.5,2,2.5);ctx.fillRect(9,8.5,2,2.5);ctx.fillStyle='#d9b64a';ctx.fillRect(12,4,2,4);}break;
  case 'bandana':ctx.fillStyle=ch.bandana;ctx.beginPath();ctx.arc(0,-1,R+1.3,Math.PI*0.95,Math.PI*1.98);ctx.fill();ctx.fillRect(-R-1,-5,R*2+2,3);ctx.fillStyle='#fff';for(let k=0;k<4;k++)ctx.fillRect(-8+k*5,-9+(k%2)*2,1.5,1.5);
   ctx.fillStyle=ch.bandana;ctx.beginPath();ctx.moveTo(-11,-5);ctx.lineTo(-19,-2);ctx.lineTo(-13,1);ctx.fill();break;
  case 'short':ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.arc(0,-1,R+1.2,Math.PI*0.92,Math.PI*1.9);ctx.fill();
   ctx.beginPath();ctx.moveTo(-12,-6);ctx.quadraticCurveTo(-2,-19,13,-9);ctx.quadraticCurveTo(4,-11,-2,-7);ctx.fill();ctx.fillRect(-11,-6,5,9);break;
  case 'mohawk':for(let i=0;i<5;i++){const x=-9+i*4.2;ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.moveTo(x-3,-9+Math.abs(x)*0.3);ctx.lineTo(x-4,-24+Math.abs(x)*0.5);ctx.lineTo(x+3,-10+Math.abs(x)*0.3);ctx.fill();}
   ctx.fillStyle='#111';ctx.fillRect(2,-3,9,3);break; // shades
  case 'beard':ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.arc(0,-1,R+0.5,Math.PI*1.0,Math.PI*1.9);ctx.fill();
   ctx.beginPath();ctx.moveTo(-6,4);ctx.quadraticCurveTo(2,18,13,7);ctx.lineTo(10,5);ctx.quadraticCurveTo(2,9,-3,2);ctx.fill();break;
  case 'long':ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.arc(0,-1,R+1,Math.PI*0.95,Math.PI*1.85);ctx.fill();break;
  case 'bald':ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.ellipse(-2,-7,4,2.2,-0.4,0,7);ctx.fill();break;
 }
 if(ch.beard){ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.moveTo(-7,3);ctx.quadraticCurveTo(0,20,13,7);ctx.lineTo(10,4);ctx.quadraticCurveTo(2,10,-4,1);ctx.fill();}
 if(ch.stache){ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.moveTo(5,3);ctx.quadraticCurveTo(10,1,14,5);ctx.lineTo(13,6.5);ctx.quadraticCurveTo(9,4,5,5);ctx.fill();ctx.fillStyle='rgba(220,220,220,0.35)';ctx.fillRect(0,8,5,3);}
 if(ch.goatee){ctx.fillStyle=ch.hairC;ctx.beginPath();ctx.moveTo(4,4);ctx.quadraticCurveTo(5,15,11,12);ctx.lineTo(13,6);ctx.lineTo(11,8);ctx.quadraticCurveTo(8,10,6,4);ctx.fill();ctx.fillRect(5,2.5,8,1.6);}
 if(ch.tongue){ctx.fillStyle='#e0607a';ctx.fillRect(8,8,3,4);}
 if(ch.smile){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(5,5);ctx.quadraticCurveTo(9,10,13,5);ctx.closePath();ctx.fill();}
 if(ch.loud){ctx.fillStyle='#3a0d0d';ctx.beginPath();ctx.ellipse(8.5,6.5,3,3.6,0,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(6.5,3,4,1.2);}
 if(ch.hair!=='mohawk'&&ch.hair!=='mask'&&ch.hair!=='skull'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(6,-2,2.6,0,7);ctx.fill();ctx.fillStyle=ch.eye||'#111';ctx.beginPath();ctx.arc(7,-2,1.4,0,7);ctx.fill();}
 ctx.strokeStyle='#111';ctx.lineWidth=1.6;ctx.beginPath();
 if(ch.align==='heel'||ch.id==='dragon'){ctx.moveTo(2,-7);ctx.lineTo(10,-4);}else{ctx.moveTo(2,-6);ctx.lineTo(10,-6);}ctx.stroke();
 if(ch.id==='ref'){ctx.fillStyle=ch.hairC;ctx.fillRect(5,3,8,2);}
}



