# Backslide frames from Liam's 2-figure sheets (art_src/backslide/<id>.png): left = pin_bsk (kneeling, doing it),
# right = pin_bsu (rolled up on his shoulders, legs in the air). Run after add_frames.py / add_cage.py, then pack.py.
import sys, os, re, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage as nd
T = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(T + '/../..')
_src = open(T + '/lib/v3_helpers.py').read(); exec(_src.split('def split')[0].split('WR={')[0]); exec('def split' + _src.split('def split')[1].split('hd=json')[0])
K = 0.88   # the rolled-up man stands this tall, as a share of his fighting-stance height
A = R + '/src/03_assets.js'; js = open(A).read()
for p in sorted(glob.glob(R + '/art_src/backslide/*.png')):
    wid = os.path.basename(p)[:-4]
    m = re.search(r'("%s": \{"src": "SPR\(sprites/%s.webp\)", "names": )(\[[^\]]*\])' % (wid, wid), js)
    if not m: print('skip', wid); continue
    im = Image.open(p).convert('RGBA'); a = np.asarray(im).astype(int)
    fg = ~((a[..., 0] > 190) & (a[..., 1] < 90) & (a[..., 2] > 190))
    lab, n = nd.label(nd.binary_dilation(fg, iterations=4)); objs = nd.find_objects(lab)
    big = sorted(range(n), key=lambda i: -((objs[i][0].stop - objs[i][0].start) * (objs[i][1].stop - objs[i][1].start)))[:2]
    big.sort(key=lambda i: objs[i][1].start)
    figs = []
    for i in big:
        sl = objs[i]; c = a[sl].copy(); c[..., 3] = np.where((lab[sl] == i + 1) & fg[sl], 255, 0); figs.append(Image.fromarray(c.astype('uint8'), 'RGBA'))
    names = json.loads(m.group(2)); sh = Image.open(f'{R}/assets/sprites/{wid}.webp').convert('RGBA')
    cells = [sh.crop(((i % 8) * 320, (i // 8) * 224, (i % 8) * 320 + 320, (i // 8) * 224 + 224)) for i in range(len(names))]
    b = cells[names.index('idle0')].getbbox(); s = K * (b[3] - b[1]) / figs[1].size[1]
    for fr, f in zip(['pin_bsk', 'pin_bsu'], figs):
        c = cell(prep(f, s), 'stand', 0)
        if fr in names: cells[names.index(fr)] = c
        else: names.append(fr); cells.append(c)
    rows = (len(names) + 7) // 8; out = Image.new('RGBA', (2560, 224 * rows), (0, 0, 0, 0))
    for i, c2 in enumerate(cells): out.alpha_composite(c2, ((i % 8) * 320, (i // 8) * 224))
    q = out.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(out)[..., 3]
    Image.fromarray(qa, 'RGBA').save(f'{R}/assets/sprites/{wid}.webp', lossless=True, method=6, quality=100)
    js = js[:m.start(2)] + json.dumps(names) + js[m.end(2):]
    print(wid, 'scale', round(s, 3), [f.size for f in figs])
open(A, 'w').write(js)
