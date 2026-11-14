from PIL import Image
import numpy as np, json, io, base64
fr={}  # (old frame index, not needed)
CW,CH,AXd,AYd=320,224,160,212
WR={ # roster id: (folder, sheet-name prefix map, size)
 'bigmf':('BIG MF',{'A':'BIG MF Attacking','D':'BIG MF Damage','W':'BIG MF Walking','R':'Big MF Airborne'},1.22),
 'cdiddy':('C-Diddy',{'A':'C-Diddy Attacking','D':'C-Diddy Damage','W':'C-Diddy Walking','R':'C-Diddy Airborne'},1.1),
 'cjdirt':('CJ Dirt',{'A':'CJ Dirt Attacking','D':'CJ Dirt Damage','W':'CJ Dirt Walking','R':'Cj Dirt Airborne'},1.08),
 'razzle':('Dazzle',{'A':'Dazzle Attacking','D':'Dazzle Damage','W':'Dazzle Walking','R':'Dazzle Airborne'},0.97),
 'firebelly':('FireBelly Giga Herrera',{'A':'Firebelly Giga Hererra WO Vest Attacking','D':'Firebelly Giga Hererra WO Vest Damage','W':'Firebelly Giga Hererra WO Vest Walking','R':'Firebelly Giga Hererra WO Vest Airborne'},1.2),
 'jojo':('JoJo Savage',{'A':'JoJo Attacking','D':'JoJo Damage','W':'JoJo Walking','R':'JoJo Airborne'},1.2),
 'dragon':('Michael Hayashi',{'A':'Angry Dragon Michael Hayashi Attacking','D':'Angry Dragon Michael Hayashi Damage','W':'Angry Dragon Michael Hayashi Walking','R':'Angry Dragon Michael Hayashi Airborne'},1.0),
 'necrosis':('Necrosis Black',{'A':'Necrosis Black Attacking','D':'Necrosis Damage','W':'Necrosis Black Walking','R':'Necrosis Black Airborne','F':'Necrosis Black Finisher'},1.0),
 'mainevent':('Michael Sean',{'A':'Michael Sean Attacking','D':'Michael Sean Damage','W':'Michael Sean Walking','R':'Michael Sean Airborne'},1.12),
 'matsunaga':('Matsunaga',{'A':'Matsunaga Attacking','D':'Matsunaga Damage','W':'Matsunaga Walking','R':'Matsunaga airborne'},0.86),
 'zeke':('Zeke',{'A':'Zeke Attacking','D':'Zeke Damage','W':'Zeke Walking','R':'Zeke Airborne'},1.32),
 'asesino':('David Asesino Martinez',{'A':'David Asesino Martinez Attacking','D':'David Asesino Martinez Damage','W':'David Asesino Martinez  Walking','R':'David Asesino Martinez Airborne'},0.98),
 'spektro':('Spektro Black',{'A':'Spektro Black Attacking','D':'Spektro Black Damage','W':'Spektro Black Walking','R':'Spektro Black Airborne'},1.0),
 'maverick':('The Maverick J Cruise',{'A':'The Maverick J Cruise Attacking','D':'The Maverick J Cruise Damage','W':'The Maverick J Cruise Walking','R':'The Maverick J Cruise Airborne'},1.0),
}
def split(im):
    a=np.asarray(im)[...,3]>0;w=a.shape[1];cols=a.sum(0).astype(float)
    def cutsfor(n):
        cuts=[0]
        for k in range(1,n):
            c0=int(w*k/n);lo,hi=max(cuts[-1]+40,c0-int(w/n*0.3)),min(w-40,c0+int(w/n*0.3))
            cuts.append(lo+int(np.argmin(cols[lo:hi])))
        return cuts+[w]
    best=cutsfor(2)
    c3=cutsfor(3)
    if all(cols[c]<0.12*cols.max() for c in c3[1:-1]):best=c3
    out=[]
    for x0,x1 in zip(best,best[1:]):
        p=im.crop((x0,0,x1,im.size[1]));out.append(p.crop(p.getbbox()))
    return out
def frames_of(folder,sheet):
    out=[]
    for f in fr[folder+'|'+sheet]:
        im=Image.open(f['file'])
        if f['w']>700: out+=split(im)
        else: out.append(im.crop(im.getbbox()))
    return out
def prep(im,s,flip=False,crop=None):
    if crop:im=im.crop((0,0,im.size[0],int(im.size[1]*crop)));im=im.crop(im.getbbox())
    a=np.asarray(im).copy();a[a[...,3]<128,:3]=[20,14,16];im=Image.fromarray(a,'RGBA')
    im=im.resize((max(1,round(im.size[0]*s)),max(1,round(im.size[1]*s))),Image.LANCZOS)
    a=np.asarray(im).copy();a[...,3]=np.where(a[...,3]>120,255,0);im=Image.fromarray(a,'RGBA')
    if flip:im=im.transpose(Image.FLIP_LEFT_RIGHT)
    return im.crop(im.getbbox())
def feetx(im):
    a=np.asarray(im)[...,3]>0;h=a.shape[0];ys,xs=np.nonzero(a[int(h*0.9):]);return xs.mean() if len(xs) else im.size[0]/2
