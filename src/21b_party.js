// ================= ONLINE PARTY (up to 4 players, test link) =================
// Star layout: the host's game is the hub. Every guest sends its buttons to the host; once the host has
// everyone's buttons for a step it sends the whole step (one entry per wrestler) to all guests.
// Everybody runs the same deterministic match from those steps. CPU wrestlers are worked out on each
// device from the same state, so they don't need sending. If a guest leaves mid-match, a CPU takes over
// their wrestler on the same step for everyone. Every second the host sends a fingerprint of the match;
// a guest that drifted asks for the host's snapshot and replays from there.
const PARTY_PREFIX='dd209p-';
const PARTY_LAG=+(QS.get('lag')||0),PARTY_BOT=QS.has('bot');
let botT=0,botHeld=null;
function botInput(){if(--botT<=0){botT=6+Math.floor(Math.random()*20);botHeld=['left','right','up','down',null][Math.floor(Math.random()*5)];}
 const I={left:false,right:false,up:false,down:false,jumpP:false,punchP:false,kickP:false,grabP:false,finP:false};if(botHeld)I[botHeld]=true;
 if(Math.random()<0.08)I[['punchP','kickP','grabP','jumpP','punchP'][Math.floor(Math.random()*5)]]=true;return I;}
const plDelay=fn=>PARTY_LAG?setTimeout(fn,PARTY_LAG):fn();
const PARTY={
 st:'off',role:null,peer:null,code:'',err:'',seat:0,m:0,D:6,rtt:0,stallT:0,
 conns:[null,null,null,null],     // host: one data link per guest seat (seat 0 is the host)
 conn:null,                       // guest: the link to the host
 L:null,                          // lobby: {cfg:{type,elim,map}, seats:[{pick}|null x4]}
 frames:new Map(),hist:new Map(),hashes:new Map(),rhashes:new Map(),snaps:new Map(),
 inb:[new Map(),new Map(),new Map(),new Map()],away:new Set(),next:0,lastSent:0,seatSlot:null,slotSeat:null,dropQ:[],gone:new Set(),
 wantRematch:false,lastRecv:[0,0,0,0],

 // ---------- connection ----------
 newPeer(id){if(typeof Peer==='undefined'){this.fail('Online library missing');return null;}
  const p=id?new Peer(id,NET_CFG):new Peer(NET_CFG);
  p.on('disconnected',()=>{if(this.peer===p&&!p.destroyed)setTimeout(()=>{try{if(p.disconnected&&!p.destroyed)p.reconnect();}catch(e){}},400);});
  p.on('error',e=>{if(this.peer!==p)return;
   if(e.type==='unavailable-id'&&this.role==='host'){this.code=this.mkCode();setTimeout(()=>{if(this.role!=='host')return;try{p.destroy();}catch(_){}this.openHost();},300);return;}
   if(e.type==='peer-unavailable'&&this.st==='joining'&&++this.tries<=8){this.err='Looking for that room... (is their game open?)';partyUI.update();setTimeout(()=>this.tryJoin(),2500);return;}
   if(e.type==='network'||e.type==='server-error'||e.type==='socket-error'||e.type==='disconnected'){if(this.st==='hosting'||this.st==='joining'||this.st==='lobby'){this.err='Reconnecting to the online server...';partyUI.update();}return;}
   this.fail(e.type==='peer-unavailable'?'No room with that code':'Connection error ('+e.type+')');});
  return p;},
 mkCode(){return Array.from({length:4},()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join('');},
 host(){this.reset();this.role='host';this.seat=0;this.code=this.mkCode();this.st='lobby';
  this.L={cfg:{type:2,elim:1,map:0},seats:[{pick:null},null,null,null]};this.openHost();partyUI.show(false);G.scene='party';},
 openHost(){this.peer=this.newPeer(PARTY_PREFIX+this.code);if(!this.peer)return;
  this.peer.on('open',()=>{this.err='';});
  this.peer.on('connection',c=>{
   const seat=[1,2,3].find(k=>!this.conns[k]);
   if(seat==null||this.st==='playing'){c.on('open',()=>{c.send({t:'full',playing:this.st==='playing'});setTimeout(()=>c.close(),500);});return;}
   this.conns[seat]=c;this.lastRecv[seat]=performance.now();
   c.on('open',()=>{});
   c.on('data',d=>{this.lastRecv[seat]=performance.now();plDelay(()=>this.recvHost(seat,d));});
   const gone=()=>{if(this.conns[seat]===c)this.seatLeft(seat);};c.on('close',gone);c.on('error',gone);});},
 join(code){code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==4){this.err='Codes are 4 letters';partyUI.update();return;}
  this.reset();this.role='guest';this.code=code;this.st='joining';this.tries=0;
  this.peer=this.newPeer();if(!this.peer)return;this.peer.on('open',()=>this.tryJoin());partyUI.update();},
 tryJoin(){if(this.st!=='joining'||!this.peer||this.peer.destroyed)return;
  const c=this.peer.connect(PARTY_PREFIX+this.code,{reliable:true});this.conn=c;
  c.on('open',()=>{c._was=true;this.lastRecv[0]=performance.now();c.send({t:'hi',v:NET_VER});});
  c.on('data',d=>{this.lastRecv[0]=performance.now();plDelay(()=>this.recvGuest(d));});
  const gone=()=>{if(this.conn===c&&c._was)this.lost('THE HOST LEFT');};c.on('close',gone);c.on('error',gone);},
 send(o){if(this.role==='guest'){if(this.conn&&this.conn.open)this.conn.send(o);}else this.conns.forEach(c=>{if(c&&c.open)c.send(o);});},
 sendTo(seat,o){const c=this.conns[seat];if(c&&c.open)c.send(o);},
 sendLobby(){if(this.role==='host')this.send({t:'lobby',L:this.L});},
 fail(msg){this.err=msg;if(this.st==='joining'||this.st==='hosting')this.st='error';partyUI.update();},
 lost(why){if(this.st==='off')return;this.err=why;this.st='lost';G.net=null;partyUI.update();},
 leave(){this.send({t:'bye'});this.close();},
 close(){for(const c of this.conns)try{if(c)c.close();}catch(e){}try{if(this.conn)this.conn.close();}catch(e){}try{if(this.peer)this.peer.destroy();}catch(e){}
  this.conns=[null,null,null,null];this.conn=this.peer=null;this.st='off';if(G.net===this)G.net=null;G.netMenu=false;},
 reset(){this.close();this.away=new Set();this.err='';this.L=null;this.m=0;this.wantRematch=false;this.gone=new Set();this.rtt=0;},
 // a guest's link closed: in the lobby their seat frees up; mid-match a CPU takes over their wrestler
 seatLeft(seat){this.conns[seat]=null;if(!this.L)return;
  if(this.st==='playing'&&this.seatSlot&&this.seatSlot[seat]!=null&&!this.gone.has(seat)){this.gone.add(seat);this.dropQ.push(this.seatSlot[seat]);this.assemble();}
  this.L.seats[seat]=null;this.sendLobby();},
 humans(){return this.L?this.L.seats.map((s,i)=>s?i:-1).filter(i=>i>=0):[];},

 // ---------- messages ----------
 recvHost(seat,d){if(!d||!d.t)return;
  if(d.t==='hi'){if(d.v!==NET_VER){this.sendTo(seat,{t:'old'});setTimeout(()=>{const c=this.conns[seat];this.conns[seat]=null;try{c&&c.close();}catch(e){}},400);return;}
   this.L.seats[seat]={pick:null};this.sendTo(seat,{t:'welcome',seat,code:this.code});this.sendLobby();sfx('bell');return;}
  if(!this.L.seats[seat])return; // not introduced yet
  switch(d.t){
  case 'p':this.sendTo(seat,{t:'q',ts:d.ts});break;
  case 'rtt':if(this.L.seats[seat])this.L.seats[seat].rtt=d.r;break;
  case 'pick':if(this.L.seats[seat]){this.L.seats[seat].pick=d.i;this.sendLobby();}break;
  case 'i':if(d.m===this.m&&!this.gone.has(seat))this.takeInputs(seat,d.s,d.v);break;
  case 'away':this.away.add(seat);this.assemble();break;
  case 'need':if(d.m===this.m&&this.snaps.has(d.s))this.sendTo(seat,{t:'snap',m:this.m,s:d.s,d:this.snaps.get(d.s)});break;
  case 'bye':this.seatLeft(seat);break;}},
 recvGuest(d){if(!d||!d.t)return;
  switch(d.t){
  case 'welcome':this.seat=d.seat;this.st='lobby';partyUI.show(false);G.scene='party';sfx('bell');this.ping();break;
  case 'old':this.reset();this.err=NET_OLD;this.st='error';partyUI.show(true);G.scene='lobby';break;
  case 'full':this.reset();this.err=d.playing?'That match has already started':'That room is full (4 players)';this.st='error';partyUI.show(true);G.scene='lobby';break;
  case 'q':{const r=performance.now()-d.ts;this.rtt=this.rtt?this.rtt*0.7+r*0.3:r;this.send({t:'rtt',r:Math.round(this.rtt)});break;}
  case 'lobby':this.L=d.L;break;
  case 'start':this.begin(d);break;
  case 'f':if(d.m===this.m){this.frames.set(d.s,{v:d.v,dr:d.dr});if(d.s>this.maxF)this.maxF=d.s;}break;
  case 'h':if(d.m===this.m){this.rhashes.set(d.s,d.h);this.check(d.s);}break;
  case 'snap':if(d.m===this.m)this.repair(d.s,d.d);break;
  case 'tolobby':this.toLobby();break;
  case 'bye':this.lost('THE HOST LEFT');break;}},
 ping(){if(this.role==='guest')this.send({t:'p',ts:performance.now()});},
 pick(i){if(!this.L)return;if(this.role==='host'){this.L.seats[0].pick=i;this.sendLobby();}else{this.L.seats[this.seat].pick=i;this.send({t:'pick',i});}},

 // ---------- host: settings and starting ----------
 canStart(){if(this.role!=='host'||!this.L)return'';const h=this.humans(),n=msSlots(this.L.cfg.type);
if(h.length>n)return'TOO MANY PLAYERS FOR '+MS_TYPES[this.L.cfg.type][0];
  if(h.some(k=>this.L.seats[k].pick==null))return'WAITING FOR EVERYONE TO PICK...';return'';},
 start(rematch){const L=this.L,c=L.cfg,h=this.humans(),n=msSlots(c.type),t=MS_TYPES[c.type][1];
  // where the humans stand: in tag, the first two players are on opposite teams
  const order=t==='tag'?[0,2,1,3]:[0,1,2,3];const seatSlot={},picks=[],ctl=[];
  h.forEach((seat,k)=>{seatSlot[seat]=order[k];});
  for(let s=0;s<n;s++){const seat=h.find(k=>seatSlot[k]===s);ctl[s]=seat!=null?'net':'cpu';picks[s]=seat!=null?L.seats[seat].pick:null;}
  // CPUs get wrestlers nobody picked
  const used=picks.filter(p=>p!=null);const free=ROSTER.map((ch,i)=>i).filter(i=>ROSTER[i].id!=='kliq'&&ROSTER[i].id!=='ref'&&!used.includes(i));
  for(let i=free.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[free[i],free[j]]=[free[j],free[i]];}
  for(let s=0;s<n;s++)if(picks[s]==null)picks[s]=free.pop();
  const cfg=msBuildCfg(c.type,picks,ctl,c.elim,MS_MAPS[c.map][1]);
  const maxR=Math.max(60,...h.map(k=>(L.seats[k]&&L.seats[k].rtt)||0));
  const msg={t:'start',m:this.m+1,seed:(Math.random()*4294967296)>>>0,D:clamp(Math.ceil(maxR/16.7)+3,4,14),cfg,seatSlot};
  this.send(msg);this.begin(msg);},
 // everybody: build the same match from the host's message
 begin(d){this.m=d.m;this.D=d.D;this.seatSlot=d.seatSlot;this.wantRematch=false;this.gone=new Set();this.dropQ=[];
  this.frames.clear();this.hist.clear();this.hashes.clear();this.rhashes.clear();this.snaps.clear();this.inb.forEach(b=>b.clear());this.stallT=0;
  const me=this.seatSlot[this.seat];G.forceSeed=d.seed;G.mode=0;
  startGroup(Object.assign({},d.cfg,{me:me!=null?me:0}));G.forceSeed=null;
  this.st='playing';G.net=this;G.netMenu=false;
  // the first D steps have no buttons yet: everyone starts them blank
  const n=G.f.length;for(let s=0;s<this.D;s++)this.frames.set(s,{v:new Array(n).fill(0)});this.lastSent=this.D-1;this.next=this.D;this.maxF=this.D-1;},
 // host: once every human's buttons for the next step are in, send the whole step to everyone
 takeInputs(seat,from,v){let any=false;for(let k=0;k<v.length;k++)if(from+k>=this.next){this.inb[seat].set(from+k,v[k]);any=true;}
  if(any&&this.away.delete(seat)){}this.assemble();},
 assemble(){if(this.role!=='host'||this.st!=='playing')return;const n=G.f.length;
  for(let guard=0;guard<120;guard++){const s=this.next,live=Object.keys(this.seatSlot).map(Number).filter(k=>!this.gone.has(k)&&!this.away.has(k));
   if(!live.every(k=>this.inb[k].has(s)))break;
   const v=new Array(n).fill(0);live.forEach(k=>{v[this.seatSlot[k]]=this.inb[k].get(s);this.inb[k].delete(s);});
   const fr={v};if(this.dropQ.length){fr.dr=this.dropQ.splice(0);}
   this.frames.set(s,fr);this.send({t:'f',m:this.m,s,v,dr:fr.dr});this.next++;}
  if(this.next%120===0)this.inb.forEach(b=>{for(const k of b.keys())if(k<this.next)b.delete(k);});},

 // ---------- lockstep (the same calls the 1-on-1 online code uses) ----------
 ready(s){const ok=this.frames.has(s);if(!ok)this.stallT+=1/60;else this.stallT=0;return ok;},
 take(s){const fr=this.frames.get(s);this.frames.delete(s);
  if(fr.dr)for(const slot of fr.dr){const f=G.f[slot];if(f){f.cpu=true;callout(f.ch.short+' LEFT - CPU TAKES OVER','#bfae98',1.4);}}
  this.hist.set(s,fr.v);if(this.hist.size>900)this.hist.delete(s-900);return fr.v;},
 afterStep(fs){if(G.resim||G.irp)return;
  let s=fs-1+this.D;const v=packInp(PARTY_BOT?botInput():humanInput(0));
  // back from another tab/app and caught up: jump my buttons ahead of where the match is now, so the host counts me in again
  if(this.returning&&this.frames.size<=this.D+4){s=Math.max(s,(this.role==='host'?this.next:this.maxF+1)+this.D);this.returning=false;}
  if(s>this.lastSent){const from=this.lastSent+1,arr=[];for(let k=from;k<=s;k++)arr.push(v);this.lastSent=s;
   if(this.role==='host')this.takeInputs(0,from,arr);else this.send({t:'i',m:this.m,s:from,v:arr});}
  if(fs%60===0){const h=simHash();
   if(this.role==='host'){this.snaps.set(fs,getSnap());this.snaps.delete(fs-600);this.send({t:'h',m:this.m,s:fs,h});}
   else{this.hashes.set(fs,h);this.check(fs);this.hashes.delete(fs-1200);if(fs%120===0)this.ping();}}},
 onBegin(){},
 catchUp(){let k=0;while(this.st==='playing'&&G.scene==='fight'&&this.frames.size>this.D+4&&k<45){if(simStep()===false)break;k++;}},
 check(s){if(!this.hashes.has(s)||!this.rhashes.has(s))return;
  if(this.hashes.get(s)!==this.rhashes.get(s))this.send({t:'need',m:this.m,s});this.rhashes.delete(s);},
 repair(s,data){if(this.role!=='guest'||G.scene!=='fight')return;const end=G.fstep;if(end<s)return;
  for(let k=s;k<end;k++)if(!this.hist.has(k))return;
  setSnap(data);const tape=[];for(let k=s;k<end;k++)tape[k]=this.hist.get(k);
  G.replay={inp:tape};G.resim=true;for(let k=0;G.fstep<end&&k<2000;k++)simStep();G.resim=false;G.replay=null;},

 // ---------- during / after the match ----------
 toLobby(){this.st='lobby';G.net=null;G.netMenu=false;G.mm=null;G.scene='party';if(this.role==='host')this.send({t:'tolobby'});},
 updFightMeta(){
  if(G.over&&G.over.t>1.8){
   if(this.role==='host'){if(confirmP()||(clickQ&&inRect(clickQ,OVER_BTNS[0]))){this.start();return;}
    if(hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1]))){this.toLobby();return;}}
   if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,OVER_BTNS[2]))){this.leave();G.scene='title';}
   return;}
  if(hit(['Escape','KeyP']))G.netMenu=!G.netMenu;
  if(G.netMenu){if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,PAUSE_BTNS[1]))){this.leave();G.scene='title';}
   else if(clickQ&&inRect(clickQ,PAUSE_BTNS[0]))G.netMenu=false;}},
 updLost(){if(confirmP()||clickQ||hit(['Escape'])){this.close();this.st='off';G.scene='title';}},
 hud(){
  if(this.st==='lost'){R(0,0,W,H,'rgba(6,2,3,0.85)');T(this.err||'DISCONNECTED',192,90,2,'#ff4a3a','center','#000');T(coarse?'TAP TO RETURN':'PRESS ENTER',192,112,1,'#e9dcc6','center',null);return;}
  if(G.net!==this||G.scene!=='fight')return;
  if(!G.entrance)T((PARTY_BOT?'BOT • ':'')+(PARTY_LAG?'+'+PARTY_LAG+'MS LAG • ':'')+'ONLINE • '+this.humans().length+' PLAYERS'+(this.role==='guest'?' • '+Math.round(this.rtt)+'MS':''),192,30,1,'#5fe07a','center','#000');
  if(this.stallT>0.5){BOX(132,44,120,13,'#140a0c','#ffd35a');T('WAITING FOR PLAYERS...',192,48,1,'#fff','center',null);}
  if(G.netMenu&&!G.over){R(0,0,W,H,'rgba(6,2,3,0.7)');T('ONLINE MATCH',192,60,3,'#ffd35a','center','#5a0608');T("THE MATCH KEEPS GOING - YOU CAN'T PAUSE ONLINE",192,92,1,'#e9dcc6','center',null);
   [['BACK TO MATCH (ESC)',0],['LEAVE MATCH (Q)',1]].forEach(([s,i])=>{const b=PAUSE_BTNS[i];BOX(...b,'#140a0c','#ffd35a');T(s,192,b[1]+5,1,'#fff','center',null);});}
  if(G.over&&G.over.t>1.8&&this.role==='guest')T('WAITING FOR THE HOST TO START THE NEXT ONE...',192,114,1,'#ffd35a','center','#000');},
};
// heartbeat: a link that's been silent for 8 s is treated as gone
setInterval(()=>{if(PARTY.st==='off'||PARTY.st==='lost')return;const now=performance.now();
 if(PARTY.role==='guest'){PARTY.ping();if(PARTY.lastRecv[0]&&now-PARTY.lastRecv[0]>15000&&PARTY.conn&&PARTY.conn._was)PARTY.lost('LOST THE HOST');}
 else{PARTY.send({t:'hb'});for(let k=1;k<4;k++)if(PARTY.conns[k]&&PARTY.conns[k].open&&now-PARTY.lastRecv[k]>15000)PARTY.seatLeft(k);}},1000);

