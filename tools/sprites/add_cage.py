# Adds the 6 cage-escape frames (art_src/sheets_new/M/<id>.png, Sheet M) to each wrestler's built sheet.
# Run AFTER add_frames.py, then pack.py, then node build.mjs.
# Frames: cclimb0, cclimb1 (climbing), ctop (over the top), cdrop (dropping down), ccrawl0, ccrawl1 (crawling).
# Size: the sheets draw everyone the same height, so each figure is scaled from his own stance (idle0) height.
import sys, os, re, json, glob
import numpy as np
from PIL import Image
T = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(T + '/../..')
sys.path.insert(0, T + '/lib')
from cut import frames
_src = open(T + '/lib/v3_helpers.py').read(); exec(_src.split('def split')[0].split('WR={')[0]); exec('def split' + _src.split('def split')[1].split('hd=json.load')[0])
NAMES = ['cclimb0', 'cclimb1', 'ctop', 'cdrop', 'ccrawl0', 'ccrawl1']
K = 1.30   # the dropping frame (arms straight up, body straight) is ~1.3x his fighting-stance height
A = R + '/src/03_assets.js'; js = open(A).read(); out_rep = {}
for p in sorted(glob.glob(R + '/art_src/sheets_new/M/*.png')):
    wid = os.path.basename(p)[:-4]
    m = re.search(r'("%s": \{"src": "SPR\(sprites/%s.webp\)", "names": )(\[[^\]]*\])' % (wid, wid), js)
    if not m: print('skip', wid); continue
    figs = frames(p)
    if len(figs) != 6: print('!!', wid, 'has', len(figs), 'figures, skipped'); continue
    names = json.loads(m.group(2)); sh = Image.open(f'{R}/assets/sprites/{wid}.webp').convert('RGBA')
    cells = [sh.crop(((i % 8) * 320, (i // 8) * 224, (i % 8) * 320 + 320, (i // 8) * 224 + 224)) for i in range(len(names))]
    b = cells[names.index('idle0')].getbbox(); stance = b[3] - b[1]
    s = K * stance / figs[3].size[1]
    for fr, im in zip(NAMES, figs):
        pim = prep(im, s); c = cell(pim, 'stand' if fr != 'ctop' else 'stand', 0)
        if fr in names: cells[names.index(fr)] = c
        else: names.append(fr); cells.append(c)
    rows = (len(names) + 7) // 8; out = Image.new('RGBA', (2560, 224 * rows), (0, 0, 0, 0))
    for i, c2 in enumerate(cells): out.alpha_composite(c2, ((i % 8) * 320, (i // 8) * 224))
    q = out.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(out)[..., 3]
    Image.fromarray(qa, 'RGBA').save(f'{R}/assets/sprites/{wid}.webp', lossless=True, method=6, quality=100)
    js = js[:m.start(2)] + json.dumps(names) + js[m.end(2):]
    print(wid, 'stance', stance, 'scale', round(s, 3), 'drop h', round(figs[3].size[1] * s))
open(A, 'w').write(js)
