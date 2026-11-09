// ================= MATCH SETUP (test link) =================
// One screen to set up any match: type, rules, elimination, arena and who controls each wrestler.
// Works with keys (arrows/WASD to move and change, Enter to start) and with taps (big rows, < > arrows, START).
const MS_TYPES=[['1 ON 1','single',2],['TRIPLE THREAT','multi',3],['FATAL 4-WAY','multi',4],['TAG TEAM','tag',4],['ROYAL RUMBLE','rumble',8]];
const MS_RULES=[['NORMAL',''],['HARDCORE','hc'],['STEEL CAGE','cage']];
const MS_MAPS=[['BMF RANCH','ranch'],['THE BARN','secret']];
const MS_CTL=['P1','P2','CPU'],MS_CTLCOL=['#ff4a3a','#3a8bff','#8a7a66'];
G.ms={type:0,rules:0,elim:0,map:0,ctl:[0,2,2,2],row:0};
const msCount=(t=G.ms.type)=>MS_TYPES[t][2];
const msSlots=(t=G.ms.type)=>Math.min(4,msCount(t));
function msSlotName(i){const t=MS_TYPES[G.ms.type][1];
 if(t==='tag')return (i<2?'TEAM A':'TEAM B')+' #'+(i%2+1);if(t==='rumble')return 'ENTRANT '+(i+1);return 'WRESTLER '+(i+1);}
function msRows(){const ms=G.ms,t=MS_TYPES[ms.type][1],rows=[{k:'type'}];
 if(t==='single')rows.push({k:'rules'});if(t==='multi')rows.push({k:'elim'});rows.push({k:'map'});
 for(let i=0;i<msSlots();i++)rows.push({k:'slot',i});rows.push({k:'start'});return rows;}
function msVal(r){const ms=G.ms;
 if(r.k==='type')return['MATCH',MS_TYPES[ms.type][0]];if(r.k==='rules')return['RULES',MS_RULES[ms.rules][0]];
 if(r.k==='elim')return['ELIMINATION',ms.elim?'ON - LAST ONE STANDING':'OFF - FIRST PIN WINS'];
 if(r.k==='map')return['ARENA',MS_MAPS[ms.map][0]];if(r.k==='slot')return[msSlotName(r.i),MS_CTL[ms.ctl[r.i]]];return['',''];}
function msChange(r,d){const ms=G.ms;sfx('punch');
 if(r.k==='type'){ms.type=(ms.type+d+MS_TYPES.length)%MS_TYPES.length;ms.row=Math.min(ms.row,msRows().length-1);}
 else if(r.k==='rules')ms.rules=(ms.rules+d+3)%3;else if(r.k==='elim')ms.elim=ms.elim?0:1;else if(r.k==='map')ms.map=(ms.map+d+2)%2;
 else if(r.k==='slot'){const c=(ms.ctl[r.i]+d+3)%3;
  // P1 and P2 are one wrestler each: taking P1 here makes the old P1 slot a CPU
  if(c<2)ms.ctl.forEach((v,j)=>{if(j!==r.i&&v===c)ms.ctl[j]=2;});ms.ctl[r.i]=c;}}
// screen layout (384x216): rows down the middle, START at the bottom, BACK top-left
const MS_X=56,MS_W=272,MS_Y0=30,MS_RH=17,MS_BACK=[4,4,40,13],MS_GO=[132,192,120,19];
const msRowRect=i=>[MS_X,MS_Y0+i*MS_RH,MS_W,MS_RH-3];
function msOpen(online){G.ms.row=0;G.scene='setup';G.ms.online=online;}
function updSetup(){const ms=G.ms,rows=msRows();
 if(hit(['Escape'])||(clickQ&&inRect(clickQ,MS_BACK))){G.scene='title';sfx('punch');return;}
 if(hit(['KeyW','ArrowUp']))ms.row=(ms.row+rows.length-1)%rows.length;
 if(hit(['KeyS','ArrowDown']))ms.row=(ms.row+1)%rows.length;
 const r=rows[ms.row];
 if(r.k!=='start'){if(hit(['KeyA','ArrowLeft']))msChange(r,-1);if(hit(['KeyD','ArrowRight']))msChange(r,1);if(confirmP())msChange(r,1);}
 else if(confirmP()){mselOpen();sfx('bell');return;}
 if(clickQ){const q=clickQ;
  if(inRect(q,MS_GO)){mselOpen();sfx('bell');return;}
  rows.forEach((rr,i)=>{if(rr.k==='start')return;const b=msRowRect(i);if(!inRect(q,b))return;ms.row=i;
   msChange(rr,q.x<b[0]+b[2]*0.42?-1:1);});}}
