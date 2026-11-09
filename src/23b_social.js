// ================= SOCIAL MEDIA & PROMOS (Universe Mode, test link) =================
// Once a week you can cut a promo: build a post from 3 lines (HYPE / TRASH TALK / RESPECT), post it, watch the reactions.
// Followers make the crowd hotter and start your finisher meter higher. Trash talk is a gamble: win = bonus, lose = RATIO'D.
// 3,000 followers earns a shot at the SOCIAL MEDIA CHAMPIONSHIP.
const SM_TITLE_AT=3000;
const PROMO_LINES={
 hype:[['THE {ME} IS COMING FOR WHAT\'S MINE.','SATURDAY AT THE DEN. BE THERE.','NOBODY IN THE 209 WORKS HARDER THAN ME.'],
       ['I\'VE BEEN IN THE GYM ALL WEEK.','THE BARN IS GONNA SHAKE.','THIS IS MY YEAR.'],
       ['BMF RANCH BABY.','SEE YOU AT THE DEN.','HIT THAT FOLLOW. YOU WON\'T WANT TO MISS IT.']],
 trash:[['{OPP} WRESTLES LIKE HE LEARNED ON YOUTUBE.','{OPP}, I\'VE SEEN BETTER MOVES AT A WEDDING.','{OPP} IS ALL TALK AND NO TAPE.'],
        ['TELL {OPP} TO BRING A STRETCHER.','{OPP} BETTER STRETCH. HE\'S GONNA BE ON THE MAT.','I\'M PUTTING {OPP} THROUGH A TABLE. MAYBE TWO.'],
        ['CRY ABOUT IT, {OPP}.','{OPP}, LOG OFF.','RETIRE ALREADY, {OPP}.']],
 respect:[['{OPP} IS TOUGH. I\'M TOUGHER.','MAD RESPECT TO {OPP}.','{OPP} HAS EARNED THIS MATCH.'],
          ['MAY THE BEST MAN WIN SATURDAY.','HAYASHI AND CJ GOT ME READY.','WE\'RE GONNA STEAL THE SHOW.'],
          ['RESPECT THE GRIND. 209.','SEE YOU IN THE RING, BROTHER.','THANK YOU TO EVERY FAN AT THE DEN.']]};
const TONE_LBL={hype:'HYPE',trash:'TRASH TALK',respect:'RESPECT'},TONE_COL={hype:'#ffd35a',trash:'#ff4a3a',respect:'#5fe07a'};
const smFix=U=>{if(U.fol==null)U.fol=500;if(!U.feed)U.feed=[];if(!U.sm)U.sm={holder:null,champ:false,shot:0};return U;};
function smTarget(U){const ids=Object.keys(U.riv||{});const r=ids.find(id=>U.riv[id].week>=U.week);return r?ROSTER.find(c=>c.id===r):uniOpp();}
function promoStart(){const U=smFix(G.uni);if(U.posted)return;const opp=smTarget(U),me=ROSTER.find(c=>c.id===U.me);
 const fill=s=>s.replace(/\{ME\}/g,me.short.toUpperCase()).replace(/\{OPP\}/g,opp.short.toUpperCase()).replace(/\{OPPTAG\}/g,opp.short.toUpperCase().replace(/[^A-Z]/g,''));
 const slots=[0,1,2].map(i=>{const opts=['hype','trash','respect'].map(t=>({t,s:fill(PROMO_LINES[t][i][Math.floor(Math.random()*3)])}));
  for(let k=opts.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[opts[k],opts[j]]=[opts[j],opts[k]];}return opts;});
 G.pr={slots,pick:[],sel:0,phase:'write',t:0,opp,me,likes:0,goal:0,replies:[],shown:0};G.scene='promo';sfx('punch');}
function promoScore(P){const U=G.uni,tones=P.pick.map(p=>p.t),n=k=>tones.filter(t=>t===k).length;
 const same=Math.max(n('hype'),n('trash'),n('respect')),rival=!!(U.riv&&U.riv[P.opp.id]);
 let base=60+Math.round(U.fol*0.04);base*=same===3?1.8:same===2?1.35:1;if(n('trash'))base*=1+0.25*n('trash');if(rival)base*=1.5;
 if(U.champ||(U.sm&&U.sm.champ))base*=1.25;
 base*=0.8+Math.random()*0.45;const fol=Math.round(base),likes=Math.round(fol*(6+Math.random()*4));
 const heat=n('trash')>=2,bad=n('trash')>=1&&n('respect')>=1; // mixed signals land flat
 return{fol:bad?Math.round(fol*0.6):fol,likes:bad?Math.round(likes*0.6):likes,heat,rival,same};}
const REPLIES={trash:['SEE YOU SATURDAY. BRING YOUR MOUTHGUARD.','BIG WORDS FOR SOMEBODY I\'VE PINNED.','SCREENSHOTTED. RECEIPTS SATURDAY.'],
 hype:['LET\'S GOOO','THE BARN IS READY.','209 STAND UP!'],respect:['RESPECT. SEE YOU IN THERE.','APPRECIATE IT. NO HOLDING BACK THOUGH.','THIS IS WHAT IT\'S ABOUT.']};
