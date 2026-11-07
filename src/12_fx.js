// ================= FX =================
function shake(a){G.shake=Math.max(G.shake,a);}
function pop(x,y,text,col='#fff'){G.pops.push({x,y,text,col,life:1.1,max:1.1});}
function popOn(f,text,col){pop(PX(f.x,f.z),PY(f.z)-f.y-70*f.ch.size,text,col);}
function say(s){G.ticker=s;G.tickerT=0;}
function callout(text,col='#ffd35a',dur=1.4){G.callout={text,col,t:0,dur};}
function part(x,y,vx,vy,life,col,size=1,type='spark'){G.parts.push({x,y,vx,vy,life,max:life,col,size,type});}
const sx_=f=>PX(f.x,f.z),sy_=f=>PY(f.z)-f.y;
function hitFx(x,y,n=8,cols=['#fff','#ffe680','#ffb347']){for(let i=0;i<n;i++){const a=rnd(Math.PI*2),s=rnd(40,150);part(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(0.12,0.3),pick(cols),pick([1,1,2]));}}
function dust(x,y,big){for(let i=0;i<(big?14:6);i++)part(x+rnd(-14,14),y+rnd(-2,1),rnd(-70,70),rnd(-50,-10),rnd(0.25,0.55),pick(['#d8cfbf','#bdb3a2']),2,'dust');}
function fireFx(x,y,n=10){for(let i=0;i<n;i++)part(x+rnd(-8,8),y+rnd(-12,12),rnd(-40,40),rnd(-110,-20),rnd(0.25,0.6),pick(['#ff3b1f','#ff8a1f','#ffd35a']),2,'fire');}
function glitterFx(x,y,n=10){for(let i=0;i<n;i++){const a=rnd(Math.PI*2),s=rnd(20,120);part(x,y,Math.cos(a)*s,Math.sin(a)*s-30,rnd(0.35,0.8),pick(['#ff5ad8','#22d3c5','#fff36b','#ffffff','#a77bff']),1,'glitter');}}
function crowdReact(f,big){G.hype=Math.min(1,G.hype+(big?0.35:0.12));
 if(f.ch.align==='heel'){sfx('boo');pop(rnd(110,280),rnd(66,80),pick(['BOOO!','BOO!']),'#9cff57');}
 else{sfx('roar');pop(rnd(110,280),rnd(66,80),pick(['OHHH!','209!','YEAH!']),'#ffd35a');}}
const LINES={
 punch:['{a} with a stiff right hand!','{a} tees off on {d}!','Big shot from {a}!','{a} lands a haymaker!'],
 kick:['{a} with a thunderous kick!','{a} lights up {d}!','Right on the button from {a}!'],
 drop:['DROPKICK from {a}! Both boots!','{a} flies in with a dropkick!'],
 grab:['{a} hoists {d} up... SUPLEX!','{a} drops {d} on the back of the head!','Suplex city in the 209!'],
 stomp:['{a} puts the boots to {d}!','{a} stomping a mudhole!'],
 perch:['{a} is climbing the turnbuckle!','{a} going UP TOP in the Den!'],
 dive:['{a} hits it from the top! Unbelievable!','{a} flies off the top rope!'],
 crash:['{a} crashes and burns!','Nobody home! {a} eats the mat!'],
 pin:['{a} with the cover!','{a} hooks the leg!'],
 kickout:['{d} kicks out! The Den is going nuts!','NO! {d} gets the shoulder up!'],
 fin:['{a} hits the {f}! That could be it!','THE {f}! {d} is folded in half!'],
};
function line(k,a,d){say(pick(LINES[k]).replace(/\{a\}/g,a.ch.short).replace(/\{d\}/g,d?d.ch.short:'').replace(/\{f\}/g,a.ch.fin));}


LINES.rev=['{a} reverses the whip!','No you don\'t! {a} turns it around!'];
LINES.whip=['{a} whips {d} into the ropes!','{a} sends {d} for a ride!'];
LINES.clothes=['CLOTHESLINE! {a} turns {d} inside out!','{a} meets {d} with a big boot!'];

