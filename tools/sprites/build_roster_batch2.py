import os;os.chdir('/home/claude/ddgame/art_src/batch2')  # source sheets live here
import sys,json,os;sys.path.insert(0,'/home/claude/ddgame/tools/sprites/lib')
from cut2 import framesc;from PIL import Image,ImageOps;import numpy as np
src=open('/home/claude/ddgame/tools/sprites/lib/v3_helpers.py').read();cwd=os.getcwd();None
exec(src.split('def split')[0].split('WR={')[0]);exec('def split'+src.split('def split')[1].split('hd=json.load')[0]);os.chdir(cwd)
SH={'A':['idle0','idle1','walk0','walk1','walk2','walk3','roar'],'B':['punch0','punch1','kick0','kick1','stomp0','grap0','win0'],
 'C':['hit','fall','down','getup','dazed','jump','dropkick'],'D':['perch0','perch1','dive','sup0','sup1','situp','sig'],
 'E':['sup_v0','sup_v1','pinned_up','pin_bs0','pin_bs1','pin_cx','pin_ru'],'F':['pin_bsv0','pin_bsv1','pin_cxv','frog0','frog1','frog_v0','frog_v1']}
MODE={'jump':'air','dropkick':'air','dive':'air','fall':'lieback','down':'lieback','sup1':'air','sup_v0':'air','sup_v1':'air','pinned_up':'lieback','pin_bs1':'liefwd','pin_cx':'liefwd','pin_bsv1':'lieback','pin_cxv':'lieback','frog1':'air'}
MIRROR={'pin_bs0'}
out={}
EXTRA={'razz':[('razz_pin.webp',['pinning']),('razz_br.webp',['br0','br1'])],'frank':[('frank_pin.webp',['pinning']),('frank_br.webp',['br0','br1'])],'flaco':[('flaco_br.webp',['br0','br1'])],'jaguar':[('jaguar_br.webp',['br0','br1'])],'tripp':[('tripp_br.webp',['br0','br1'])],'jason':[('jason_br.webp',['br0','br1'])],'kruze':[('kruze_br.webp',['br0','br1']),('kruze_hub.webp',['hubw0','hubw1','hubw2','hubw3','hubwind','hubsmack','hubpose']),('kruze_X1.webp',['_a','perch0','_b','_c','situp','_d','sig']),('kruze_X2.webp',['_a','perch1','dive','_b','_c','_d','_e'])]}
def get(w):
  F={}
  for L,names in SH.items():
    p=f'{w}_{L}.webp'
    if not os.path.exists(p):continue
    W0,H0=Image.open(p).size
    fr=sorted([f for f in framesc(p) if f[0].size[0]<W0*0.8],key=lambda f:f[1][0])
    while len(fr)<7:  # two frames touching: split the widest at its thinnest column
      ws=[f[0].size[0] for f in fr];k=ws.index(max(ws));im,c=fr[k];a=np.asarray(im)[...,3]>0;ww=a.shape[1]
      col=a.sum(0);lo,hi=int(ww*0.3),int(ww*0.7);x=lo+int(np.argmin(col[lo:hi]))
      L_=im.crop((0,0,x,im.size[1]));R_=im.crop((x,0,ww,im.size[1]))
      fr[k:k+1]=[(L_.crop(L_.getbbox()),(c[0]-ww/2+x/2,c[1])),(R_.crop(R_.getbbox()),(c[0]+x/2,c[1]))]
    if len(fr)!=7:print('!!',w,L,len(fr));continue
    for n,(im,_) in zip(names,fr):F[n]=im
  for p,names in EXTRA.get(w,[]):
    W0=Image.open(p).size[0];fr=sorted([f for f in framesc(p) if f[0].size[0]<W0*(0.97 if len(names)==1 else 0.8)],key=lambda f:f[1][0])
    if len(fr)!=len(names):print('!!',p,len(fr));continue
    for n,(im,_) in zip(names,fr):
      if not n.startswith('_'):F[n]=im
  return F
