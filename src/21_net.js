// online version: both players must be running the same build or the matches drift apart (bump when match rules change)
const NET_VER=11,NET_OLD='Your friend has a different version of the game. Both of you refresh the page and try again.';
// ================= ONLINE PLAY =================
// Lockstep over a WebRTC data channel (PeerJS). Both games run the same deterministic simulation.
// Each player sends their packed buttons for step (now + DELAY); a step only runs once both are in.
// Every second both sides compare a hash of the match; if they ever differ the host's copy wins:
// the guest jumps to the host's snapshot and re-plays the inputs since then.
const QS=new URLSearchParams(location.search);
const NET_CFG=(()=>{const c={debug:0};if(QS.get('peerhost')){c.host=QS.get('peerhost');c.port=+QS.get('peerport')||9000;c.secure=QS.get('peersecure')==='1';c.path='/';}return c;})();
const NET_PREFIX='dd209-';
const CODE_CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const NET={
 st:'off',peer:null,conn:null,role:null,me:0,code:'',err:'',D:4,rtt:0,m:0,seed:0,
 local:new Map(),remote:new Map(),hist:new Map(),hashes:new Map(),rhashes:new Map(),snaps:new Map(),
 myPick:null,myD:0,lastSent:0,theirPick:null,wantRematch:false,theyRematch:false,stallT:0,desyncs:0,repairs:0,lag:+(QS.get('lag')||0),pingT:0,lost:false,

 // ---- connection
 newPeer(id){if(typeof Peer==='undefined'){this.fail('Online library missing');return null;}
  const p=id?new Peer(id,NET_CFG):new Peer(NET_CFG);
  // phones drop the server connection when the game goes to the background (switching apps to send the code):
  // reconnect as soon as we're back, keeping the same room code
  p.on('disconnected',()=>{if(this.peer===p)this.reconnect();});
  p.on('error',e=>{if(this.peer!==p)return;
   if(e.type==='unavailable-id'&&this.role==='host'){this.rehost();return;}
   if(e.type==='peer-unavailable'&&this.st==='joining'&&++this.tries<=10){this.err='Looking for that room... (is their game open?)';netUI.update();setTimeout(()=>this.tryJoin(),2500);return;}
   if((e.type==='network'||e.type==='server-error'||e.type==='socket-error'||e.type==='disconnected')&&(this.st==='hosting'||this.st==='joining')){this.err='Reconnecting to the online server...';netUI.update();this.reconnect();return;}
   this.fail(e.type==='peer-unavailable'?'No match with that code':e.type==='network'||e.type==='server-error'||e.type==='socket-error'?"Can't reach the online server":'Connection error ('+e.type+')');});
  return p;},
 host(){this.reset();this.role='host';this.me=0;this.code=Array.from({length:4},()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join('');
  this.st='hosting';this.tries=0;this.openHost();return this.code;},
 openHost(){this.peer=this.newPeer(NET_PREFIX+this.code);if(!this.peer)return;
  this.peer.on('open',()=>{if(this.st==='hosting'){this.err='';this.tries=0;netUI.update();}});
  this.peer.on('connection',c=>{if(this.conn&&this.conn.open){c.close();return;}this.bind(c);});},
 // the server still remembers our room from before the phone slept: wait a moment and claim the same code again
 rehost(){if(this.st!=='hosting')return;if(++this.tries>8){this.host();return;}this.err='Reconnecting to the online server...';netUI.update();
  setTimeout(()=>{if(this.st!=='hosting')return;try{this.peer.destroy();}catch(e){}this.openHost();},2500);},
 reconnect(){const p=this.peer;if(!p||p.destroyed||!p.disconnected)return;if(document.hidden)return; // tried again when the game is visible
  clearTimeout(this.recT);this.recT=setTimeout(()=>{try{if(this.peer===p&&p.disconnected&&!p.destroyed)p.reconnect();}catch(e){}},300);},
 tries:0,recT:0,
 join(code){code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==4){this.err='Codes are 4 letters';return;}
  this.reset();this.role='guest';this.me=1;this.code=code;this.st='joining';this.tries=0;this.peer=this.newPeer();if(!this.peer)return;
  this.peer.on('open',()=>{if(!this.conn)this.tryJoin();});},
 tryJoin(){if(this.st!=='joining'||!this.peer||this.peer.destroyed)return;if(this.peer.disconnected){this.reconnect();setTimeout(()=>this.tryJoin(),1500);return;}
  const c=this.peer.connect(NET_PREFIX+this.code,{reliable:true});this.bind(c);},
 bind(c){this.conn=c;c.on('open',()=>{this.lastRecv=performance.now();this.st='connected';this.err='';this.send({t:'hi',v:NET_VER});this.ping();netUI.update();onNetConnected();});
  c.on('data',d=>{this.lastRecv=performance.now();if(this.lag)setTimeout(()=>this.recv(d),this.lag);else this.recv(d);});
  // a failed attempt while still looking for the room isn't a disconnect; only a real, opened link counts
  c.on('close',()=>{if(c===this.conn&&c._was)this.drop();});c.on('error',()=>{if(c===this.conn&&c._was)this.drop();});c.on('open',()=>{c._was=true;});},
 send(o){if(this.conn&&this.conn.open)this.conn.send(o);},
 fail(msg){this.err=msg;if(this.st!=='connected'&&this.st!=='playing'){this.st='error';}netUI.update();},
 drop(){if(this.st==='off')return;this.lost=true;this.err='Opponent disconnected';this.st='lost';netUI.update();},
 leave(){this.send({t:'bye'});this.close();},
 close(){try{if(this.conn)this.conn.close();}catch(e){}try{if(this.peer)this.peer.destroy();}catch(e){}this.peer=this.conn=null;this.st='off';G.net=null;G.netMenu=false;},
 reset(){this.close();this.err='';this.lost=false;this.myPick=this.theirPick=null;this.wantRematch=this.theyRematch=false;this.desyncs=this.repairs=0;},
 ping(){this.send({t:'p',ts:performance.now()});},
 lastRecv:0,

 // ---- messages
 recv(d){if(!d||!d.t)return;
  switch(d.t){
  case 'hi':if(d.v!==NET_VER){this.fail(NET_OLD);try{this.conn.close();}catch(e){}}break;
  case 'p':this.send({t:'q',ts:d.ts});break;
  case 'q':{const r=performance.now()-d.ts;this.rtt=this.rtt?this.rtt*0.7+r*0.3:r;
   // my input delay follows the connection: enough steps to cover one-way travel plus a little jitter
   this.myD=clamp(Math.ceil(this.rtt/2/16.7)+2,2,12);break;}
  case 'pick':this.theirPick=d.i;this.tryStart();break;
  case 'start':this.begin(d);break;
  case 'i':if(d.m===this.m)for(let k=0;k<d.v.length;k++)this.remote.set(d.s+k,d.v[k]);break;
  case 'h':if(d.m===this.m){this.rhashes.set(d.s,d.h);this.check(d.s);}break;
  case 'need':if(this.role==='host'&&d.m===this.m&&this.snaps.has(d.s))this.send({t:'snap',m:this.m,s:d.s,d:this.snaps.get(d.s)});break;
  case 'snap':if(d.m===this.m)this.repair(d.s,d.d);break;
  case 'rematch':this.theyRematch=true;this.tryRematch();break;
  case 'reselect':netToSelect();break;
  case 'bye':this.drop();break;}},

 // ---- wrestler select -> match start (host decides seed, stage and delay)
 pick(i){this.myPick=i;this.send({t:'pick',i});this.tryStart();},
 tryStart(){if(this.role!=='host'||this.myPick==null||this.theirPick==null)return;
  const D=clamp(Math.ceil((this.rtt||60)/2/16.7)+2,3,12);
  const msg={t:'start',m:this.m+1,seed:(Math.random()*4294967296)>>>0,picks:[this.myPick,this.theirPick],stage:G.stage,D};
  this.send(msg);this.begin(msg);},
 tryRematch(){if(this.role==='host'&&this.wantRematch&&this.theyRematch){const msg={t:'start',m:this.m+1,seed:(Math.random()*4294967296)>>>0,picks:this.lastPicks,stage:G.stage,D:this.D,rematch:true};this.send(msg);this.begin(msg);}},
 begin(d){this.m=d.m;this.seed=d.seed;this.D=d.D;this.lastPicks=d.picks;this.wantRematch=this.theyRematch=false;
  this.local.clear();this.remote.clear();this.hist.clear();this.hashes.clear();this.rhashes.clear();this.snaps.clear();this.stallT=0;
  this.st='playing';G.net=this;G.netMenu=false;G.stage=d.stage;G.mode=2;
  if(d.rematch){beginFight();G.scene='fight';}
  else{G.sel={c:[d.picks[0],d.picks[1]],stage:2,picks:d.picks.slice()};startIntro();G.f[0].cpu=G.f[1].cpu=false;}
  netUI.update();},
 // called by beginFight(): the first DELAY steps have no input yet, so both sides start them blank
 // (the other player's early inputs may already be waiting in `remote`: begin() cleared it when this match was
 // announced, and inputs are tagged with the match number, so anything there now belongs to this match. Keep it.)
 onBegin(){this.local.clear();this.hist.clear();
  for(let s=0;s<this.D;s++){this.local.set(s,0);if(!this.remote.has(s))this.remote.set(s,0);}this.lastSent=this.D-1;if(!this.myD)this.myD=this.D;},

 // ---- lockstep
 ready(s){const ok=this.local.has(s)&&this.remote.has(s);if(!ok)this.stallT+=1/60;else this.stallT=0;return ok;},
 take(s){const a=this.local.get(s),b=this.remote.get(s);const pair=this.me===0?[a,b]:[b,a];this.hist.set(s,pair);
  this.local.delete(s);this.remote.delete(s);if(this.hist.size>900)this.hist.delete(s-900);return pair;},
 afterStep(fs){if(G.resim||G.irp)return;
  // schedule my buttons myD steps ahead. If the delay grew, fill the gap with the same buttons; if it shrank, wait.
  const s=fs-1+this.myD,v=packInp(humanInput(0));
  if(s>this.lastSent){const from=this.lastSent+1,arr=[];for(let k=from;k<=s;k++){this.local.set(k,v);arr.push(v);}this.lastSent=s;this.send({t:'i',m:this.m,s:from,v:arr});}
  if(fs%60===0){const h=simHash();this.hashes.set(fs,h);if(this.role==='host'){this.snaps.set(fs,getSnap());this.snaps.delete(fs-600);}
   this.send({t:'h',m:this.m,s:fs,h});this.check(fs);this.hashes.delete(fs-1200);}
  if(++this.pingT>=60){this.pingT=0;this.ping();}},
 check(s){if(!this.hashes.has(s)||!this.rhashes.has(s))return;
  if(this.hashes.get(s)!==this.rhashes.get(s)){this.desyncs++;if(this.role==='guest')this.send({t:'need',m:this.m,s});}
  this.rhashes.delete(s);},
 // guest only: jump to the host's state at step s, then re-play every step since with the inputs we already have
 repair(s,data){if(this.role!=='guest'||G.scene!=='fight')return;const end=G.fstep;if(end<s)return;
  for(let k=s;k<end;k++)if(!this.hist.has(k))return;
  setSnap(data);const tape=[];for(let k=s;k<end;k++)tape[k]=this.hist.get(k);
  G.replay={inp:tape};G.resim=true;for(let k=0;G.fstep<end&&k<2000;k++)simStep();G.resim=false;G.replay=null;this.repairs++;},

 // ---- per-step menu handling during an online fight (never touches the match itself)
 updFightMeta(){
  if(G.over&&G.over.t>1.8){
   if(confirmP()||(clickQ&&inRect(clickQ,OVER_BTNS[0]))){if(!this.wantRematch){this.wantRematch=true;this.send({t:'rematch'});this.tryRematch();}}
   else if(hit(['Escape'])||(clickQ&&inRect(clickQ,OVER_BTNS[1]))){this.send({t:'reselect'});netToSelect();}
   else if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,OVER_BTNS[2]))){this.leave();G.scene='title';}
   return;}
  if(hit(['Escape','KeyP']))G.netMenu=!G.netMenu;
  if(G.netMenu){if(hit(['KeyQ'])||(clickQ&&inRect(clickQ,PAUSE_BTNS[1]))){this.leave();G.scene='title';}
   else if(clickQ&&inRect(clickQ,PAUSE_BTNS[0]))G.netMenu=false;}},
};
// heartbeat: ping every second; if we hear nothing for 6 s the other player is gone
setInterval(()=>{if(!NET.conn||!['connected','playing'].includes(NET.st))return;NET.ping();if(NET.lastRecv&&performance.now()-NET.lastRecv>6000)NET.drop();},1000);
function onNetConnected(){G.mode=2;G.scene='select';G.sel={c:[0,ROSTER.findIndex(c=>c.id==='papi')],stage:0,picks:[null,null]};netUI.show(false);sfx('bell');}
function netToSelect(){if(!NET.conn)return;NET.myPick=NET.theirPick=null;NET.st='connected';G.net=null;G.netMenu=false;G.mode=2;G.scene='select';
 G.sel={c:[NET.lastPicks?NET.lastPicks[NET.me]:0,0],stage:0,picks:[null,null]};}

