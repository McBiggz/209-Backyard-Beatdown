// ================= LOADING (builds every sprite sheet) =================
const BUILD_Q=[...ROSTER.map(ch=>()=>buildWrestler(ch)),()=>buildRef(),()=>{HDKEYS.forEach(buildHD);}];
function updLoading(){if(G.load<BUILD_Q.length){if(G.load===BUILD_Q.length-1&&!hdReady()){hdWait++;return;}try{BUILD_Q[G.load]();}catch(e){console.warn('load step',G.load,e);}G.load++;}else G.scene='title';}
function drawLoading(){R(0,0,W,H,'#0a0506');logo('T',192,80);const p=G.load/BUILD_Q.length;BOX(112,150,160,8,'#140a0c','#ffd35a');R(114,152,Math.round(156*p),4,'#ff8a1f');
 T('DRAWING THE ROSTER... '+Math.round(p*100)+'%',192,164,1,'#bfae98','center',null);}

