# Adds single extra frames (art_src/extra/<id>_<frame>.webp) to a wrestler's built sheet.
# Run AFTER the roster builders (they rebuild sheets from scratch), then pack.py, then node build.mjs.
#   pinnedk = being pinned in a normal cover: on his back, knees up, boots flat (sized to his lying frame)
import sys, os, re, json, glob
import numpy as np
from PIL import Image
T = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(T + '/../..')
sys.path.insert(0, T + '/lib')
from cut import frames
_src = open(T + '/lib/v3_helpers.py').read(); exec(_src.split('def split')[0].split('WR={')[0]); exec('def split' + _src.split('def split')[1].split('hd=json.load')[0])
A = R + '/src/03_assets.js'; js = open(A).read()
for p in sorted(glob.glob(R + '/art_src/extra/*_*.webp')):
    wid, fr = os.path.basename(p)[:-5].split('_', 1)
    m = re.search(r'("%s": \{"src": "SPR\(sprites/%s.webp\)", "names": )(\[[^\]]*\])' % (wid, wid), js)
    names = json.loads(m.group(2)); sh = Image.open(f'{R}/assets/sprites/{wid}.webp').convert('RGBA')
    cells = [sh.crop(((i % 8) * 320, (i // 8) * 224, (i % 8) * 320 + 320, (i // 8) * 224 + 224)) for i in range(len(names))]
    im = max(frames(p), key=lambda f: f.size[0] * f.size[1])
    dn = cells[names.index('down')]; b = dn.getbbox(); s = 0.92 * (b[2] - b[0]) / im.size[0]
    c = cell(prep(im, s), 'lieback', 0)
    if fr in names: cells[names.index(fr)] = c
    else: names.append(fr); cells.append(c)
    rows = (len(names) + 7) // 8; out = Image.new('RGBA', (2560, 224 * rows), (0, 0, 0, 0))
    for i, c2 in enumerate(cells): out.alpha_composite(c2, ((i % 8) * 320, (i // 8) * 224))
    q = out.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(out)[..., 3]
    Image.fromarray(qa, 'RGBA').save(f'{R}/assets/sprites/{wid}.webp', lossless=True, method=6, quality=100)
    js = js[:m.start(2)] + json.dumps(names) + js[m.end(2):]
    print(wid, fr, round(s, 3))
open(A, 'w').write(js)
