from PIL import Image;import numpy as np;from scipy import ndimage
def key(f):
  a=np.asarray(Image.open(f).convert('RGBA')).astype(int)
  r,g,b=a[...,0],a[...,1],a[...,2]
  mag=(r>150)&(b>150)&(g<120)&(abs(r-b)<90)
  out=a.copy();out[...,3]=np.where(mag,0,255)
  # despill pinkish edge pixels
  return out.astype(np.uint8)
def frames(f):
  A=key(f);a=A[...,3]>0;lab,k=ndimage.label(a,structure=np.ones((3,3)));sl=ndimage.find_objects(lab)
  areas=ndimage.sum(a,lab,range(1,k+1))
  big=sorted([i for i in range(k) if areas[i]>0.04*areas.max()],key=lambda i:sl[i][1].start)
  def dist(i,j):
    cy=(sl[i][0].start+sl[i][0].stop)/2;cx=(sl[i][1].start+sl[i][1].stop)/2
    return max(0,sl[j][1].start-cx,cx-sl[j][1].stop)+max(0,sl[j][0].start-cy,cy-sl[j][0].stop)
  out=[]
  for j in big:
    m=np.zeros_like(a)
    for i in range(k):
      if areas[i]<20:continue
      if (i if i in big else min(big,key=lambda q:dist(i,q)))==j:m|=lab==i+1
    B=A.copy();B[...,3]=np.where(m,255,0);im=Image.fromarray(B);out.append(im.crop(im.getbbox()))
  return out
