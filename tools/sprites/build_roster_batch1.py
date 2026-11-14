import os;os.chdir('/home/claude/ddgame/art_src/batch1')  # source sheets live here
import sys,json,re,os;sys.path.insert(0,'/home/claude/ddgame/tools/sprites/lib')
from lay import layout;from PIL import Image,ImageOps;import numpy as np
src=open('/home/claude/ddgame/tools/sprites/lib/v3_helpers.py').read();cwd=os.getcwd();None
exec(src.split('def split')[0].split('WR={')[0]);exec('def split'+src.split('def split')[1].split('hd=json.load')[0]);os.chdir(cwd)
MODE={'sup0':'stand','sup1':'air','situp':'stand','sig':'stand','sup_v0':'air','sup_v1':'air','pinned_up':'lieback','pin_bs0':'stand','pin_bs1':'liefwd','pin_cx':'liefwd','pin_ru':'stand','pin_bsv0':'stand','pin_bsv1':'lieback','pin_cxv':'lieback','frog0':'stand','frog1':'air','frog_v0':'stand','frog_v1':'stand'}
SRC={'cdiddy':[('cd_A.webp','A'),('cd_B.webp','B'),('cd_C.webp','C')],'cjdirt':[('cj_all.webp','all')],'papi':[('pp_all.webp','all')],'bigmf':[('bm_A.webp','A'),('bm_B.webp','B'),('bm_C.webp','C')],'razzle':[('dz_all.webp','all')],'firebelly':[('fb_all.webp','all')],'matsunaga':[('ma_all.webp','all')],'jojo':[('jj_all.webp','all')],'ghoulie':[('gh_all.webp','all')],'dragon':[('dr_all.webp','all')],'necrosis':[('ne_all.webp','all')],'asesino':[('as_A.webp','A'),('as_B.webp','B'),('as_C.webp','C')],'mainevent':[('ms_all.webp','all')],'spektro':[('sp_all.webp','all')],'zeke':[('ze_all.webp','all')],'maverick':[('mv_all.webp','all')]}
MIRROR=json.load(open('mirror.json')) if os.path.exists('mirror.json') else {}
A='/home/claude/ddgame/src/03_assets.js';js=open(A).read()
vsh=Image.open('/home/claude/ddgame/assets/sprites/viral.webp')
def hcell(sh,names,n):i=names.index(n);c=sh.crop(((i%8)*320,(i//8)*224,(i%8)*320+320,(i//8)*224+224));b=c.getbbox();return b[3]-b[1]
vn=json.loads(re.search(r'"viral": \{"src": "__ASSET\(sprites/viral.webp\)__", "names": (\[[^\]]*\])',js).group(1))
R_SKID=hcell(vsh,vn,'frog_v1')/hcell(vsh,vn,'idle0');R_SIG=hcell(vsh,vn,'sig')/hcell(vsh,vn,'idle0')
ONLY=sys.argv[1:]
GM={('bigmf','A'):0.934,('bigmf','B'):1.135,('bigmf','C'):0.883,('asesino','B'):1.139,('asesino','C'):0.921,('cdiddy','A'):0.912,('cdiddy','B'):1.094,('cdiddy','C'):0.849,('spektro','all'):0.903,('necrosis','all'):0.896,('firebelly','all'):0.891,('maverick','all'):0.919}
FM={'bigmf':{'pin_cxv':0.87},'asesino':{'pin_bsv1':0.85},'cdiddy':{'pin_bsv1':0.83,'pin_cxv':0.85}}
FOLD={'ghoulie':{'dive':1.25}}
for wid,srcs in SRC.items():
  if ONLY and wid not in ONLY:continue
  m=re.search(r'("%s": \{"src": "__ASSET\(sprites/%s.webp\)__", "names": )(\[[^\]]*\])'%(wid,wid),js);names=json.loads(m.group(2))
  base=Image.open(f'/home/claude/ddgame/art_src/orig/{wid}.webp');old=[n for n in names if n not in MODE];idle=hcell(base,old,'idle0');win=hcell(base,old,'win0')
  cells={n:base.crop(((i%8)*320,(i//8)*224,(i%8)*320+320,(i//8)*224+224)) for i,n in enumerate(old)}
  for n_,f_ in FOLD.get(wid,{}).items():
    c_=cells[n_];bb=c_.getbbox();fig=c_.crop(bb);fig=fig.resize((round(fig.width*f_),round(fig.height*f_)),Image.NEAREST)
    nc=Image.new('RGBA',c_.size,(0,0,0,0));cx_=(bb[0]+bb[2])/2;cy_=(bb[1]+bb[3])/2;nc.alpha_composite(fig,(int(max(0,min(c_.width-fig.width,cx_-fig.width/2))),int(max(0,min(c_.height-fig.height,cy_-fig.height/2)))));cells[n_]=nc
  new={}
  for p,k in srcs:
    d=layout(p,k)
    s=R_SIG*idle/d['sig'].size[1] if 'sig' in d else (R_SKID*idle/d['frog_v1'].size[1] if 'frog_v1' in d else None)
    if s is None:  # pins-only image: match pinned figure to previous sheet scale
      s=SC
    SC=s
    s=s*{'matsunaga':0.9}.get(wid,1)   # his new art is drawn bulkier than his original sprite
    for n,im in d.items():
      ss=s*GM.get((wid,k),1)*FM.get(wid,{}).get(n,1)
      if n in MIRROR.get(wid,[])+['sup_v1']:im=ImageOps.mirror(im)
      new[n]=cell(prep(im,ss),MODE[n],0)
  allN=old+list(new);rows=(len(allN)+7)//8
  sheet=Image.new('RGBA',(2560,224*rows),(0,0,0,0))
  for i,n in enumerate(allN):sheet.alpha_composite(cells[n] if n in cells else new[n],((i%8)*320,(i//8)*224))
  q=sheet.quantize(255,method=Image.Quantize.FASTOCTREE).convert('RGBA');qa=np.asarray(q).copy();qa[...,3]=np.asarray(sheet)[...,3]
  Image.fromarray(qa,'RGBA').save(f'/home/claude/ddgame/assets/sprites/{wid}.webp',lossless=True,method=6,quality=100)
  js=js[:m.start(2)]+json.dumps(allN)+js[m.end(2):]
  # preview
  pv=Image.new('RGBA',(320*9,224*2),(70,70,70,255))
  for j,n in enumerate(list(new)):pv.alpha_composite(new[n],((j%9)*320,(j//9)*224))
  pv.convert('RGB').resize((320*9//2,224)).save(f'pv_{wid}.webp');print(wid,len(allN),idle,win,round(s,3))
open(A,'w').write(js)
