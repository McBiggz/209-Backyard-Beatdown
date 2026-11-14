import sys,json;sys.path.insert(0,'/home/claude/ddgame/tools/sprites')
from prompts_content import *
GRIP='''GRIP POINTS (used by every suplex frame, for every wrestler; the game lines two wrestlers up using these, so keep them exact):
- NECK: the attacker's front (right) arm wraps the opponent's neck: elbow beside the opponent's ear, forearm across the back of the neck.
- BELT: the attacker's back (left) hand grips the opponent's tights at the hip.
- DRAPE: the opponent's near (right) arm is draped over the attacker's shoulder.
- HEIGHTS: hook = neck at his chest, belt at his waist. Lift = both at his chest. Hold and fall = neck at HIS SHOULDER, belt one head-length ABOVE HIS HEAD.'''
EXTRA={'G':'Use the GRIP POINTS exactly as written. Draw only the attacker; the opponent is invisible.','H':'Use the GRIP POINTS exactly as written: this is the man being suplexed, and the invisible attacker is to his RIGHT. Draw only him.'}
tot=sum(len(f) for _,_,f in SHEETS)
txt=['BACKYARD BRAWL - FULL FRAME PROMPTS (every frame, every wrestler)\n',
f'{len(SHEETS)} sheets, {tot} frames per wrestler. Includes the 10-frame suplex with exact grip points.\n',
'HOW TO USE\n1. Make the STYLE REFERENCE first (below) and keep it.\n2. New ChatGPT chat per wrestler. Attach his character model + the STYLE REFERENCE. Paste the SETUP prompt with his name and look line filled in.\n3. When it says "Ready", paste ONE whole sheet block at a time (not just the letter).\n4. For the suplex, paste the GRIP POINTS block once before Sheet G.\n5. Check each sheet: right poses, right order, same size as before, still him. If not, "redo frame X" or start a fresh chat.\n6. Download the real image (not a screenshot) and send it to Claude with his name and the sheet letter.\n',
'STYLE REFERENCE (do this once, before anyone else)\nRedraw Viral\'s fighting stance (and one new guy\'s) with his character model attached and this prompt. Play them in the game first. When you like it, that image is the STYLE REFERENCE you attach to every chat:\n"Redraw this wrestler as a single fighting-stance sprite in true 16-bit SNES fighting-game pixel art: visible square pixels, thin even black outline, limited palette of 16-24 colors, 2-3 flat shading tones per color, no gradients or airbrushing, bold readable shapes. Facing RIGHT. Solid flat magenta background (#FF00FF), no border, no text."\n',
'='*60+'\nSETUP PROMPT (paste once per wrestler chat)\n'+'='*60+'\n'+SETUP+'\n']
for L,title,fr in SHEETS:
  if L=='G':txt.append('='*60+'\nGRIP POINTS (paste once, before Sheet G)\n'+'='*60+'\n'+GRIP+'\n')
  txt.append('='*60+f'\nSHEET {L} - {title.upper()} ({len(fr)} frames)\n'+'='*60)
  txt.append(f'Sheet {L}: {title}. Draw a NEW image: ONE row of exactly {len(fr)} frames, left to right, in this order. Follow all the rules. Match the attached STYLE REFERENCE and keep him the same size as before.'+((' '+EXTRA[L]) if L in EXTRA else ''))
  for i,f in enumerate(fr):txt.append(f'{i+1}. {f}')
  txt.append('')
txt.append('='*60+'\nLOOK LINES (paste after LOOK:)\n'+'='*60)
for n,t in LOOK:txt.append(f'{n.upper()}: {t}\n')
open('/mnt/user-data/outputs/Full_Frame_Prompts.txt','w').write('\n'.join(txt))
json.dump({'setup':SETUP,'sheets':SHEETS,'look':LOOK,'grip':GRIP,'extra':EXTRA},open('c.json','w'))
print(tot)
