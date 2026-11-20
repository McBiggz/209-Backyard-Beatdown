# Sheets R (doing lifts/slams), S (taking them) and T (mat attacks, whip, stagger) from art_src/sheets_new/<R|S|T>/<id>.png.
# 8/8/6 figures, read row by row. Run after add_frames.py / add_cage.py / add_backslide.py / add_entpose.py, then pack.py.
# Size: every sheet draws him at one size, so each sheet is scaled from one upright reference figure against his stance (idle0) height.
import sys, os, re, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage
T = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(T + '/../..')
sys.path.insert(0, T + '/lib')
from cut import key
_src = open(T + '/lib/v3_helpers.py').read(); exec(_src.split('def split')[0].split('WR={')[0]); exec('def split' + _src.split('def split')[1].split('hd=json.load')[0])
SHEETS = {  # names, reference figure index, its height as a share of his stance, frames placed by centre (lying / airborne)
 'R': (['rlock', 'rwaist', 'rlift', 'rpress', 'rcarry', 'rslam', 'rsit', 'rpick'], 4, 1.00, set()),
 'S': (['slock', 'sdbl', 'shalf', 'sfold', 'sshoul', 'sfall', 'simp', 'spick'], 0, 0.94, {'shalf', 'sfold', 'sshoul', 'sfall', 'simp'}),
 'T': (['telb0', 'telb1', 'tknee', 'tmount', 'twhip', 'tstag'], 4, 0.95, {'telb0', 'telb1'}),
}
def figures(p, n):
    A = key(p); a = A[..., 3] > 0; lab, k = ndimage.label(a, structure=np.ones((3, 3))); sl = ndimage.find_objects(lab)
    areas = ndimage.sum(a, lab, range(1, k + 1)); big = [i for i in range(k) if areas[i] > 0.04 * areas.max()]
    def ctr(i): return ((sl[i][0].start + sl[i][0].stop) / 2, (sl[i][1].start + sl[i][1].stop) / 2)
    def dist(i, j):
        cy, cx = ctr(i); return max(0, sl[j][1].start - cx, cx - sl[j][1].stop) + max(0, sl[j][0].start - cy, cy - sl[j][0].stop)
    H = a.shape[0]; big.sort(key=lambda i: (ctr(i)[0] > H / 2, sl[i][1].start))   # top row first, then left to right
    out = []
    for j in big:
        m = np.zeros_like(a)
        for i in range(k):
            if areas[i] < 20: continue
            if (i if i in big else min(big, key=lambda q: dist(i, q))) == j: m |= lab == i + 1
        B = A.copy(); B[..., 3] = np.where(m, 255, 0); im = Image.fromarray(B); out.append(im.crop(im.getbbox()))
    return out
A = R + '/src/03_assets.js'; js = open(A).read(); only = sys.argv[1:]
for sh_ in 'RST':
    NAMES, ref, K, mid = SHEETS[sh_]
    for p in sorted(glob.glob(f'{R}/art_src/sheets_new/{sh_}/*.png')):
        wid = os.path.basename(p)[:-4]
        if only and wid not in only: continue
        m = re.search(r'("%s": \{"src": "SPR\(sprites/%s.webp\)", "names": )(\[[^\]]*\])' % (wid, wid), js)
        if not m: print('skip', wid); continue
        figs = figures(p, len(NAMES))
        if len(figs) != len(NAMES): print('!!', sh_, wid, 'has', len(figs), 'figures, skipped'); continue
        names = json.loads(m.group(2)); sh = Image.open(f'{R}/assets/sprites/{wid}.webp').convert('RGBA')
        cells = [sh.crop(((i % 8) * 320, (i // 8) * 224, (i % 8) * 320 + 320, (i // 8) * 224 + 224)) for i in range(len(names))]
        b = cells[names.index('idle0')].getbbox(); stance = b[3] - b[1]; s = K * stance / figs[ref].size[1]
        for fr, im in zip(NAMES, figs):
            pim = prep(im, s)
            if pim.size[1] > AYd - 2:   # arms straight up on a big man: shrink just enough to keep the hands inside the cell
                k_ = (AYd - 2) / pim.size[1]; pim = pim.resize((max(1, round(pim.size[0] * k_)), AYd - 2), Image.LANCZOS)
            c = cell(pim, 'mid' if fr in mid else 'stand', 0)
            if fr in names: cells[names.index(fr)] = c
            else: names.append(fr); cells.append(c)
        rows = (len(names) + 7) // 8; out = Image.new('RGBA', (2560, 224 * rows), (0, 0, 0, 0))
        for i, c2 in enumerate(cells): out.alpha_composite(c2, ((i % 8) * 320, (i // 8) * 224))
        q = out.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(out)[..., 3]
        Image.fromarray(qa, 'RGBA').save(f'{R}/assets/sprites/{wid}.webp', lossless=True, method=6, quality=100)
        js = js[:m.start(2)] + json.dumps(names) + js[m.end(2):]
        print(sh_, wid, 'stance', stance, 'scale', round(s, 3))
open(A, 'w').write(js)