// ---- online overlay drawn on top of the fight
function drawNetHUD(){if(PARTY.st!=='off'){PARTY.hud();return;}
 if(NET.st==='lost'){R(0,0,W,H,'rgba(6,2,3,0.8)');T('OPPONENT DISCONNECTED',192,90,2,'#ff4a3a','center','#000');T(coarse?'TAP TO RETURN':'PRESS ENTER',192,112,1,'#e9dcc6','center',null);return;}
 if(!G.net)return;
 const r=Math.round(NET.rtt);if(G.scene==='fight'&&!G.entrance)T('ONLINE • '+r+'MS',192,30,1,r<90?'#5fe07a':r<160?'#ffd35a':'#ff4a3a','center','#000');
 if(NET.stallT>0.5&&G.scene==='fight'){BOX(132,44,120,13,'#140a0c','#ffd35a');T('WAITING FOR OPPONENT...',192,48,1,'#fff','center',null);}
 if(G.netMenu&&!G.over){R(0,0,W,H,'rgba(6,2,3,0.7)');T('ONLINE MATCH',192,60,3,'#ffd35a','center','#5a0608');T("THE MATCH KEEPS GOING - YOU CAN'T PAUSE ONLINE",192,92,1,'#e9dcc6','center',null);
  [['BACK TO MATCH (ESC)',0],['LEAVE MATCH (Q)',1]].forEach(([s,i])=>{const b=PAUSE_BTNS[i];BOX(...b,'#140a0c','#ffd35a');T(s,192,b[1]+5,1,'#fff','center',null);});}
 if(G.over&&G.over.t>1.8){const msg=NET.wantRematch&&!NET.theyRematch?'WAITING FOR OPPONENT...':NET.theyRematch&&!NET.wantRematch?'OPPONENT WANTS A REMATCH!':'';if(msg)T(msg,192,114,1,'#ffd35a','center','#000');}}
