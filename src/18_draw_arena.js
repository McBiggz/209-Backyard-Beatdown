// ================= DRAW: ARENA (pixel art) =================
const CROWD=[];
(function(){const pal=['#c83a3a','#3a5ac8','#e0e0e0','#3a8a4a','#d8a030','#7a3aa8','#2a2a2a','#e07a2a','#4ab0c8','#a83a6a'],skins=['#e8bc98','#d09a72','#b07a52','#8a5a3a','#5e3a26'],hair=['#1a1210','#3a2418','#6a4a2a','#c8a060','#2a2a2a','#888'];
 const signs=['209','DEN!','PAPI','VIRAL','BIG MF','BOO','LODI','DAZZLE','GIGA'];
 for(let row=0;row<3;row++)for(let i=0;i<31;i++)CROWD.push({x:i*13+(row%2)*6+((i*5+row*3)%4)-4,y:[24,40,56][row],row,c:pick(pal),s:pick(skins),h:pick(hair),ph:rnd(6.28),sp:rnd(0.8,1.3),sign:Math.random()<0.07?pick(signs):null,arm:Math.random()<0.5});})();
function drawCrowd(minRow=0){const amp=1+G.hype*3,spd=4+G.hype*7;
 for(const c of CROWD){if(c.row<minRow)continue;const b=Math.round(Math.abs(Math.sin(G.t*spd*c.sp+c.ph))*amp),x=c.x,y=c.y-b,dk=(2-c.row)*0.16;
  const sc=shade(c.c,-dk),sk=shade(c.s,-dk);
  if(G.hype>0.55&&c.arm){R(x-8,y-22,2,12,sc);R(x+6,y-22,2,12,sc);R(x-8,y-24,2,2,sk);R(x+6,y-24,2,2,sk);}
  R(x-6,y-10,12,13,sc);R(x+3,y-10,3,13,shade(c.c,-dk-0.25));R(x-6,y-10,12,1,shade(c.c,0.2-dk));
  R(x-3,y-18,7,8,sk);R(x+2,y-18,2,8,shade(c.s,-dk-0.2));R(x-3,y-19,7,3,shade(c.h,-dk));R(x-3,y-17,1,3,shade(c.h,-dk));
  R(x-1,y-15,1,1,'#1a1010');R(x+2,y-15,1,1,'#1a1010');if(G.hype>0.5)R(x,y-12,2,1,'#5a1a1a');
  if(c.sign){const w=TW(c.sign)+6;R(x-w/2,y-30,w,8,'#f4efe0');R(x-w/2,y-23,w,1,'#9a948a');T(c.sign,x,y-29,1,'#b01018','center',null);}}}
function drawBarricade(dark){const top=60,bot=94;R(0,top,W,bot-top,dark?'#0a0710':'#3a3a40');
 for(let x=1;x<W;x+=3)R(x,top+3,1,bot-top-3,dark?'#4a4a5a':'#6a6a74');
 [top,top+16,bot-3].forEach(y=>{R(0,y,W,3,'#a8a8b8');R(0,y,W,1,'#e8e8f0');R(0,y+2,W,1,'#5a5a68');});
 for(let x=12;x<W;x+=60){R(x,top,4,bot-top,'#8a8a98');R(x,top,1,bot-top,'#d8d8e4');R(x+3,top,1,bot-top,'#4a4a56');}}
function drawArena(){if(G.stage===3){ctx.drawImage(PANO,-Math.round(G.cam*2)/2,0,MAPW,H);if(G.entrance){const p=0.25+0.15*Math.sin(G.t*8);ELL(PX(513,158),158,34,7,`rgba(190,80,255,${p.toFixed(2)})`);}return;}if(G.stage===2){ctx.drawImage(ARENA_IMG,0,0,W,H);return;}if(G.stage===1){drawOutdoor();return;}
 R(0,0,W,H,'#0c0710');for(let y=0;y<60;y+=4)R(0,y,W,1,'rgba(255,255,255,0.015)');
 drawCrowd();drawBarricade(true);R(0,94,W,H-94,'#0a0610');}
function drawOutdoor(){
 const sky=['#2a6fd6','#3479da','#3f84df','#4b90e4','#5a9de9','#6aaaed','#7cb8f1','#8fc5f4'];sky.forEach((c,i)=>R(0,i*8,W,8,c));
 DISC(350,14,7,'#fff3b8');DISC(350,14,5,'#fffbe6');
 for(let i=0;i<3;i++){const x=Math.round(((G.t*4+i*150)%520)-60),y=8+(i*9)%16;DISC(x,y,5,'#fff');DISC(x+7,y-2,6,'#fff');DISC(x+14,y+1,4,'#fff');}
 for(const[x,h]of[[22,30],[96,26],[300,30],[372,24]]){R(x-2,40-h+20,4,h,'#5a4030');DISC(x,30-h/3,12,'#2f6a2a');DISC(x-5,25-h/3,8,'#3f8a35');DISC(x+5,23-h/3,6,'#4f9a40');}
 R(150,6,84,34,'#f2d23a');R(150,28,84,6,'#e04aa0');R(158,10,46,12,'#2a1a20');T('TACOS',220,10,1,'#c0161d','center','#000');T('209 GRILL',192,29,1,'#fff','center',null);
 R(0,40,W,H-40,'#7a7468');drawCrowd(1);drawBarricade(false);R(0,94,W,H-94,'#6e695e');}
