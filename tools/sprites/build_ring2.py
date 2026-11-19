# Rope-less ring maps (test link): the game draws the ropes. For each map, cut out:
#   <map>2_front.png   front posts + front pads (drawn over the wrestlers; the front ropes go under it)
#   <map>2_bpads.png   back pads (drawn over the back/side rope ends so the ropes tie in under the pads)
# and for the ranch also the whole picture, ranch2_full.webp. Prints placement (game px) + pad centres.
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..')
def blue_of(a): return (a[..., 2] > a[..., 0] + 30) & (a[..., 2] > a[..., 1] + 15)
def cut(a, m, name, ox, oy):
    ys, xs = np.nonzero(m); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    rgba = np.dstack([a, np.where(m, 255, 0)]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(rgba, 'RGBA').save(f'{R}/assets/maps/{name}.png')
    return dict(x=round(x0 / 2 + ox, 2), y=round(y0 / 2 + oy, 2), w=(x1 - x0) / 2, h=(y1 - y0) / 2)
def pads_mask(a, centres):
    b = blue_of(a); m = np.zeros(b.shape, bool); lum = a.mean(-1)
    for (x, y) in centres:
        y0, y1, x0, x1 = y - 16, y + 16, x - 26, x + 26; sub = b[y0:y1, x0:x1]
        lab, n = nd.label(sub)
        if n: k = lab[16, 26] or np.bincount(lab.ravel())[1:].argmax() + 1; sub = lab == k
        d = nd.binary_dilation(sub, iterations=2); m[y0:y1, x0:x1] |= sub | (d & (lum[y0:y1, x0:x1] < 90))
    return m
out = {}
# ---------- ranch ----------
a = np.asarray(Image.open(R + '/art_src/maps/ranch_apron.png').convert('RGB').resize((1296, 432), Image.LANCZOS)).astype(np.int16)
Image.fromarray(a.astype(np.uint8)).save(R + '/assets/maps/ranch2_full.webp', quality=92, method=6)
P = {'BL': (165, [169, 197, 223]), 'BR': (446, [168, 197, 223]), 'FL': (97, [191, 229, 268]), 'FR': (528, [192, 230, 269])}
sat = a.max(-1) - a.min(-1); lum = a.mean(-1)
from PIL import ImageDraw
def shapes(size, rects=(), ells=()):
    im = Image.new('L', (size[1], size[0]), 0); d = ImageDraw.Draw(im)
    for r in rects: d.rectangle(r, fill=255)
    for e in ells: d.ellipse(e, fill=255)
    return np.asarray(im) > 0
def padshape(cx, cy, rx, ry, post_x):   # the pad + its bolt over to the post
    return [(cx - rx, cy - ry, cx + rx, cy + ry)], [(min(cx, post_x), cy - 3, max(cx, post_x), cy + 3)]
ells = [(64, 176, 84, 186), (544, 177, 564, 187), (58, 304, 92, 318), (535, 304, 575, 318)]          # post tops, base plates
rects = [(66, 181, 82, 312), (546, 182, 562, 312)]                                                   # front posts
for k, post in (('FL', 74), ('FR', 554)):
    for y in P[k][1]: e, r = padshape(P[k][0], y, 13, 11, post); ells += e; rects += r
m = shapes(a.shape[:2], rects, ells)
bp_e, bp_r = [], []
for k, post in (('BL', 152), ('BR', 459)):
    for y in P[k][1]: e, r = padshape(P[k][0], y, 10, 9, post); bp_e += e; bp_r += r
bmask = shapes(a.shape[:2], bp_r, bp_e)
out['ranch2_front'] = cut(a, m, 'ranch2_front', 0, 0)
out['ranch2_bpads'] = cut(a, bmask, 'ranch2_bpads', 0, 0)
out['ranch_pads'] = {k: [[x / 2, y / 2] for y in ys_] for k, (x, ys_) in P.items()}
# ---------- barn: back pads only (the rest is build_barn2.py) ----------
b = np.asarray(Image.open(R + '/art_src/maps/barn_apron.png').convert('RGB').resize((1404, 468), Image.LANCZOS)).astype(np.int16)
BP = {'BL': (405, [231, 257, 285]), 'BR': (690, [231, 257, 285])}
out['barn2_bpads'] = cut(b, pads_mask(b, [(BP[k][0], y) for k in BP for y in BP[k][1]]), 'barn2_bpads', -119.8, -27.5)
print(json.dumps(out))
