// ================= AUDIO =================
let AC=null,master=null,crowdG=null,noiseBuf=null,muted=false;
function initAudio(){
 if(AC){if(AC.state==='suspended')AC.resume();return;}
 try{
  AC=new (window.AudioContext||window.webkitAudioContext)();
  master=AC.createGain();master.gain.value=0.5;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=850;f.Q.value=0.5;
  crowdG=AC.createGain();crowdG.gain.value=0.03;s.connect(f).connect(crowdG).connect(master);s.start();
 }catch(e){AC=null;}
}
function noise(dur,freq,q,vol,type='lowpass',atk=0.002){if(!AC)return;const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;
 const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=AC.createGain();
 g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+atk);g.gain.exponentialRampToValueAtTime(0.0001,t+atk+dur);
 s.connect(f).connect(g).connect(master);s.start(t,Math.random());s.stop(t+atk+dur+0.05);}
function tone(freq,dur,vol,type='sine',to,delay=0){if(!AC)return;const t=AC.currentTime+delay;const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,t);
 if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o.connect(g).connect(master);o.start(t);o.stop(t+dur+0.05);}
function bell(delay){if(!AC)return;const t=AC.currentTime+delay;[1,2.76,5.4].forEach((m,i)=>{const o=AC.createOscillator();o.frequency.value=820*m;const g=AC.createGain();
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.32/(i+1),t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+1.2/(i+1));o.connect(g).connect(master);o.start(t);o.stop(t+1.3);});}
function sfx(n){if(!AC||muted||G.resim)return;switch(n){
 case 'punch':noise(0.07,1900,1,0.55);tone(150,0.08,0.35,'square',60);break;
 case 'kick':noise(0.12,1300,1,0.7);tone(120,0.12,0.45,'triangle',45);break;
 case 'slam':noise(0.4,380,0.7,0.95);tone(75,0.45,0.8,'sine',32);break;
 case 'grab':noise(0.1,700,1,0.3,'bandpass');break;
 case 'block':noise(0.05,3200,1.5,0.35,'bandpass');tone(220,0.05,0.2,'square',140);break;
 case 'whoosh':noise(0.3,900,2,0.35,'bandpass',0.08);break;
 case 'fire':noise(0.7,700,0.8,0.5,'lowpass',0.05);tone(90,0.6,0.25,'sawtooth',40);break;
 case 'count':noise(0.06,2600,2,0.7);tone(320,0.05,0.25,'square');break;
 case 'bell':bell(0);bell(0.32);bell(0.64);break;
 case 'roar':noise(1.5,750,0.6,0.5,'bandpass',0.18);break;
 case 'boo':[110,123,138,150].forEach((f,i)=>tone(f,1.0,0.07,'sawtooth',f*0.8,i*0.03));noise(1.0,400,0.6,0.25,'lowpass',0.2);break;
 case 'scream':tone(420,0.9,0.3,'sawtooth',170);tone(640,0.9,0.14,'square',250);noise(0.9,1500,1,0.4,'bandpass',0.03);break;
 case 'glitter':for(let i=0;i<5;i++)tone(1500+Math.random()*1800,0.15,0.08,'sine',null,i*0.05);break;
}}


function ropeSfx(){if(!AC||muted||G.resim)return;tone(80,0.3,0.45,'triangle',55);noise(0.18,300,1,0.4);}

