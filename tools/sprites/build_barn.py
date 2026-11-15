# Builds the Dragon's Den barn (new Secret Map, test link) from Liam's art: art_src/maps/barn_final.png (2172x724).
# Outputs (all at 2x game pixels, like the other maps):
#   assets/maps/barn_full.webp    the room, with the left door panel and C.Diddy taken OUT (door drawn by the game)
#   assets/maps/barn_front.png    front ropes, front posts and front pads: drawn over the wrestlers
#   assets/maps/barn_panel.png    the left sliding door panel (slides shut over the doorway)
#   assets/maps/barn_diddy.png    C.Diddy, peeking out of the doorway
#   assets/maps/barn_doorrope.png the back ropes across the doorway, drawn over C.Diddy and the panel
# and prints the BARN placement constants for src/03_assets.js.
# The ring in this art is flatter than the game's, so the whole picture is scaled to fit the game ring:
#   front posts on the game's front posts, the mat's front edge on the game's front edge (game x = src*K + OX, y = src*K + OY).
import os, json
import numpy as np
from PIL import Image
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..')
K = 0.3233; OX = -119.8; OY = -27.5          # src px -> game px
S = 1404 / 2172                                # src -> stored 2x pixels (2*K, rounded to a whole width)
im = Image.open(R + '/art_src/maps/barn_final.png').convert('RGB').resize((1404, 468), Image.LANCZOS)
a = np.asarray(im).astype(np.int16); H, W = a.shape[:2]
lum = a.mean(-1); sat = a.max(-1) - a.min(-1)
out = {}
def save(name, arr, box):   # box in 2x px (x0,y0,x1,y1) -> placement in game px
    x0, y0, x1, y1 = box; Image.fromarray(arr[y0:y1, x0:x1].astype(np.uint8), 'RGBA').save(f'{R}/assets/maps/{name}.png')
    out[name] = dict(x=round(x0 / 2 + OX, 2), y=round(y0 / 2 + OY, 2), w=(x1 - x0) / 2, h=(y1 - y0) / 2)
rgba = np.dstack([a, np.full((H, W), 255, np.int16)])

# ---- front layer: 3 front ropes (rows found from the row profile), 2 front posts, front pads
m = np.zeros((H, W), bool)
for y0, y1 in [(265, 272), (302, 309), (337, 343)]: m[y0:y1, 303:808] = True
for x0, x1 in [(303, 324), (787, 808)]:
    for y in range(250, 458):   # post: widest run of grey/black around the post's centre
        c = (x0 + x1) // 2
        if y < 262:              # rounded cap: only the grey pixels
            row = (sat[y, x0 - 2:x1 + 2] < 30) & (lum[y, x0 - 2:x1 + 2] > 25)
            m[y, x0 - 2:x1 + 2] |= row
        else: m[y, x0:x1] = True
blue = (a[..., 2] > a[..., 0] + 30) & (a[..., 2] > a[..., 1] + 15)
from scipy import ndimage
pads = np.zeros_like(m)
for bx0, bx1 in [(322, 366), (748, 790)]:
    for ry in (268, 305, 340):
        y0, y1 = ry - 14, ry + 12; sub = blue[y0:y1, bx0:bx1]; d = ndimage.binary_dilation(sub, iterations=2)
        pads[y0:y1, bx0:bx1] |= sub | (d & (lum[y0:y1, bx0:bx1] < 70))
m |= pads
f = rgba.copy(); f[..., 3] = np.where(m, 255, 0)
ys, xs = np.nonzero(m); save('barn_front', f, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

# ---- the doorway. Left panel x 560-611, gap (C.Diddy) 611-661, panel/gap rows 186-304
PX0, PX1, GX1, PY0, PY1 = 560, 611, 661, 186, 305
wall = a[:, 514:560]                                   # plain wall just left of the door (back ropes cross it at the same rows)
wsat = wall.max(-1) - wall.min(-1)
rope_rows = [y for y in range(225, PY1) if (wsat[y] < 26).mean() > 0.85]   # above 225 is the wall trim, not a rope
base = a.copy()
for x in range(PX0, PX1): base[PY0:PY1, x] = wall[PY0:PY1, (x - PX0) % wall.shape[1]]   # where the open panel was: bare wall
dark = np.array([20, 15, 17], np.int16)
base[PY0:PY1, PX1:GX1] = dark                                                                 # the empty doorway
for y in rope_rows: base[y, PX1:GX1] = wall[y, (np.arange(PX1, GX1) - PX0) % wall.shape[1]]   # back ropes run across it
for y in range(PY1, PY1 + 6): base[y, PX1:GX1] = base[y, PX1 - 5][None, :]   # below the doorway: C.Diddy's boots left a reddish smear here
Image.fromarray(base.astype(np.uint8)).save(R + '/assets/maps/barn_full.webp', lossless=False, quality=92, method=6)
out['barn_full'] = dict(x=OX, y=OY, w=W / 2, h=H / 2)
# panel (ropes taken out: fill each rope row from the panel row just above it)
pan = rgba.copy()
rr = set(rope_rows)
for y in range(PY0, PY1):
    if y in rr:
        yy = y
        while yy in rr: yy -= 1
        pan[y, PX0:PX1, :3] = a[yy, PX0:PX1]
save('barn_panel', pan, (PX0, PY0 - 11, PX1, PY1))    # include the hangers on the rail
# C.Diddy: everything in the gap that isn't the dark doorway
g = a[PY0:PY1, PX1:GX1]; gl = g.mean(-1); gs = g.max(-1) - g.min(-1)
dm = ~((gl < 34) & (gs < 26)); dm = ndimage.binary_opening(dm, iterations=1)
dd = rgba.copy(); dd[..., 3] = 0; dd[PY0:PY1, PX1:GX1, 3] = np.where(dm, 255, 0)
save('barn_diddy', dd, (PX1, PY0, GX1, PY1))
# ropes across the doorway + the open panel's spot (so they stay in front of C.Diddy and the sliding panel)
rp = rgba.copy(); rp[..., 3] = 0
for y in rope_rows:
    rp[y, PX0:GX1, :3] = wall[y, (np.arange(PX0, GX1) - PX0) % wall.shape[1]]
    rp[y, PX0:GX1, 3] = np.where(wsat[y, (np.arange(PX0, GX1) - PX0) % wall.shape[1]] < 30, 255, 0)
save('barn_doorrope', rp, (PX0, PY0, GX1, PY1))
print('rope rows', rope_rows)
print(json.dumps(out))
