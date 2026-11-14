import json,re,numpy as np,sys
from PIL import Image
js=open('/home/claude/ddgame/src/03_assets.js').read()
def names(w):return json.loads(re.search(r'"%s": \{"src": "__ASSET\(sprites/%s.webp\)__", "names": (\[[^\]]*\])'%(w,w),js).group(1))
DER={'idle1','downW','win1','stomp1','grap1','whiff','grabbed','held','fk0','fk1','fs0','fs1','fp0','fp1','fp2','fv0','fv1','hubw0','hubw1','hubw2','hubw3','hubwind','hubsmack','hubpose','pinning'}|{f'flip{i}' for i in range(8)}
BASE=['idle0','walk0','walk2','punch0','win0']
SA=['sup0','sup1','situp','sig','sup_v0','sup_v1'];SB=['pinned_up','pin_bs0','pin_bs1','pin_cx','pin_ru','pin_bsv0','pin_bsv1','pin_cxv'];SC=['frog0','frog1','frog_v0','frog_v1']
SPLIT={'cdiddy','bigmf','asesino'}
N7={'A':['idle0','walk0','walk1','walk2','walk3'],'B':['punch0','punch1','kick0','kick1','stomp0','grap0','win0'],'C':['hit','fall','down','getup','dazed','jump','dropkick'],'D':['perch0','perch1','dive','sup0','sup1','situp','sig'],'E':['sup_v0','sup_v1','pinned_up','pin_bs0','pin_bs1','pin_cx','pin_ru'],'F':['pin_bsv0','pin_bsv1','pin_cxv','frog0','frog1','frog_v0','frog_v1']}
NEW7=['tripp','jason','frank','flaco','jaguar','kruze','razz']
OLD=['dragon','papi','mainevent','razzle','bigmf','asesino','spektro','jojo','cdiddy','cjdirt','necrosis','firebelly','maverick','matsunaga','zeke','ghoulie']
def areas(w):
  n=names(w);sh=np.asarray(Image.open(f'/home/claude/ddgame/assets/sprites/{w}.webp'))[...,3]>0
  return {k:float(sh[(n.index(k)//8)*224:(n.index(k)//8)*224+224,(n.index(k)%8)*320:(n.index(k)%8)*320+320].sum()) for k in n if k not in DER}
V=areas('viral');vb=np.median([V[k] for k in BASE]);ref={k:V[k]/vb for k in V}
def groups(w):
  if w in NEW7:
    g={f'sheet {L}':ks for L,ks in N7.items()}
    if w=='kruze':g['sheet D']=['sup0','sup1'];g['extra sheets']=['perch0','perch1','dive','situp','sig']
    return g
  g={'original art':None}
  if w in SPLIT:g.update({'new art: suplex sheet':SA,'new art: pin sheet':SB,'new art: leapfrog sheet':SC})
  else:g['new art (one sheet)']=SA+SB+SC
  return g
def audit():
  res={}
  for w in OLD+NEW7:
    A=areas(w);b=np.median([A[k] for k in BASE]);r={k:((A[k]/b)/ref[k])**0.5 for k in A if k in ref}
    G=groups(w);allnew=set(sum([v for v in G.values() if v],[]))
    if 'original art' in G:G['original art']=[k for k in r if k not in allnew]
    res[w]={'frames':r,'groups':{g:(float(np.median([r[k] for k in ks if k in r])),[k for k in ks if k in r]) for g,ks in G.items() if any(k in r for k in ks)}}
  return res
if __name__=='__main__':
  R=audit()
  # systematic per-frame deviations (same frame off for most wrestlers) = ruler artifacts, not real problems
  frames=sorted({k for w in R for k in R[w]['frames']})
  sysdev={k:float(np.median([R[w]['frames'][k]/R[w]['groups'][[g for g,(m,ks) in R[w]['groups'].items() if k in ks][0]][0] for w in R if k in R[w]['frames']])) for k in frames}
  json.dump({'R':{w:{'frames':v['frames'],'groups':{g:[m,ks] for g,(m,ks) in v['groups'].items()}} for w,v in R.items()},'sys':sysdev},open(sys.argv[1],'w'))
  for w,v in R.items():
    gs={g:round(m,3) for g,(m,ks) in v['groups'].items() if abs(m-1)>0.06 and g!='original art'}
    fr={}
    for g,(m,ks) in v['groups'].items():
      for k in ks:
        d=v['frames'][k]/m/sysdev[k]
        if abs(d-1)>0.18:fr[k]=round(d,2)
    print(f'{w:10}',gs,'| frames:',fr)