function updNetLost(){if(NET.st==='lost'&&(confirmP()||clickQ||hit(['Escape']))){NET.close();NET.st='off';G.scene='title';}}

// ---- lobby (HTML so phones get a real keyboard for the code)
const netUI=(()=>{const el=document.createElement('div');el.id='netui';
 el.innerHTML=`<div class="nbox"><div class="nt">PLAY ONLINE</div>
 <div id="nmain"><button id="nhost">HOST A MATCH</button><div class="nor">— or join a friend —</div>
 <div class="nrow"><input id="ncode" maxlength="4" placeholder="CODE" autocomplete="off" autocapitalize="characters" spellcheck="false"><button id="njoin">JOIN</button></div></div>
 <div id="nwait"><div class="nsub">Tell your opponent this code:</div><div id="nshow"></div><div class="nsub" id="nwmsg">Waiting for them to join…</div></div>
 <div id="nmsg"></div><button id="nback">BACK</button></div>`;
 document.body.appendChild(el);
 const $=id=>el.querySelector('#'+id);
 $('nhost').onclick=()=>{initAudio();NET.host();api.update();};
 const doJoin=()=>{initAudio();NET.join($('ncode').value);api.update();};
 $('njoin').onclick=doJoin;$('ncode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')doJoin();});
 $('ncode').addEventListener('keyup',e=>e.stopPropagation());
 $('nback').onclick=()=>{NET.close();api.show(false);G.scene='title';};
 const api={show(on){el.classList.toggle('on',on);if(on){this.update();}},
  update(){const s=NET.st;$('nmain').style.display=(s==='hosting')?'none':'block';$('nwait').style.display=s==='hosting'?'block':'none';
   $('nshow').textContent=NET.code;$('nmsg').textContent=NET.err||(s==='joining'?'Connecting…':'');
   if(location.protocol==='file:'||/claude|anthropic/.test(location.hostname+document.referrer)){if(!NET.err&&s==='off')$('nmsg').textContent='Online play needs the website version of the game.';}}};
 return api;})();

// back from another app: get the room back on the server right away
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&NET.peer)NET.reconnect();});
setInterval(()=>{if(NET.peer&&NET.st!=='off')NET.reconnect();},3000);