const RC=['#d91c22','#f2f2f2','#1f4fd1'];
const ropeCol=i=>G.stage===1?'#161616':RC[i];
function corner(sx,sz){return[PX(sx*RX,sz),PY(sz)];}
function post(x,yb,h,w){const pc=G.stage===1?['#17702e','#5fe07a','#0e4a1e']:['#8a8a96','#d8d8e4','#4a4a56'];R(x-(w>>1),yb-h,w,h,pc[0]);R(x-(w>>1),yb-h,1,h,pc[1]);R(x+(w>>1),yb-h,1,h,pc[2]);}
function pad(x,y,w,h){const c=G.stage===1?['#141414','#3a3a3a']:['#2448c0','#6a8ae8'];R(x-(w>>1),y,w,h,c[0]);R(x-(w>>1),y,w,1,c[1]);R(x-(w>>1),y,1,h,c[1]);R(x-(w>>1),y+h-1,w,1,'#0a1440');}
function ropeY(front,i){return front?[14,27,40][i]:[10,20,30][i];}
function ropeOff(side){const r=G.rope;if(r.side!==side||r.t>0.6)return 0;return Math.round(Math.sin(r.t*40)*3*(1-r.t/0.6));}
function rope(x0,y0,x1,y1,c,thick){LN(x0,y0,x1,y1,c);if(thick)LN(x0,y0+1,x1,y1+1,shade(c==='#161616'?'#3a3a3a':c,-0.4));}
function drawRingBack(){if(G.stage>=2)return;
 const yb=Math.round(PY(RZB)),yf=Math.round(PY(RZF));
 const mc=G.stage===1?['#20263a','#242a3f','#282f45','#2c344b']:['#8a8ab6','#9292be','#9a9ac6','#a2a2ce'];
 for(let y=yb;y<=yf;y++){const z=zAtY(y),xl=PX(-RX-8,z),xr=PX(RX+8,z);R(xl,y,xr-xl,1,mc[Math.min(3,Math.floor((y-yb)/(yf-yb+1)*4))]);}
 R(PX(-RX-8,RZB),yb,PX(RX+8,RZB)-PX(-RX-8,RZB),1,G.stage===1?'#3a4058':'#c4c4e4');
 logo('M',192,Math.round(PY(30)),G.stage===1?0.6:0.55);
 // apron
 const ab=yf+1;R(0,ab,W,H-ab,G.stage===1?'#141414':'#1c3aa8');
 if(G.stage!==1){R(0,ab,W,2,'#4a6ae0');R(0,ab+2,W,1,'#2a4ad0');for(let y=ab+6;y<H;y+=6)R(0,y,W,1,'rgba(0,0,40,0.18)');for(let x=0;x<W;x+=64){R(x,ab,1,H-ab,'#2a4ad0');R(x+1,ab,1,H-ab,'#142a80');}}
 else{R(0,ab,W,1,'#4a5068');}
 for(let x=32;x<W;x+=64)logo('A',x,ab+12);
 const[blx,bly]=corner(-1,RZB),[brx,bry]=corner(1,RZB);
 post(blx,bly,34,3);post(brx,bry,34,3);for(let i=0;i<3;i++){pad(blx,bly-ropeY(0,i)-3,5,6);pad(brx,bry-ropeY(0,i)-3,5,6);}
 for(let i=0;i<3;i++)rope(blx+3,bly-ropeY(0,i),brx-3,bry-ropeY(0,i),ropeCol(2-i),false);
 const[flx,fly]=corner(-1,RZF),[frx,fry]=corner(1,RZF);
 for(let i=0;i<3;i++){const ol=ropeOff(-1),or=ropeOff(1);rope(blx+ol,bly-ropeY(0,i),flx+ol,fly-ropeY(1,i),ropeCol(2-i),true);rope(brx+or,bry-ropeY(0,i),frx+or,fry-ropeY(1,i),ropeCol(2-i),true);}
}
function drawRingFront(){if(G.stage>=2)return;const[flx,fly]=corner(-1,RZF),[frx,fry]=corner(1,RZF);
 for(let i=0;i<3;i++){const y=fly-ropeY(1,i);R(0,y,W,2,ropeCol(2-i));R(0,y+2,W,1,'rgba(0,0,0,0.4)');if(G.stage!==1)for(let x=(i*5)%8;x<W;x+=8)R(x,y,2,1,'rgba(255,255,255,0.35)');}
 post(flx,fly,48,5);post(frx,fry,48,5);for(let i=0;i<3;i++){pad(flx+2,fly-ropeY(1,i)-4,8,8);pad(frx-2,fry-ropeY(1,i)-4,8,8);}}