for w in sys.argv[1:]:
  F=get(w);s=146/F['idle0'].size[1];cells={}
  REF={'B':'punch0','C':'dazed','D':'perch1','E':'pin_bs0','F':'frog_v1'};SA=Image.open(f'{w}_A.webp').size
  SS={}
  for L,rn in REF.items():   # a sheet drawn at a different size: match it to sheet A by a standing frame
    p_=f'{w}_{L}.webp'
    if os.path.exists(p_) and rn in F and abs(Image.open(p_).size[1]/Image.open(p_).size[0]-SA[1]/SA[0])>0.05:
      SS[L]=F['idle0'].size[1]/F[rn].size[1]*(0.97 if rn in('punch0','perch1') else 1.0)
  SHOF={n:L for L,ns in SH.items() for n in ns}
  _sc=json.load(open('/home/claude/ddgame/tools/sprites/data/sheetscale.json')).get(w,{})
  for L_,v in _sc.items():
    if L_ in 'BCDEF' and abs(v-1)>0.06:SS[L_]=SS.get(L_,1)/v   # this sheet was drawn smaller/bigger than Sheet A
  if 'pinning' in F:SS['PIN']=1.39*F['idle0'].size[1]/F['pinning'].size[0]   # pin cover: same proportions as Frank's (which fits)
  SHOF['pinning']='PIN'
  if 'br0' in F:SS['BR']=F['idle0'].size[1]/F['br0'].size[1];SHOF['br0']=SHOF['br1']='BR'   # hand-drawn breathing, same size as his stance
  if 'hubw0' in F:SS['HUB']=F['walk0'].size[1]/F['hubw1'].size[1]
  for n in ['hubw0','hubw1','hubw2','hubw3','hubwind','hubsmack','hubpose']:SHOF[n]='HUB'
  def C(n,src=None,mode=None,dy=0,flip=False):
    if (src or n) not in F:return
    im=F[src or n];im=ImageOps.mirror(im) if (flip or (src or n) in MIRROR) else im
    k=SS.get(SHOF.get(src or n),None);sc=s*k if k else s
    sc*={'jason':{'sup1':1.23}}.get(w,{}).get(src or n,1)
    cells[n]=cell(prep(im,sc),mode or MODE.get(src or n,'stand'),dy)
  for n in F:
    if n!='roar':C(n)
  C('idle1');C('walk0');C('stomp1','kick0');C('grap1','grap0');C('whiff','grap0');C('grabbed','hit');C('downW','down',dy=-2)
  C('pinning','pinning','liefwd') if 'pinning' in F else C('pinning','pin_ru','stand');   # no pin-cover art yet: the roll-up crouch stands inC('held','fall');C('win1','win0',dy=-3)
  C('fk0','kick0');C('fk1','kick1');C('fs0','sup0' if 'sup0' in F else 'grap0');C('fs1','punch1');C('fp0','perch0');C('fp1','jump','air');C('fp2','perch0');C('fv0','roar');C('fv1','hit')
  # breathing: second idle frame = first one with the chest and shoulders lifted 1 pixel (no size change)
  if 'br0' in F:   # hand-drawn breathing frames replace the stance pair
    C('idle0','br0');C('idle1','br1');cells.pop('br0',None);cells.pop('br1',None)
  im=cells['idle0'];bb=im.getbbox();cut=bb[1]+int((bb[3]-bb[1])*0.5);top=im.crop((0,0,im.size[0],cut));br=im.copy();br.paste(Image.new('RGBA',(im.size[0],cut),(0,0,0,0)),(0,0));br.alpha_composite(top,(0,-2));cells['idle1']=br if 'br1' not in F else cells['idle1']
  gb=cells['grabbed']
  for i in range(8):r=gb.crop(gb.getbbox()).rotate(i*45,resample=Image.NEAREST,expand=True);cells['flip%d'%i]=cell(r.crop(r.getbbox()),'center')
  names=list(cells);rows=(len(names)+7)//8
  sheet=Image.new('RGBA',(2560,224*rows),(0,0,0,0))
  for i,n in enumerate(names):sheet.alpha_composite(cells[n],((i%8)*320,(i//8)*224))
  q=sheet.quantize(255,method=Image.Quantize.FASTOCTREE).convert('RGBA');qa=np.asarray(q).copy();qa[...,3]=np.asarray(sheet)[...,3]
  Image.fromarray(qa,'RGBA').save(f'/home/claude/ddgame/assets/sprites/{w}.webp',lossless=True,method=6,quality=100)
  out[w]=names
  pv=Image.new('RGBA',(320*10,224*((len(names)+9)//10)),(70,70,70,255))
  for i,n in enumerate(names):pv.alpha_composite(cells[n],((i%10)*320,(i//10)*224))
  pv.convert('RGB').resize((pv.width//3,pv.height//3)).save(f'pv_{w}.webp');print(w,len(names),round(s,3))
old=json.load(open('/home/claude/ddgame/tools/sprites/data/names_batch2.json')) if os.path.exists('/home/claude/ddgame/tools/sprites/data/names_batch2.json') else {};old.update(out);json.dump(old,open('/home/claude/ddgame/tools/sprites/data/names_batch2.json','w'))
