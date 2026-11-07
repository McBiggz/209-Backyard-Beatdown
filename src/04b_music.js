// ================= MUSIC (16-bit style, synthesized) =================
// Every theme lives in data/music.json. A theme = tempo, key, scale, instruments, drum groove, bass style,
// a 4-bar chord progression and 3 one-bar melody phrases (A B A C). Melody phrases are written as
// "degree:length" pairs in 16th notes ("0:2 2:2 4:4 .:8" = scale steps 0, 2, 4, then a rest).
// The victory fanfare is built from the same theme: an arpeggio up the home chord, then phrase A resolving home.
const NOTE_IX={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const SCALES={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],harmonic:[0,2,3,5,7,8,11],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10],
 phrygian:[0,1,3,5,7,8,10],spanish:[0,1,4,5,7,8,10],penta:[0,2,4,7,9],minpenta:[0,3,5,7,10],blues:[0,3,5,6,7,10]};
const DRUMS={rock:'k.h.s.h.kkh.s.h.',heavy:'k.....h.s.....h.',march:'s.ssk.s.s.ssk.ss',dhol:'k.hks.h.kkh.s.hk',disco:'k.h.ksh.k.h.ksh.',
 fast:'khshkhshkhshkhsh',cumbia:'k.hs.hk.hs.hk.hs',trap:'k...s..k..k.s.hh',shuffle:'k..hs..hk..hs.hh',tribal:'t.t.k.tt.tk.t.tt',none:'................'};
const MUS={g:null,echo:null,timer:null,cur:null,step:0,next:0,vol:1.0};
function musInit(){if(!AC||MUS.g)return;MUS.g=AC.createGain();MUS.g.gain.value=0;MUS.g.connect(master);
 const d=AC.createDelay(1),fb=AC.createGain(),lp=AC.createBiquadFilter(),wet=AC.createGain();d.delayTime.value=0.19;fb.gain.value=0.28;lp.type='lowpass';lp.frequency.value=2600;wet.gain.value=0.22;
 MUS.echo=AC.createGain();MUS.echo.connect(d);d.connect(lp).connect(fb).connect(d);lp.connect(wet).connect(MUS.g);
 const pw=(duty)=>{const n=32,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++)im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*duty);return AC.createPeriodicWave(re,im);};
 MUS.waves={pulse:pw(0.25),thin:pw(0.125)};}
const themeOf=id=>{const M=DATA.music||{};return M.themes&&(M.themes[id]||M.themes[M.fallback])||null;};
// turn a theme into one bar list of note events per voice
function musBuild(T,mode){const sc=SCALES[T.scale]||SCALES.major,root=60+(NOTE_IX[T.key]||0)+(T.octave||0)*12;
 const deg=d=>{const n=sc.length,o=Math.floor(d/n);return root+sc[((d%n)+n)%n]+12*o;};
 const parse=s=>{const ev=[];let t=0;for(const tok of String(s).trim().split(/\s+/)){const[d,l]=tok.split(':');const len=+l||1;if(d!=='.'&&t<16)ev.push({t,len:Math.min(len,16-t),d:+d});t+=len;}return ev;};
 const ph=T.phrases||[];let bars;
 if(mode==='win'){const a=parse(ph[0]||'0:4');const half=a.filter(e=>e.t<8);bars=[[{t:0,len:2,d:0},{t:2,len:2,d:2},{t:4,len:2,d:4},{t:6,len:10,d:sc.length}],[...half,{t:8,len:8,d:0}]];}
 else bars=[parse(ph[0]),parse(ph[1]),parse(ph[0]),parse(ph[2]||ph[1])];
 const prog=mode==='win'?[0,0]:(T.prog||[0,0,0,0]);
 return bars.map((mel,i)=>({mel,root:prog[i%prog.length],deg}));}
function musPlay(id,mode='theme',opts={}){if(!AC||G.resim)return;musInit();const T=themeOf(id);if(!T)return;
 const key=id+':'+mode;if(MUS.cur&&MUS.cur.key===key)return;
 MUS.cur={key,T,mode,bars:musBuild(T,mode),loop:mode!=='win',then:opts.then||null,quiet:opts.quiet||1};
 MUS.step=0;MUS.next=AC.currentTime+0.06;const v=MUS.vol*MUS.cur.quiet*(muted?0:1);MUS.g.gain.cancelScheduledValues(AC.currentTime);MUS.g.gain.setTargetAtTime(v,AC.currentTime,0.05);
 if(!MUS.timer)MUS.timer=setInterval(musTick,25);}
