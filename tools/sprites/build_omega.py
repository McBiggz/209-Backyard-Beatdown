# Builds assets/sprites/ref.webp (Skinny Omega) from his Walking and Counting sheets.
import numpy as np, json, os
from PIL import Image
from scipy import ndimage
src = open('/home/claude/ddgame/tools/sprites/lib/v3_helpers.py').read()
exec(src.split('def split')[0].split('WR={')[0])                       # CW, CH, AXd, AYd
exec('def split' + src.split('def split')[1].split('hd=json.load')[0])  # prep, cell, feetx
os.chdir('/home/claude/omega')

def frames(n):
    im = Image.open(n + '.png'); a = np.asarray(im)[..., 3] > 0
    lab, k = ndimage.label(a, structure=np.ones((3, 3))); sl = ndimage.find_objects(lab)
    areas = ndimage.sum(a, lab, range(1, k + 1))
    big = sorted([i for i in range(k) if areas[i] > 0.04 * areas.max()], key=lambda i: sl[i][1].start)
    def dist(i, j):
        cy = (sl[i][0].start + sl[i][0].stop) / 2; cx = (sl[i][1].start + sl[i][1].stop) / 2
        return max(0, sl[j][1].start - cx, cx - sl[j][1].stop) + max(0, sl[j][0].start - cy, cy - sl[j][0].stop)
    owner = {i: (i if i in big else min(big, key=lambda j: dist(i, j))) for i in range(k)}
    A = np.asarray(im); out = []
    for j in big:
        m = np.isin(lab, [i + 1 for i in range(k) if owner[i] == j]); B = A.copy(); B[..., 3] = np.where(m, B[..., 3], 0)
        f = Image.fromarray(B); out.append(f.crop(f.getbbox()))
    return out

W = frames('walk')    # 0 ready stance, 1 standing, 2-5 walk
C = frames('count')   # 0 kneel, 1 lying hand up, 2 lying slap, 3 raise winner, 4 call for the bell
s = 146 * 0.98 / W[1].size[1]
k = W[1].size[1] / C[4].size[1]   # the counting sheet was drawn smaller: match his standing height
S = {'W': s, 'C': s * k}

def lie(im):   # lying face down, head forward: the body stretches back from the anchor
    c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); w, h = im.size
    c.alpha_composite(im, (AXd - 104, int(AYd - h))); return c   # both lying frames line up at the feet

m = {'ridle': (W[1], 'W', 'stand'), 'rready': (W[0], 'W', 'stand'),
     'rwalk0': (W[2], 'W', 'stand'), 'rwalk1': (W[3], 'W', 'stand'), 'rwalk2': (W[4], 'W', 'stand'), 'rwalk3': (W[5], 'W', 'stand'),
     'rkneel': (C[0], 'C', 'stand'), 'rcount': (C[1], 'C', 'lie'), 'rslap': (C[2], 'C', 'lie'),
     'rraise': (C[3], 'C', 'stand'), 'rbell': (C[4], 'C', 'stand')}
out = {}
for n, (im, sh, mode) in m.items():
    p = prep(im, S[sh])
    out[n] = lie(p) if mode == 'lie' else cell(p, 'stand')
names = list(out); cols = 8; rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGBA', (CW * cols, CH * rows), (0, 0, 0, 0))
for i, n in enumerate(names): sheet.alpha_composite(out[n], ((i % cols) * CW, (i // cols) * CH))
q = sheet.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(sheet)[..., 3]
sheet = Image.fromarray(qa, 'RGBA')
sheet.save('/home/claude/ddgame/assets/sprites/ref.webp', lossless=True, method=6, quality=100)
json.dump(names, open('names.json', 'w'))
prev = Image.new('RGBA', (8 * 160, rows * 112), (60, 60, 60, 255)); prev.alpha_composite(sheet.resize((8 * 160, rows * 112))); prev.save('sheet_prev.png')
print(names, round(S['W'], 3), round(S['C'], 3))
