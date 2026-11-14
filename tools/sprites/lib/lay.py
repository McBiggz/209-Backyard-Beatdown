import sys;sys.path.insert(0,'/home/claude/ddgame/tools/sprites/lib')
from cut2 import framesc;from PIL import Image,ImageDraw
A=['sup0','sup1','situp','sig','sup_v0','sup_v1'];B=['pinned_up','pin_bs0','pin_bs1','pin_cx','pin_ru','pin_bsv0','pin_bsv1','pin_cxv'];C=['frog0','frog1','frog_v0','frog_v1']
ALL=A+B[:6]+B[6:]+C
LAY={'A':([4,2],A),'B':([5,3],B),'C':([4],C),'all':([6,6,6],ALL)}
def layout(path,kind):
  rows,names=LAY[kind];F=framesc(path)
  assert len(F)==sum(rows),(path,len(F))
  F=sorted(F,key=lambda f:f[1][1]);out=[];i=0
  for r in rows:out+=sorted(F[i:i+r],key=lambda f:f[1][0]);i+=r
  return dict(zip(names,[f[0] for f in out]))
