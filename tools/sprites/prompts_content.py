import json
LOOK=json.load(open('/home/claude/ddgame/tools/sprites/data/look_lines_batch1.json'))
LOOK=[(n,t.replace('same face, ','').replace('same ','')) for n,t in LOOK]
LOOK+=[('Tripp Rogers','short brown slightly receding hair combed back, brown mustache and short beard going grey at the chin, cocky smirk, average athletic build with a bit of a belly, arm tattoos, black zip-front singlet with silver snakeskin diagonal side panels and silver trim, black tights, black wristband, black knee pads, tall black laced boots with a silver stripe'),
('Jason Hastings','full white sugar-skull face paint with BIG black eye sockets, black nose tip, black dots up the forehead and stitched-mouth lines, dark slicked-back hair with faded sides, full black beard, big heavyset build, full sleeve tattoos on both arms, shiny silver snakeskin singlet with white trim and a black heart with "MOTHER" inside it on the chest, black elbow pads, black and white hand tape, black knee pads, tall black laced boots'),
('Frank Douglas','dark brown hair combed back with a high forehead, full brown beard going grey on the chin, thick brown handlebar mustache, mean scowl, lean athletic build, black sleeveless shirt with "Control YOUR KIDS" in white script, black shorts, black knee pads with a small white logo, tall black boots with a white stripe'),
('Ultimo Jaguar','orange luchador jaguar mask with silver pointed eye outlines, green and silver nose and forehead crest, black whisker spots and two white fangs, short goatee, stocky powerful build, black star tattoos on both shoulders, sleeve tattoo on his right arm, orange strap singlet with silver claw marks and green and silver jaguar designs on the hips, orange armbands, orange knee pads with silver claw marks, tall black shiny laced boots'),
('El Flaco Loco','full-head luchador mask split exactly down the middle, left half sparkly green, right half red, with white flame outlines around the eyes, nose and mouth, black sleeveless shirt with a white luchador-mask graphic in a green frame and "VIVA LA LUCHA LIBRE" in red, average stocky build, upper-arm tattoo, red tights with black and white eagle-wing designs on the thighs, white knee pads, tall white laced boots'),
('Jesus Kruze','bald with a black skull-print bandana, black wraparound sunglasses, very long thick black beard, septum ring, big heavyset build, thick gold Cuban-link chain, black sleeveless button-up work shirt with a small red "209", long baggy black shorts past the knees, white tube socks pulled up to the knees, black Chuck Taylor high-tops'),
('Razzle','tan skin, short black curly hair, thin mustache and chin stubble, big grin, bright yellow-and-orange 90s-pattern headband, mirrored orange-red shield sunglasses with a speckled neon-green frame, shorter stocky build, open tie-dye fringe vest in big flat blocks of yellow, pink and blue over a bare chest, black tights with bold neon pink, green and yellow zigzag stripes, neon pink wristbands, white knee pads, tall white laced boots'),
('209 Kliq Enforcer','(no art yet: attach his photos and describe his look here)')]
SETUP='''You are making sprite sheets for my 16-bit wrestling game. Do not draw anything yet. Read these rules and reply only "Ready."

WRESTLER: [NAME]
LOOK: [PASTE HIS LOOK LINE]

The attached images are (1) his character model and (2) the STYLE REFERENCE sheet. Every sheet must match the STYLE REFERENCE's art style exactly, and match his character model for his face, body, gear and colors. Always draw each sheet completely new; never reuse or edit an earlier image.

RULES FOR EVERY SHEET:
1. True 16-bit SNES pixel art: visible square pixels, hard edges, no blur, no gradients, no airbrushing. Limited palette (about 16-24 colors). Shading with 2-3 flat tones per color. Thin, even black outline.
2. Same size in every frame and every sheet: the same height and head size as his character model. Never shrink him on later sheets.
3. ONE row of frames, left to right, in the exact order listed. Wide landscape image. Clear magenta space between frames; frames never touch.
4. Standing frames share the same baseline (feet on the same line).
5. Draw ONLY him. Any opponent is invisible: pose him as if the other person were there.
6. Side view, facing RIGHT unless a frame says otherwise.
7. Solid flat magenta background (#FF00FF). No border, floor, shadow, motion lines, effects, numbers, labels or text (except writing on his own gear).
8. Every frame must be a different pose. Never repeat a pose.
9. If I say "redo frame X", redraw only that frame and keep everything else identical.'''
SHEETS=[
('A','Stance, breathing and walk',[
'Fighting stance: knees bent, fists up, weight forward.',
'Same stance breathing out: identical pose and size, shoulders and chest lowered by a tiny amount.',
'Walk 1: right foot forward heel touching down, arms swinging.',
'Walk 2: weight coming down onto the right foot, knees bent slightly.',
'Walk 3: legs passing each other, body at its highest.',
'Walk 4: left foot forward heel touching down, arms swinging the other way.',
'Walk 5: weight coming down onto the left foot, knees bent slightly.',
'Walk 6: legs passing each other again, body at its highest.']),
('B','Punch, kick and stomp',[
'Punch wind-up: fist pulled back by his ear, leaning back slightly.',
'Punch: arm fully extended forward, fist out, leaning in, mouth open.',
'Punch recover: arm coming back, halfway between punch and stance.',
'Kick chamber: knee raised high in front, balancing on one leg.',
'Kick: leg fully extended forward at waist height, sole of the boot out.',
'Kick recover: leg coming back down, knee bent, foot just above the mat.',
'Stomp raise: one knee lifted high, looking down at a man on the mat.',
'Stomp: foot slammed down hard in front of him, body leaning over it.']),
('C','Grab, whip, run and block',[
'Reach: both hands reaching forward to lock up, collar-and-elbow.',
'Lock-up: arms locked around an invisible opponent at chest height, pushing forward, straining.',
'Irish whip: one arm swung out to the side, flinging an invisible opponent away.',
'Whiff: grabbed at nothing, stumbling forward off balance.',
'Run 1: full sprint, right leg forward, arms pumping, leaning forward.',
'Run 2: full sprint, left leg forward, arms pumping the other way.',
'Block: forearms raised in front of his face, chin tucked, bracing.']),
('D','Getting hit and falling',[
'Hit high: head snapped back, wincing, one hand coming up.',
'Hit to the body: doubled over forward, holding his stomach.',
'Stagger: stumbling backward, arms flailing for balance.',
'Falling back: tipping over backward, feet leaving the mat.',
'Mid-air fall: body nearly flat in the air, back toward the mat, arms flung out.',
'Landing: slammed flat on his back, head on the LEFT, legs bouncing up slightly.',
'Down: lying flat on his back, head on the LEFT, eyes shut.',
'Down, stirring: lying on his back, head on the LEFT, one knee bent, one hand on his head.']),
('E','Getting up and dazed',[
'Rolling onto his side, propped on one elbow, head on the LEFT.',
'On hands and knees, head hanging.',
'Getting up: on one knee, pushing up with one hand.',
'Almost up: standing bent over, hands on his knees.',
'Dazed 1: wobbly on his feet, hand on his head, eyes unfocused.',
'Dazed 2: wobbly, swaying the other way, knees buckling.']),
('F','Air and top rope',[
'Jump crouch: crouched low, about to spring up.',
'Jump: in the air, knees tucked.',
'Dropkick: horizontal in mid-air, both boots straight out in front.',
'Crouched on the top rope, arms out for balance (draw no rope).',
'Standing on the top rope, knees slightly bent, arms spread wide, looking down (draw no rope).',
'Diving forward through the air, body flat, arms stretched out in front.',
'Landing crouch: just landed on his feet, knees bent deep, one hand on the mat.']),
('G','Suplex: doing it',[
'Hook: standing, knees bent, facing RIGHT. His front (right) arm wraps around the invisible opponent\'s neck, elbow beside the opponent\'s ear, forearm across the back of the opponent\'s neck (the opponent is bent over in front of him, head at his chest height). His back (left) hand grips the opponent\'s tights at the hip, at HIS waist height.',
'Lift start: knees bent deep, hips low, leaning back slightly. Same grip: front arm around the neck at his chest height, back hand on the tights now at his chest height, both arms pulling up hard.',
'Hold (the delayed part): standing straight up, legs locked, chest out, leaning back slightly, face red from strain. Front arm curled around the neck at HIS OWN SHOULDER height. Back arm pointing straight up, hand gripping the tights about one head-length ABOVE HIS OWN HEAD (as if holding a man straight up and down).',
'Falling back: body tilted about 45 degrees backward in mid-air, feet leaving the mat. SAME grip as the hold: front arm curled at shoulder height, back arm straight up above his head.',
'Sit up: sitting on the mat after the slam, legs out in front, one hand on the mat, the other hand on the back of his head.']),
('H','Suplex: taking it',[
'Front facelock: bent forward at the waist, facing RIGHT toward the invisible attacker, head tucked down at the attacker\'s chest height. His near (right) arm draped up and over the attacker\'s shoulder; his other arm hanging. Knees slightly bent.',
'Going up: feet leaving the mat, legs swinging up behind him, body tilted diagonally (head low and toward the RIGHT, feet high and to the LEFT). Right arm still draped as if over a shoulder.',
'Straight up: completely upside down and vertical, legs together pointing straight at the sky, head at the bottom. His chest faces RIGHT (toward the attacker). Arms hanging limp. The top of his head is where the attacker\'s shoulder would be.',
'Going over: flat and horizontal in mid-air, back toward the mat, head on the RIGHT, legs straight to the LEFT, arms flung out, hair flying, mouth open.',
'Landing: flat on his back on the mat, head on the RIGHT, arms spread out, legs slightly bent, grimacing.']),
('I','Pins he does',[
'Pin cover: lying chest-down low across an invisible opponent, propped on both hands, legs stretched out behind him, head up yelling at the referee.',
'Backslide set-up: standing, facing LEFT, back against an invisible opponent\'s back, arms reaching back over his shoulders.',
'Backslide pin: bridging backward, feet planted, back arched high, arms reaching back over his head.',
'Crucifix pin: on his back at an angle, legs bent and spread as if trapping an arm, one arm hooking the other.',
'Roll-up: crouched low over an invisible opponent, cradling a leg and the head.']),
('J','Pins he takes, and the 5-by-5',[
'Being pinned: on his back, head on the LEFT, shoulders flat, both legs up and bent at the knees.',
'Being backslid: leaning far backward against an invisible back, arms pulled up over his head.',
'Backslid and pinned: flat on his back, head on the LEFT, arms stretched over his head along the mat.',
'Crucifixed: flat on his back, head on the LEFT, arms spread straight out like a cross.',
'Leapfrog take-off: just jumped, legs swinging out wide, arms reaching forward and down.',
'Leapfrog straddle: high in the air, legs spread wide, arms out to the sides, yelling.',
'Ducking under: mid-sprint, bent forward hard at the waist, back almost flat, head tucked.',
'Skid: braking to a stop, front foot planted, arms out, angry look.']),
('K','Showtime and finisher',[
'Taunt: [HIS TAUNT, e.g. pointing at the crowd and yelling].',
'Signature pose: [HIS ENTRANCE POSE].',
'Victory 1: both arms raised high overhead, celebrating.',
'Victory 2: one fist pumped high, the other hand pointing at the crowd.',
'Finisher set-up: [THE START OF HIS FINISHER].',
'Finisher impact: [THE BIG MOMENT OF HIS FINISHER].']),
]
