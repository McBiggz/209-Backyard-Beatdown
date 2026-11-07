// ================= PIXEL PRIMITIVES (screen) =================
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function LN(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);ctx.fillStyle=c;
 const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;
 for(let n=0;n<4000;n++){ctx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function DISC(cx,cy,r,c){ctx.fillStyle=c;cx=Math.round(cx);cy=Math.round(cy);for(let dy=-r;dy<=r;dy++){const hw=Math.floor(Math.sqrt(r*r-dy*dy)+0.35);ctx.fillRect(cx-hw,cy+dy,hw*2+1,1);}}
function ELL(cx,cy,rx,ry,c){ctx.fillStyle=c;cx=Math.round(cx);cy=Math.round(cy);for(let dy=-ry;dy<=ry;dy++){const hw=Math.floor(rx*Math.sqrt(Math.max(0,1-(dy*dy)/((ry+0.5)*(ry+0.5))))+0.3);ctx.fillRect(cx-hw,cy+dy,hw*2+1,1);}}
function BOX(x,y,w,h,fill,border){R(x,y,w,h,border);R(x+1,y+1,w-2,h-2,fill);}

