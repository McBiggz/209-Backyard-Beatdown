# Side ropes that can stretch: for each map and each side of the ring, cut the three side ropes out of the art (a band along each rope,
# from the back turnbuckle pad to the front one) and fill in what's behind them. Outputs, per map+side:
#   assets/maps/<map>_rope<L|R>.png   the ropes alone (transparent elsewhere)
#   assets/maps/<map>_clean<L|R>.png  the same box with the ropes painted out
# and prints ROPEFX placement data for src/03_assets.js. The game draws the clean box + the ropes bent outward when someone bounces off them.
import os, json
import numpy as np, cv2
from PIL import Image
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..')
# turnbuckle pad centres in the stored map image (2x game px): [back, front] per rope, top to bottom
MAPS = {
 'ranch': dict(src='assets/maps/bmfranch_full.webp', ox=0, oy=0, th=7,
   L=[((165,167),(97,189)),((164,197),(97,228)),((164,223),(96,267))],
   R=[((447,167),(527,190)),((447,196),(528,228)),((447,223),(528,267))]),
 'barn': dict(src='assets/maps/barn_full.webp', ox=-119.8, oy=-27.5, th=6, hrope=1,
   L=[((405,231),(345,265)),((405,257),(344,302)),((405,285),(345,337))],
   R=[((690,231),(764,265)),((690,257),(763,302)),((690,285),(763,337))]),
}
out = {}
for mk, M in MAPS.items():
    img = np.asarray(Image.open(R + '/' + M['src']).convert('RGB')); H, W = img.shape[:2]
    for side in 'LR':
        ropes = M[side]; mask = np.zeros((H, W), np.uint8)
        for (b, f) in ropes:
            # stop short of the pads so the pads stay put
            b2 = (b[0] + (f[0] - b[0]) * 0.17, b[1] + (f[1] - b[1]) * 0.17); f2 = (b[0] + (f[0] - b[0]) * 0.85, b[1] + (f[1] - b[1]) * 0.85)
            cv2.line(mask, (int(b2[0]), int(b2[1])), (int(f2[0]), int(f2[1])), 255, M['th'] * 2)
        if M.get('hrope'):   # the straight back/front ropes that cross the side ropes stay where they are
            ai = img.astype(int); gr = ((ai.max(-1) - ai.min(-1)) < 32) & (ai.mean(-1) > 45)
            runs = np.zeros_like(gr)
            for y in range(H):
                row = gr[y]; x = 0
                while x < W:
                    if row[x]:
                        e = x
                        while e < W and row[e]: e += 1
                        if e - x >= 28: runs[y, x:e] = True
                        x = e
                    else: x += 1
            runs = cv2.dilate(runs.astype(np.uint8), np.ones((3, 1), np.uint8)) > 0
            mask[runs] = 0
        ys, xs = np.nonzero(mask); x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
        clean = cv2.inpaint(img[..., ::-1].copy(), mask, 6, cv2.INPAINT_TELEA)[..., ::-1]
        cl = np.dstack([clean[y0:y1, x0:x1], np.where(cv2.dilate(mask, np.ones((3, 3), np.uint8))[y0:y1, x0:x1] > 0, 255, 0)]).astype(np.uint8)
        rp = np.dstack([img[y0:y1, x0:x1], mask[y0:y1, x0:x1]]).astype(np.uint8)
        Image.fromarray(cl, 'RGBA').save(f'{R}/assets/maps/{mk}_clean{side}.png'); Image.fromarray(rp, 'RGBA').save(f'{R}/assets/maps/{mk}_rope{side}.png')
        xb = ropes[0][0][0]; xf = ropes[0][1][0]  # back / front x of the ropes (stored px)
        out[mk + side] = dict(x=round(x0 / 2 + M['ox'], 2), y=round(y0 / 2 + M['oy'], 2), w=(x1 - x0) / 2, h=(y1 - y0) / 2, xb=round(xb / 2 + M['ox'], 2), xf=round(xf / 2 + M['ox'], 2))
print(json.dumps(out))
