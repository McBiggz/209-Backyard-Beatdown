# Renders every theme (entrance loop + victory fanfare) to audio so the soundtrack can be heard and checked.
import asyncio,sys,base64,json,struct,os
from playwright.async_api import async_playwright
URL=sys.argv[1];OUT=sys.argv[2]
JS="""async (id)=>{const T=themeOf(id),sd=60/T.bpm/4;const themeLen=4*16*sd,winLen=2*16*sd,secs=themeLen+winLen+1.2,sr=32000;
 const off=new OfflineAudioContext(1,Math.ceil(sr*secs),sr);const save={AC,master,noiseBuf,g:MUS.g,echo:MUS.echo,waves:MUS.waves};
 AC=off;master=off.createGain();master.gain.value=0.5;master.connect(off.destination);noiseBuf=off.createBuffer(1,sr*2,sr);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 MUS.g=null;musInit();MUS.g.gain.value=MUS.vol;
 const run=(mode,t0)=>{const C={T,mode,bars:musBuild(T,mode)};let t=t0;for(const bar of C.bars)for(let s=0;s<16;s++){musStepPlay(C,bar,s,t,sd);t+=sd;}return t;};
 let t=run('theme',0.05);t=run('win',t+0.3);
 const buf=await off.startRendering();Object.assign(MUS,{g:save.g,echo:save.echo,waves:save.waves});AC=save.AC;master=save.master;noiseBuf=save.noiseBuf;
 const x=buf.getChannelData(0);let pk=0,sq=0;for(const v of x){pk=Math.max(pk,Math.abs(v));sq+=v*v;}
 const pcm=new Int16Array(x.length);for(let i=0;i<x.length;i++)pcm[i]=Math.max(-1,Math.min(1,x[i]))*32767;
 let bin='';const u=new Uint8Array(pcm.buffer);for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));
 return {name:T.name,peak:pk,rms:Math.sqrt(sq/x.length),sr,b64:btoa(bin)};}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page()
    await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000)
    ids=await pg.evaluate("Object.keys(DATA.music.themes)")
    os.makedirs(OUT,exist_ok=True)
    for i in ids:
      r=await pg.evaluate(JS,i);raw=base64.b64decode(r['b64'])
      with open(f'{OUT}/{i}.wav','wb') as f:
        f.write(b'RIFF'+struct.pack('<I',36+len(raw))+b'WAVEfmt '+struct.pack('<IHHIIHH',16,1,1,r['sr'],r['sr']*2,2,16)+b'data'+struct.pack('<I',len(raw))+raw)
      print(f"{i:13} {r['name']:22} peak {r['peak']:.2f} rms {r['rms']:.3f}")
    await b.close()
asyncio.run(main())