// ---------- the lobby screen (drawn on the game canvas) ----------
const PL_BACK=[4,4,40,13],PL_PICK=[24,186,110,19],PL_GO=[250,186,110,19],PL_ROWS=[[150,30,220,14],[150,46,220,14],[150,62,220,14]];
function plRows(){const t=MS_TYPES[PARTY.L.cfg.type][1],r=t==='multi'?['type','elim']:['type'];if(TEST_MODES)r.push('map');return r;}
function updParty(){const P=PARTY;if(!P.L){if(hit(['Escape'])||(clickQ&&inRect(clickQ,PL_BACK))){P.leave();G.scene='title';}return;}
 const c=P.L.cfg,host=P.role==='host',rows=plRows();G.plRow=Math.min(G.plRow||0,rows.length-1);
 if(hit(['Escape'])||(clickQ&&inRect(clickQ,PL_BACK))){P.leave();G.scene='title';sfx('punch');return;}
 if(hit(['KeyJ','KeyR'])||(clickQ&&inRect(clickQ,PL_PICK))){mselOpen(true);return;}
 if(host){const chg=(k,d)=>{if(k==='type')c.type=(c.type+d+MS_TYPES.length)%MS_TYPES.length;else if(k==='elim')c.elim=c.elim?0:1;else c.map=(c.map+d+2)%2;sfx('punch');P.sendLobby();};
  if(hit(['KeyW','ArrowUp']))G.plRow=(G.plRow+rows.length-1)%rows.length;if(hit(['KeyS','ArrowDown']))G.plRow=(G.plRow+1)%rows.length;
  if(hit(['KeyA','ArrowLeft']))chg(rows[G.plRow],-1);if(hit(['KeyD','ArrowRight']))chg(rows[G.plRow],1);
  if(clickQ)rows.forEach((k,i)=>{const b=PL_ROWS[i];if(inRect(clickQ,b)){G.plRow=i;chg(k,clickQ.x<b[0]+b[2]*0.4?-1:1);}});
  if((confirmP()||(clickQ&&inRect(clickQ,PL_GO)))&&!P.canStart()){P.start();sfx('bell');}}
 else if(confirmP())mselOpen(true);}