function msArrow(x,y,d,col){for(let k=0;k<4;k++)R(d<0?x+k:x+3-k,y+3-k,1,2*k+1,col);}
function drawSetup(){drawArena();R(0,0,W,H,'rgba(6,2,3,0.82)');const ms=G.ms,rows=msRows();
 T('MATCH SETUP',192,8,2,'#ffd35a','center','#5a0608');
 BOX(...MS_BACK,'#140a0c','#5a4a40');T('< BACK',MS_BACK[0]+20,MS_BACK[1]+4,1,'#bfae98','center',null);
 rows.forEach((r,i)=>{if(r.k==='start')return;const[x,y,w,h]=msRowRect(i),on=ms.row===i,[lab,val]=msVal(r);
  BOX(x,y,w,h,on?'#8f0f14':'#140a0c',on?'#ffd35a':'#5a4a40');
  T(lab,x+5,y+4,1,on?'#ffd35a':'#8a7a66','left',null);
  const vx=x+176,col=r.k==='slot'?MS_CTLCOL[ms.ctl[r.i]]:'#fff';
  msArrow(x+104,y+3,-1,on?'#ffd35a':'#5a4a40');msArrow(x+w-10,y+3,1,on?'#ffd35a':'#5a4a40');
  if(r.k==='slot'){R(vx-TW(val)/2-3,y+2,TW(val)+6,h-4,col);T(val,vx,y+4,1,'#fff','center',null);}
  else T(val,vx,y+4,1,col,'center',null);});
 const onGo=rows[ms.row].k==='start',bl=Math.floor(G.t*3)%2;
 BOX(...MS_GO,onGo?'#8f0f14':'#3a0a0c','#ffd35a');T('PICK WRESTLERS >',192,MS_GO[1]+6,1,onGo&&bl?'#ffd35a':'#fff','center',null);
 const t=MS_TYPES[ms.type][1],note=t==='rumble'?'8 WRESTLERS - THE OTHER 4 ENTRANTS ARE RANDOM CPUS':t==='tag'?'TEAM A: WRESTLERS 1+2  -  TEAM B: WRESTLERS 3+4':t==='multi'?'ANYONE CAN BREAK UP A PIN':'';
 if(note)T(note,192,MS_GO[1]-9,1,'#8a7a66','center',null);
 if(!coarse)T('UP/DOWN PICK A ROW  -  LEFT/RIGHT CHANGE IT  -  ESC BACK',192,208,1,'#5a4a40','center',null);}

// ---------- wrestler picks for every slot, one after another ----------
// online, the same screen is used to pick just your own wrestler (party: true)
function mselOpen(party){const n=party?1:msSlots();G.msel={slot:0,n,picks:[],c:0,page:0,party:!!party};
 if(!party&&G.mselLast)G.msel.c=G.mselLast[0]||0;G.scene='msel';}
const MSEL_RND=[296,3,84,11];
function mselCtl(i){return G.msel.party?0:G.ms.ctl[i];}
function updMsel(){const S=G.msel,n=ROSTER.length-1; // the last roster entry is the ref
 if(hit(['Escape'])){if(S.slot>0){S.slot--;S.c=S.picks.pop();}else G.scene=S.party?'party':'setup';sfx('punch');return;}
 const o=S.c;if(hit(['KeyA','ArrowLeft']))S.c=(S.c+n-1)%n;if(hit(['KeyD','ArrowRight']))S.c=(S.c+1)%n;
 if(hit(['KeyW','ArrowUp']))S.c=vmove(S.c,-1,n);if(hit(['KeyS','ArrowDown']))S.c=vmove(S.c,1,n);if(S.c!==o)S.page=pageOf(S.c);
 if(hit(['KeyQ','PageUp','KeyE','PageDown'])){const P=Math.ceil(n/PER);S.page=(S.page+(hit(['KeyQ','PageUp'])?-1:1)+P)%P;S.c=Math.min(n-1,S.page*PER+S.c%PER);}
 let pick=null;if(confirmP()||hit(['KeyJ']))pick=S.c;
 if(hit(['KeyR'])||(clickQ&&inRect(clickQ,MSEL_RND))){const free=[...Array(n).keys()].filter(i=>!S.picks.includes(i)&&ROSTER[i].id!=='kliq');pick=free[Math.floor(Math.random()*free.length)];}
 else if(clickQ&&inRect(clickQ,PAGE_BTN)){const P=Math.ceil(n/PER);S.page=(S.page+(clickQ.x<PAGE_BTN[0]+PAGE_BTN[2]/2?-1:1)+P)%P;}
 else if(clickQ)for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++)if(inRect(clickQ,cardRect(i))){pick=i;break;}
 if(pick==null)return;
 if(S.picks.includes(pick)){sfx('whoosh');return;} // already taken in this match
 S.picks.push(pick);S.c=pick;sfx('kick');
 if(S.party){PARTY.pick(pick);G.scene='party';return;}
 if(++S.slot>=S.n){G.mselLast=S.picks.slice();startFromSetup();}}