def cell(im,mode='stand',dy=0):
    c=Image.new('RGBA',(CW,CH),(0,0,0,0));w,h=im.size
    if mode=='stand':x=AXd-round(feetx(im));y=AYd-h
    elif mode=='lieback':x=AXd+round(w*0.12)-w;y=AYd+2-h
    elif mode=='liefwd':x=AXd-round(w*0.12);y=AYd+2-h-14
    elif mode=='center':x=AXd-w//2;y=150-h//2
    else:x=AXd-w//2;y=AYd-h
    c.alpha_composite(im,(int(max(0,min(CW-w,x))),int(max(0,min(CH-h,y+dy)))));return c
hd=json.load(open('hd.json'))
for key,(folder,S,size) in WR.items():
    Fr={k:frames_of(folder,v) for k,v in S.items()}
    if 'A' not in Fr:Fr['A']=[Fr['W'][1],Fr['D'][0],Fr['W'][0],Fr['D'][0],Fr['W'][2]]
    for k in 'ADWR':print(key,k,len(Fr[k]))
    std=Fr['W'][0].size[1];s=146*(1+(size-1)*0.6)/std
    g=lambda k,i,mode='stand',**o:(Fr[k][i],mode,o)
    m={'idle0':g('W',0),'idle1':g('W',1),'walk0':g('W',2),'walk1':g('W',3),'walk2':g('W',4),'walk3':g('W',5),
       'punch0':g('A',0),'punch1':g('A',1),'kick0':g('A',2),'kick1':g('A',3),'stomp0':g('A',4),'stomp1':g('A',2),
       'jump':g('R',0,'air'),'dropkick':g('R',1,'air'),'perch0':g('R',2,crop=0.6),'perch1':g('R',3,crop=0.6),'dive':g('R',4,'air'),
       'grap0':g('D',0),'whiff':g('D',0),'hit':g('D',1),'getup':g('D',2),'grabbed':g('D',2),'dazed':g('D',2),
       'down':g('D',3,'lieback',flip=True),'downW':g('D',3,'lieback',flip=True,dy=-2),'pinning':g('D',3,'liefwd'),
       'fall':g('D',4,'lieback',dy=-10),'held':g('D',4,'lieback'),
       'grap1':g('R',3,crop=0.6),'win0':g('R',3,crop=0.6),'win1':g('R',3,crop=0.6,dy=-3),
       'fk0':g('A',2),'fk1':g('A',3),'fs0':g('R',3,crop=0.6),'fs1':g('A',1),'fp0':g('R',2,crop=0.6),'fp1':g('R',0,'air'),'fp2':g('R',2,crop=0.6),'fv0':g('A',0),'fv1':g('D',1)}
    if 'F' in Fr:
        F=Fr['F'];m.update({'fv0':(F[0],'stand',{}),'fv1':(F[1],'stand',{}),'fs0':(F[0],'stand',{}),'fs1':(F[1],'stand',{}),'dazed':(F[2],'stand',{}),'win0':(F[3],'stand',{}),'win1':(F[3],'stand',{'dy':-3})})
    out={}
    for n,(im,mode,o) in m.items():out[n]=cell(prep(im,s,flip=o.get('flip',False),crop=o.get('crop')),mode,o.get('dy',0))
    gb=out['grabbed']
    for k in range(8):
        r=gb.crop(gb.getbbox()).rotate(k*45,resample=Image.NEAREST,expand=True);r=r.crop(r.getbbox());out['flip%d'%k]=cell(r,'center')
    names=list(out);cols=8;rows=(len(names)+cols-1)//cols
    sheet=Image.new('RGBA',(CW*cols,CH*rows),(0,0,0,0))
    for i,n in enumerate(names):sheet.alpha_composite(out[n],((i%cols)*CW,(i//cols)*CH))
    q=sheet.quantize(255,method=Image.Quantize.FASTOCTREE).convert('RGBA');qa=np.asarray(q).copy();qa[...,3]=np.asarray(sheet)[...,3];sheet=Image.fromarray(qa,'RGBA')
    sheet.save('sheet_'+key+'.png');b=io.BytesIO();sheet.save(b,'PNG',optimize=True)
    hd[key]={'src':'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode(),'names':names,'cols':cols}
    print(key,len(names),len(b.getvalue()))
import os
os.makedirs('pub/sprites',exist_ok=True)
for k in ['viral','papi']:Image.open(k+'_sheet.png').save('pub/sprites/'+k+'.png',optimize=True)
for k in WR:Image.open('sheet_'+k+'.png').save('pub/sprites/'+k+'.png',optimize=True)
meta={k:{'src':'sprites/'+k+'.png','names':hd[k]['names'],'cols':hd[k]['cols']} for k in ['viral','papi']+list(WR)}
meta['arena']=hd['arena']
json.dump(meta,open('hd_meta.json','w'))
# preview line-up
prev=Image.open('arena.png').convert('RGBA');keys=['viral','papi']+list(WR)
for i,k in enumerate(keys):
    sh=Image.open('sheet_'+k+'.png' if k in WR else k+'_sheet.png');names=hd[k]['names'];j=names.index('idle0')
    c=sh.crop(((j%8)*320,(j//8)*224,(j%8)*320+320,(j//8)*224+224))
    prev.alpha_composite(c,(-120+i*68,190 if i%2 else 150))
prev.save('lineup.png')
