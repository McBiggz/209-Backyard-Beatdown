# Adds single extra frames (art_src/extra/<id>_<frame>.webp) to a wrestler's built sheet.
# Run AFTER the roster builders (they rebuild sheets from scratch), then pack.py, then node build.mjs.
#   pinnedk = being pinned in a normal cover: on his back, knees up, boots flat (sized to his lying frame)
import sys, os, re, json, glob
import numpy as np
from PIL import Image
T = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(T + '/../..')
sys.path.insert(0, T + '/lib')
from cut import frames, key
from scipy import ndimage
def one_figure(p):
    # the single biggest figure in the image, plus loose bits that sit inside it (drops borders and stray referees)
    A = key(p); a = A[..., 3] > 0; H, W = a.shape
    lab, k = ndimage.label(a, structure=np.ones((3, 3))); sl = ndimage.find_objects(lab); area = ndimage.sum(a, lab, range(1, k + 1))
    ok = [i for i in range(k) if not (sl[i][1].stop - sl[i][1].start > 0.95 * W and sl[i][0].stop - sl[i][0].start > 0.95 * H)]
    if not ok: return max(frames(p), key=lambda f: f.size[0] * f.size[1])
    big = max(ok, key=lambda i: area[i]); y0, y1, x0, x1 = sl[big][0].start, sl[big][0].stop, sl[big][1].start, sl[big][1].stop
    m = np.zeros_like(a)
    for i in ok:
        cy = (sl[i][0].start + sl[i][0].stop) / 2; cx = (sl[i][1].start + sl[i][1].stop) / 2
        if i == big or (x0 <= cx <= x1 and y0 <= cy <= y1 and area[i] < area[big] * 0.2): m |= lab == i + 1
    B = A.copy(); B[..., 3] = np.where(m, 255, 0); f = Image.fromarray(B); return f.crop(f.getbbox())
_src = open(T + '/lib/v3_helpers.py').read(); exec(_src.split('def split')[0].split('WR={')[0]); exec('def split' + _src.split('def split')[1].split('hd=json.load')[0])
A = R + '/src/03_assets.js'; js = open(A).read()
for p in sorted(glob.glob(R + '/art_src/extra/*_*.webp')):
    wid, fr = os.path.basename(p)[:-5].split('_', 1)
    m = re.search(r'("%s": \{"src": "SPR\(sprites/%s.webp\)", "names": )(\[[^\]]*\])' % (wid, wid), js)
    names = json.loads(m.group(2)); sh = Image.open(f'{R}/assets/sprites/{wid}.webp').convert('RGBA')
    cells = [sh.crop(((i % 8) * 320, (i // 8) * 224, (i % 8) * 320 + 320, (i // 8) * 224 + 224)) for i in range(len(names))]
    im = one_figure(p)
    if fr == 'pinning':   # pin cover: as long as 1.39x his standing height (same proportions as Frank's, which fits)
        b = cells[names.index('idle0')].getbbox(); s = 1.39 * (b[3] - b[1]) / im.size[0] * {'jason': 0.92, 'kruze': 0.88}.get(wid, 1); mode = 'liefwd'
    else:
        b = cells[names.index('down')].getbbox(); s = 0.92 * (b[2] - b[0]) / im.size[0]; mode = 'lieback'
    pim = prep(im, s); c = cell(pim, mode, 0)
    bb = c.getbbox()
    if bb and bb[2] >= 320:   # ran off the right edge of the cell: slide it left so nothing is cut off
        ov = pim.size[0] - (320 - bb[0]); c = Image.new('RGBA', c.size, (0, 0, 0, 0)); c.alpha_composite(pim, (max(0, bb[0] - ov - 4), bb[3] - pim.size[1]))
    if fr in names: cells[names.index(fr)] = c
    else: names.append(fr); cells.append(c)
    rows = (len(names) + 7) // 8; out = Image.new('RGBA', (2560, 224 * rows), (0, 0, 0, 0))
    for i, c2 in enumerate(cells): out.alpha_composite(c2, ((i % 8) * 320, (i // 8) * 224))
    q = out.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(out)[..., 3]
    Image.fromarray(qa, 'RGBA').save(f'{R}/assets/sprites/{wid}.webp', lossless=True, method=6, quality=100)
    js = js[:m.start(2)] + json.dumps(names) + js[m.end(2):]
    print(wid, fr, round(s, 3))
open(A, 'w').write(js)