function drawMsel(){drawArena();R(0,0,W,H,'rgba(6,2,3,0.8)');const S=G.msel,n=ROSTER.length-1,ctl=mselCtl(S.slot);
 const who=S.party?'PICK YOUR WRESTLER':msSlotName(S.slot)+' ('+MS_CTL[ctl]+')';
 R(4,3,218,11,MS_CTLCOL[ctl]);T(who+(S.party?'':'  '+(S.slot+1)+'/'+S.n),113,5,1,'#fff','center',null);
 {const P=Math.ceil(n/PER);BOX(...PAGE_BTN,'#140a0c','#ffd35a');T('< PAGE '+(S.page+1)+'/'+P+' >',PAGE_BTN[0]+PAGE_BTN[2]/2,PAGE_BTN[1]+3,1,'#ffd35a','center',null);}
 BOX(...MSEL_RND,'#8f0f14','#ffd35a');T('RANDOM',MSEL_RND[0]+42,MSEL_RND[1]+3,1,'#fff','center',null);
 for(let i=S.page*PER;i<Math.min(n,S.page*PER+PER);i++){const ch=ROSTER[i],[x,y,w,h]=cardRect(i);const bc=['#111111','#161616','#141414'].includes(ch.trunks)?ch.accent:ch.trunks;
  R(x,y,w,h,'#140a0c');for(let k=0;k<4;k++)R(x,y+k*14,w,14,shade(bc,-0.45-k*0.12));
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h-9);ctx.clip();const st=SETS[ch.id],fy=Math.max(y+h-12,y+4+(AY-(st.idle0_top||20)));ELL(x+w/2,fy,12,2,'rgba(0,0,0,0.35)');drawSpr(st,'idle'+(Math.floor(G.t*1.6+i)%2),x+w/2,fy,1);ctx.restore();
  R(x,y+h-9,w,9,'#0a0506');T(cardName(ch),x+w/2,y+h-7,1,'#fff','center',null);
  const tk=S.picks.indexOf(i);if(tk>=0){R(x,y,w,h-9,'rgba(0,0,0,0.55)');const c=MS_CTLCOL[mselCtl(tk)],l=S.party?'YOU':MS_CTL[mselCtl(tk)];R(x+w/2-12,y+30,24,9,c);T(l,x+w/2,y+31,1,'#fff','center',null);}
  if(S.c===i){const c=MS_CTLCOL[ctl];R(x-1,y-1,w+2,2,c);R(x-1,y+h-1,w+2,2,c);R(x-1,y,2,h,c);R(x+w-1,y,2,h,c);}}
 const ch=ROSTER[S.c];BOX(4,184,376,22,'#140a0c',MS_CTLCOL[ctl]);T(ch.name,7,187,1,'#fff','left',null);T(ch.tag+' - '+ch.fin,7,195,1,'#bfae98','left',null);
 if(!S.party&&S.picks.length){T('PICKED: '+S.picks.map(p=>ROSTER[p].short).join(', '),377,191,1,'#8a7a66','right',null);}
 T(coarse?'TAP A WRESTLER - TAP RANDOM FOR A SURPRISE':'ARROWS PICK - ENTER LOCK IN - R RANDOM - ESC BACK',192,209,1,'#8a7a66','center',null);}

// ---------- start the match that was set up ----------
function msRandomIds(have,count){const pool=ROSTER.filter(c=>c.id!=='kliq'&&c.id!=='ref'&&!have.includes(c.id)).map(c=>c.id);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,count);}
// turns the setup + picks into a startGroup() config (also used by the online lobby)
function msBuildCfg(typeIdx,picks,ctl,elim,map){const ty=MS_TYPES[typeIdx],ids=picks.map(p=>ROSTER[p].id);let order;
 if(ty[1]==='rumble'){ids.push(...msRandomIds(ids,8-ids.length));while(ctl.length<8)ctl.push('cpu');
  order=[...Array(8).keys()];for(let i=7;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}}
 return{type:ty[1]==='single'?'multi':ty[1],ids,ctl,elim:ty[1]==='multi'&&!!elim,map,order,fromSetup:true};}
function startFromSetup(){const ms=G.ms,ty=MS_TYPES[ms.type],picks=G.msel.picks.slice(),ctl=ms.ctl.slice(0,picks.length).map(c=>c===2?'cpu':c);
 G.mapPick=MS_MAPS[ms.map][1];G.fromSetup=true;
 // 1 on 1 with a human runs on the classic engine (it has hardcore, cage, entrances and the Secret Map)
 if(ty[1]==='single'&&ctl.some(c=>c!=='cpu')){let a=0,b=1;if(ctl[0]==='cpu'||ctl[1]===0){a=1;b=0;}
  G.mode=ctl[b]==='cpu'?0:1;const rl=MS_RULES[ms.rules][1];G.hc=rl==='hc';G.cage=rl==='cage';G.stage=3;
  G.sel={c:[picks[a],picks[b]],stage:2,picks:[picks[a],picks[b]]};startIntro();return;}
 const cfg=msBuildCfg(ms.type,picks,ctl,ms.elim,G.mapPick);cfg.me=Math.max(0,cfg.ctl.findIndex(c=>c===0||c===1));
 G.mode=0;startGroup(cfg);}
