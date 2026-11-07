// ================= 3x5 BITMAP FONT =================
const GL={A:[2,5,7,5,5],B:[6,5,6,5,6],C:[3,4,4,4,3],D:[6,5,5,5,6],E:[7,4,6,4,7],F:[7,4,6,4,4],G:[3,4,5,5,3],H:[5,5,7,5,5],I:[7,2,2,2,7],J:[1,1,1,5,2],
 K:[5,5,6,5,5],L:[4,4,4,4,7],M:[5,7,7,5,5],N:[6,5,5,5,5],O:[2,5,5,5,2],P:[6,5,6,4,4],Q:[2,5,5,6,3],R:[6,5,6,5,5],S:[3,4,2,1,6],T:[7,2,2,2,2],
 U:[5,5,5,5,7],V:[5,5,5,5,2],W:[5,5,7,7,5],X:[5,5,2,5,5],Y:[5,5,2,2,2],Z:[7,1,2,4,7],
 '0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[6,1,2,4,7],'3':[6,1,2,1,6],'4':[5,5,7,1,1],'5':[7,4,6,1,6],'6':[3,4,6,5,2],'7':[7,1,2,2,2],'8':[2,5,2,5,2],'9':[2,5,3,1,6],
 ' ':[0,0,0,0,0],'.':[0,0,0,0,2],',':[0,0,0,2,4],'!':[2,2,2,0,2],'?':[6,1,2,0,2],"'":[2,2,0,0,0],'"':[5,5,0,0,0],'-':[0,0,7,0,0],'+':[0,2,7,2,0],
 ':':[0,2,0,2,0],'/':[1,1,2,4,4],'&':[2,5,2,5,3],'(':[1,2,2,2,1],')':[4,2,2,2,4],'#':[5,7,5,7,5],'*':[5,2,7,2,5],'%':[5,1,2,4,5],'=':[0,7,0,7,0],
 '[':[3,2,2,2,3],']':[6,2,2,2,6],'<':[1,2,4,2,1],'>':[4,2,1,2,4],'•':[0,0,2,0,0],'·':[0,0,2,0,0],'✓':[0,1,1,5,2],'_':[0,0,0,0,7],'★':[2,7,2,5,0]};
const TXC=new Map();
function textCanvas(s,sc,col,out){const key=s+'\u0001'+sc+col+out;let c=TXC.get(key);if(c)return c;
 const u=String(s).toUpperCase();const w=Math.max(1,u.length*4*sc-sc)+2,h=5*sc+2;c=mk(w,h);const g=c.getContext('2d');
 const stamp=(ox,oy,color)=>{g.fillStyle=color;for(let i=0;i<u.length;i++){const gl=GL[u[i]]||GL['?'];for(let r=0;r<5;r++){const bits=gl[r];for(let b=0;b<3;b++)if(bits&(4>>b))g.fillRect(1+ox+(i*4+b)*sc,1+oy+r*sc,sc,sc);}}};
 if(out)for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]])stamp(ox,oy,out);
 stamp(0,0,col);if(TXC.size>800)TXC.clear();TXC.set(key,c);return c;}
function T(s,x,y,sc=1,col='#fff',align='left',out='#000'){const c=textCanvas(s,sc,col,out);let dx=Math.round(x)-1;
 if(align==='center')dx=Math.round(x-(c.width-2)/2)-1;else if(align==='right')dx=Math.round(x-(c.width-2))-1;ctx.drawImage(c,dx,Math.round(y)-1);return c.width-2;}
const TW=(s,sc=1)=>String(s).length*4*sc-sc;