function drawParty(){drawArena();R(0,0,W,H,'rgba(6,2,3,0.84)');const P=PARTY,L=P.L;
 BOX(...PL_BACK,'#140a0c','#5a4a40');T('< LEAVE',PL_BACK[0]+20,PL_BACK[1]+4,1,'#bfae98','center',null);
 T('ONLINE LOBBY',192,6,2,'#ffd35a','center','#5a0608');
 if(!L){T('CONNECTING...',192,100,1,'#fff','center',null);return;}
 // room code, big, so it can be read out or screenshotted
 BOX(14,30,124,40,'#140a0c','#ffd35a');T('ROOM CODE',76,34,1,'#bfae98','center',null);{ctx.save();ctx.font='900 23px "Arial Black","Segoe UI",Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  const cx=76,cy=56,gap=26,ch=P.code.split('');ch.forEach((c,i)=>{const x=cx+(i-1.5)*gap;ctx.lineWidth=5;ctx.strokeStyle='#5a0608';ctx.strokeText(c,x,cy);ctx.fillStyle='#ffd35a';ctx.fillText(c,x,cy);});ctx.restore();} // a real font: the pixel font's M/H/N/W/K/X look too alike
 if(P.err)T(P.err,76,74,1,'#ff8a7a','center',null);
 // match settings (only the host can change them)
 const c=L.cfg,host=P.role==='host';plRows().forEach((k,i)=>{const[x,y,w,h]=PL_ROWS[i],on=host&&G.plRow===i;
  const lab=k==='type'?'MATCH':k==='elim'?'ELIMINATION':'ARENA',val=k==='type'?MS_TYPES[c.type][0]:k==='elim'?(c.elim?'ON':'OFF'):MS_MAPS[c.map][0];
  BOX(x,y,w,h,on?'#8f0f14':'#140a0c',on?'#ffd35a':'#5a4a40');T(lab,x+4,y+4,1,'#8a7a66','left',null);T(val,x+150,y+4,1,'#fff','center',null);
  if(host){msArrow(x+82,y+3,-1,on?'#ffd35a':'#5a4a40');msArrow(x+w-9,y+3,1,on?'#ffd35a':'#5a4a40');}});
 if(!host)T('THE HOST PICKS THE MATCH',260,80,1,'#8a7a66','center',null);
 // players
 const n=msSlots(c.type),h=P.humans();
 for(let k=0;k<4;k++){const s=L.seats[k],x=14+k*90,y=92;BOX(x,y,84,71,'#140a0c',k===P.seat?'#ffd35a':'#5a4a40');
  if(!s){T(k<n&&h.length<=k?'CPU':'OPEN',x+42,y+28,1,'#5a4a40','center',null);continue;}
  T((k===0?'HOST':'PLAYER '+(k+1))+(k===P.seat?' (YOU)':''),x+42,y+3,1,k===P.seat?'#ffd35a':'#bfae98','center',null);
  if(s.pick!=null){const ch=ROSTER[s.pick],st=SETS[ch.id];ctx.save();ctx.beginPath();ctx.rect(x+1,y+10,82,50);ctx.clip();ELL(x+42,y+59,11,2,'rgba(0,0,0,0.4)');drawSpr(st,'idle'+(Math.floor(G.t*1.6+k)%2),x+42,y+59,1,0.6*(ch.drawScale||1));ctx.restore();T(ch.short.toUpperCase(),x+42,y+62,1,'#fff','center',null);}
  else T('PICKING...',x+42,y+30,1,'#8a7a66','center',null);}
 const cpus=Math.max(0,MS_TYPES[c.type][2]-h.length);T(h.length+' PLAYER'+(h.length>1?'S':'')+(cpus?' + '+cpus+' CPU':''),192,166,1,'#bfae98','center',null);
 BOX(...PL_PICK,'#140a0c','#ffd35a');T('PICK WRESTLER',PL_PICK[0]+55,PL_PICK[1]+6,1,'#fff','center',null);
 if(host){const why=P.canStart(),ok=!why;BOX(...PL_GO,ok?'#8f0f14':'#2a1a1c',ok?'#ffd35a':'#5a4a40');T('START MATCH',PL_GO[0]+55,PL_GO[1]+6,1,ok?'#fff':'#5a4a40','center',null);if(why)T(why,192,176,1,'#ff8a7a','center',null);}
 else T('WAITING FOR THE HOST TO START',PL_GO[0]+55,PL_GO[1]+6,1,'#8a7a66','center',null);}

// ---------- host / join screen (HTML so phones get a real keyboard for the code) ----------
const partyUI=(()=>{const el=document.createElement('div');el.id='partyui';el.className='netui';
 el.innerHTML=`<div class="nbox"><div class="nt">PLAY ONLINE</div><div class="nsub">Up to 4 players • empty spots are CPUs</div>
 <div><button id="phost">HOST A ROOM</button><div class="nor">— or join a friend —</div>
 <div class="nrow"><input id="pcode" maxlength="4" placeholder="CODE" autocomplete="off" autocapitalize="characters" spellcheck="false"><button id="pjoin">JOIN</button></div></div>
 <div id="pmsg"></div><button id="pback">BACK</button></div>`;
 document.body.appendChild(el);
 const $=id=>el.querySelector('#'+id);
 $('phost').onclick=()=>{initAudio();PARTY.host();};
 const doJoin=()=>{initAudio();PARTY.join($('pcode').value);};
 $('pjoin').onclick=doJoin;$('pcode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')doJoin();});
 $('pcode').addEventListener('keyup',e=>e.stopPropagation());
 $('pback').onclick=()=>{PARTY.close();api.show(false);G.scene='title';};
 const api={show(on){el.classList.toggle('on',on);if(on)this.update();},
  update(){$('pmsg').textContent=PARTY.err||(PARTY.st==='joining'?'Connecting…':'');}};
 return api;})();

// switching tabs / apps pauses the game in that window: tell the host, so the match goes on without waiting.
// (the host's own window does the same for itself: frames keep going out to everyone else)
document.addEventListener('visibilitychange',()=>{const P=PARTY;if(P.st!=='playing')return;
 if(!document.hidden){P.returning=true;return;}
 if(P.role==='guest')P.send({t:'away'});else{P.away.add(0);P.assemble();}});
