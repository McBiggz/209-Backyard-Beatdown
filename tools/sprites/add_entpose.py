# Custom entrance poses: art_src/ent/<id>_pose.png (one figure on magenta) -> frame 'entp' on that wrestler's sheet,
# scaled so the figure is as tall as his fighting stance x K. Run after add_frames / add_cage / add_backslide, then pack.py.
import sys, os, re, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage as nd
T = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(T + '/../..')
_src = open(T + '/lib/v3_helpers.py').read(); exec(_src.split('def split')[0].split('WR={')[0]); exec('def split' + _src.split('def split')[1].split('hd=json')[0])
K = 1.06
TOPX = {}   # px of the source image above the head that aren't body (props held up high) - not counted in height   # standing tall in the spotlight: a touch taller than the knees-bent fighting stance
A = R + '/src/03_assets.js'; js = open(A).read()
for p in sorted(glob.glob(R + '/art_src/ent/*_pose.png')):
    wid = os.path.basename(p)[:-9]
    m = re.search(r'("%s": \{"src": "SPR\(sprites/%s.webp\)", "names": )(\[[^\]]*\])' % (wid, wid), js)
    if not m: print('skip', wid); continue
    a = np.asarray(Image.open(p).convert('RGBA')).astype(int)
    fg = ~((a[..., 0] > 190) & (a[..., 1] < 90) & (a[..., 2] > 190))
    lab, n = nd.label(nd.binary_dilation(fg, iterations=3)); sz = nd.sum(fg, lab, range(1, n + 1)); keep = [i + 1 for i in range(n) if sz[i] > sz.max() * 0.01]  # keep separate pieces too (censor bars)
    lab = np.isin(lab, keep).astype(int); k = 1
    ys, xs = np.nonzero(lab == k); c = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
    c[..., 3] = np.where(fg[ys.min():ys.max() + 1, xs.min():xs.max() + 1] & (lab[ys.min():ys.max() + 1, xs.min():xs.max() + 1] == k), 255, 0)
    fig = Image.fromarray(c.astype('uint8'), 'RGBA')
    names = json.loads(m.group(2)); sh = Image.open(f'{R}/assets/sprites/{wid}.webp').convert('RGBA')
    cells = [sh.crop(((i % 8) * 320, (i // 8) * 224, (i % 8) * 320 + 320, (i // 8) * 224 + 224)) for i in range(len(names))]
    b = cells[names.index('idle0')].getbbox(); s = K * (b[3] - b[1]) / (fig.size[1] - TOPX.get(wid, 0))
    cc = cell(prep(fig, s), 'stand', 0)
    if 'entp' in names: cells[names.index('entp')] = cc
    else: names.append('entp'); cells.append(cc)
    rows = (len(names) + 7) // 8; out = Image.new('RGBA', (2560, 224 * rows), (0, 0, 0, 0))
    for i, c2 in enumerate(cells): out.alpha_composite(c2, ((i % 8) * 320, (i // 8) * 224))
    q = out.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(out)[..., 3]
    Image.fromarray(qa, 'RGBA').save(f'{R}/assets/sprites/{wid}.webp', lossless=True, method=6, quality=100)
    js = js[:m.start(2)] + json.dumps(names) + js[m.end(2):]
    print(wid, 'entp scale', round(s, 3))
open(A, 'w').write(js)
