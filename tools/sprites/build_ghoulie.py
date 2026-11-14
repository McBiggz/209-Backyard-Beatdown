# Builds assets/sprites/ghoulie.webp from Ghoulie's five sheets (same 48-frame layout as every other wrestler).
import numpy as np, json, os
from PIL import Image
from scipy import ndimage
src = open('/home/claude/ddgame/tools/sprites/lib/v3_helpers.py').read()
exec(src.split('def split')[0].split('WR={')[0])                       # CW, CH, AXd, AYd ...
exec('def split' + src.split('def split')[1].split('hd=json.load')[0])  # prep, cell, feetx ...
pf = open('/home/claude/props/perchfix.py').read()
exec('def runs' + pf.split('def runs')[1])                              # knob_cut (perch frames with full boots)
os.chdir('/home/claude/ghoulie')

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

W, A_, D, R, F = [frames(n) for n in ['Walking', 'Attacking', 'Damage', 'Airborne', 'Finisher']]
SIZE = 1.08
s = 146 * (1 + (SIZE - 1) * 0.6) / W[0].size[1]
k = Image.open('Walking.png').size[1] / Image.open('Attacking.png').size[1]   # the walking sheet was drawn smaller
S = {'W': s, 'X': s * k}

arms, f = knob_cut(R[3]); dist = R[3].size[1] * (1 - f); h = R[2].size[1]
crouch = R[2].crop((0, 0, R[2].size[0], min(h, int(h - dist) + int(h * 0.03))))
arms = arms.crop(arms.getbbox()); crouch = crouch.crop(crouch.getbbox())

# Damage sheet order: 0 hit, 1 falling, 2 lying, 3 getting up.   Extra ("Finisher") sheet: 0 roar, 1 grab, 2 dazed, 3 victory
g = lambda im, mode='stand', sh='X', **o: (im, mode, sh, o)
m = {'idle0': g(W[0], sh='W'), 'idle1': g(W[1], sh='W'), 'walk0': g(W[2], sh='W'), 'walk1': g(W[3], sh='W'), 'walk2': g(W[4], sh='W'), 'walk3': g(W[5], sh='W'),
     'punch0': g(A_[0]), 'punch1': g(A_[1]), 'kick0': g(A_[2]), 'kick1': g(A_[3]), 'stomp0': g(A_[4]), 'stomp1': g(A_[2]),
     'jump': g(R[0], 'air'), 'dropkick': g(R[1], 'air'), 'perch0': g(crouch), 'perch1': g(arms), 'dive': g(R[4], 'air'),
     'grap0': g(F[1]), 'whiff': g(F[1]), 'hit': g(D[0]), 'getup': g(D[3]), 'grabbed': g(D[0]), 'dazed': g(F[2]),
     'down': g(D[2], 'lieback', flip=True), 'downW': g(D[2], 'lieback', flip=True, dy=-2), 'pinning': g(D[2], 'liefwd'),
     'fall': g(D[1], 'lieback', dy=-10), 'held': g(D[1], 'lieback'),
     'grap1': g(F[1]), 'win0': g(F[3]), 'win1': g(F[3], dy=-3),
     'fk0': g(A_[2]), 'fk1': g(A_[3]), 'fs0': g(F[0]), 'fs1': g(A_[1]), 'fp0': g(crouch), 'fp1': g(R[0], 'air'), 'fp2': g(crouch), 'fv0': g(F[0]), 'fv1': g(D[0])}
out = {}
for n, (im, mode, sh, o) in m.items():
    out[n] = cell(prep(im, S[sh], flip=o.get('flip', False)), mode, o.get('dy', 0))
gb = out['grabbed']
for i in range(8):
    r = gb.crop(gb.getbbox()).rotate(i * 45, resample=Image.NEAREST, expand=True); out['flip%d' % i] = cell(r.crop(r.getbbox()), 'center')
names = list(out); cols = 8; rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGBA', (CW * cols, CH * rows), (0, 0, 0, 0))
for i, n in enumerate(names): sheet.alpha_composite(out[n], ((i % cols) * CW, (i // cols) * CH))
q = sheet.quantize(255, method=Image.Quantize.FASTOCTREE).convert('RGBA'); qa = np.asarray(q).copy(); qa[..., 3] = np.asarray(sheet)[..., 3]
sheet = Image.fromarray(qa, 'RGBA')
sheet.save('/home/claude/ddgame/assets/sprites/ghoulie.webp', lossless=True, method=6, quality=100)
json.dump(names, open('names.json', 'w'))
prev = Image.new('RGBA', (8 * 160, 6 * 112), (60, 60, 60, 255)); prev.alpha_composite(sheet.resize((8 * 160, 6 * 112))); prev.save('sheet_prev.png')
print('frames', len(names), 'scale walk', round(S['W'], 3), 'other', round(S['X'], 3))
