import os;os.chdir('/home/claude/ddgame/art_src/batch1')  # source sheets live here
import sys,json,re;sys.path.insert(0,'/home/claude/ddgame/tools/sprites/lib');sys.path.insert(0,'/home/claude/ddgame/tools/sprites/lib')
from cut import frames;from PIL import Image;import numpy as np
src=open('/home/claude/ddgame/tools/sprites/lib/v3_helpers.py').read()
import os;cwd=os.getcwd()
exec(src.split('def split')[0].split('WR={')[0]);exec('def split'+src.split('def split')[1].split('hd=json.load')[0]);os.chdir(cwd)
OFF=json.load(open('off.json')) if os.path.exists('off.json') else {}
P=frames('pin.webp');FR=frames('frog.webp');DU=frames('duck.webp');SV=frames('supv.webp');print('SV',[x.size for x in SV]);S=frames('sup.webp');sp=155/520;ss=155/736
new={'pinned_up':(P[0],sp,'lieback'),'pin_bs0':(P[1],sp,'stand'),'pin_bs1':(P[2],sp,'liefwd'),'pin_cx':(P[3],sp,'liefwd'),'pin_ru':(P[4],sp,'stand'),
     'sup0':(S[0],ss,'stand'),'sup1':(S[1],ss,'air'),'situp':(S[2],ss,'stand'),'sig':(S[3],ss,'stand'),'frog0':(FR[0],0.17,'stand'),'frog1':(FR[1],0.17,'air'),'frog_v0':(DU[0],0.17,'stand'),'frog_v1':(DU[1],0.17,'stand'),'sup_v0':(SV[0],0.28,'air'),'sup_v1':(SV[1],0.28,'air'),'pin_bsv0':(SV[2],0.28,'stand'),'pin_bsv1':(SV[3],0.28,'lieback'),'pin_cxv':(SV[4],0.28,'lieback')}
A='/home/claude/ddgame/src/03_assets.js';js=open(A).read()
m=re.search(r'("viral": \{"src": "SPR\(sprites/viral.webp\)", "names": )(\[[^\]]*\])',js);names=json.loads(m.group(2))
base=Image.open('/home/claude/ddgame/art_src/orig/viral.orig.webp')
old=[n for n in names if n not in new][:43]
cells={n:base.crop(((i%8)*320,(i//8)*224,(i%8)*320+320,(i//8)*224+224)) for i,n in enumerate(old)}
for n,(im,s,mode) in new.items():
  o=OFF.get(n,[0,0]);c=cell(prep(im,s),mode,o[1])
  if o[0]:c2=Image.new('RGBA',c.size,(0,0,0,0));c2.alpha_composite(c,(o[0],0)) if o[0]>0 else c2.alpha_composite(c.crop((-o[0],0,320,224)),(0,0));c=c2
  cells[n]=c
allN=old+list(new);rows=(len(allN)+7)//8
sheet=Image.new('RGBA',(320*8,224*rows),(0,0,0,0))
for i,n in enumerate(allN):sheet.alpha_composite(cells[n],((i%8)*320,(i//8)*224))
q=sheet.quantize(255,method=Image.Quantize.FASTOCTREE).convert('RGBA');qa=np.asarray(q).copy();qa[...,3]=np.asarray(sheet)[...,3]
Image.fromarray(qa,'RGBA').save('/home/claude/ddgame/assets/sprites/viral.webp',lossless=True,method=6,quality=100)
js=js[:m.start(2)]+json.dumps(allN)+js[m.end(2):];open(A,'w').write(js);print(len(allN),rows)