function promoPost(P){const U=G.uni,S=promoScore(P);P.res=S;P.goal=S.likes;P.phase='post';P.t=0;
 const top=P.pick.reduce((a,p)=>{a[p.t]=(a[p.t]||0)+1;return a;},{}),tone=Object.keys(top).sort((a,b)=>top[b]-top[a])[0];
 P.replies=[{who:P.opp.short.toUpperCase(),s:REPLIES[tone][Math.floor(Math.random()*3)]},{who:'DEN FAN',s:['W POST','THIS IS CINEMA','ON MY WAY TO THE DEN','HE\'S COOKING'][Math.floor(Math.random()*4)]}];
 U.fol+=S.fol;U.posted=true;U.heat=S.heat?P.opp.id:null;U.feed.unshift(P.pick.map(p=>p.s).join(' ').slice(0,60));U.feed=U.feed.slice(0,3);sfx('roar');uniSave();}
function updPromo(){const P=G.pr,dt=STEP,inp=humanInput(0);P.t+=dt;G.pops.length=0;
 if(hit(['Escape'])&&P.phase==='write'){G.scene='uni';return;}
 if(P.phase==='write'){const opts=P.slots[P.pick.length];
  if(hit(['KeyW','ArrowUp']))P.sel=(P.sel+2)%3;if(hit(['KeyS','ArrowDown']))P.sel=(P.sel+1)%3;
  let go=confirmP()||inp.punchP||inp.grabP;if(clickQ)opts.forEach((_,i)=>{if(inRect(clickQ,PR_OPT(i))){P.sel=i;go=true;}});
  if(go){P.pick.push(opts[P.sel]);P.sel=0;sfx('punch');if(P.pick.length===3)promoPost(P);}return;}
 if(P.phase==='post'){P.likes=Math.min(P.goal,Math.round(P.goal*Math.min(1,P.t/2.2)));P.shown=P.t>2.4?2:P.t>1.4?1:0;
  if(P.t>2.6&&(confirmP()||clickQ||inp.punchP||inp.jumpP)){const U=G.uni;U.flash=`+${P.res.fol} FOLLOWERS`+(P.res.heat?' • HEATED!':'');U.flashT=3;G.scene='uni';smCheckTitle(U);uniSave();}}}
const PR_OPT=i=>[132,96+i*30,180,26];
function wrapTxt(s,maxc){const w=s.split(' '),out=[];let l='';for(const x of w){if((l+' '+x).trim().length>maxc){out.push(l.trim());l=x;}else l+=' '+x;}if(l.trim())out.push(l.trim());return out;}
function drawPhone(x,y,w,h){R(x-3,y-3,w+6,h+6,'#0a0a0e');R(x-2,y-2,w+4,h+4,'#2a2a34');R(x,y,w,h,'#f4f2ee');R(x+w/2-10,y-1,20,2,'#0a0a0e');}
function drawPromo(){const P=G.pr,U=G.uni;if(SECRET.complete)ctx.drawImage(SECRET,-60,0,MAPW,H);R(0,0,W,H,'rgba(8,4,6,0.82)');
 drawSpr(SETS[U.me],P.phase==='post'?'win0':'idle0',60,190,1,1);
 T('CUT A PROMO',12,8,2,'#ffd35a','left','#5a0608');T('TARGET: '+P.opp.name,12,30,1,'#bfae98','left',null);T('FOLLOWERS '+smFmt(U.fol),12,40,1,'#fff','left',null);
 const px=132,py=8,pw=180,ph=84;drawPhone(px,py,pw,ph);
 T(P.me.short.toUpperCase().replace(/\s/g,''),px+6,py+5,1,'#1a1a1a','left',null);
 {const k=U.champ?'hw':(U.sm&&U.sm.champ)?'sm':null;if(k){drawBeltIcon(px+pw-30,py+3,k);T(k==='hw'?'DEN CHAMP':'SM CHAMP',px+pw-56,py+5,1,'#c4161c','right',null);}}
 const body=P.pick.map(p=>p.s).join(' ');wrapTxt(body||'...',42).slice(0,6).forEach((l,i)=>T(l,px+6,py+16+i*9,1,body?'#1a1a1a':'#9a9a9a','left',null));
 if(P.phase==='write'){T('LINE '+(P.pick.length+1)+' OF 3',W-8,8,1,'#bfae98','right',null);
  P.slots[P.pick.length].forEach((o,i)=>{const r=PR_OPT(i),on=P.sel===i;BOX(...r,on?'#2a1416':'#140a0c',on?TONE_COL[o.t]:'#5a4a40');
   T(TONE_LBL[o.t],r[0]+4,r[1]+3,1,TONE_COL[o.t],'left',null);wrapTxt(o.s,42).slice(0,2).forEach((l,k)=>T(l,r[0]+4,r[1]+11+k*7,1,'#fff','left',null));});
  T(coarse?'TAP A LINE':'W/S TO PICK • ENTER TO ADD',192,204,1,'#6a5a4a','center',null);}
 else{R(px,py+ph-14,pw,14,'#e4e0da');T(smFmt(P.likes)+' LIKES',px+6,py+ph-10,1,'#d42a2a','left',null);T('POSTED',px+pw-6,py+ph-10,1,'#7a7a7a','right',null);
  P.replies.slice(0,P.shown).forEach((r,i)=>{BOX(px,100+i*24,pw,20,'#140a0c','#5a4a40');T(r.who,px+4,104+i*24,1,'#3a8bff','left',null);T(r.s.slice(0,44),px+4,112+i*24,1,'#fff','left',null);});
  if(P.t>1){const S=P.res;T('+'+S.fol+' FOLLOWERS',px+pw/2,152,2,'#5fe07a','center','#000');
   T(S.same===3?'ON-BRAND COMBO!':S.same===2?'GOOD COMBO':'',px+pw/2,170,1,'#ffd35a','center',null);
   if(S.rival)T('CALLED OUT YOUR RIVAL: GOING VIRAL',px+pw/2,180,1,'#ff8a7a','center',null);
   if(S.heat)T('HEATED! WIN AND IT PAYS OFF. LOSE AND GET RATIO\'D',px+pw/2,190,1,'#ff4a3a','center',null);}
  if(P.t>2.6)T(coarse?'TAP TO CONTINUE':'PRESS ENTER',192,204,1,'#bfae98','center',null);}}
