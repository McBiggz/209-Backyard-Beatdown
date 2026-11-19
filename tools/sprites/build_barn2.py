# The barn with an apron and NO painted ropes (art_src/maps/barn_apron.png, 2170x725): the game draws the ropes itself.
# Same placement as build_barn.py (the posts and pads are in the same spots), so the ring lines up with the game unchanged.
# Outputs (2x game px):
#   assets/maps/barn2_full.webp   the room: doorway emptied (C.Diddy is drawn from his game sprite), left door panel taken out
#   assets/maps/barn2_front.png   the two front posts + front pads: drawn over the wrestlers (the front ropes go under them)
#   assets/maps/barn2_panel.png   the left sliding door panel
# and prints BARN2 placement + the pad centres (game px) for the code-drawn ropes.
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..')
OX = -119.8; OY = -27.5
im = Image.open(R + '/art_src/maps/barn_apron.png').convert('RGB').resize((1404, 468), Image.LANCZOS)
a = np.asarray(im).astype(np.int16); H, W = a.shape[:2]
lum = a.mean(-1); sat = a.max(-1) - a.min(-1)
out = {}
def save(name, arr, box):
    x0, y0, x1, y1 = box; Image.fromarray(arr[y0:y1, x0:x1].astype(np.uint8), 'RGBA').save(f'{R}/assets/maps/{name}.png')
    out[name] = dict(x=round(x0 / 2 + OX, 2), y=round(y0 / 2 + OY, 2), w=(x1 - x0) / 2, h=(y1 - y0) / 2)
rgba = np.dstack([a, np.full((H, W), 255, np.int16)])
# ---- front posts (they now stand on the mat and stop at its surface) + their pads
m = np.zeros((H, W), bool)
for x0, x1 in [(303, 324), (787, 808)]:
    c = (x0 + x1) // 2
    bot = 390   # the post meets the mat surface here (below it is the skirt)
    for y in range(248, bot + 2):
        if y < 262: m[y, x0 - 2:x1 + 2] |= (sat[y, x0 - 2:x1 + 2] < 30) & (lum[y, x0 - 2:x1 + 2] > 25)
        else: m[y, x0:x1] = True
    print('post bottom', x0, bot, '-> game y', bot / 2 + OY)
blue = (a[..., 2] > a[..., 0] + 30) & (a[..., 2] > a[..., 1] + 15)
for bx0, bx1 in [(322, 366), (748, 790)]:
    for ry in (268, 305, 340):
        y0, y1 = ry - 14, ry + 12; sub = blue[y0:y1, bx0:bx1]; d = ndimage.binary_dilation(sub, iterations=2)
        m[y0:y1, bx0:bx1] |= sub | (d & (lum[y0:y1, bx0:bx1] < 70))
f = rgba.copy(); f[..., 3] = np.where(m, 255, 0)
ys, xs = np.nonzero(m); save('barn2_front', f, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
# ---- doorway: left panel 560-611, gap 611-657, rows 184-303
PX0, PX1, GX1, PY0, PY1 = 560, 611, 657, 184, 303
wall = a[:, 514:560]
base = a.copy()
for x in range(PX0, PX1): base[PY0:PY1, x] = wall[PY0:PY1, (x - PX0) % wall.shape[1]]
base[PY0:PY1, PX1:GX1] = np.array([20, 15, 17], np.int16)
for y in range(PY1, PY1 + 4): base[y, PX1:GX1] = base[y, PX1 - 5][None, :]
Image.fromarray(base.astype(np.uint8)).save(R + '/assets/maps/barn2_full.webp', lossless=False, quality=92, method=6)
out['barn2_full'] = dict(x=OX, y=OY, w=W / 2, h=H / 2)
save('barn2_panel', rgba, (PX0, PY0 - 11, PX1, PY1))
out['gap'] = dict(x=round(PX1 / 2 + OX, 2), y=round(PY0 / 2 + OY, 2), w=(GX1 - PX1) / 2, h=(PY1 - PY0) / 2)
# ---- pad centres (stored px from the pad finder) -> game px, per post, top to bottom
P = {'BL': (405, [231, 257, 285]), 'BR': (690, [231, 257, 285]), 'FL': (345, [265, 302, 337]), 'FR': (764, [265, 302, 337])}
out['pads'] = {k: [[round(x / 2 + OX, 1), round(y / 2 + OY, 1)] for y in ys_] for k, (x, ys_) in P.items()}
print(json.dumps(out))