function musStop(fade=0.6){if(!MUS.cur||!AC)return;MUS.g.gain.setTargetAtTime(0,AC.currentTime,fade/3);const c=MUS.cur;setTimeout(()=>{if(MUS.cur===c)MUS.cur=null;},fade*1000);}
function musTick(){const C=MUS.cur;if(!C||!AC)return;const T=C.T,sd=60/T.bpm/4;
 while(MUS.next<AC.currentTime+0.15){const bi=Math.floor(MUS.step/16),s=MUS.step%16;
  if(bi>=C.bars.length){if(C.loop){MUS.step=0;continue;}if(C.then){const n=C.then;C.then=null;musPlay(n.id,n.mode,n.opts);return;}MUS.cur=null;return;}
  musStepPlay(C,C.bars[bi],s,MUS.next,sd);MUS.step++;MUS.next+=sd;}}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function voice(t,m,dur,type,vol,out,{vib=0,att=0.005,rel=0.06,detune=0,echo=false}={}){const o=AC.createOscillator();if(MUS.waves[type])o.setPeriodicWave(MUS.waves[type]);else o.type=type;
 o.frequency.setValueAtTime(mtof(m),t);if(detune)o.detune.value=detune;
 if(vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.5;lg.gain.value=vib;l.connect(lg).connect(o.frequency);l.start(t+0.12);l.stop(t+dur+rel);}
 const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.setValueAtTime(vol,t+Math.max(att,dur-0.02));g.gain.exponentialRampToValueAtTime(0.0001,t+dur+rel);
 o.connect(g);g.connect(out||MUS.g);if(echo)g.connect(MUS.echo);o.start(t);o.stop(t+dur+rel+0.02);}
function drum(t,ch,T){const nz=(dur,f,type,vol)=>{const s=AC.createBufferSource();s.buffer=noiseBuf;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;const g=AC.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl).connect(g).connect(MUS.g);s.start(t,Math.random()*1.5);s.stop(t+dur+0.02);};
 const sw=(f0,f1,dur,vol)=>{const o=AC.createOscillator();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=AC.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g).connect(MUS.g);o.start(t);o.stop(t+dur+0.02);};
 if(ch==='k')sw(140,42,0.16,0.55);else if(ch==='s'){nz(0.12,2200,'bandpass',0.28);sw(220,140,0.06,0.12);}else if(ch==='h')nz(0.035,7500,'highpass',0.09);
 else if(ch==='t')sw(200,95,0.18,0.38);else if(ch==='c')nz(0.9,6000,'highpass',0.16);}
function musStepPlay(C,bar,s,t,sd){const T=C.T,deg=bar.deg,r=bar.root;
 // drums
 let dp=DRUMS[T.drums]||DRUMS.rock;if(C.mode==='win')dp=bar===C.bars[0]?'s.s.s.sssssssssc':'k...............';
 const ch=dp[s];if(ch&&ch!=='.')drum(t,ch,T);
 // melody (+ optional harmony a 3rd below)
 for(const e of bar.mel)if(e.t===s){const d=e.len*sd*0.92;voice(t,deg(e.d)+12*(T.leadOct||0),d,T.lead||'square',0.085,null,{vib:e.len>=4?6:0,echo:true});
  if(T.harmony)voice(t,deg(e.d-2)+12*(T.leadOct||0),d,T.harmonyWave||'triangle',0.045,MUS.g);}
 // bass
 const b=deg(r)-24,st=T.bass||'drive',bw=T.bassWave||'triangle';
 if(st==='drive'&&s%2===0)voice(t,b,sd*1.6,bw,0.13,MUS.g,{rel:0.03});
 else if(st==='pulse'&&s%4===0)voice(t,b,sd*3.2,bw,0.15,MUS.g);
 else if(st==='octave'&&s%2===0)voice(t,b+(s%4===2?12:0),sd*1.6,bw,0.12,MUS.g,{rel:0.03});
 else if(st==='walk'&&s%4===0)voice(t,deg(r+[0,2,4,5][s/4])-24,sd*3.4,bw,0.14,MUS.g);
 else if(st==='tumbao'&&(s===0||s===6||s===8||s===12))voice(t,s===6||s===12?deg(r+4)-24:b,sd*2,bw,0.14,MUS.g);
 else if(st==='slow'&&s===0)voice(t,b,sd*14,bw,0.16,MUS.g);
 // pad: the bar's chord, held
 if(T.pad&&s===0)for(const k of [0,2,4])voice(t,deg(r+k)-12,sd*15.5,T.padWave||'sawtooth',0.022,MUS.g,{att:0.08,rel:0.25,detune:k?6:-6});}
// keep the mute key working for music too
function musMute(){if(MUS.g&&AC)MUS.g.gain.setTargetAtTime(muted?0:MUS.vol*(MUS.cur?MUS.cur.quiet:1),AC.currentTime,0.05);}
// what should be playing right now (called once per screen frame; never touches the match itself)
function musFrame(){if(!AC)return;const sc=G.scene;
 if(sc==='title'||sc==='lobby'||sc==='select'||sc==='intro')musPlay('title','theme',{quiet:0.6});
 else if(sc==='fight'&&G.over&&G.over.w&&!G.irp&&!G.tut&&G.over.t>1.3){const id=G.over.w.ch.id.replace('_alt',''),k=(G.rec&&G.rec.seed)+'|'+id;
  if(MUS.wonKey!==k){MUS.wonKey=k;musPlay(id,'win',{then:{id,mode:'theme',opts:{quiet:0.5}}});}}}