const smFmt=n=>n>=10000?(n/1000).toFixed(1)+'K':String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
// ---------- effects on matches ----------
function smMatchStart(){const U=G.uni;if(!U||!G.uniMatch)return;smFix(U);const f=G.f[0];
 f.meter=Math.min(30,Math.round(U.fol/250));G.hype=Math.max(G.hype,Math.min(0.75,0.35+U.fol/10000));
 if(U.heat===uniOpp().id)say(`${f.ch.short} has been running his mouth online all week. The Den wants blood!`);}
function smAfterMatch(U,won,opId){smFix(U);let msg='';
 if(U.heat===opId){if(won){const b=Math.round(150+U.fol*0.08);U.fol+=b;msg=`BACKED UP THE TRASH TALK! +${b} FOLLOWERS`;}
  else{const l=Math.round(U.fol*0.12);U.fol=Math.max(0,U.fol-l);msg=`RATIO'D! -${l} FOLLOWERS`;}}
 else if(won)U.fol+=40;
 U.vic=won?uniOpp().id:null;
 if(U.kind[U.week-1]==='smtitle'&&won){U.sm.champ=true;msg='SOCIAL MEDIA CHAMPION!';}
 U.heat=null;U.posted=false;return msg;}
function smCheckTitle(U){smFix(U);if(U.sm.champ||U.sm.shot||U.fol<SM_TITLE_AT)return;
 if(!U.sm.holder){const pool=ROSTER.filter(c=>c.id!==U.me&&!/^kliq|^mainevent/.test(c.id));U.sm.holder=pool[Math.floor(Math.random()*pool.length)].id;}
 const w=uniBook(U,U.sm.holder,'smtitle',U.week+1);if(w){U.sm.shot=w;U.flash=`${smFmt(U.fol)} FOLLOWERS! SOCIAL MEDIA TITLE SHOT WEEK ${w}`;U.flashT=4;}}

// free post after a win: bigger if it was a rivalry, a title, or you backed up trash talk
function smVictory(U){const op=ROSTER.find(c=>c.id===U.vic)||uniOpp(),nm=op.short.toUpperCase();const b=Math.round(80+U.fol*0.05);
 U.fol+=b;U.feed.unshift(`ANOTHER W AT THE DEN. ${nm}, GOOD MATCH. WHO'S NEXT?`);U.feed=U.feed.slice(0,3);U.vic=null;
 U.flash=`VICTORY POST: +${b} FOLLOWERS`;U.flashT=3;sfx('roar');smCheckTitle(U);uniSave();}
// 3. champions post with the belt: a little pixel belt on the phone (swapped for the real art once it's in)
function drawBeltIcon(x,y,kind){const strap=kind==='sm'?'#c4161c':'#141414',plate=kind==='sm'?'#c8c8d4':'#e8b830',hi=kind==='sm'?'#ffffff':'#fff2a0';
 R(x-22,y+3,44,8,'#000');R(x-21,y+4,42,6,strap);R(x-9,y,18,14,'#000');R(x-8,y+1,16,12,plate);R(x-6,y+2,4,2,hi);R(x-4,y+6,8,2,kind==='sm'?'#c4161c':'#c4161c');
 R(x-17,y+5,4,4,plate);R(x+13,y+5,4,4,plate);}
